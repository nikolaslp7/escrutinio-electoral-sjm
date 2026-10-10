'use client';

import React from 'react';
import { Search, X, ListFilter } from 'lucide-react';
import { useElectionStore } from '@/store/useElectionStore';
import { CandidateCard } from './CandidateCard';

export const CandidateList: React.FC = () => {
  const {
    candidates,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    getSortedCandidates,
    getElectoralStats,
  } = useElectionStore();

  const sortedCandidates = getSortedCandidates();
  const stats = getElectoralStats();

  const candidateCount = candidates.filter((c) => !c.isSpecial).length;
  const specialCount = candidates.filter((c) => c.isSpecial).length;
  const maxVotes = Math.max(...candidates.map((c) => c.votes), 1);

  // For proper ordinal ranking in the filtered view:
  // We compute the true overall rank from the full sorted list
  const fullSorted = [...candidates].sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#0B0F19] border border-slate-800 rounded-2xl p-2.5 sm:p-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por candidato o partido (ej. Dante, Somos Perú, APP)..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Todos ({candidates.length})
          </button>
          <button
            onClick={() => setActiveFilter('candidates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'candidates'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Candidatos ({candidateCount})
          </button>
          <button
            onClick={() => setActiveFilter('special')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'special'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Votos de Acta ({specialCount})
          </button>
        </div>
      </div>

      {/* Candidate Cards Grid / List with Framer Motion Layout Reordering */}
      <div className="flex flex-col gap-2">
        {sortedCandidates.map((candidate) => {
          const overallRank = fullSorted.findIndex((c) => c.id === candidate.id) + 1;
          return (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              rank={overallRank}
              totalVotesCounted={stats.totalCounted}
              validVotesCounted={stats.validVotes}
              maxVotes={maxVotes}
            />
          );
        })}

        {sortedCandidates.length === 0 && (
          <div className="text-center py-12 px-4 bg-[#0B0F19] rounded-2xl border border-slate-800 text-slate-400">
            <ListFilter className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium">No se encontraron candidatos con &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-3 text-xs text-blue-400 hover:underline font-semibold"
            >
              Restablecer filtros de búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
