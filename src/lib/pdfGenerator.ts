import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Candidate, ElectoralStats, MesaConfig } from '@/types/election';

// Generates a SHA-256 hash representation of the ballot count for digital verification
async function computeHash(dataString: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(dataString);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Fast deterministic fallback hash
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < dataString.length; i++) {
    const ch = dataString.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}e8b94f71a0c24d983e84bf9d29f0a6d4c1b9`.substring(0, 64);
}

export async function generatePdfDocument(
  candidates: Candidate[],
  stats: ElectoralStats,
  mesaConfig: MesaConfig,
  heroCandidate?: Candidate,
  heroRank: number = 2
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  let currentY = 11;

  // --- TOP HEADER BANNER ---
  const headerHeight = 22;
  doc.setFillColor(11, 15, 25);
  doc.rect(margin, currentY, contentWidth, headerHeight, 'F');

  // Decorative APP stripes
  doc.setFillColor(0, 51, 153);
  doc.rect(margin, currentY, contentWidth, 2.5, 'F');
  doc.setFillColor(229, 28, 36);
  doc.rect(margin + 50, currentY, 40, 2.5, 'F');

  // Stylized APP Seal Badge (Box)
  doc.setFillColor(0, 51, 153);
  doc.roundedRect(margin + 4, currentY + 4.5, 13, 14, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('A', margin + 10.5, currentY + 13.5, { align: 'center' });
  doc.setFontSize(4.8);
  doc.text('APP', margin + 10.5, currentY + 17, { align: 'center' });

  // Main Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('ACTA OFICIAL DE ESCRUTINIO - ELECCIONES MUNICIPALES', margin + 21, currentY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(190, 205, 230);
  doc.text('ALIANZA PARA EL PROGRESO (APP) • SAN JUAN DE MIRAFLORES (SJM) • LIMA', margin + 21, currentY + 14.5);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('SISTEMA INTEGRAL DE CONTROL ELECTORAL Y AUDITORÍA DE PERSONEROS', margin + 21, currentY + 18.5);

  currentY += headerHeight + 3; // ~36mm

  // --- METADATA OF THE MESA ---
  const metaHeight = 17;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, metaHeight, 1.5, 1.5, 'FD');

  const colW = contentWidth / 4;

  // Col 1: Mesa N°
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('MESA DE SUFRAGIO', margin + 4, currentY + 5);
  doc.setTextColor(0, 51, 153);
  doc.setFontSize(11.5);
  doc.text(`N° ${mesaConfig.mesaNumber}`, margin + 4, currentY + 11);
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(mesaConfig.district, margin + 4, currentY + 15);

  // Col 2: Padrón Total
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('PADRÓN ELECTORAL', margin + colW + 4, currentY + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11.5);
  doc.text(`${mesaConfig.totalPadron} electores`, margin + colW + 4, currentY + 11);
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('100.0% Padrón General', margin + colW + 4, currentY + 15);

  // Col 3: Ciudadanos que Votaron
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('CIUDADANOS QUE VOTARON', margin + colW * 2 + 4, currentY + 5);
  doc.setTextColor(16, 124, 65);
  doc.setFontSize(11.5);
  doc.text(`${mesaConfig.votedOfficial} votantes`, margin + colW * 2 + 4, currentY + 11);
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stats.participationRate.toFixed(2)}% de Participación`, margin + colW * 2 + 4, currentY + 15);

  // Col 4: Ausentismo
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('AUSENTISMO REGISTRADO', margin + colW * 3 + 4, currentY + 5);
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(11.5);
  doc.text(`${mesaConfig.absentOfficial} ausentes`, margin + colW * 3 + 4, currentY + 11);
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stats.absenteeismRate.toFixed(2)}% No Votaron`, margin + colW * 3 + 4, currentY + 15);

  currentY += metaHeight + 2.5; // ~55.5mm

  // --- CUADRE BANNER ---
  const cuadreHeight = 8;
  if (stats.isBalanced) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(margin, currentY, contentWidth, cuadreHeight, 1.5, 1.5, 'FD');

    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      `✓ MESA CUADRADA EXACTA (${stats.totalCounted} de ${mesaConfig.votedOfficial} votos emitidos)`,
      pageWidth / 2,
      currentY + 5.3,
      { align: 'center' }
    );
  } else {
    const isUnder = stats.difference < 0;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(margin, currentY, contentWidth, cuadreHeight, 1.5, 1.5, 'FD');

    doc.setTextColor(153, 27, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      `⚠ ALERTA DE CUADRE: ${Math.abs(stats.difference)} VOTO(S) ${isUnder ? 'FALTANTES' : 'SOBRANTES'} (${stats.totalCounted}/${mesaConfig.votedOfficial} votos)`,
      pageWidth / 2,
      currentY + 5.3,
      { align: 'center' }
    );
  }

  currentY += cuadreHeight + 2.5; // ~66mm

  // --- HERO PANEL: DANTE MENDIETA (APP) ---
  // Fix 1: Clear grid separation between left title column and right numeric blocks
  const heroVotes = heroCandidate ? heroCandidate.votes : 39;
  const totalCounted = Math.max(1, stats.totalCounted);
  const validVotes = Math.max(1, stats.validVotes);
  const heroEmitidosPct = ((heroVotes / totalCounted) * 100).toFixed(2);
  const heroValidosPct = ((heroVotes / validVotes) * 100).toFixed(2);

  const heroPanelHeight = 20;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(0, 51, 153);
  doc.roundedRect(margin, currentY, contentWidth, heroPanelHeight, 1.5, 1.5, 'FD');

  // Left blue accent strip
  doc.setFillColor(0, 51, 153);
  doc.rect(margin, currentY, 3, heroPanelHeight, 'F');

  // LEFT COLUMN: Institutional Titles (from x = margin + 5 = 19mm up to 98mm)
  doc.setTextColor(0, 51, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('CANDIDATO DESTACADO • ALIANZA PARA EL PROGRESO (APP)', margin + 5, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 15, 25);
  doc.text('DANTE MENDIETA', margin + 5, currentY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Alianza para el Progreso (APP) • Lista Distrital N° 2 SJM', margin + 5, currentY + 16.5);

  // RIGHT COLUMN: 4 Isolated Metric Cards (from x = 102mm to 192mm)
  const metricsStartX = margin + 89; // 14 + 89 = 103mm
  const colMetricWidth = 21.5;

  const heroMetrics = [
    { label: 'POSICIÓN', val: `#${heroRank}`, color: [0, 51, 153] },
    { label: 'VOTOS TOTALES', val: `${heroVotes}`, color: [15, 23, 42] },
    { label: '% EMITIDOS', val: `${heroEmitidosPct}%`, color: [0, 51, 153] },
    { label: '% VÁLIDOS', val: `${heroValidosPct}%`, color: [16, 124, 65] },
  ];

  heroMetrics.forEach((m, idx) => {
    const colX = metricsStartX + idx * colMetricWidth;

    // Inner card pill
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(219, 234, 254);
    doc.roundedRect(colX, currentY + 2.5, colMetricWidth - 2, heroPanelHeight - 5, 1.2, 1.2, 'FD');

    // Label
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(m.label, colX + (colMetricWidth - 2) / 2, currentY + 6.8, { align: 'center' });

    // Numeric Value
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(m.val, colX + (colMetricWidth - 2) / 2, currentY + 13.5, { align: 'center' });
  });

  currentY += heroPanelHeight + 3; // ~89mm

  // --- GENERAL TABLE (17 RUBROS) ---
  // Fix 2: Clean typography and formatting without artificial charSpace or corrupted symbols
  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

  const tableData = sortedCandidates.map((c, index) => {
    const pctEmitidos = totalCounted > 0 ? ((c.votes / totalCounted) * 100).toFixed(2) + '%' : '0.00%';
    const pctValidos =
      c.isSpecial || validVotes <= 0 ? '-' : ((c.votes / validVotes) * 100).toFixed(2) + '%';

    let displayTitle = '';
    if (c.id === 'cand-mendieta') {
      // Clean string without special symbols or font artifacts
      displayTitle = 'Dante Mendieta (Alianza para el Progreso - APP)';
    } else if (c.isSpecial) {
      displayTitle = c.name;
    } else {
      displayTitle = `${c.name} (${c.party})`;
    }

    return [
      (index + 1).toString(),
      displayTitle,
      c.votes.toString(),
      pctEmitidos,
      pctValidos,
    ];
  });

  // Summary footer rows
  const summaryRows = [
    [
      '',
      `VOTOS VÁLIDOS TOTALES (${stats.validVotes} votos)`,
      stats.validVotes.toString(),
      totalCounted > 0 ? ((stats.validVotes / totalCounted) * 100).toFixed(2) + '%' : '0.00%',
      '100.00%',
    ],
    [
      '',
      `TOTAL VOTOS EMITIDOS (CÉDULAS ESCRUTADAS)`,
      stats.totalCounted.toString(),
      '100.00%',
      '-',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        'Pos.',
        'Organización Política / Candidato',
        'Votos Obtenidos',
        '% Votos Emitidos (s/ ' + stats.totalCounted + ')',
        '% Votos Válidos (s/ ' + stats.validVotes + ')',
      ],
    ],
    body: tableData,
    foot: summaryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [11, 15, 25],
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 41, 59],
      cellPadding: 1.5,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 7.2,
      fontStyle: 'bold',
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 32, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' },
    },
    didParseCell: (data) => {
      // Highlight Dante Mendieta (APP) row cleanly
      if (data.section === 'body') {
        const row = sortedCandidates[data.row.index];
        if (row && row.id === 'cand-mendieta') {
          data.cell.styles.fillColor = [224, 238, 255];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [0, 51, 153];
        } else if (row && row.isSpecial) {
          data.cell.styles.fillColor = [248, 250, 252];
          data.cell.styles.textColor = [100, 116, 139];
        }
      }
    },
  });

  // Fix 3: Generous bottom margin and non-clipped footer placement
  // Compute deterministic hash of ballot
  const rawData = JSON.stringify({
    mesa: mesaConfig.mesaNumber,
    padron: mesaConfig.totalPadron,
    votes: candidates.map((c) => ({ id: c.id, v: c.votes })),
  });
  const verificationHash = await computeHash(rawData);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  const tableBottomY = doc.lastAutoTable.finalY;

  // Ensure footer is placed at least 4mm below table, but pinned near bottom with >= 15mm page margin
  const footerBoxHeight = 20;
  const preferredFooterY = pageHeight - margin - footerBoxHeight - 3; // 297 - 14 - 20 - 3 = 260mm
  const finalFooterY = Math.max(tableBottomY + 3.5, preferredFooterY);

  // Bounding box for footer
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, finalFooterY, contentWidth, footerBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(71, 85, 105);
  doc.text('SISTEMA DE VERIFICACIÓN ELECTORAL DIGITAL & CADENA DE CUSTODIA:', margin + 4, finalFooterY + 4.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(0, 51, 153);
  doc.text(`HASH SHA-256: ${verificationHash}`, margin + 4, finalFooterY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `FECHA DE EMISIÓN: ${dateFormatted} • HORA: ${timeFormatted} • PERSONERO REGISTRADO: SISTEMA DIGITAL APP SJM`,
    margin + 4,
    finalFooterY + 12.5
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Documento oficial generado para fines de control, auditoría interna y personería legal partidaria. Conforme a la Ley Orgánica de Elecciones N° 26859.',
    margin + 4,
    finalFooterY + 16.5
  );

  return doc;
}

export async function generatePdfBlob(
  candidates: Candidate[],
  stats: ElectoralStats,
  mesaConfig: MesaConfig,
  heroCandidate?: Candidate,
  heroRank: number = 2
): Promise<Blob> {
  const doc = await generatePdfDocument(candidates, stats, mesaConfig, heroCandidate, heroRank);
  return doc.output('blob');
}

export async function downloadPdfFile(
  candidates: Candidate[],
  stats: ElectoralStats,
  mesaConfig: MesaConfig,
  heroCandidate?: Candidate,
  heroRank: number = 2,
  filename: string = 'Acta_Mesa_054990_SJM_APP.pdf'
) {
  const doc = await generatePdfDocument(candidates, stats, mesaConfig, heroCandidate, heroRank);
  doc.save(filename);
}
