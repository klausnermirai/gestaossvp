
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConferenceHierarchy, Council } from '../types';
import { Section } from '../components/Section';
import { Input } from '../components/Input';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

interface ConferenceProps {
  conferences: ConferenceHierarchy[];
  councils: Council[];
  onSave: (conf: ConferenceHierarchy) => void;
  onDelete: (id: string) => void;
}

const emptyConference: ConferenceHierarchy = {
    id: '',
    metropolitanCouncil: '',
    centralCouncil: '',
    particularCouncil: '',
    name: '',
    presidentName: '',
    presidentCpf: '',
    presidentPhone: '',
    secretaryName: '',
    secretaryCpf: '',
    treasurerName: '',
    treasurerCpf: '',
    managerName: '',
    managerCpf: '',
    city: '',
    foundationDate: '',
    meetingAddress: '',
    meetingDay: '',
    meetingTime: ''
};

export const Conference: React.FC<ConferenceProps> = ({ conferences, councils, onSave, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ConferenceHierarchy>(emptyConference);

  const handleEdit = (conf: ConferenceHierarchy) => {
      setFormData(conf);
      setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
      if(confirm("Deseja remover esta conferência?")) {
          onDelete(id);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Logic to clear child selections if parent changes
    if (name === 'metropolitanCouncil') {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            centralCouncil: '', // Clear central
            particularCouncil: '' // Clear particular
        }));
    } else if (name === 'centralCouncil') {
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            particularCouncil: '' // Clear particular
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
      if(!formData.name) {
          alert("O nome da conferência é obrigatório.");
          return;
      }

      onSave(formData.id ? formData : { ...formData, id: uuidv4() });
      setIsFormOpen(false);
      setFormData(emptyConference);
  };

  const handleCancel = () => {
      setIsFormOpen(false);
      setFormData(emptyConference);
  };

  const getCouncilName = (id: string) => councils.find(c => c.id === id)?.name || '-';

  // Filter lists based on hierarchy for the form
  const metropolitans = councils.filter(c => c.type === 'Metropolitano');
  
  const centrals = councils.filter(c => 
      c.type === 'Central' && 
      (!formData.metropolitanCouncil || c.parentId === formData.metropolitanCouncil)
  );

  const particulars = councils.filter(c => 
      c.type === 'Particular' && 
      (!formData.centralCouncil || c.parentId === formData.centralCouncil)
  );

  if (isFormOpen) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">
                    {formData.id ? 'Editar Conferência' : 'Nova Conferência'}
                </h2>
                <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200">
                <Section title="Estrutura Hierárquica">
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 mb-2 font-semibold">Vínculo com Conselhos Superiores</p>
                        <div className="grid grid-cols-1 gap-4">
                            
                            {/* Metropolitan */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Conselho Metropolitano</label>
                                <select 
                                    name="metropolitanCouncil" 
                                    value={formData.metropolitanCouncil} 
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Selecione...</option>
                                    {metropolitans.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {metropolitans.length === 0 && <p className="text-xs text-slate-500 mt-1">Cadastre conselhos na aba 'Conselhos'.</p>}
                            </div>

                            {/* Central */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Conselho Central</label>
                                <select 
                                    name="centralCouncil" 
                                    value={formData.centralCouncil} 
                                    onChange={handleChange}
                                    disabled={!formData.metropolitanCouncil && metropolitans.length > 0}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">Selecione...</option>
                                    {centrals.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Particular */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Conselho Particular</label>
                                <select 
                                    name="particularCouncil" 
                                    value={formData.particularCouncil} 
                                    onChange={handleChange}
                                    disabled={!formData.centralCouncil && centrals.length > 0}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">Selecione...</option>
                                    {particulars.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                </Section>

                <Section title="Dados Gerais">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input label="Nome da Conferência" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Conferência São Vicente de Paulo" />
                        </div>
                        <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} />
                        <Input type="date" label="Data de Fundação / Agregação" name="foundationDate" value={formData.foundationDate} onChange={handleChange} />
                    </div>
                </Section>

                <Section title="Diretoria & Acesso">
                    <div className="space-y-4">
                        {/* Presidente */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-3 rounded border border-slate-100">
                             <div className="md:col-span-6">
                                <Input label="Nome do Presidente" name="presidentName" value={formData.presidentName} onChange={handleChange} />
                             </div>
                             <div className="md:col-span-3">
                                <Input label="CPF (Login)" name="presidentCpf" value={formData.presidentCpf} onChange={handleChange} placeholder="000.000.000-00" />
                             </div>
                             <div className="md:col-span-3">
                                <Input label="Telefone" name="presidentPhone" value={formData.presidentPhone} onChange={handleChange} />
                             </div>
                        </div>

                        {/* Secretário */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-3 rounded border border-slate-100">
                             <div className="md:col-span-8">
                                <Input label="Nome do Secretário(a)" name="secretaryName" value={formData.secretaryName} onChange={handleChange} />
                             </div>
                             <div className="md:col-span-4">
                                <Input label="CPF (Login)" name="secretaryCpf" value={formData.secretaryCpf} onChange={handleChange} placeholder="000.000.000-00" />
                             </div>
                        </div>

                        {/* Tesoureiro */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-3 rounded border border-slate-100">
                             <div className="md:col-span-8">
                                <Input label="Nome do Tesoureiro(a)" name="treasurerName" value={formData.treasurerName} onChange={handleChange} />
                             </div>
                             <div className="md:col-span-4">
                                <Input label="CPF (Login)" name="treasurerCpf" value={formData.treasurerCpf} onChange={handleChange} placeholder="000.000.000-00" />
                             </div>
                        </div>

                        {/* Gestor */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-blue-50 p-3 rounded border border-blue-100">
                             <div className="md:col-span-8">
                                <Input label="Nome do Gestor do Sistema" name="managerName" value={formData.managerName} onChange={handleChange} placeholder="Responsável técnico/acesso" />
                             </div>
                             <div className="md:col-span-4">
                                <Input label="CPF (Login)" name="managerCpf" value={formData.managerCpf} onChange={handleChange} placeholder="000.000.000-00" />
                             </div>
                        </div>
                    </div>
                </Section>

                <Section title="Reuniões">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input label="Endereço das Reuniões" name="meetingAddress" value={formData.meetingAddress} onChange={handleChange} />
                        </div>
                        <Input label="Dia da Semana" name="meetingDay" value={formData.meetingDay} onChange={handleChange} placeholder="Ex: Segunda-feira" />
                        <Input type="time" label="Horário" name="meetingTime" value={formData.meetingTime} onChange={handleChange} />
                    </div>
                </Section>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                     <button onClick={handleCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Salvar Conferência</button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Conferências</h2>
            <p className="text-slate-500">Cadastro de Conferências da Unidade</p>
        </div>
        <button 
          onClick={() => { setFormData(emptyConference); setIsFormOpen(true); }} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusIcon />
          Nova Conferência
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                  <tr>
                      <th className="p-4 border-b">Nome / Cidade</th>
                      <th className="p-4 border-b">Diretoria</th>
                      <th className="p-4 border-b">Vínculo (Particular)</th>
                      <th className="p-4 border-b">Reunião</th>
                      <th className="p-4 border-b text-right">Ações</th>
                  </tr>
              </thead>
              <tbody className="text-sm">
                  {conferences.length === 0 ? (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma conferência cadastrada.</td>
                      </tr>
                  ) : (
                      conferences.map(conf => (
                          <tr key={conf.id} className="hover:bg-slate-50 border-b last:border-0">
                              <td className="p-4">
                                  <div className="font-bold text-slate-900">{conf.name}</div>
                                  <div className="text-xs text-slate-500">{conf.city} • Fund: {conf.foundationDate ? new Date(conf.foundationDate).toLocaleDateString('pt-BR') : '-'}</div>
                              </td>
                              <td className="p-4 text-slate-600 text-xs space-y-1">
                                  {conf.presidentName && <div>👤 Pres: {conf.presidentName}</div>}
                                  {conf.secretaryName && <div>📝 Sec: {conf.secretaryName}</div>}
                                  {conf.treasurerName && <div>💰 Tes: {conf.treasurerName}</div>}
                                  {conf.managerName && <div className="text-blue-600 font-bold">💻 Gest: {conf.managerName}</div>}
                              </td>
                              <td className="p-4 text-slate-600">
                                  {getCouncilName(conf.particularCouncil)}
                              </td>
                              <td className="p-4 text-slate-600">
                                  {conf.meetingDay} {conf.meetingTime && `às ${conf.meetingTime}`}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                  <button onClick={() => handleEdit(conf)} className="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                                  <button onClick={() => handleDelete(conf.id)} className="text-red-500 hover:text-red-700 font-medium">Excluir</button>
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
};
