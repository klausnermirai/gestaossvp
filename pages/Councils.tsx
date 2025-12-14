
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Council, CouncilType } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { Input } from '../components/Input';

interface CouncilsProps {
  councils: Council[];
  onSave: (council: Council) => void;
  onDelete: (id: string) => void;
}

export const Councils: React.FC<CouncilsProps> = ({ councils, onSave, onDelete }) => {
  const [activeTab, setActiveTab] = useState<CouncilType>('Particular');
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Council>>({
    name: '',
    address: '',
    email: '',
    parentId: '',
    presidentName: '',
    presidentCpf: '',
    presidentPhone: '',
    secretaryName: '',
    secretaryCpf: '',
    treasurerName: '',
    treasurerCpf: '',
    managerName: '',
    managerCpf: ''
  });

  const filteredCouncils = councils.filter(c => c.type === activeTab);

  const getPotentialParents = (): Council[] => {
    if (activeTab === 'Central') {
      return councils.filter(c => c.type === 'Metropolitano');
    }
    if (activeTab === 'Particular') {
      return councils.filter(c => c.type === 'Central');
    }
    return [];
  };

  const potentialParents = getPotentialParents();
  const parentLabel = activeTab === 'Central' ? 'Conselho Metropolitano (Vínculo)' : activeTab === 'Particular' ? 'Conselho Central (Vínculo)' : '';

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    return councils.find(c => c.id === parentId)?.name;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCouncil: Council = {
      id: uuidv4(),
      type: activeTab,
      name: formData.name || '',
      parentId: formData.parentId || '',
      address: formData.address || '',
      email: formData.email || '',
      presidentName: formData.presidentName || '',
      presidentCpf: formData.presidentCpf || '',
      presidentPhone: formData.presidentPhone || '',
      secretaryName: formData.secretaryName || '',
      secretaryCpf: formData.secretaryCpf || '',
      treasurerName: formData.treasurerName || '',
      treasurerCpf: formData.treasurerCpf || '',
      managerName: formData.managerName || '',
      managerCpf: formData.managerCpf || '',
    };

    onSave(newCouncil);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      email: '',
      parentId: '',
      presidentName: '',
      presidentCpf: '',
      presidentPhone: '',
      secretaryName: '',
      secretaryCpf: '',
      treasurerName: '',
      treasurerCpf: '',
      managerName: '',
      managerCpf: ''
    });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este Conselho?')) {
      // Check for children dependencies (simple check)
      const hasChildren = councils.some(c => c.parentId === id);
      if (hasChildren) {
          alert('Não é possível remover este conselho pois existem outros conselhos vinculados a ele.');
          return;
      }
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Conselhos</h2>
          <p className="text-slate-500">Gestão da estrutura hierárquica e diretoria</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
        {(['Metropolitano', 'Central', 'Particular'] as CouncilType[]).map((type) => (
          <button
            key={type}
            onClick={() => { setActiveTab(type); setIsAdding(false); }}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === type 
                ? 'bg-white text-blue-700 border border-slate-200 border-b-white -mb-px shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Conselho {type}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-lg rounded-tr-lg shadow-sm border border-slate-200 border-t-0 p-6">
        
        {/* Header da Aba */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-700">Lista de Conselhos {activeTab}s</h3>
          {!isAdding && (
             <button 
             onClick={() => setIsAdding(true)} 
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
           >
             <PlusIcon />
             Adicionar Conselho {activeTab}
           </button>
          )}
        </div>

        {/* Formulário de Adição */}
        {isAdding && (
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6 animate-fade-in">
            <h4 className="font-bold text-slate-800 mb-4">Novo Conselho {activeTab}</h4>
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vínculo Hierárquico */}
                {activeTab !== 'Metropolitano' && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{parentLabel}</label>
                        <select 
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={formData.parentId}
                            onChange={e => setFormData({...formData, parentId: e.target.value})}
                            required
                        >
                            <option value="">Selecione um conselho superior...</option>
                            {potentialParents.map(parent => (
                                <option key={parent.id} value={parent.id}>{parent.name}</option>
                            ))}
                        </select>
                        {potentialParents.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Nenhum conselho superior cadastrado para realizar o vínculo.</p>
                        )}
                    </div>
                )}

                {/* Dados Gerais */}
                <div className="md:col-span-2">
                    <Input 
                    label="Nome do Conselho" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder={`Ex: Conselho ${activeTab} de ...`}
                    required
                    />
                </div>
                <div className="md:col-span-2">
                    <Input 
                    label="Endereço Completo" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                </div>
                <Input 
                    label="Email de Contato" 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Seção Diretoria */}
              <div className="border-t border-slate-200 pt-4">
                  <h5 className="text-sm font-bold text-blue-800 uppercase mb-4 tracking-wider">Diretoria & Permissões</h5>
                  
                  {/* Presidente */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-white p-3 rounded-md border border-slate-100">
                      <div className="md:col-span-6">
                        <Input label="Nome do Presidente" value={formData.presidentName} onChange={e => setFormData({...formData, presidentName: e.target.value})} />
                      </div>
                      <div className="md:col-span-3">
                        <Input label="CPF (Login)" value={formData.presidentCpf} onChange={e => setFormData({...formData, presidentCpf: e.target.value})} placeholder="000.000.000-00" />
                      </div>
                      <div className="md:col-span-3">
                        <Input label="Telefone" value={formData.presidentPhone} onChange={e => setFormData({...formData, presidentPhone: e.target.value})} />
                      </div>
                  </div>

                  {/* Secretário */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-white p-3 rounded-md border border-slate-100">
                      <div className="md:col-span-8">
                        <Input label="Nome do Secretário(a)" value={formData.secretaryName} onChange={e => setFormData({...formData, secretaryName: e.target.value})} />
                      </div>
                      <div className="md:col-span-4">
                        <Input label="CPF (Login)" value={formData.secretaryCpf} onChange={e => setFormData({...formData, secretaryCpf: e.target.value})} placeholder="000.000.000-00" />
                      </div>
                  </div>

                  {/* Tesoureiro */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-white p-3 rounded-md border border-slate-100">
                      <div className="md:col-span-8">
                        <Input label="Nome do Tesoureiro(a)" value={formData.treasurerName} onChange={e => setFormData({...formData, treasurerName: e.target.value})} />
                      </div>
                      <div className="md:col-span-4">
                        <Input label="CPF (Login)" value={formData.treasurerCpf} onChange={e => setFormData({...formData, treasurerCpf: e.target.value})} placeholder="000.000.000-00" />
                      </div>
                  </div>

                  {/* Gestor do Sistema */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                      <div className="md:col-span-8">
                        <Input label="Nome do Gestor do Sistema" value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} placeholder="Responsável técnico/acesso" />
                      </div>
                      <div className="md:col-span-4">
                        <Input label="CPF (Login)" value={formData.managerCpf} onChange={e => setFormData({...formData, managerCpf: e.target.value})} placeholder="000.000.000-00" />
                      </div>
                  </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Salvar Conselho
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista */}
        <div className="grid grid-cols-1 gap-4">
          {filteredCouncils.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
              Nenhum conselho {activeTab.toLowerCase()} cadastrado.
            </div>
          ) : (
            filteredCouncils.map((council) => (
              <div key={council.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                     <h4 className="font-bold text-slate-800 text-lg">{council.name}</h4>
                     {council.parentId && (
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                            🔗 {getParentName(council.parentId) || 'Vínculo?'}
                        </span>
                     )}
                  </div>

                  <div className="text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {council.presidentName && <div>👤 Pres: <strong>{council.presidentName}</strong></div>}
                    {council.treasurerName && <div>💰 Tes: {council.treasurerName}</div>}
                    {council.managerName && <div>💻 Gestor: {council.managerName}</div>}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(council.id)}
                  className="mt-4 md:mt-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors self-end md:self-center"
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
