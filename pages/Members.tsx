
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Member, ConferenceHierarchy } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

interface MembersProps {
  members: Member[];
  conferences: ConferenceHierarchy[];
  onSave: (member: Member) => void;
  onDelete: (id: string) => void;
}

export const Members: React.FC<MembersProps> = ({ members, conferences, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState<Partial<Member>>({
    name: '',
    cpf: '',
    password: 'ssvp', // Default Password
    conferenceId: '',
    accessLevel: 'user',
    address: '',
    type: 'Confrade',
    role: 'Membro',
    active: true,
    phone: '',
    admissionDate: new Date().toISOString().split('T')[0],
    acclamationDate: '',
    proclamationDate: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.name && newMember.cpf) {
      onSave({ ...newMember, id: uuidv4() } as Member);
      setNewMember({
        name: '',
        cpf: '',
        password: 'ssvp',
        conferenceId: '',
        accessLevel: 'user',
        address: '',
        type: 'Confrade',
        role: 'Membro',
        active: true,
        phone: '',
        admissionDate: new Date().toISOString().split('T')[0],
        acclamationDate: '',
        proclamationDate: ''
      });
      setIsAdding(false);
    }
  };

  const removeMember = (id: string) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      onDelete(id);
    }
  };

  const getConferenceName = (id?: string) => {
      if (!id) return 'Não Vinculado (Admin?)';
      return conferences.find(c => c.id === id)?.name || 'Conferência Desconhecida';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Membros da Conferência</h2>
            <p className="text-slate-500">Gestão de Confrades, Consócias e Acessos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusIcon />
          Novo Membro
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 animate-fade-in">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-slate-700">Ficha de Cadastro de Membro</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Linha 1: Dados Pessoais Básicos */}
            <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input 
                    required
                    className="w-full px-3 py-2 border rounded-md" 
                    value={newMember.name} 
                    onChange={e => setNewMember({...newMember, name: e.target.value})} 
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF (Login)</label>
                <input 
                    required
                    className="w-full px-3 py-2 border rounded-md" 
                    value={newMember.cpf} 
                    placeholder="000.000.000-00"
                    onChange={e => setNewMember({...newMember, cpf: e.target.value})} 
                />
            </div>

            {/* Linha de Autenticação e Vínculo */}
            
            <div className="md:col-span-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Conferência (Vínculo)</label>
                <select 
                    className="w-full px-3 py-2 border rounded-md bg-white" 
                    value={newMember.conferenceId} 
                    onChange={e => setNewMember({...newMember, conferenceId: e.target.value})}
                >
                    <option value="">Selecione...</option>
                    {conferences.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            {/* Nível de Acesso Removido: Definido automaticamente pelo Cargo abaixo */}

            {/* Linha 2: Contato e Endereço */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input 
                    className="w-full px-3 py-2 border rounded-md" 
                    value={newMember.phone} 
                    onChange={e => setNewMember({...newMember, phone: e.target.value})} 
                />
            </div>
            <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                <input 
                    className="w-full px-3 py-2 border rounded-md" 
                    value={newMember.address} 
                    onChange={e => setNewMember({...newMember, address: e.target.value})} 
                />
            </div>

            {/* Linha 3: Dados Vicentinos */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select 
                    className="w-full px-3 py-2 border rounded-md bg-white" 
                    value={newMember.type} 
                    onChange={e => setNewMember({...newMember, type: e.target.value as any})}
                >
                    <option value="Confrade">Confrade</option>
                    <option value="Consócia">Consócia</option>
                </select>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Função / Encargo</label>
                <select 
                    className="w-full px-3 py-2 border rounded-md bg-white" 
                    value={newMember.role} 
                    onChange={e => {
                        const newRole = e.target.value;
                        // Regra de Negócio: Apenas 'Gestor do Sistema' ganha permissão de ADMIN automaticamente.
                        // Todos os outros cargos ganham permissão USER (restrito à conferência).
                        const newAccessLevel = newRole === 'Gestor do Sistema' ? 'admin' : 'user';
                        setNewMember({...newMember, role: newRole, accessLevel: newAccessLevel});
                    }}
                >
                    <option value="Presidente">Presidente</option>
                    <option value="Vice-Presidente">Vice-Presidente</option>
                    <option value="Secretário">Secretário</option>
                    <option value="Tesoureiro">Tesoureiro</option>
                    <option value="Gestor do Sistema">Gestor do Sistema</option>
                    <option value="Membro">Membro</option>
                    <option value="Aspirante">Aspirante</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                    * Gestor do Sistema recebe acesso administrativo total.
                </p>
            </div>
            <div className="md:col-span-2 flex items-center pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={newMember.active}
                        onChange={e => setNewMember({...newMember, active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Membro Ativo</span>
                </label>
            </div>

            {/* Linha 4: Datas Importantes */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Início (Conferência)</label>
                <input 
                    type="date"
                    className="w-full px-3 py-2 border rounded-md" 
                    value={newMember.admissionDate} 
                    onChange={e => setNewMember({...newMember, admissionDate: e.target.value})} 
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Aclamação</label>
                <input 
                    type="date"
                    className="w-full px-3 py-2 border rounded-md" 
                    value={newMember.acclamationDate} 
                    onChange={e => setNewMember({...newMember, acclamationDate: e.target.value})} 
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Proclamação</label>
                <input 
                    type="date"
                    className="w-full px-3 py-2 border rounded-md" 
                    value={newMember.proclamationDate} 
                    onChange={e => setNewMember({...newMember, proclamationDate: e.target.value})} 
                />
            </div>

            <div className="md:col-span-6 flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm">Salvar Cadastro</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                <th className="p-4 border-b">Nome / Login</th>
                <th className="p-4 border-b">Conferência</th>
                <th className="p-4 border-b">Tipo/Encargo</th>
                <th className="p-4 border-b">Contato</th>
                <th className="p-4 border-b">Datas</th>
                <th className="p-4 border-b text-center">Ativo</th>
                <th className="p-4 border-b text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {members.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">Nenhum membro cadastrado.</td>
                    </tr>
                ) : (
                    members.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50 border-b last:border-0">
                        <td className="p-4">
                            <div className="font-medium text-slate-900">{member.name}</div>
                            <div className="text-xs text-slate-400">CPF: {member.cpf}</div>
                        </td>
                        <td className="p-4 text-slate-600 text-xs">
                             {getConferenceName(member.conferenceId)}
                        </td>
                        <td className="p-4 text-slate-600">
                            <div className="flex flex-col gap-1">
                                <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${member.type === 'Confrade' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                    {member.type}
                                </span>
                                <span className="text-xs">{member.role}</span>
                                {member.accessLevel === 'admin' && <span className="text-[10px] text-purple-700 font-bold">ADMIN</span>}
                            </div>
                        </td>
                        <td className="p-4 text-slate-600">{member.phone || '-'}</td>
                        <td className="p-4 text-xs text-slate-500">
                            <div>Início: {member.admissionDate ? new Date(member.admissionDate).toLocaleDateString('pt-BR') : '-'}</div>
                        </td>
                        <td className="p-4 text-center">
                            <span className={`inline-block w-2 h-2 rounded-full ${member.active ? 'bg-green-500' : 'bg-red-500'}`} title={member.active ? 'Ativo' : 'Inativo'}></span>
                        </td>
                        <td className="p-4 text-right">
                            <button onClick={() => removeMember(member.id)} className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                                <TrashIcon />
                            </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
