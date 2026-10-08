'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroDanteMendieta } from '@/components/HeroDanteMendieta';
import { MesaAuditBanner } from '@/components/MesaAuditBanner';
import { CandidateList } from '@/components/CandidateList';
import { QuickAuditModal } from '@/components/QuickAuditModal';
import { ResetConfirmModal } from '@/components/ResetConfirmModal';
import { Toast } from '@/components/Toast';
import { Shield, Sparkles, CheckCircle, Smartphone } from 'lucide-react';

export default function Home() {
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Container */}
      <Toast />

      {/* Sticky Top Header */}
      <Header
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* Pinned Hero Module: Dante Mendieta (APP) */}
        <section aria-label="Candidato Principal APP - Dante Mendieta">
          <HeroDanteMendieta />
        </section>

        {/* Electoral Mesa Audit Banner */}
        <section aria-label="Resumen de Cuadre de Mesa">
          <MesaAuditBanner />
        </section>

        {/* Search, Filter & Reordering Candidate Cards */}
        <section aria-label="Cómputo General de Candidatos">
          <div className="flex items-center justify-between px-1 mb-1">
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Cómputo en Tiempo Real de Cédulas
            </h2>
            <span className="text-[11px] text-slate-400 hidden xs:inline">
              Reordenamiento dinámico por votación oficial
            </span>
          </div>
          <CandidateList />
        </section>
      </main>

      {/* Footer & Institutional Tech Badges */}
      <footer className="mt-8 border-t border-slate-800/80 bg-slate-950/80 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Shield className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Sistema de Escrutinio y Personería Digital • San Juan de Miraflores (Mesa 054990)
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Next.js 15+</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">TypeScript</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Zustand</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Framer Motion</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Web Audio API</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">jsPDF A4</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuickAuditModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
      <ResetConfirmModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
    </div>
  );
}
