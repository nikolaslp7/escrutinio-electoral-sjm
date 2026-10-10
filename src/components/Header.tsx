'use client';

import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  FileText,
  Share2,
  RotateCcw as ResetIcon,
  BarChart3,
} from 'lucide-react';
import { useElectionStore } from '@/store/useElectionStore';
import { sharePdfReport } from '@/lib/share';
import { downloadPdfFile } from '@/lib/pdfGenerator';

interface HeaderProps {
  onOpenAudit: () => void;
  onOpenReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAudit, onOpenReset }) => {
  const {
    candidates,
    mesaConfig,
    soundEnabled,
    history,
    redoStack,
    toggleSound,
    undo,
    redo,
    canUndo,
    canRedo,
    getElectoralStats,
    getHeroCandidate,
    getHeroRank,
    showToast,
  } = useElectionStore();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Global Keyboard Shortcuts (Ctrl+Z / Cmd+Z for Undo, Ctrl+Y / Cmd+Shift+Z for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo()) {
            e.preventDefault();
            redo();
          }
        } else {
          if (canUndo()) {
            e.preventDefault();
            undo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (canRedo()) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Generando Acta Oficial en PDF...', 'info', 2000);
      const stats = getElectoralStats();
      const hero = getHeroCandidate();
      const rank = getHeroRank();
      await downloadPdfFile(candidates, stats, mesaConfig, hero, rank);
      showToast('✓ Acta PDF descargada con éxito', 'success', 3000);
    } catch (e) {
      console.error(e);
      showToast('Error al generar el PDF del acta', 'error', 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareReport = async () => {
    try {
      setIsSharing(true);
      const stats = getElectoralStats();
      const hero = getHeroCandidate();
      const rank = getHeroRank();
      await sharePdfReport(candidates, stats, mesaConfig, hero, rank, (msg, type) => {
        showToast(msg, type, 3000);
      });
    } catch (e) {
      console.error(e);
      showToast('Error al compartir el reporte', 'error', 3000);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800 shadow-xl transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Institutional Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#003399] to-[#001f5c] border border-blue-500/30 shadow-lg shadow-blue-900/30 text-white font-black tracking-wider text-sm sm:text-base">
            <span className="text-white drop-shadow-md">A</span>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E51C24] flex items-center justify-center border-2 border-[#0B0F19]">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1">
                APP <span className="text-blue-400 font-light hidden sm:inline">|</span>{' '}
                <span className="text-slate-200 font-semibold text-xs sm:text-sm">Escrutinio SJM</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/80">
                Mesa {mesaConfig.mesaNumber}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden xs:inline-block">
              San Juan de Miraflores • Elecciones Municipales
            </span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            title={soundEnabled ? 'Sonido activado (clic para silenciar)' : 'Sonido silenciado'}
            className={`p-2 rounded-lg border transition-all duration-150 ${
              soundEnabled
                ? 'bg-slate-900 text-blue-400 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Undo Button */}
          <button
            onClick={undo}
            disabled={!canUndo()}
            aria-label="Deshacer último voto (Ctrl+Z)"
            title={canUndo() ? `Deshacer (${history.length} acciones) [Ctrl+Z]` : 'Nada que deshacer'}
            className="relative p-2 rounded-lg border bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            {history.length > 0 && (
              <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full px-1 min-w-[16px] text-center">
                {history.length}
              </span>
            )}
          </button>

          {/* Redo Button */}
          {redoStack.length > 0 && (
            <button
              onClick={redo}
              disabled={!canRedo()}
              aria-label="Rehacer voto"
              title={`Rehacer (${redoStack.length} disponibles)`}
              className="p-2 rounded-lg border bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
            >
              <RotateCw className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Quick Audit Modal */}
          <button
            onClick={onOpenAudit}
            title="Resumen y auditoría electoral de la mesa"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg border bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Auditoría</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            title="Generar y descargar Acta Oficial de Escrutinio en formato A4"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Acta PDF</span>
          </button>

          {/* Share via WhatsApp / Web Share */}
          <button
            onClick={handleShareReport}
            disabled={isSharing}
            title="Compartir Acta Oficial vía WhatsApp / Menú Nativo"
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 border border-emerald-500/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onOpenReset}
            title="Restaurar a los votos de acta inicial"
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
          >
            <ResetIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
