
import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConferenceHierarchy, Member, AssistedFamily, Council, FinancialTransaction } from './types';
import { Sidebar } from './components/Sidebar';
import { Conference } from './pages/Conference';
import { Members } from './pages/Members';
import { Councils } from './pages/Councils';
import { FinancialControl } from './pages/FinancialControl';
import { AssistedFamilyForm } from './components/AssistedFamilyForm';
import { Header } from './components/Header';
import { PlusIcon } from './components/icons/PlusIcon';
import { Login } from './pages/Login';
import { supabase } from './supabaseClient';

type View = 'dashboard' | 'conference' | 'members' | 'assisted' | 'councils' | 'financial';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Global State ---
  const [conferences, setConferences] = useState<ConferenceHierarchy[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<AssistedFamily[]>([]);
  const [councils, setCouncils] = useState<Council[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  
  // --- Assisted Families State Management ---
  const [editingFamily, setEditingFamily] = useState<AssistedFamily | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [familyFilter, setFamilyFilter] = useState<'active' | 'archived'>('active');

  // --- INITIAL DATA FETCH ---
  const fetchAllData = async () => {
      setIsLoading(true);
      
      const { data: membersData } = await supabase.from('members').select('*');
      if (membersData) setMembers(membersData);

      const { data: conferencesData } = await supabase.from('conferences').select('*');
      if (conferencesData) setConferences(conferencesData);

      const { data: councilsData } = await supabase.from('councils').select('*');
      if (councilsData) setCouncils(councilsData);

      const { data: familiesData } = await supabase.from('families').select('*');
      if (familiesData) setFamilies(familiesData);

      const { data: transactionsData } = await supabase.from('transactions').select('*');
      if (transactionsData) setTransactions(transactionsData);

      setIsLoading(false);
  };

  useEffect(() => {
    // 1. Carregar membros para login (opcional, mas bom para cache)
    const loadMembersForLogin = async () => {
        const { data } = await supabase.from('members').select('*');
        if (data) setMembers(data);
    };

    // 2. Garantir usuário mestre (Teste de Conexão + Setup Inicial)
    const ensureMasterUser = async () => {
        const masterCpf = '999999999999';
        
        try {
            // Verifica se já existe
            const { data, error } = await supabase.from('members').select('id').eq('cpf', masterCpf).maybeSingle();
            
            if (error) {
                console.error("Erro de conexão ou tabela inexistente:", error);
                return;
            }

            if (!data) {
                console.log("Criando usuário mestre...");
                const { error: insertError } = await supabase.from('members').insert({
                    id: uuidv4(),
                    conferenceId: '', 
                    accessLevel: 'admin',
                    password: 'ssvp',
                    name: 'Gestor Mestre do Sistema',
                    cpf: masterCpf,
                    address: 'Sede Central - Administrativa',
                    type: 'Confrade',
                    role: 'Gestor do Sistema',
                    phone: '000000000',
                    active: true,
                    admissionDate: new Date().toISOString(),
                    acclamationDate: '',
                    proclamationDate: ''
                });
                
                if (insertError) {
                    console.error("Erro ao criar usuário mestre:", insertError);
                } else {
                    console.log("Usuário mestre criado com sucesso!");
                    loadMembersForLogin(); // Recarrega lista
                }
            }
        } catch (e) {
            console.error("Exceção ao configurar sistema:", e);
        }
    };

    ensureMasterUser();
    loadMembersForLogin();
  }, []);

  // Recarregar tudo quando o usuário loga
  useEffect(() => {
    if (currentUser) {
        fetchAllData();
    }
  }, [currentUser]);

  // --- ACTIONS (SUPABASE WRAPPERS) ---

  const handleLogin = async (cpfInput: string, pass: string) => {
      setIsLoading(true);
      
      // Sanitização: Remove tudo que não é número
      const cpf = cpfInput.replace(/\D/g, '');

      // Regra: Senha sempre 'ssvp'
      if (pass !== 'ssvp') {
          alert("Senha incorreta.");
          setIsLoading(false);
          return;
      }
      
      try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('cpf', cpf)
            .maybeSingle();

        if (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor. Verifique se as tabelas foram criadas no Supabase.");
            setIsLoading(false);
            return;
        }

        if (data) {
            if (!data.active) {
                alert("Usuário inativo. Contate o conselho.");
            } else {
                setCurrentUser(data as Member);
            }
        } else {
            alert(`CPF ${cpf} não encontrado no cadastro. (Certifique-se que o usuário mestre foi criado)`);
        }
      } catch (err) {
        console.error(err);
        alert("Ocorreu um erro inesperado.");
      } finally {
        setIsLoading(false);
      }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setCurrentView('dashboard');
      // Limpar dados sensíveis do estado? Opcional.
  };

  // --- CRUD HANDLERS ---

  // Family
  const handleSaveFamily = async (family: AssistedFamily) => {
    const familyWithStatus = { ...family, status: family.status || 'active' };
    
    const { error } = await supabase.from('families').upsert(familyWithStatus);
    
    if (error) {
        alert("Erro ao salvar família: " + error.message);
    } else {
        // Atualiza estado local
        if (editingFamily) {
            setFamilies(prev => prev.map(f => f.id === familyWithStatus.id ? familyWithStatus : f));
        } else {
            setFamilies(prev => [...prev, familyWithStatus]);
        }
        setIsFormOpen(false);
        setEditingFamily(null);
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (confirm('Deseja excluir permanentemente o cadastro desta família?')) {
        const { error } = await supabase.from('families').delete().eq('id', id);
        if (error) {
            alert("Erro ao excluir: " + error.message);
        } else {
            setFamilies(prev => prev.filter(f => f.id !== id));
        }
    }
  };

  const toggleFamilyStatus = async (id: string, newStatus: 'active' | 'archived') => {
      const msg = newStatus === 'archived' 
        ? "Deseja arquivar esta família?"
        : "Deseja reativar esta família?";
      
      if(confirm(msg)) {
          const { error } = await supabase.from('families').update({ status: newStatus }).eq('id', id);
          if (error) {
              alert("Erro ao atualizar status: " + error.message);
          } else {
              setFamilies(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
          }
      }
  };

  // Members
  const handleSaveMember = async (member: Member) => {
      const { error } = await supabase.from('members').upsert(member);
      if (error) {
          alert("Erro ao salvar membro: " + error.message);
      } else {
          // Update local state is tricky because upsert might be an update or insert
          // Easy way: re-fetch or manual merge
          const exists = members.find(m => m.id === member.id);
          if (exists) {
              setMembers(prev => prev.map(m => m.id === member.id ? member : m));
          } else {
              setMembers(prev => [...prev, member]);
          }
      }
  };

  const handleDeleteMember = async (id: string) => {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) alert("Erro ao excluir membro: " + error.message);
      else setMembers(prev => prev.filter(m => m.id !== id));
  };

  // Councils
  const handleSaveCouncil = async (council: Council) => {
      const { error } = await supabase.from('councils').upsert(council);
      if (error) alert("Erro ao salvar conselho: " + error.message);
      else {
          const exists = councils.find(c => c.id === council.id);
          if (exists) setCouncils(prev => prev.map(c => c.id === council.id ? council : c));
          else setCouncils(prev => [...prev, council]);
      }
  };

  const handleDeleteCouncil = async (id: string) => {
      const { error } = await supabase.from('councils').delete().eq('id', id);
      if (error) alert("Erro ao excluir conselho: " + error.message);
      else setCouncils(prev => prev.filter(c => c.id !== id));
  };

  // Conferences
  const handleSaveConference = async (conf: ConferenceHierarchy) => {
      const { error } = await supabase.from('conferences').upsert(conf);
      if (error) alert("Erro ao salvar conferência: " + error.message);
      else {
          const exists = conferences.find(c => c.id === conf.id);
          if (exists) setConferences(prev => prev.map(c => c.id === conf.id ? conf : c));
          else setConferences(prev => [...prev, conf]);
      }
  };

  const handleDeleteConference = async (id: string) => {
      const { error } = await supabase.from('conferences').delete().eq('id', id);
      if (error) alert("Erro ao excluir conferência: " + error.message);
      else setConferences(prev => prev.filter(c => c.id !== id));
  };

  // Transactions
  const handleSaveTransaction = async (trans: FinancialTransaction) => {
      const { error } = await supabase.from('transactions').upsert(trans);
      if (error) alert("Erro ao salvar lançamento: " + error.message);
      else setTransactions(prev => [...prev, trans]); // Only adds in UI for now (FinancialControl creates new UUIDs)
  };

  const handleDeleteTransaction = async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) alert("Erro ao excluir lançamento: " + error.message);
      else setTransactions(prev => prev.filter(t => t.id !== id));
  };


  const handleEditFamilyStart = (family: AssistedFamily) => {
    setEditingFamily(family);
    setIsFormOpen(true);
  };

  // --- FILTERED DATA (Based on User Role) ---
  
  const filteredData = useMemo(() => {
      if (!currentUser) return { confs: [], fams: [], mems: [], trans: [] };

      // Se for Admin (Conselho), vê tudo
      if (currentUser.accessLevel === 'admin') {
          return {
              confs: conferences,
              fams: families,
              mems: members,
              trans: transactions
          };
      }

      // Se for User (Membro), vê apenas dados da sua conferência
      const myConfId = currentUser.conferenceId;
      return {
          confs: conferences.filter(c => c.id === myConfId),
          fams: families.filter(f => f.conferenceId === myConfId),
          mems: members.filter(m => m.conferenceId === myConfId), // Vê apenas membros da sua conferência
          trans: transactions.filter(t => t.conferenceId === myConfId)
      };

  }, [currentUser, conferences, families, members, transactions]);

  // --- RENDER ---

  if (!currentUser) {
      return <Login onLogin={handleLogin} isLoading={isLoading} />;
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Painel Geral</h2>
        <p className="text-slate-500">Olá, {currentUser.name}</p>
        {isLoading && <span className="text-xs text-blue-600 animate-pulse">Sincronizando dados...</span>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium uppercase">Conferências</h3>
            <p className="text-4xl font-bold text-slate-800 mt-2">{filteredData.confs.length}</p>
            {currentUser.accessLevel === 'admin' && (
                <div className="mt-4 text-xs text-slate-600 font-semibold cursor-pointer" onClick={() => setCurrentView('conference')}>Gerenciar &rarr;</div>
            )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium uppercase">Membros Ativos</h3>
            <p className="text-4xl font-bold text-blue-900 mt-2">{filteredData.mems.filter(m => m.active).length}</p>
            <div className="mt-4 text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => setCurrentView('members')}>Ver Membros &rarr;</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium uppercase">Famílias Assistidas</h3>
            <p className="text-4xl font-bold text-green-900 mt-2">{filteredData.fams.filter(f => (f.status || 'active') === 'active').length}</p>
             <div className="mt-4 text-xs text-green-600 font-semibold cursor-pointer" onClick={() => setCurrentView('assisted')}>Ver Famílias &rarr;</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium uppercase">Caixa Atual</h3>
            <p className="text-4xl font-bold text-slate-800 mt-2">R$ 0,00</p>
            <div className="mt-4 text-xs text-slate-600 cursor-pointer" onClick={() => setCurrentView('financial')}>Financeiro &rarr;</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Mensagem do Conselho</h3>
          <p className="text-blue-800">
              {currentUser.accessLevel === 'admin' 
                ? "Como presidente de conselho, verifique a regularidade das conferências vinculadas." 
                : "Lembre-se de manter as fichas de sindicância atualizadas para a próxima visita regulamentar."}
          </p>
      </div>
    </div>
  );

  const renderAssistedList = () => {
    if (isFormOpen) {
        return (
            <AssistedFamilyForm 
                initialData={editingFamily} 
                conferences={filteredData.confs} 
                userConferenceId={currentUser.accessLevel === 'user' ? currentUser.conferenceId : undefined}
                onSubmit={handleSaveFamily} 
                onCancel={() => { setIsFormOpen(false); setEditingFamily(null); }} 
            />
        );
    }

    const displayedFamilies = filteredData.fams.filter(f => (f.status || 'active') === familyFilter);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Famílias Assistidas</h2>
                    <p className="text-slate-500">
                        {currentUser.accessLevel === 'user' ? 'Minha Conferência' : 'Todas as Conferências'}
                    </p>
                </div>
                <button 
                onClick={() => { setEditingFamily(null); setIsFormOpen(true); }} 
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                <PlusIcon />
                Nova Família
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 border-b border-slate-200">
                <button
                    onClick={() => setFamilyFilter('active')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${familyFilter === 'active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Em Atendimento
                </button>
                <button
                    onClick={() => setFamilyFilter('archived')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${familyFilter === 'archived' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Arquivadas
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="p-4 border-b">Assistido Principal</th>
                            {currentUser.accessLevel === 'admin' && <th className="p-4 border-b">Conferência</th>}
                            <th className="p-4 border-b">Endereço</th>
                            <th className="p-4 border-b text-center">Membros</th>
                            <th className="p-4 border-b text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {displayedFamilies.length === 0 ? (
                             <tr>
                                <td colSpan={currentUser.accessLevel === 'admin' ? 5 : 4} className="p-8 text-center text-slate-500">
                                    {familyFilter === 'active' 
                                        ? "Nenhuma família em atendimento." 
                                        : "Nenhuma família arquivada."}
                                </td>
                            </tr>
                        ) : (
                            displayedFamilies.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50 border-b last:border-0">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{f.assistedName}</div>
                                        {f.spouseName && <div className="text-xs text-slate-500">Cônjuge: {f.spouseName}</div>}
                                    </td>
                                    {currentUser.accessLevel === 'admin' && (
                                        <td className="p-4 text-slate-600 text-xs">{f.conference || '-'}</td>
                                    )}
                                    <td className="p-4 text-slate-600">{f.address}</td>
                                    <td className="p-4 text-center text-slate-600">{f.familyMembers.length + (f.spouseName ? 2 : 1)}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEditFamilyStart(f)} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide">Editar</button>
                                        
                                        {f.status === 'archived' ? (
                                             <button onClick={() => toggleFamilyStatus(f.id, 'active')} className="text-green-600 hover:text-green-800 font-medium text-xs uppercase tracking-wide">Reativar</button>
                                        ) : (
                                             <button onClick={() => toggleFamilyStatus(f.id, 'archived')} className="text-amber-600 hover:text-amber-800 font-medium text-xs uppercase tracking-wide">Arquivar</button>
                                        )}
                                        
                                        <button onClick={() => handleDeleteFamily(f.id)} className="text-red-500 hover:text-red-700 font-medium text-xs uppercase tracking-wide ml-2">Excluir</button>
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

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center lg:hidden shrink-0 z-10">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-bold text-lg text-blue-900">SSVP</span>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {currentView === 'dashboard' && <Header />} {/* Show Banner on Dashboard only */}
                
                <div className="mt-6">
                    {currentView === 'dashboard' && renderDashboard()}
                    
                    {currentView === 'councils' && (
                        <Councils 
                            councils={councils} 
                            onSave={handleSaveCouncil}
                            onDelete={handleDeleteCouncil}
                        />
                    )}
                    
                    {currentView === 'conference' && (
                        <Conference 
                            conferences={filteredData.confs} 
                            councils={councils} 
                            onSave={handleSaveConference}
                            onDelete={handleDeleteConference}
                        />
                    )}
                    
                    {currentView === 'members' && (
                         <Members 
                            members={filteredData.mems} 
                            conferences={filteredData.confs} 
                            onSave={handleSaveMember}
                            onDelete={handleDeleteMember}
                         />
                    )}
                    
                    {currentView === 'assisted' && renderAssistedList()}
                    
                    {currentView === 'financial' && (
                        <FinancialControl 
                            transactions={filteredData.trans} 
                            conferences={filteredData.confs} 
                            councils={councils}
                            members={filteredData.mems}
                            families={filteredData.fams}
                            onSave={handleSaveTransaction}
                            onDelete={handleDeleteTransaction}
                        />
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
