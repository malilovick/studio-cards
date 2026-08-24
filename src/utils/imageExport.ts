import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import { DeckConfig } from "../types";
import { ProgressCallback } from "./pdfExport";

/**
 * Exports all deck cards as 300 DPI PNGs in a structured ZIP archive
 */
export async function exportDeckAsZip(
  deck: DeckConfig,
  frontElementsMap: Map<string, HTMLElement>,
  backElement: HTMLElement,
  onProgress?: ProgressCallback
): Promise<void> {
  const zip = new JSZip();

  const folderFronts = zip.folder("01_FRENTES_ALTA_RESOLUCAO_300DPI");
  const folderBacks = zip.folder("02_VERSOS_ALTA_RESOLUCAO_300DPI");

  const total = deck.cards.length + 1;
  let current = 0;

  // 1. Render Back (Master Verso)
  onProgress?.(++current, total, "Renderizando Verso das Cartas (300 DPI)...");
  const masterBack = backElement || document.getElementById("export-card-back-master");
  if (!masterBack) {
    throw new Error("Elemento do verso das cartas não encontrado para renderização.");
  }
  const backDataUrl = await toPng(masterBack, { pixelRatio: 3.5 });
  const backBase64 = backDataUrl.replace(/^data:image\/png;base64,/, "");
  folderBacks?.file("VERSO_MASTER_COLECAO.png", backBase64, { base64: true });

  // 2. Render each front card
  for (const card of deck.cards) {
    const cardEl = frontElementsMap?.get(card.id) || document.getElementById(`export-${card.id}`);
    if (cardEl) {
      onProgress?.(++current, total, `Renderizando Frente: Carta ${card.number} - ${card.title}...`);
      const frontDataUrl = await toPng(cardEl, { pixelRatio: 3.5 });
      const frontBase64 = frontDataUrl.replace(/^data:image\/png;base64,/, "");
      const cleanTitle = card.title.replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase();
      const fileName = `CARTA_${card.number}_${cleanTitle}.png`;
      folderFronts?.file(fileName, frontBase64, { base64: true });
    }
  }

  // 3. Add Print Shop Spec / Guide
  const printSpecs = `=====================================================
ESPECIFICAÇÕES TÉCNICAS PARA IMPRESSÃO EM GRÁFICA
=====================================================

BARALHO: ${deck.deckTitle}
COLEÇÃO: ${deck.collectionName}
AUTOR(A): ${deck.authorName} (${deck.authorRole})
TOTAL DE CARTAS: ${deck.cards.length} unidades

1. DIMENSÕES:
   - Tamanho Final Cortado: ${deck.customWidthMm} mm x ${deck.customHeightMm} mm
   - Sangria (Bleed): ${deck.bleedMm} mm em cada lateral (total: ${deck.customWidthMm + deck.bleedMm * 2} x ${deck.customHeightMm + deck.bleedMm * 2} mm)
   - Margem de Segurança Interna: ${deck.safeMarginMm} mm
   - Cantos: Arredondamento sugerido de 3 mm a 5 mm (facas de corte padrão)

2. RECOMENDAÇÃO DE PAPEL E ACABAMENTO:
   - Papel Recomendado: Papel Cartão Triplex 350g, Couchê 300g/350g ou Papel Especial Linho 300g
   - Acabamento Sugerido: Laminação Fosca (Soft-Touch ou BOPP Fosco) frente e verso
   - Acabamento Especial (Opcional): Hot Stamping Dourado ou Verniz Localizado UV nos títulos e ornamentos

3. ARQUIVOS INCLUSOS:
   - Pasta 01_FRENTES_ALTA_RESOLUCAO_300DPI: Todas as frentes numeradas em 300 DPI
   - Pasta 02_VERSOS_ALTA_RESOLUCAO_300DPI: Verso padrão alinhado para impressão frente e verso (duplex)

Gerado com Gerador Profissional de Cartas Terapêuticas
`;

  zip.file("GUIA_DE_IMPRESSAO_PARA_GRAFICA.txt", printSpecs);

  onProgress?.(total, total, "Compactando arquivo ZIP...");
  const content = await zip.generateAsync({ type: "blob" });

  const safeDeckName = deck.deckTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
  saveAs(content, `BARALHO_${safeDeckName}_300DPI_GRAFICA.zip`);
}
