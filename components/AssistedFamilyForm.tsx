
import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AssistedFamily, FormData, FamilyMember, VisitRecord, ConferenceHierarchy } from '../types';
import { Section } from './Section';
import { Input, DateInput, NumberInput } from './Input';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface Props {
  initialData?: AssistedFamily | null;
  conferences: ConferenceHierarchy[]; // Recebe lista para vincular
  userConferenceId?: string; // ID da conferência do usuário logado (se não for admin)
  onSubmit: (data: AssistedFamily) => void;
  onCancel: () => void;
}

const emptyForm: FormData = {
  conferenceId: '',
  conference: '',
  status: 'active', // Default status
  assistedName: '',
  assistedBirthDate: '',
  spouseName: '',
  spouseBirthDate: '',
  address: '',
  maritalStatus: '',
  religion: '',
  housingSituation: '',
  familyMembers: [],
  profession: '',
  workingMembersCount: '',
  rentValue: '',
  netIncome: '',
  governmentAssistance: '',
  healthInfo: '',
  churchParticipation: '',
  sacramentsInfo: '',
  visitors: '',
  approvalDate: '',
  generalObservations: '',
  visits: [],
};

export const AssistedFamilyForm: React.FC<Props> = ({ initialData, conferences, userConferenceId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [activeTab, setActiveTab] = useState<'cadastro' | 'acompanhamento'>('cadastro');
  
  // State for new visit form
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [newVisit, setNewVisit] = useState<Partial<VisitRecord>>({
    date: new Date().toISOString().split('T')[0],
    visitors: '',
    report: '',
    needs: ''
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = initialData;
      setFormData({ 
          ...rest, 
          visits: rest.visits || [],
          status: rest.status || 'active' 
      });
    } else if (userConferenceId) {
        // Se criando novo e usuário tem conferência fixa
        const userConf = conferences.find(c => c.id === userConferenceId);
        setFormData(prev => ({
            ...prev,
            conferenceId: userConferenceId,
            conference: userConf?.name || ''
        }));
    }
  }, [initialData, userConferenceId, conferences]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleConferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      const selectedName = conferences.find(c => c.id === selectedId)?.name || '';
      setFormData(prev => ({
          ...prev,
          conferenceId: selectedId,
          conference: selectedName
      }));
  };
  
  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  }, []);

  const addFamilyMember = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { id: uuidv4(), name: '', birthDate: '', isBaptized: false }]
    }));
  }, []);

  const removeFamilyMember = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(member => member.id !== id)
    }));
  }, []);

  const handleFamilyMemberChange = useCallback((id: string, field: keyof Omit<FamilyMember, 'id'>, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  }, []);

  const handleAddVisit = () => {
    if (!newVisit.date || !newVisit.report) {
        alert("Preencha a data e o relato da visita.");
        return;
    }
    
    const visitToAdd: VisitRecord = {
        id: uuidv4(),
        date: newVisit.date,
        visitors: newVisit.visitors || '',
        report: newVisit.report,
        needs: newVisit.needs || ''
    };

    setFormData(prev => ({
        ...prev,
        visits: [visitToAdd, ...prev.visits] // Add to top
    }));

    setNewVisit({
        date: new Date().toISOString().split('T')[0],
        visitors: '',
        report: '',
        needs: ''
    });
    setIsAddingVisit(false);
  };

  const removeVisit = (visitId: string) => {
      if(confirm("Remover este registro de visita?")) {
        setFormData(prev => ({
            ...prev,
            visits: prev.visits.filter(v => v.id !== visitId)
        }));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.conferenceId) {
        alert("Selecione a Conferência responsável.");
        return;
    }
    const finalData: AssistedFamily = {
        id: initialData?.id || uuidv4(),
        ...formData
    };
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-100px)]">
      <div className="p-6 sm:p-8 border-b border-slate-200 shrink-0">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
                {initialData ? `Família: ${initialData.assistedName}` : 'Nova Família Assistida'}
            </h2>
            <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-700">
                ✕
            </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-slate-200">
            <button
                type="button"
                className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'cadastro' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('cadastro')}
            >
                Dados Cadastrais
            </button>
            <button
                type="button"
                className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'acompanhamento' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('acompanhamento')}
            >
                Histórico de Acompanhamento ({formData.visits.length})
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        
        {/* TAB: CADASTRO */}
        {activeTab === 'cadastro' && (
            <div className="space-y-8">
                <Section title="Conferência Responsável">
                    <div className="grid grid-cols-1 gap-6">
                        {userConferenceId ? (
                             <Input label="Conferência" name="conference" value={formData.conference} disabled />
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selecione a Conferência</label>
                                <select 
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={formData.conferenceId}
                                    onChange={handleConferenceChange}
                                >
                                    <option value="">Selecione...</option>
                                    {conferences.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </Section>

                <Section title="Dados Cadastrais">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Input label="Nome do Assistido" name="assistedName" value={formData.assistedName} onChange={handleChange} required />
                    <DateInput label="Dt. Nasc." name="assistedBirthDate" value={formData.assistedBirthDate} onChange={handleChange} />
                    <Input label="Nome do Cônjuge" name="spouseName" value={formData.spouseName} onChange={handleChange} />
                    <DateInput label="Dt. Nasc." name="spouseBirthDate" value={formData.spouseBirthDate} onChange={handleChange} />
                    <div className="md:col-span-2">
                        <Input label="Endereço" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <Input label="Estado Civil" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} />
                    <Input label="Religião" name="religion" value={formData.religion} onChange={handleChange} />
                    <Input label="Situação Moradia" name="housingSituation" value={formData.housingSituation} onChange={handleChange} placeholder="Própria, Alugada, Cedida..." />
                    </div>
                </Section>

                <Section title="Membros da Família">
                    <div className="space-y-4">
                    {formData.familyMembers.map((member) => (
                        <div key={member.id} className="grid grid-cols-1 sm:grid-cols-7 gap-4 items-center p-3 bg-slate-50 rounded-lg border">
                        <div className="sm:col-span-3">
                            <Input placeholder="Nome Completo" value={member.name} onChange={(e) => handleFamilyMemberChange(member.id, 'name', e.target.value)} />
                        </div>
                            <div className="sm:col-span-2">
                            <DateInput value={member.birthDate} onChange={(e) => handleFamilyMemberChange(member.id, 'birthDate', e.target.value)} />
                        </div>
                            <div className="sm:col-span-1 flex items-center justify-center">
                            <Checkbox label="Batizado?" checked={member.isBaptized} onChange={(e) => handleFamilyMemberChange(member.id, 'isBaptized', e.target.checked)} />
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                            <button type="button" onClick={() => removeFamilyMember(member.id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors">
                            <TrashIcon />
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                    <button type="button" onClick={addFamilyMember} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                    <PlusIcon />
                    Adicionar Membro
                    </button>
                </Section>

                <Section title="Situação Financeira">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Input label="Profissão" name="profession" value={formData.profession} onChange={handleChange} />
                    <NumberInput label="Quantos Trabalham?" name="workingMembersCount" value={formData.workingMembersCount} onChange={handleChange} />
                    <NumberInput label="Valor do Aluguel" name="rentValue" value={formData.rentValue} onChange={handleChange} isCurrency={true} />
                    <NumberInput label="Renda Líquida" name="netIncome" value={formData.netIncome} onChange={handleChange} isCurrency={true} />
                    <div className="md:col-span-2">
                        <Textarea label="Assistência do governo" name="governmentAssistance" value={formData.governmentAssistance} onChange={handleChange} rows={2} />
                    </div>
                    </div>
                </Section>

                <Section title="Observações">
                    <div className="grid grid-cols-1 gap-4">
                    <Textarea label="Alguém doente? Precisa de medicação?" name="healthInfo" value={formData.healthInfo} onChange={handleChange} rows={3} />
                    <Textarea label="Participação da igreja?" name="churchParticipation" value={formData.churchParticipation} onChange={handleChange} rows={3} />
                    <Textarea label="Precisam dos sacramentos? (crisma, matrimônio)" name="sacramentsInfo" value={formData.sacramentsInfo} onChange={handleChange} rows={3} />
                    </div>
                </Section>

                <Section title="Aprovação Inicial">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <Input label="Visitadores" name="visitors" value={formData.visitors} onChange={handleChange} />
                    <DateInput label="Aprovado em" name="approvalDate" value={formData.approvalDate} onChange={handleChange} />
                    </div>
                    <div className="mt-4">
                        <Textarea label="Demais Observações" name="generalObservations" value={formData.generalObservations} onChange={handleChange} rows={4} />
                    </div>
                </Section>
            </div>
        )}

        {/* TAB: ACOMPANHAMENTO */}
        {activeTab === 'acompanhamento' && (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-blue-900">Registro de Visitas</h3>
                        <p className="text-sm text-blue-700">Relate semanalmente as visitas realizadas e as necessidades da família.</p>
                    </div>
                    {!isAddingVisit && (
                        <button 
                            type="button" 
                            onClick={() => setIsAddingVisit(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center gap-2"
                        >
                            <PlusIcon /> Registrar Visita
                        </button>
                    )}
                </div>

                {isAddingVisit && (
                    <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-md animate-fade-in">
                        <h4 className="font-bold text-lg mb-4 text-slate-800">Nova Visita</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DateInput 
                                label="Data da Visita" 
                                value={newVisit.date} 
                                onChange={(e) => setNewVisit({...newVisit, date: e.target.value})} 
                            />
                            <Input 
                                label="Vicentinos Visitantes" 
                                value={newVisit.visitors} 
                                onChange={(e) => setNewVisit({...newVisit, visitors: e.target.value})} 
                                placeholder="Quem realizou a visita?"
                            />
                            <div className="md:col-span-2">
                                <Textarea 
                                    label="Relato da Visita (Escuta Caridosa)" 
                                    value={newVisit.report} 
                                    onChange={(e) => setNewVisit({...newVisit, report: e.target.value})} 
                                    rows={4}
                                    placeholder="Descreva como a família está, principais assuntos conversados..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input 
                                    label="Necessidades Identificadas / Ações" 
                                    value={newVisit.needs} 
                                    onChange={(e) => setNewVisit({...newVisit, needs: e.target.value})} 
                                    placeholder="Cesta básica, remédios, apoio espiritual, orientação..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button 
                                type="button" 
                                onClick={() => setIsAddingVisit(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleAddVisit}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                            >
                                Salvar Relato
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {formData.visits.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                            Nenhuma visita registrada ainda.
                        </div>
                    ) : (
                        formData.visits.map((visit) => (
                            <div key={visit.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded text-sm">
                                                {new Date(visit.date).toLocaleDateString('pt-BR')}
                                            </div>
                                            {visit.visitors && (
                                                <span className="text-sm text-slate-500">
                                                    por <span className="font-medium text-slate-700">{visit.visitors}</span>
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeVisit(visit.id)}
                                            className="text-slate-400 hover:text-red-500"
                                            title="Excluir registro"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                    
                                    <div className="text-slate-700 whitespace-pre-wrap mb-3">
                                        {visit.report}
                                    </div>
                                    
                                    {visit.needs && (
                                        <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md border border-yellow-100">
                                            <strong>Necessidades/Ações:</strong> {visit.needs}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
      </div>
      
      <div className="p-6 sm:p-8 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-lg flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
            Fechar / Cancelar
        </button>
        <button type="submit" className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all">
          Salvar Tudo
        </button>
      </div>
    </form>
  );
};
