import { Candidate, ElectoralStats, MesaConfig } from '@/types/election';
import { generatePdfBlob, downloadPdfFile } from './pdfGenerator';

export async function sharePdfReport(
  candidates: Candidate[],
  stats: ElectoralStats,
  mesaConfig: MesaConfig,
  heroCandidate?: Candidate,
  heroRank: number = 2,
  onNotify?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<void> {
  const filename = `Acta_Mesa_${mesaConfig.mesaNumber}_SJM_APP.pdf`;

  try {
    const pdfBlob = await generatePdfBlob(candidates, stats, mesaConfig, heroCandidate, heroRank);
    const file = new File([pdfBlob], filename, {
      type: 'application/pdf',
    });

    const isCanShareFiles =
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [file] });

    if (isCanShareFiles) {
      // Mobile native share sheet (Android / iOS)
      await navigator.share({
        files: [file],
        title: `Acta Oficial Mesa ${mesaConfig.mesaNumber} - SJM`,
        text: `Comparto el Acta Oficial de Escrutinio de la Mesa ${mesaConfig.mesaNumber} (San Juan de Miraflores) con el conteo final de APP.`,
      });
      if (onNotify) onNotify('Acta enviada al menú de compartir', 'success');
    } else {
      // Desktop fallback: Trigger direct file download and open WhatsApp Web with structured report
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      // Top 3 candidates for dynamic message
      const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
      const first = sorted[0];
      const second = sorted[1];
      const third = sorted[2];

      const heroVotes = heroCandidate?.votes ?? 39;
      const totalCounted = stats.totalCounted;
      const heroEmitidosPct = totalCounted > 0 ? ((heroVotes / totalCounted) * 100).toFixed(1) : '0';

      const mesaStatusText = stats.isBalanced
        ? 'Mesa Cuadrada Exacta'
        : `Diferencia de ${stats.difference > 0 ? '+' : ''}${stats.difference} votos`;

      const message = encodeURIComponent(
        `📊 *REPORTE ESCRUTINIO MESA ${mesaConfig.mesaNumber} - SJM*\n` +
        `🔵 *Dante Mendieta (APP):* ${heroVotes} votos (${heroEmitidosPct}% emitidos | Puesto #${heroRank})\n` +
        `🟢 *${first ? first.name : 'Líder'}:* ${first ? first.votes : 0} votos\n` +
        `🔵 *${second && second.id !== heroCandidate?.id ? second.name : (third ? third.name : '3er Lugar')}:* ${second && second.id !== heroCandidate?.id ? second.votes : (third ? third.votes : 0)} votos\n` +
        `🗳️ *Total Votantes:* ${stats.totalCounted} / ${mesaConfig.totalPadron} (${mesaStatusText})\n\n` +
        `_El archivo PDF formal (${filename}) ha sido descargado en tu equipo._`
      );

      window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
      if (onNotify) onNotify('PDF descargado y enlace de WhatsApp abierto', 'success');
    }
  } catch (error: unknown) {
    if ((error as Error)?.name !== 'AbortError') {
      console.error('Error al compartir acta:', error);
      // Fallback to simple download
      try {
        await downloadPdfFile(candidates, stats, mesaConfig, heroCandidate, heroRank, filename);
        if (onNotify) onNotify('Descarga de PDF iniciada', 'info');
      } catch (e) {
        if (onNotify) onNotify('No se pudo compartir el archivo PDF', 'error');
      }
    }
  }
}
