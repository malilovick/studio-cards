import jsPDF from "jspdf";
import { toPng, toJpeg } from "html-to-image";
import { CardItem, DeckConfig, PrintSheetOptions } from "../types";

export interface ProgressCallback {
  (current: number, total: number, statusText: string): void;
}

/**
 * Helper to render an HTML element to high quality PNG data URL
 */
export async function renderElementToImage(
  elementId: string,
  pixelRatio: number = 3
): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for export.`);
  }

  return await toPng(element, {
    pixelRatio: pixelRatio,
    quality: 1.0,
    cacheBust: true,
    filter: (node) => {
      // Don't render interactive UI or buttons if present
      if (node instanceof HTMLElement && node.classList.contains("no-print")) {
        return false;
      }
      return true;
    },
  });
}

/**
 * Draws standard professional printer crop marks (Marcas de Corte) on a jsPDF instance
 */
function drawCropMarks(
  pdf: jsPDF,
  x: number, // mm
  y: number, // mm
  width: number, // mm
  height: number, // mm
  bleed: number = 3, // mm
  markLength: number = 4 // mm
) {
  pdf.setDrawColor(30, 30, 30);
  pdf.setLineWidth(0.15); // Fine hairline for cutting

  // Top-Left corner
  // Horizontal line (pointing left)
  pdf.line(x - bleed - markLength, y, x - bleed, y);
  // Vertical line (pointing up)
  pdf.line(x, y - bleed - markLength, x, y - bleed);

  // Top-Right corner
  // Horizontal line (pointing right)
  pdf.line(x + width + bleed, y, x + width + bleed + markLength, y);
  // Vertical line (pointing up)
  pdf.line(x + width, y - bleed - markLength, x + width, y - bleed);

  // Bottom-Left corner
  // Horizontal line (pointing left)
  pdf.line(x - bleed - markLength, y + height, x - bleed, y + height);
  // Vertical line (pointing down)
  pdf.line(x, y + height + bleed, x, y + height + bleed + markLength);

  // Bottom-Right corner
  // Horizontal line (pointing right)
  pdf.line(x + width + bleed, y + height, x + width + bleed + markLength, y + height);
  // Vertical line (pointing down)
  pdf.line(x + width, y + height + bleed, x + width, y + height + bleed + markLength);
}

/**
 * Generates print-ready PDF sheets (A4 or A3) with double-sided duplex alignment and crop marks
 */
export async function generatePrintSheetPDF(
  deck: DeckConfig,
  options: PrintSheetOptions,
  frontElementsMap: Map<string, HTMLElement>,
  backElement: HTMLElement,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const paperFormat = options.paperSize.toLowerCase() as "a4" | "a3" | "letter";
  const orientation = options.orientation;

  const pdf = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: paperFormat,
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const cardW = deck.customWidthMm;
  const cardH = deck.customHeightMm;
  const bleed = options.showBleedZone ? deck.bleedMm : 0;
  const effectiveCardW = cardW + bleed * 2;
  const effectiveCardH = cardH + bleed * 2;

  // Calculate maximum columns and rows on the sheet
  const marginMm = 10;
  const availableW = pageWidth - marginMm * 2;
  const availableH = pageHeight - marginMm * 2;

  const cols = Math.max(1, Math.floor(availableW / (effectiveCardW + 4)));
  const rows = Math.max(1, Math.floor(availableH / (effectiveCardH + 4)));
  const cardsPerPage = cols * rows;

  const totalCards = deck.cards.length;
  const totalBatches = Math.ceil(totalCards / cardsPerPage);

  // Render the master back image once
  onProgress?.(1, totalCards + 2, "Renderizando verso das cartas...");
  const masterBack = backElement || document.getElementById("export-card-back-master");
  if (!masterBack) {
    throw new Error("Elemento do verso das cartas não encontrado para renderização.");
  }
  const backImgData = await toPng(masterBack, { pixelRatio: 3 });

  // Grid spacing calculations to center cards on page
  const gridTotalW = cols * effectiveCardW + (cols - 1) * 2;
  const gridTotalH = rows * effectiveCardH + (rows - 1) * 2;
  const startX = (pageWidth - gridTotalW) / 2;
  const startY = (pageHeight - gridTotalH) / 2;

  let processedCount = 0;

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const batchCards = deck.cards.slice(batchIdx * cardsPerPage, (batchIdx + 1) * cardsPerPage);

    if (batchIdx > 0 || pdf.getNumberOfPages() > 1) {
      pdf.addPage(paperFormat, orientation);
    }

    // 1. FRONT SHEET (Página de Frentes)
    // Add sheet header text in margin
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `${deck.deckTitle} | Folha ${batchIdx + 1} de ${totalBatches} (FRENTE) | Formato: ${cardW}x${cardH}mm + Sangria ${bleed}mm`,
      marginMm,
      marginMm - 3
    );

    for (let i = 0; i < batchCards.length; i++) {
      const card = batchCards[i];
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = startX + col * (effectiveCardW + 2);
      const y = startY + row * (effectiveCardH + 2);

      const cardEl = frontElementsMap?.get(card.id) || document.getElementById(`export-${card.id}`);
      if (cardEl) {
        processedCount++;
        onProgress?.(
          processedCount,
          totalCards + 2,
          `Processando Carta ${card.number} - ${card.title}...`
        );
        const frontImgData = await toPng(cardEl, { pixelRatio: 3 });
        pdf.addImage(frontImgData, "PNG", x, y, effectiveCardW, effectiveCardH, undefined, "FAST");

        if (options.showCropMarks) {
          drawCropMarks(pdf, x + bleed, y + bleed, cardW, cardH, bleed);
        }
      }
    }

    // 2. BACK SHEET (Página de Versos com Espelhamento para Impressão Duplex)
    if (options.duplexMode === "front-back-interleaved") {
      pdf.addPage(paperFormat, orientation);

      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(
        `${deck.deckTitle} | Folha ${batchIdx + 1} de ${totalBatches} (VERSO - ALINHAMENTO DUPLEX)`,
        marginMm,
        marginMm - 3
      );

      for (let i = 0; i < batchCards.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        // DUPLEX HORIZONTAL MIRRORING:
        // When flipping sheet horizontally, column 0 becomes column (cols - 1 - col)
        const mirroredCol = cols - 1 - col;

        const x = startX + mirroredCol * (effectiveCardW + 2);
        const y = startY + row * (effectiveCardH + 2);

        pdf.addImage(backImgData, "PNG", x, y, effectiveCardW, effectiveCardH, undefined, "FAST");

        if (options.showCropMarks) {
          drawCropMarks(pdf, x + bleed, y + bleed, cardW, cardH, bleed);
        }
      }
    }
  }

  onProgress?.(totalCards + 2, totalCards + 2, "Finalizando PDF para gráfica...");
  return pdf.output("blob");
}

/**
 * Generates an individual PDF with 1 card per page (ideal for print on demand or digital sharing)
 */
export async function generateIndividualCardsPDF(
  deck: DeckConfig,
  frontElementsMap: Map<string, HTMLElement>,
  backElement: HTMLElement,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const cardW = deck.customWidthMm;
  const cardH = deck.customHeightMm;
  const bleed = deck.bleedMm;
  const totalW = cardW + bleed * 2;
  const totalH = cardH + bleed * 2;

  const pdf = new jsPDF({
    orientation: cardW > cardH ? "landscape" : "portrait",
    unit: "mm",
    format: [totalW, totalH],
    compress: true,
  });

  const masterBack = backElement || document.getElementById("export-card-back-master");
  if (!masterBack) {
    throw new Error("Elemento do verso das cartas não encontrado para renderização.");
  }
  const backImgData = await toPng(masterBack, { pixelRatio: 3 });

  for (let i = 0; i < deck.cards.length; i++) {
    const card = deck.cards[i];
    if (i > 0) pdf.addPage([totalW, totalH], cardW > cardH ? "landscape" : "portrait");

    onProgress?.(i + 1, deck.cards.length, `Renderizando Carta ${card.number}...`);
    const cardEl = frontElementsMap?.get(card.id) || document.getElementById(`export-${card.id}`);
    if (cardEl) {
      const frontImgData = await toPng(cardEl, { pixelRatio: 3 });
      pdf.addImage(frontImgData, "PNG", 0, 0, totalW, totalH);

      // Add back page immediately after
      pdf.addPage([totalW, totalH], cardW > cardH ? "landscape" : "portrait");
      pdf.addImage(backImgData, "PNG", 0, 0, totalW, totalH);
    }
  }

  return pdf.output("blob");
}
