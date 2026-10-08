'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowRightLeft, Crown, Award, Check } from 'lucide-react';
import { Candidate } from '@/types/election';
import { useElectionStore } from '@/store/useElectionStore';

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
  totalVotesCounted: number;
  validVotesCounted: number;
  maxVotes: number;
}

interface FloatingParticle {
  id: number;
  text: string;
  type: 'plus' | 'minus' | 'transfer';
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  rank,
  totalVotesCounted,
  validVotesCounted,
  maxVotes,
}) => {
  const { addVotes, subtractVote, transferToNull } = useElectionStore();
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  const emitidosPct =
    totalVotesCounted > 0 ? ((candidate.votes / totalVotesCounted) * 100).toFixed(1) : '0.0';
  const validosPct =
    !candidate.isSpecial && validVotesCounted > 0
      ? ((candidate.votes / validVotesCounted) * 100).toFixed(1)
      : null;

  const barWidth = maxVotes > 0 ? Math.min(100, (candidate.votes / maxVotes) * 100) : 0;

  const spawnParticle = (text: string, type: 'plus' | 'minus' | 'transfer') => {
    const id = Date.now() + Math.random();
    setParticles((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 700);
  };

  const handlePlusOne = () => {
    addVotes(candidate.id, 1);
    spawnParticle('+1', 'plus');
  };

  const handlePlusFive = () => {
    addVotes(candidate.id, 5);
    spawnParticle('+5', 'plus');
  };

  const handleMinusOne = () => {
    if (candidate.votes <= 0) return;
    subtractVote(candidate.id);
    spawnParticle('-1', 'minus');
  };

  const handleTransferToNull = () => {
    if (candidate.votes <= 0 || candidate.isSpecial) return;
    transferToNull(candidate.id);
    spawnParticle('→ Nulo', 'transfer');
  };

  // Rank badge styling
  const renderRankBadge = () => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 shrink-0">
          <Crown className="w-3.5 h-3.5 fill-current" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-black text-xs shadow-md shrink-0">
          #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-700 to-amber-800 text-amber-100 font-black text-xs shrink-0">
          #3
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 text-slate-400 font-semibold text-xs border border-slate-700/60 shrink-0">
        #{rank}
      </span>
    );
  };

  const isDante = candidate.id === 'cand-mendieta';
  const isSpecial = candidate.isSpecial;

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      key={candidate.id}
      className={`group relative rounded-xl border transition-all duration-200 ${
        isDante
          ? 'bg-[#003399]/15 border-blue-500/60 shadow-lg shadow-blue-950/30'
          : isSpecial
          ? 'bg-slate-900/50 border-slate-800/90 hover:border-slate-700'
          : 'bg-[#0B0F19] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
      }`}
    >
      {/* Accent left indicator with candidate official color */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all"
        style={{ backgroundColor: candidate.color }}
      />

      <div className="p-3 sm:p-4 pl-4 sm:pl-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left info block */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {renderRankBadge()}

            {/* Party Color Dot / Acronym */}
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: candidate.color }}
              title={`Color oficial: ${candidate.party}`}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-bold text-sm sm:text-base tracking-tight truncate ${
                    isDante ? 'text-blue-200 font-extrabold' : 'text-slate-100'
                  }`}
                >
                  {candidate.name}
                </h3>
                {isDante && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white shadow-sm shrink-0">
                    APP
                  </span>
                )}
                {isSpecial && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                    Acta Oficial
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="truncate">{candidate.party}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-300 font-medium">{emitidosPct}% emit.</span>
                {validosPct && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-emerald-400 font-medium">{validosPct}% vál.</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right action block */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
            {/* Direct counter box with particle effect */}
            <div className="relative">
              <button
                onClick={handlePlusOne}
                title="Clic para sumar +1 voto"
                className="flex items-center justify-center min-w-[56px] sm:min-w-[64px] h-10 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-blue-500/60 active:scale-95 transition-all"
              >
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {candidate.votes}
                </span>
              </button>

              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
                <AnimatePresence>
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{
                        opacity: 1,
                        y: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 0,
                        y: p.type === 'minus' ? 25 : -25,
                        scale: 1.15,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      className={`absolute px-1.5 py-0.5 rounded-full text-[11px] font-black shadow-md ${
                        p.type === 'plus'
                          ? 'bg-emerald-500 text-slate-950'
                          : p.type === 'minus'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {p.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Voting buttons */}
            <div className="flex items-center gap-1">
              {/* -1 button */}
              <button
                onClick={handleMinusOne}
                disabled={candidate.votes <= 0}
                title="Corregir error de digitación (-1 voto)"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/70 hover:border-rose-700/50 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Restar 1 voto"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* +1 button */}
              <button
                onClick={handlePlusOne}
                title="Sumar 1 voto regular (+1)"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs border border-blue-400/40 flex items-center justify-center transition-all active:scale-90 shadow-md shadow-blue-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px]">1</span>
              </button>

              {/* +5 button */}
              <button
                onClick={handlePlusFive}
                title="Sumar lote de 5 votos (+5)"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs border border-emerald-400/40 flex items-center justify-center transition-all active:scale-90 shadow-md shadow-emerald-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px]">5</span>
              </button>

              {/* Pasar a Nulo button (Not shown for Votos Nulos itself) */}
              {!candidate.isSpecial && (
                <button
                  onClick={handleTransferToNull}
                  disabled={candidate.votes <= 0}
                  title={`Cédula observada/viciada: traslada 1 voto de ${candidate.name} a Votos Nulos`}
                  className="px-2 h-8 sm:h-9 rounded-lg bg-slate-800/80 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-700/70 hover:border-amber-600/50 text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none ml-1"
                >
                  <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                  <span className="hidden xs:inline">A Nulo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Small comparative vote share bar */}
        <div className="mt-2.5 h-1 w-full bg-slate-800/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${barWidth}%`,
              backgroundColor: candidate.color,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
