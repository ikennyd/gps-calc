import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, CalculatorState } from '../types';
import { PLATFORMS, TAX_REGIMES } from '../constants';

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

const pct = (n: number | '') =>
  `${Number(n).toFixed(2)}%`;

export function exportSimulationToPDF(
  inputs: CalculatorState,
  results: CalculationResult,
  platformId: string,
  productName?: string
) {
  const platform = PLATFORMS.find(p => p.id === platformId) ?? PLATFORMS[0];
  const regimeLabel =
    TAX_REGIMES.find(r => r.id === inputs.taxRegime)?.label ?? 'Simples Nacional';
  const commissionRate = inputs.customCommission ?? platform.defaultCommission;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(124, 252, 0); // GPS green
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GPS Calc', 14, 13);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Simulação de Lucratividade', 14, 20);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  doc.text(`Gerado em: ${dateStr}`, 196, 20, { align: 'right' });

  // ── Sub-header ──────────────────────────────────────────────────────────────
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(productName?.trim() || 'Simulação sem título', 14, 40);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Plataforma: ${platform.name} ${platform.type}`, 14, 47);
  doc.text(`Regime: ${regimeLabel}`, 14, 53);

  // ── Result highlight box ────────────────────────────────────────────────────
  const profitColor = results.profit >= 0 ? [0, 160, 0] : [200, 0, 0];
  doc.setFillColor(profitColor[0], profitColor[1], profitColor[2]);
  doc.roundedRect(136, 33, 60, 28, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('LUCRO LÍQUIDO', 166, 41, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(results.profit), 166, 52, { align: 'center' });

  // ── Inputs table ────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: 62,
    head: [['Parâmetro de Entrada', 'Valor']],
    body: [
      ['Preço de Venda', fmt(Number(inputs.salePrice) || 0)],
      ['Custo do Produto', fmt(Number(inputs.cost) || 0)],
      ...(inputs.isKit ? [['Qtd no Kit', String(inputs.quantity)]] : []),
      ['Comissão', `${commissionRate}%`],
      ['Regime Tributário', `${regimeLabel} (${pct(inputs.taxRate)})`],
      ['Marketing / Ads', pct(inputs.marketingRate)],
      ['Frete', fmt(Number(inputs.shippingCost) || 0)],
      ['Embalagem / Extras', fmt(Number(inputs.otherCosts) || 0)],
    ],
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  // ── Results table ────────────────────────────────────────────────────────────
  const afterInputs = (doc as any).lastAutoTable?.finalY ?? 100;

  autoTable(doc, {
    startY: afterInputs + 8,
    head: [['Resultado', 'Valor']],
    body: [
      ['Receita Bruta', fmt(Number(inputs.salePrice) || 0)],
      ['Total de Deduções', `- ${fmt(results.totalDeductions)}`],
      ['  ↳ Comissão', `- ${fmt(results.commissionValue)}`],
      ['  ↳ Taxa Fixa', `- ${fmt(results.fixedFeeValue)}`],
      ['  ↳ Impostos', `- ${fmt(results.taxValue)}`],
      ['  ↳ Marketing', `- ${fmt(results.marketingValue)}`],
      ['  ↳ Frete', `- ${fmt(Number(inputs.shippingCost) || 0)}`],
      ['  ↳ Extras', `- ${fmt(Number(inputs.otherCosts) || 0)}`],
      ['Custo Total do Produto', `- ${fmt(results.totalProductCost)}`],
      ['─────', '─────'],
      ['Lucro Líquido', fmt(results.profit)],
      ['Margem (%)', `${results.margin.toFixed(2)}%`],
      ['ROI (%)', `${results.roi.toFixed(2)}%`],
      ['Break-Even (Preço Mínimo)', fmt(results.breakEven)],
    ],
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.row.index === 10 && data.section === 'body') {
        // Highlight the profit row
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = results.profit >= 0 ? [230, 255, 230] : [255, 230, 230];
      }
    },
  });

  // ── Footer ──────────────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(
      'GPS — Guiando Para o Sucesso  |  gps-calc simulação de lucratividade',
      14,
      doc.internal.pageSize.height - 8
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      196,
      doc.internal.pageSize.height - 8,
      { align: 'right' }
    );
  }

  const filename = `simulacao-${(productName || 'resultado').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
}
