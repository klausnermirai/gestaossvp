
export interface FamilyMember {
  id: string;
  name: string;
  birthDate: string;
  isBaptized: boolean;
}

export interface VisitRecord {
  id: string;
  date: string;
  visitors: string; // Quem fez a visita
  report: string; // Relato do que aconteceu/foi observado
  needs: string; // Necessidades identificadas (cesta básica, remédios, espiritual)
}

export interface AssistedFamily {
  id: string;
  conferenceId: string; // Vínculo forte por ID
  conference: string; // Nome legado (para exibição)
  status: 'active' | 'archived'; 
  assistedName: string;
  assistedBirthDate: string;
  spouseName: string;
  spouseBirthDate: string;
  address: string;
  maritalStatus: string;
  religion: string;
  housingSituation: string;
  familyMembers: FamilyMember[];
  profession: string;
  workingMembersCount: number | string;
  rentValue: number | string;
  netIncome: number | string;
  governmentAssistance: string;
  healthInfo: string;
  churchParticipation: string;
  sacramentsInfo: string;
  visitors: string;
  approvalDate: string;
  generalObservations: string;
  visits: VisitRecord[]; 
}

// Alias para compatibilidade com o form antigo
export type FormData = Omit<AssistedFamily, 'id'>;

export interface Member {
  id: string;
  conferenceId: string; // Vínculo do membro com a conferência
  accessLevel: 'admin' | 'user'; // Admin = Conselho (vê tudo), User = Conferência (vê apenas a sua)
  password: string; // Senha para login
  name: string;
  cpf: string; // Login
  address: string;
  type: 'Confrade' | 'Consócia';
  role: string; 
  phone: string;
  active: boolean;
  admissionDate: string; 
  acclamationDate: string;
  proclamationDate: string;
}

export interface ConferenceHierarchy {
  id: string; 
  metropolitanCouncil: string; 
  centralCouncil: string;      
  particularCouncil: string;   
  name: string; 
  
  // Diretoria
  presidentName: string;
  presidentCpf: string;
  presidentPhone: string;
  
  secretaryName: string;
  secretaryCpf: string;
  
  treasurerName: string;
  treasurerCpf: string;
  
  managerName: string; // Gestor do Sistema
  managerCpf: string;

  city: string;
  foundationDate: string;
  meetingAddress: string;
  meetingDay: string;
  meetingTime: string;
}

export type CouncilType = 'Metropolitano' | 'Central' | 'Particular';

export interface Council {
  id: string;
  type: CouncilType;
  name: string;
  parentId?: string; 
  address: string;
  email: string;
  
  // Diretoria
  presidentName: string;
  presidentCpf: string;
  presidentPhone: string;

  secretaryName: string;
  secretaryCpf: string;
  
  treasurerName: string;
  treasurerCpf: string;

  managerName: string; // Gestor do Sistema
  managerCpf: string;
}

// --- NOVOS TIPOS FINANCEIROS ---

export interface FinancialTransaction {
  id: string;
  conferenceId: string;
  date: string;
  type: 'income' | 'expense';
  categoryId: number; 
  description: string;
  value: number;
}

export interface MonthlyMapData {
  id: string; 
  conferenceId: string;
  month: number;
  year: number;
  previousBalance: number; 
  
  // Dados Estatísticos do Mês
  activeMembers: number; 
  confradesCount: number;
  consociasCount: number;
  aspirantesCount: number;
  auxiliaresCount: number;
  familiesAssistedCount: number;
  peopleAssistedCount: number;
  
  // Dados de Rodapé
  foodKg: number;
  specialWorks: string; 
  peopleAttendedSpecialWorks: number;
  expensesSpecialWorks: number;
  constructionReform: string;
}
