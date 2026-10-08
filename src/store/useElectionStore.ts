import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Candidate, HistoryAction, MesaConfig, ElectoralStats } from '@/types/election';
import {
  INITIAL_CANDIDATES,
  INITIAL_MESA_CONFIG,
  NULL_CANDIDATE_ID,
  BLANK_CANDIDATE_ID,
  CONTESTED_CANDIDATE_ID,
  HERO_CANDIDATE_ID,
} from '@/data/initialData';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';

interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ElectionStoreState {
  candidates: Candidate[];
  mesaConfig: MesaConfig;
  soundEnabled: boolean;
  searchQuery: string;
  activeFilter: 'all' | 'candidates' | 'special';
  history: HistoryAction[];
  redoStack: HistoryAction[];
  toast: ToastState | null;
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;

  // Actions
  addVotes: (candidateId: string, amount: number) => void;
  subtractVote: (candidateId: string) => void;
  transferToNull: (candidateId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  resetToInitial: () => void;
  toggleSound: () => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: 'all' | 'candidates' | 'special') => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', durationMs?: number) => void;
  clearToast: () => void;

  // Computed helper getters
  getElectoralStats: () => ElectoralStats;
  getHeroCandidate: () => Candidate | undefined;
  getHeroRank: () => number;
  getSortedCandidates: () => Candidate[];
}

const getSnapshot = (candidates: Candidate[]): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const c of candidates) {
    map[c.id] = c.votes;
  }
  return map;
};

export const useElectionStore = create<ElectionStoreState>()(
  persist(
    (set, get) => ({
      candidates: INITIAL_CANDIDATES,
      mesaConfig: INITIAL_MESA_CONFIG,
      soundEnabled: true,
      searchQuery: '',
      activeFilter: 'all',
      history: [],
      redoStack: [],
      toast: null,
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),

      addVotes: (candidateId: string, amount: number) => {
        const state = get();
        const currentCandidates = state.candidates;
        const target = currentCandidates.find((c) => c.id === candidateId);
        if (!target) return;

        // Check if Dante was #1 before this action
        const wasHeroFirst = get().getHeroRank() === 1;

        const prevSnapshot = getSnapshot(currentCandidates);
        const nextCandidates = currentCandidates.map((c) =>
          c.id === candidateId ? { ...c, votes: Math.max(0, c.votes + amount) } : c
        );

        const newHistoryAction: HistoryAction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'ADD',
          candidateId,
          candidateName: target.name,
          delta: amount,
          description: `+${amount} votos a ${target.name}`,
          timestamp: Date.now(),
          snapshot: prevSnapshot,
        };

        set({
          candidates: nextCandidates,
          history: [...state.history, newHistoryAction],
          redoStack: [],
        });

        // Audio & Haptic feedback
        const isNowHeroFirst = get().getHeroRank() === 1;
        if (!wasHeroFirst && isNowHeroFirst && target.id === HERO_CANDIDATE_ID) {
          sound.playVictory();
          triggerHaptic('success');
          get().showToast('👑 ¡Dante Mendieta (APP) alcanzó el Primer Puesto!', 'success', 3500);
        } else {
          if (amount >= 5) {
            sound.playVotePlusFive();
            triggerHaptic('medium');
          } else {
            sound.playVotePlusOne();
            triggerHaptic('light');
          }
        }

        // Check if exact table cuadre reached
        const stats = get().getElectoralStats();
        if (stats.isBalanced) {
          sound.playBalanced();
        }
      },

      subtractVote: (candidateId: string) => {
        const state = get();
        const currentCandidates = state.candidates;
        const target = currentCandidates.find((c) => c.id === candidateId);
        if (!target || target.votes <= 0) return;

        const prevSnapshot = getSnapshot(currentCandidates);
        const nextCandidates = currentCandidates.map((c) =>
          c.id === candidateId ? { ...c, votes: Math.max(0, c.votes - 1) } : c
        );

        const newHistoryAction: HistoryAction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'SUBTRACT',
          candidateId,
          candidateName: target.name,
          delta: -1,
          description: `-1 voto corregido a ${target.name}`,
          timestamp: Date.now(),
          snapshot: prevSnapshot,
        };

        set({
          candidates: nextCandidates,
          history: [...state.history, newHistoryAction],
          redoStack: [],
        });

        sound.playVoteMinusOne();
        triggerHaptic('warning');
        get().showToast(`-1 voto corregido a ${target.name}`, 'info', 2000);
      },

      transferToNull: (candidateId: string) => {
        const state = get();
        const currentCandidates = state.candidates;
        const target = currentCandidates.find((c) => c.id === candidateId);
        if (!target || target.votes <= 0 || target.id === NULL_CANDIDATE_ID) return;

        const prevSnapshot = getSnapshot(currentCandidates);
        const nextCandidates = currentCandidates.map((c) => {
          if (c.id === candidateId) {
            return { ...c, votes: Math.max(0, c.votes - 1) };
          }
          if (c.id === NULL_CANDIDATE_ID) {
            return { ...c, votes: c.votes + 1 };
          }
          return c;
        });

        const newHistoryAction: HistoryAction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'TRANSFER_TO_NULL',
          candidateId,
          candidateName: target.name,
          delta: -1,
          description: `1 voto de ${target.name} trasladado a Votos Nulos`,
          timestamp: Date.now(),
          snapshot: prevSnapshot,
        };

        set({
          candidates: nextCandidates,
          history: [...state.history, newHistoryAction],
          redoStack: [],
        });

        sound.playTransferNull();
        triggerHaptic('warning');
        get().showToast(`1 voto de ${target.name} trasladado a Votos Nulos`, 'warning', 3000);
      },

      undo: () => {
        const state = get();
        if (state.history.length === 0) return;

        const lastAction = state.history[state.history.length - 1];
        const currentSnapshot = getSnapshot(state.candidates);

        // Reconstruct candidates using the snapshot before this action
        const restoredCandidates = state.candidates.map((c) => ({
          ...c,
          votes: lastAction.snapshot[c.id] ?? c.votes,
        }));

        const newRedoAction: HistoryAction = {
          ...lastAction,
          snapshot: currentSnapshot,
        };

        set({
          candidates: restoredCandidates,
          history: state.history.slice(0, -1),
          redoStack: [...state.redoStack, newRedoAction],
        });

        sound.playUndo();
        triggerHaptic('medium');
        get().showToast(`Deshecho: ${lastAction.description}`, 'info', 2500);
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;

        const lastRedo = state.redoStack[state.redoStack.length - 1];
        const currentSnapshot = getSnapshot(state.candidates);

        const restoredCandidates = state.candidates.map((c) => ({
          ...c,
          votes: lastRedo.snapshot[c.id] ?? c.votes,
        }));

        const newHistoryAction: HistoryAction = {
          ...lastRedo,
          snapshot: currentSnapshot,
        };

        set({
          candidates: restoredCandidates,
          history: [...state.history, newHistoryAction],
          redoStack: state.redoStack.slice(0, -1),
        });

        sound.playVotePlusOne();
        triggerHaptic('medium');
        get().showToast(`Rehecho: ${lastRedo.description}`, 'info', 2500);
      },

      canUndo: () => get().history.length > 0,
      canRedo: () => get().redoStack.length > 0,

      resetToInitial: () => {
        const state = get();
        const prevSnapshot = getSnapshot(state.candidates);

        const newAction: HistoryAction = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'RESET',
          description: 'Restauración al Acta Oficial Inicial',
          timestamp: Date.now(),
          snapshot: prevSnapshot,
        };

        set({
          candidates: INITIAL_CANDIDATES,
          history: [...state.history, newAction],
          redoStack: [],
        });

        sound.playUndo();
        triggerHaptic('heavy');
        get().showToast('Acta restaurada a los datos oficiales de apertura', 'info', 3000);
      },

      toggleSound: () => {
        const next = !get().soundEnabled;
        sound.setMuted(!next);
        set({ soundEnabled: next });
        if (next) {
          sound.playVotePlusOne();
        }
      },

      setSearchQuery: (searchQuery: string) => set({ searchQuery }),
      setActiveFilter: (activeFilter: 'all' | 'candidates' | 'special') => set({ activeFilter }),

      showToast: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', durationMs = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        set({ toast: { id, message, type } });

        setTimeout(() => {
          const current = get().toast;
          if (current && current.id === id) {
            set({ toast: null });
          }
        }, durationMs);
      },

      clearToast: () => set({ toast: null }),

      getElectoralStats: (): ElectoralStats => {
        const state = get();
        const { candidates, mesaConfig } = state;

        let totalCounted = 0;
        let nullVotes = 0;
        let blankVotes = 0;
        let contestedVotes = 0;

        for (const c of candidates) {
          totalCounted += c.votes;
          if (c.id === NULL_CANDIDATE_ID) nullVotes = c.votes;
          else if (c.id === BLANK_CANDIDATE_ID) blankVotes = c.votes;
          else if (c.id === CONTESTED_CANDIDATE_ID) contestedVotes = c.votes;
        }

        const validVotes = Math.max(0, totalCounted - (nullVotes + blankVotes + contestedVotes));
        const isBalanced = totalCounted === mesaConfig.votedOfficial;
        const difference = totalCounted - mesaConfig.votedOfficial;
        const participationRate = (mesaConfig.votedOfficial / mesaConfig.totalPadron) * 100;
        const absenteeismRate = (mesaConfig.absentOfficial / mesaConfig.totalPadron) * 100;

        return {
          totalPadron: mesaConfig.totalPadron,
          votedOfficial: mesaConfig.votedOfficial,
          absentOfficial: mesaConfig.absentOfficial,
          totalCounted,
          validVotes,
          nullVotes,
          blankVotes,
          contestedVotes,
          isBalanced,
          difference,
          participationRate,
          absenteeismRate,
        };
      },

      getHeroCandidate: () => {
        return get().candidates.find((c) => c.id === HERO_CANDIDATE_ID);
      },

      getHeroRank: () => {
        const candidates = [...get().candidates].sort((a, b) => b.votes - a.votes);
        const index = candidates.findIndex((c) => c.id === HERO_CANDIDATE_ID);
        return index !== -1 ? index + 1 : 99;
      },

      getSortedCandidates: () => {
        const { candidates, searchQuery, activeFilter } = get();

        // Sort descending by votes
        const sorted = [...candidates].sort((a, b) => {
          if (b.votes !== a.votes) return b.votes - a.votes;
          return a.name.localeCompare(b.name);
        });

        return sorted.filter((c) => {
          // Search query filter
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesName = c.name.toLowerCase().includes(q);
            const matchesParty = c.party.toLowerCase().includes(q);
            const matchesAcronym = c.partyAcronym?.toLowerCase().includes(q);
            if (!matchesName && !matchesParty && !matchesAcronym) return false;
          }

          // Category filter
          if (activeFilter === 'candidates') return !c.isSpecial;
          if (activeFilter === 'special') return !!c.isSpecial;

          return true;
        });
      },
    }),
    {
      name: 'escrutinio_sjm_storage_v1',
      partialize: (state) => ({
        candidates: state.candidates,
        soundEnabled: state.soundEnabled,
        history: state.history,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
