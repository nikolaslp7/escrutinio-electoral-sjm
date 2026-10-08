'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Users, UserCheck, UserX, FileCheck } from 'lucide-react';
import { useElectionStore } from '@/store/useElectionStore';

export const MesaAuditBanner: React.FC = () => {
  const { mesaConfig, getElectoralStats } = useElectionStore();
  const stats = getElectoralStats();

  const totalCounted = Math.max(1, stats.totalCounted);
  const validPct = ((stats.validVotes / totalCounted) * 100).toFixed(1);
  const nullPct = ((stats.nullVotes / totalCounted) * 100).toFixed(1);
  const blankPct = ((stats.blankVotes / totalCounted) * 100).toFixed(1);
  const contestedPct = ((stats.contestedVotes / totalCounted) * 100).toFixed(1);

  return (
    <div className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
            <FileCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm sm:text-base">
                Mesa de Sufragio N° {mesaConfig.mesaNumber}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• {mesaConfig.district}</span>
            </div>
            <p className="text-xs text-slate-400">
              Control Electoral de Padrón y Cuadre de Cédulas Oficiales
            </p>
          </div>
        </div>

        {/* Live Cuadre Badge */}
        <div>
          {stats.isBalanced ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-md shadow-emerald-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>MESA CUADRADA EXACTA ({stats.totalCounted} de {mesaConfig.votedOfficial} votos emitidos)</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border ${
              stats.difference < 0
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
            }`}>
              <AlertTriangle className="w-4 h-4" />
              <span>
                {stats.difference < 0
                  ? `FALTAN ${Math.abs(stats.difference)} VOTOS POR REGISTRAR (${stats.totalCounted}/${mesaConfig.votedOfficial})`
                  : `SOBRAN ${stats.difference} VOTOS - MESA DESCUADRADA (${stats.totalCounted}/${mesaConfig.votedOfficial})`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Numerical Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3.5">
        {/* Total Padrón */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Padrón</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white font-mono">{mesaConfig.totalPadron}</span>
              <span className="text-[11px] text-slate-500">cédulas</span>
            </div>
          </div>
        </div>

        {/* Votaron (Participación) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Votaron en Mesa</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-emerald-400 font-mono">{mesaConfig.votedOfficial}</span>
              <span className="text-[11px] text-emerald-500 font-semibold">({stats.participationRate.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Ausentes */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
            <UserX className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ausentes</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-rose-400 font-mono">{mesaConfig.absentOfficial}</span>
              <span className="text-[11px] text-rose-500 font-semibold">({stats.absenteeismRate.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Votos Válidos vs Especiales */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Válidos / Escrutados</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white font-mono">{stats.validVotes}</span>
              <span className="text-[11px] text-slate-400">/ {stats.totalCounted} tot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Composition Gauge */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Composición de Cédulas Escrutadas:</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Válidos: {stats.validVotes} ({validPct}%)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Nulos: {stats.nullVotes} ({nullPct}%)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Blancos: {stats.blankVotes} ({blankPct}%)
            </span>
            {stats.contestedVotes > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Impugnados: {stats.contestedVotes} ({contestedPct}%)
              </span>
            )}
          </div>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${(stats.validVotes / totalCounted) * 100}%` }}
            title={`Votos Válidos: ${stats.validVotes}`}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-300"
            style={{ width: `${(stats.nullVotes / totalCounted) * 100}%` }}
            title={`Votos Nulos: ${stats.nullVotes}`}
          />
          <div
            className="bg-slate-400 h-full transition-all duration-300"
            style={{ width: `${(stats.blankVotes / totalCounted) * 100}%` }}
            title={`Votos Blancos: ${stats.blankVotes}`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(stats.contestedVotes / totalCounted) * 100}%` }}
            title={`Votos Impugnados: ${stats.contestedVotes}`}
          />
        </div>
      </div>
    </div>
  );
};
