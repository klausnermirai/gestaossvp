
import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FinancialTransaction, ConferenceHierarchy, Council, Member, AssistedFamily, MonthlyMapData } from '../types';
import { MAP_CATEGORIES, MapLine } from '../utils/mapCategories';
import { generateMapPDF } from '../utils/pdfGenerator';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

interface Props {
  transactions: FinancialTransaction[];
  conferences: ConferenceHierarchy[];
  councils: Council[];
  members: Member[];
  families: AssistedFamily[];
  onSave: (transaction: FinancialTransaction) => void;
  onDelete: (id: string) => void;
}

export const FinancialControl: React.FC<Props> = ({ 
    transactions, 
    conferences,
    councils,
    members,
    families,
    onSave,
    onDelete
}) => {
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>(conferences[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'lancamentos' | 'mapa'>('lancamentos');

  // Transaction Type Toggle
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  // New Transaction Form State
  const [newTrans, setNewTrans] = useState<Partial<FinancialTransaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    value: 0,
    categoryId: 1
  });

  // Map Report Manual Data State (stored in memory for session)
  const [mapManualData, setMapManualData] = useState<Partial<MonthlyMapData>>({
    previousBalance: 0,
    foodKg: 0,
    specialWorks: '',
    peopleAttendedSpecialWorks: 0,
    expensesSpecialWorks: 0,
    constructionReform: ''
  });

  // --- FILTERS ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const d = new Date(t.date);
        return t.conferenceId === selectedConferenceId && 
               (d.getMonth() + 1) === selectedMonth && 
               d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedConferenceId, selectedMonth, selectedYear]);

  // --- CALCULATIONS FOR MAP ---
  const mapLines = useMemo(() => {
    const lines: Record<number, number> = {};
    
    // Initialize
    MAP_CATEGORIES.forEach(cat => lines[cat.id] = 0);

    // Sum transactions
    filteredTransactions.forEach(t => {
        lines[t.categoryId] = (lines[t.categoryId] || 0) + Number(t.value);
    });

    // Calculated Fields
    lines[6] = (lines[1] || 0) + (lines[2] || 0) + (lines[3] || 0) + (lines[4] || 0) + (lines[5] || 0); // Subtotal Receita Décima
    lines[13] = (lines[6] || 0) + (lines[7] || 0) + (lines[8] || 0) + (lines[9] || 0) + (lines[10] || 0) + (lines[11] || 0) + (lines[12] || 0); // Total Recebimentos
    lines[14] = Number(mapManualData.previousBalance || 0); // Saldo Anterior (Manual Input)
    lines[15] = lines[13] + lines[14]; // Total Geral Entrada

    lines[24] = Number((lines[6] * 0.10).toFixed(2)); // Décima (10% da linha 6) - Suggestion/Auto

    lines[28] = 0;
    for(let i=16; i<=27; i++) lines[28] += (lines[i] || 0); // Total Pagamentos
    
    lines[29] = lines[15] - lines[28]; // Saldo Final
    lines[30] = lines[28] + lines[29]; // Checksum

    return lines;
  }, [filteredTransactions, mapManualData.previousBalance]);

  // --- ACTIONS ---
  const handleAddTransaction = () => {
    if (!selectedConferenceId) {
        alert("Selecione uma conferência primeiro.");
        return;
    }
    if (!newTrans.description || !newTrans.value) return;

    const category = MAP_CATEGORIES.find(c => c.id === Number(newTrans.categoryId));
    
    const transaction: FinancialTransaction = {
        id: uuidv4(),
        conferenceId: selectedConferenceId,
        date: newTrans.date!,
        description: newTrans.description!,
        value: Number(newTrans.value),
        categoryId: Number(newTrans.categoryId),
        type: category?.type === 'expense' ? 'expense' : 'income'
    };

    onSave(transaction);
    setNewTrans({
        ...newTrans,
        description: '',
        value: 0
    });
  };

  const handleRemoveTransaction = (id: string) => {
      onDelete(id);
  };

  const handleGeneratePDF = () => {
    const conf = conferences.find(c => c.id === selectedConferenceId);
    if (!conf) return;

    // Get Hierarchy Names
    const part = councils.find(c => c.id === conf.particularCouncil)?.name;
    const cent = councils.find(c => c.id === conf.centralCouncil)?.name;
    const metro = councils.find(c => c.id === conf.metropolitanCouncil)?.name;

    // Stats
    // In a real app, these would be filtered by date. Here we take current snapshot.
    const activeM = members.filter(m => m.active);
    
    const mapData: MonthlyMapData = {
        id: 'temp',
        conferenceId: conf.id,
        month: selectedMonth,
        year: selectedYear,
        previousBalance: mapManualData.previousBalance || 0,
        activeMembers: activeM.length,
        confradesCount: activeM.filter(m => m.type === 'Confrade').length,
        consociasCount: activeM.filter(m => m.type === 'Consócia').length,
        aspirantesCount: activeM.filter(m => m.role === 'Aspirante').length, // Simplification
        auxiliaresCount: 0, // Manual input needed ideally
        familiesAssistedCount: families.length,
        peopleAssistedCount: families.reduce((acc, f) => acc + 1 + (f.spouseName ? 1 : 0) + f.familyMembers.length, 0),
        foodKg: mapManualData.foodKg || 0,
        specialWorks: mapManualData.specialWorks || '',
        peopleAttendedSpecialWorks: mapManualData.peopleAttendedSpecialWorks || 0,
        expensesSpecialWorks: mapManualData.expensesSpecialWorks || 0,
        constructionReform: mapManualData.constructionReform || ''
    };

    generateMapPDF({
        conference: conf,
        metropolitan: metro,
        central: cent,
        particular: part,
        month: selectedMonth,
        year: selectedYear,
        data: mapData,
        lines: mapLines
    });
  };

  if (conferences.length === 0) {
      return <div className="p-8 text-center text-slate-500">Cadastre uma conferência primeiro.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle Financeiro</h2>
          <p className="text-slate-500">Movimento Mensal e Mapa</p>
        </div>
        
        {/* Context Selectors */}
        <div className="flex gap-2 flex-wrap">
            <select 
                className="px-3 py-2 border rounded-md bg-white text-sm"
                value={selectedConferenceId}
                onChange={e => setSelectedConferenceId(e.target.value)}
            >
                {conferences.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select 
                className="px-3 py-2 border rounded-md bg-white text-sm"
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
            >
                {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('pt-BR', {month: 'long'})}</option>
                ))}
            </select>
            <select 
                className="px-3 py-2 border rounded-md bg-white text-sm"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
            >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
            onClick={() => setActiveTab('lancamentos')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'lancamentos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Lançamentos (Caixa)
        </button>
        <button
            onClick={() => setActiveTab('mapa')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'mapa' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Mapa Mensal (Relatório)
        </button>
      </div>

      {/* VIEW: LANCAMENTOS */}
      {activeTab === 'lancamentos' && (
          <div className="space-y-6 animate-fade-in">
              {/* Form Input */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  
                  {/* Transaction Type Toggles */}
                  <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => {
                                setTransactionType('income');
                                setNewTrans(prev => ({...prev, categoryId: 1}));
                            }}
                            className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-colors border flex items-center justify-center gap-2 ${
                                transactionType === 'income' 
                                ? 'bg-green-100 border-green-300 text-green-800' 
                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <span className="text-lg">⬇️</span> Entrada / Receita
                        </button>
                        <button
                            onClick={() => {
                                setTransactionType('expense');
                                setNewTrans(prev => ({...prev, categoryId: 16}));
                            }}
                            className={`flex-1 py-2 px-4 rounded-md font-bold text-sm transition-colors border flex items-center justify-center gap-2 ${
                                transactionType === 'expense' 
                                ? 'bg-red-100 border-red-300 text-red-800' 
                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <span className="text-lg">⬆️</span> Saída / Pagamento
                        </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                        <input type="date" className="w-full px-3 py-2 border rounded-md text-sm" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} />
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Linha do Mapa ({transactionType === 'income' ? 'Receitas' : 'Despesas'})</label>
                        <select 
                            className="w-full px-3 py-2 border rounded-md text-sm truncate bg-white" 
                            value={newTrans.categoryId} 
                            onChange={e => setNewTrans({...newTrans, categoryId: Number(e.target.value)})}
                        >
                            {MAP_CATEGORIES
                                .filter(c => !c.isCalculated && c.id !== 14)
                                .filter(c => c.type === transactionType) // Filter by type
                                .map(c => (
                                <option key={c.id} value={c.id}>{c.description}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-md text-sm" 
                            placeholder="Detalhes..."
                            value={newTrans.description} 
                            onChange={e => setNewTrans({...newTrans, description: e.target.value})} 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className="w-full px-3 py-2 border rounded-md text-sm" 
                            value={newTrans.value} 
                            onChange={e => setNewTrans({...newTrans, value: Number(e.target.value)})} 
                        />
                    </div>
                    <div className="md:col-span-1">
                        <button onClick={handleAddTransaction} className="w-full h-[38px] bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700">
                            <PlusIcon />
                        </button>
                    </div>
                  </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-xs">
                          <tr>
                              <th className="p-3">Data</th>
                              <th className="p-3">Categoria (Linha do Mapa)</th>
                              <th className="p-3">Descrição</th>
                              <th className="p-3 text-right">Entrada</th>
                              <th className="p-3 text-right">Saída</th>
                              <th className="p-3 text-center">Ações</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredTransactions.length === 0 ? (
                              <tr><td colSpan={6} className="p-6 text-center text-slate-400">Nenhum lançamento neste mês.</td></tr>
                          ) : (
                              filteredTransactions.map(t => {
                                  const cat = MAP_CATEGORIES.find(c => c.id === t.categoryId);
                                  return (
                                      <tr key={t.id} className="border-b hover:bg-slate-50">
                                          <td className="p-3">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                          <td className="p-3 text-slate-600 truncate max-w-[200px]" title={cat?.description}>
                                              <span className="font-mono font-bold text-xs mr-2">{t.categoryId.toString().padStart(2, '0')}</span>
                                              {cat?.description.substring(4)}
                                          </td>
                                          <td className="p-3">{t.description}</td>
                                          <td className="p-3 text-right font-medium text-green-700">
                                              {cat?.type === 'income' ? `R$ ${t.value.toFixed(2)}` : ''}
                                          </td>
                                          <td className="p-3 text-right font-medium text-red-700">
                                              {cat?.type === 'expense' ? `R$ ${t.value.toFixed(2)}` : ''}
                                          </td>
                                          <td className="p-3 text-center">
                                              <button onClick={() => handleRemoveTransaction(t.id)} className="text-slate-400 hover:text-red-500">
                                                  <TrashIcon />
                                              </button>
                                          </td>
                                      </tr>
                                  );
                              })
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* VIEW: MAPA */}
      {activeTab === 'mapa' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                      <h3 className="font-bold text-yellow-800">Dados Complementares do Mês</h3>
                      <p className="text-sm text-yellow-700">Preencha os dados abaixo para completar o Mapa antes de gerar o PDF.</p>
                  </div>
                  <button 
                    onClick={handleGeneratePDF}
                    className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg shadow-md hover:bg-slate-900 flex items-center gap-2"
                  >
                      📄 Gerar PDF do Mapa
                  </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Manual Inputs */}
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                          <h4 className="font-bold text-slate-700 mb-3 border-b pb-2">Valores & Saldos</h4>
                          <div className="space-y-3">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500">14. Saldo Anterior (Mês Passado)</label>
                                  <input 
                                    type="number" step="0.01" className="w-full px-3 py-2 border rounded text-sm"
                                    value={mapManualData.previousBalance}
                                    onChange={e => setMapManualData({...mapManualData, previousBalance: Number(e.target.value)})}
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                          <h4 className="font-bold text-slate-700 mb-3 border-b pb-2">Rodapé (Estatísticas)</h4>
                          <div className="space-y-3">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500">Alimentos Doados (Kg)</label>
                                  <input type="number" className="w-full px-3 py-2 border rounded text-sm" value={mapManualData.foodKg} onChange={e => setMapManualData({...mapManualData, foodKg: Number(e.target.value)})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500">Obras Especiais (Texto)</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded text-sm" value={mapManualData.specialWorks} onChange={e => setMapManualData({...mapManualData, specialWorks: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500">Construção/Reforma (Texto)</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded text-sm" value={mapManualData.constructionReform} onChange={e => setMapManualData({...mapManualData, constructionReform: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Preview Table */}
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-3 bg-slate-100 border-b font-bold text-center text-slate-700 text-sm">PRÉ-VISUALIZAÇÃO DOS TOTAIS</div>
                      <div className="grid grid-cols-2 text-xs">
                          {/* Left: Income */}
                          <div className="border-r border-slate-200">
                              <div className="bg-green-50 p-2 font-bold text-green-800 border-b">RECEITAS</div>
                              {MAP_CATEGORIES.filter(c => c.id <= 15).map(cat => (
                                  <div key={cat.id} className={`flex justify-between p-2 border-b ${cat.isCalculated ? 'bg-slate-50 font-bold' : ''}`}>
                                      <span className="truncate w-3/4" title={cat.description}>{cat.description}</span>
                                      <span>{mapLines[cat.id]?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                  </div>
                              ))}
                          </div>
                          {/* Right: Expenses */}
                          <div>
                              <div className="bg-red-50 p-2 font-bold text-red-800 border-b">DESPESAS</div>
                              {MAP_CATEGORIES.filter(c => c.id > 15).map(cat => (
                                  <div key={cat.id} className={`flex justify-between p-2 border-b ${cat.isCalculated ? 'bg-slate-50 font-bold' : ''}`}>
                                      <span className="truncate w-3/4" title={cat.description}>{cat.description}</span>
                                      <span>{mapLines[cat.id]?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
