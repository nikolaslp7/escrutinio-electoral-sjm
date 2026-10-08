'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, TrendingUp, Award, Plus, Minus, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useElectionStore } from '@/store/useElectionStore';
import { triggerConfettiCelebration } from '@/lib/confetti';

interface FloatingParticle {
  id: number;
  text: string;
  type: 'plus' | 'minus' | 'transfer';
}

export const HeroDanteMendieta: React.FC = () => {
  const {
    getHeroCandidate,
    getHeroRank,
    getElectoralStats,
    addVotes,
    subtractVote,
    transferToNull,
    candidates,
  } = useElectionStore();

  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  const hero = getHeroCandidate();
  const rank = getHeroRank();
  const stats = getElectoralStats();

  if (!hero) return null;

  const totalCounted = Math.max(1, stats.totalCounted);
  const validVotes = Math.max(1, stats.validVotes);
  const pctEmitidos = ((hero.votes / totalCounted) * 100).toFixed(1);
  const pctValidos = ((hero.votes / validVotes) * 100).toFixed(1);

  // Leader comparison
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const leader = sorted[0];
  const isLeader = rank === 1;
  const votesDiffToLeader = leader && leader.id !== hero.id ? leader.votes - hero.votes : 0;

  const spawnParticle = (text: string, type: 'plus' | 'minus' | 'transfer') => {
    const id = Date.now() + Math.random();
    setParticles((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 700);
  };

  const handlePlusOne = () => {
    addVotes(hero.id, 1);
    spawnParticle('+1', 'plus');
    if (rank === 2 && leader && hero.votes + 1 > leader.votes) {
      triggerConfettiCelebration();
    }
  };

  const handlePlusFive = () => {
    addVotes(hero.id, 5);
    spawnParticle('+5', 'plus');
    if (rank !== 1 && leader && hero.votes + 5 >= leader.votes) {
      triggerConfettiCelebration();
    }
  };

  const handleMinusOne = () => {
    if (hero.votes <= 0) return;
    subtractVote(hero.id);
    spawnParticle('-1', 'minus');
  };

  const handleTransferToNull = () => {
    if (hero.votes <= 0) return;
    transferToNull(hero.id);
    spawnParticle('→ Nulo', 'transfer');
  };

  return (
    <div className="relative w-full">
      {/* Outer Card with Dynamic Glow */}
      <div
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 border ${
          isLeader
            ? 'bg-gradient-to-br from-[#003399]/40 via-[#0B0F19] to-[#001844] border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
            : 'bg-gradient-to-br from-[#002776]/30 via-[#0B0F19] to-slate-900 border-blue-500/40 shadow-xl shadow-blue-950/40'
        }`}
      >
        {/* Subtle Decorative Background Lines */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-[#E51C24]/10 blur-3xl pointer-events-none" />

        {/* Top Institutional Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#003399] via-blue-500 to-[#E51C24]" />

        <div className="p-4 sm:p-5 relative z-10">
          {/* Header Row: Rank Badge & Party info */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#003399] text-white text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-sm">
                <span>APP</span>
                <span className="text-[10px] text-blue-200">#2</span>
              </span>
              <span className="text-xs font-medium text-slate-400">
                Alianza para el Progreso • San Juan de Miraflores
              </span>
            </div>

            {/* Rank Badge */}
            <div className="flex items-center gap-1.5">
              {isLeader ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>PUESTO #1 • LÍDER DE MESA</span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  <span>Puesto #{rank}</span>
                  {votesDiffToLeader > 0 && (
                    <span className="text-[11px] text-amber-400/90 font-normal ml-0.5 hidden xs:inline">
                      (-{votesDiffToLeader} vs {leader?.name.split(' ')[0]})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Info Row: Candidate Name & Live Numbers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Candidate Identity */}
            <div className="lg:col-span-5 flex items-center gap-3.5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#003399] to-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-900/50 border-2 border-blue-400/40 shrink-0">
                <span>DM</span>
                {isLeader && (
                  <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                    {hero.name}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-blue-300 font-medium">
                  Candidato Oficial a la Alcaldía de SJM
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    En contienda activa
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Showcase */}
            <div className="lg:col-span-7 flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-5">
              {/* Votos Acumulados (Clickable rapid increment) */}
              <div className="relative">
                <button
                  onClick={handlePlusOne}
                  title="Clic para sumar +1 voto rápido a Dante Mendieta"
                  className="flex flex-col items-center bg-slate-900/80 hover:bg-slate-800/90 border border-blue-500/30 hover:border-blue-400 rounded-xl px-4 py-2 text-center transition-all group active:scale-95"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-blue-300">
                    Votos Totales
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono group-hover:text-blue-200">
                      {hero.votes}
                    </span>
                    <span className="text-[10px] text-slate-400">votos</span>
                  </div>
                </button>

                {/* Floating Particles Container */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
                  <AnimatePresence>
                    {particles.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{
                          opacity: 1,
                          y: p.type === 'minus' ? 0 : 0,
                          scale: 0.8,
                        }}
                        animate={{
                          opacity: 0,
                          y: p.type === 'minus' ? 30 : -35,
                          scale: 1.2,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                        className={`absolute px-2 py-0.5 rounded-full text-xs font-black shadow-lg ${
                          p.type === 'plus'
                            ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/50'
                            : p.type === 'minus'
                            ? 'bg-rose-500 text-white shadow-rose-500/50'
                            : 'bg-amber-500 text-slate-950 shadow-amber-500/50'
                        }`}
                      >
                        {p.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* % Emitidos */}
              <div className="flex flex-col items-center bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2 text-center min-w-[85px]">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  % Emitidos
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
                  {pctEmitidos}%
                </span>
                <span className="text-[10px] text-slate-500">s/ {totalCounted}</span>
              </div>

              {/* % Válidos */}
              <div className="flex flex-col items-center bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2 text-center min-w-[85px]">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  % Válidos
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {pctValidos}%
                </span>
                <span className="text-[10px] text-slate-500">s/ {validVotes}</span>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
                {/* -1 button */}
                <button
                  onClick={handleMinusOne}
                  disabled={hero.votes <= 0}
                  title="Corregir error de digitación (-1 voto)"
                  className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-700/60 transition-all active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Restar 1 voto"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* +1 button */}
                <button
                  onClick={handlePlusOne}
                  title="Sumar 1 voto regular (+1)"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm border border-blue-400/40 shadow-lg shadow-blue-700/30 transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>1</span>
                </button>

                {/* +5 button */}
                <button
                  onClick={handlePlusFive}
                  title="Sumar lote de 5 votos (+5)"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm border border-emerald-400/40 shadow-lg shadow-emerald-700/30 transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>5</span>
                </button>

                {/* Pasar a Nulo button */}
                <button
                  onClick={handleTransferToNull}
                  disabled={hero.votes <= 0}
                  title="Cédula observada/viciada: traslada 1 voto de Dante Mendieta a Votos Nulos"
                  className="px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-600/50 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">A Nulo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Progress Indicator to reach #1 */}
          {!isLeader && leader && (
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Meta para liderar la mesa: Necesita <strong className="text-white font-semibold">{votesDiffToLeader + 1} votos</strong> adicionales para superar a {leader.name}.
                </span>
              </div>
              <div className="w-full sm:w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((hero.votes / leader.votes) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
