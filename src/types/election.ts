export interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
  votes: number;
  isSpecial?: boolean; // Votos Nulos, Votos en Blanco, Votos Impugnados
  isHero?: boolean; // Dante Mendieta (Alianza para el Progreso)
  logoText?: string;
  partyAcronym?: string;
}

export interface MesaConfig {
  district: string;
  mesaNumber: string;
  totalPadron: number;
  votedOfficial: number;
  absentOfficial: number;
  localVotacion: string;
}

export interface HistoryAction {
  id: string;
  type: 'ADD' | 'SUBTRACT' | 'TRANSFER_TO_NULL' | 'RESET';
  candidateId?: string;
  candidateName?: string;
  delta?: number;
  description: string;
  timestamp: number;
  snapshot: Record<string, number>; // candidateId -> votes
}

export interface ElectoralStats {
  totalPadron: number;
  votedOfficial: number;
  absentOfficial: number;
  totalCounted: number;
  validVotes: number;
  nullVotes: number;
  blankVotes: number;
  contestedVotes: number; // Impugnados
  isBalanced: boolean;
  difference: number;
  participationRate: number;
  absenteeismRate: number;
}
