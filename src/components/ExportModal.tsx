import React, { useState } from "react";
import {
  Printer,
  FileDown,
  Archive,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scissors,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { DeckConfig, PrintSheetOptions } from "../types";
import { generatePrintSheetPDF, generateIndividualCardsPDF } from "../utils/pdfExport";
import { exportDeckAsZip } from "../utils/imageExport";
import { saveAs } from "file-saver";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckConfig;
  frontElementsMap: Map<string, HTMLElement>;
  backElement: HTMLElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  deck,
  frontElementsMap,
  backElement,
}) => {
  const [exportType, setExportType] = useState<"sheet-pdf" | "single-pdf" | "zip-images">("sheet-pdf");
  const [paperSize, setPaperSize] = useState<"A4" | "A3" | "Letter">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [showBleedZone, setShowBleedZone] = useState<boolean>(true);
  const [duplexMode, setDuplexMode] = useState<"front-back-interleaved" | "fronts-then-backs">("front-back-interleaved");

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; text: string }>({
    current: 0,
    total: 0,
    text: "",
  });

  if (!isOpen) return null;

  const handleExport = async () => {
    const effectiveBackElement = backElement || document.getElementById("export-card-back-master");
    if (!effectiveBackElement) {
      alert("Elemento do verso não encontrado. Aguarde a inicialização da tela.");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: deck.cards.length, text: "Iniciando renderização..." });

    try {
      if (exportType === "sheet-pdf") {
        const options: PrintSheetOptions = {
          paperSize,
          orientation,
          showCropMarks,
          showBleedZone,
          showSafeZone: false,
          duplexMode,
          cardsPerPage: 4,
          dpi: 300,
        };

        const pdfBlob = await generatePrintSheetPDF(
          deck,
          options,
          frontElementsMap,
          effectiveBackElement,
          (curr, tot, text) => setProgress({ current: curr, total: tot, text })
        );

        const safeDeckName = deck.deckTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
        saveAs(pdfBlob, `BARALHO_${safeDeckName}_FOLHAS_IMPRESSAO_GRAFICA.pdf`);
      } else if (exportType === "single-pdf") {
        const pdfBlob = await generateIndividualCardsPDF(
          deck,
          frontElementsMap,
          effectiveBackElement,
          (curr, tot, text) => setProgress({ current: curr, total: tot, text })
        );

        const safeDeckName = deck.deckTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
        saveAs(pdfBlob, `BARALHO_${safeDeckName}_CARTAS_INDIVIDUAIS_300DPI.pdf`);
      } else if (exportType === "zip-images") {
        await exportDeckAsZip(
          deck,
          frontElementsMap,
          effectiveBackElement,
          (curr, tot, text) => setProgress({ current: curr, total: tot, text })
        );
      }

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error("Erro na exportação:", err);
      alert(`Falha ao exportar: ${err.message || "Erro desconhecido"}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <Printer size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100">
                Exportar Baralho para Impressão & Gráfica
              </h2>
              <p className="text-xs text-neutral-400">
                Gere arquivos de alta resolução com marcas de corte e sangria de 3mm.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Options */}
        <div className="py-4 space-y-4 text-xs text-neutral-300">
          {/* Format Selection Cards */}
          <div>
            <label className="font-semibold text-neutral-200 block mb-2">
              Escolha o Formato de Exportação
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Sheet PDF */}
              <button
                type="button"
                onClick={() => setExportType("sheet-pdf")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  exportType === "sheet-pdf"
                    ? "bg-emerald-600/15 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500"
                    : "bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs text-neutral-100 flex items-center gap-1.5 mb-1">
                    <Printer size={15} className="text-emerald-400" />
                    <span>Folhas A4/A3</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    PDF com múltiplas cartas por folha, frente e verso espelhados para impressão duplex.
                  </p>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 mt-2 block">
                  ★ Mais Recomendado
                </span>
              </button>

              {/* Option 2: Individual Cards PDF */}
              <button
                type="button"
                onClick={() => setExportType("single-pdf")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  exportType === "single-pdf"
                    ? "bg-emerald-600/15 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500"
                    : "bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs text-neutral-100 flex items-center gap-1.5 mb-1">
                    <FileDown size={15} className="text-emerald-400" />
                    <span>PDF Cartas Únicas</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    1 carta por página em alta fidelidade. Ideal para gráficas rápidas ou impressoras digitais.
                  </p>
                </div>
              </button>

              {/* Option 3: ZIP PNGs */}
              <button
                type="button"
                onClick={() => setExportType("zip-images")}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  exportType === "zip-images"
                    ? "bg-emerald-600/15 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500"
                    : "bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs text-neutral-100 flex items-center gap-1.5 mb-1">
                    <Archive size={15} className="text-emerald-400" />
                    <span>ZIP 300 DPI (PNG)</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Todas as frentes e versos em imagens ultra-nítidas 300 DPI + guia de especificações.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Sheet Options Settings (if sheet-pdf) */}
          {exportType === "sheet-pdf" && (
            <div className="p-3.5 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
              <h4 className="font-semibold text-neutral-200 text-xs flex items-center gap-1.5">
                <Scissors size={14} className="text-amber-400" />
                Configurações de Impressão na Gráfica
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Tamanho do Papel</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="A3">A3 (297 x 420 mm - Gráfica)</option>
                    <option value="Letter">Carta / US Letter</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Orientação da Página</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="portrait">Retrato (Vertical)</option>
                    <option value="landscape">Paisagem (Horizontal)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs text-neutral-200 font-medium">Marcas de Corte (Crop Marks)</span>
                    <p className="text-[10px] text-neutral-400">Linhas guia finas nos cantos para corte com guilhotina na gráfica.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showCropMarks}
                    onChange={(e) => setShowCropMarks(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs text-neutral-200 font-medium">Sangria Profissional de {deck.bleedMm}mm</span>
                    <p className="text-[10px] text-neutral-400">Extensão da arte para evitar bordas brancas indesejadas após o corte.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showBleedZone}
                    onChange={(e) => setShowBleedZone(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs text-neutral-200 font-medium">Alinhamento Duplex (Frente e Verso Casados)</span>
                    <p className="text-[10px] text-neutral-400">Espelha o verso horizontalmente para casamento exato ao virar a folha.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={duplexMode === "front-back-interleaved"}
                    onChange={(e) =>
                      setDuplexMode(e.target.checked ? "front-back-interleaved" : "fronts-then-backs")
                    }
                    className="rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Graphic Specs Info Box */}
          <div className="p-3 bg-neutral-800/30 rounded-xl border border-neutral-700/40 text-[11px] text-neutral-400 flex items-start gap-2">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-300">Dica para sua gráfica:</strong> Peça impressão em{" "}
              <strong className="text-amber-300">Papel Cartão Triplex 350g ou Couchê 300g</strong> com{" "}
              <strong className="text-amber-300">Laminação Fosca Soft-Touch</strong> e{" "}
              <strong className="text-amber-300">Cantos Arredondados (raio 4mm)</strong>.
            </div>
          </div>

          {/* Progress Bar while generating */}
          {isProcessing && (
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                  {progress.text || "Processando imagens em 300 DPI..."}
                </span>
                <span className="font-mono text-emerald-400">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(100, (progress.current / Math.max(1, progress.total)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all text-xs font-medium"
          >
            Fechar
          </button>
          <button
            onClick={handleExport}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 text-xs disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Gerando Arquivos de Alta Resolução...</span>
              </>
            ) : (
              <>
                <FileDown size={16} />
                <span>Baixar para Impressão ({deck.cards.length} Cartas)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
