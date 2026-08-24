import React, { useState } from "react";
import { Upload, X, FileText, Check, AlertCircle } from "lucide-react";
import { CardItem } from "../types";

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCards: (cards: CardItem[]) => void;
  currentCount: number;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImportCards,
  currentCount,
}) => {
  const [importText, setImportText] = useState("");
  const [formatType, setFormatType] = useState<"pipe" | "csv">("pipe");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseAndImport = () => {
    setError(null);
    if (!importText.trim()) {
      setError("Insira o texto das cartas para importar.");
      return;
    }

    try {
      const lines = importText.split("\n").map((l) => l.trim()).filter(Boolean);
      const parsedCards: CardItem[] = [];

      lines.forEach((line, index) => {
        // Skip header lines if user pasted CSV header
        if (index === 0 && (line.toLowerCase().includes("título") || line.toLowerCase().includes("title"))) {
          return;
        }

        const delimiter = formatType === "pipe" ? "|" : ";";
        const parts = line.split(delimiter).map((p) => p.trim());

        if (parts.length >= 2) {
          const title = parts[0] || `CARTA ${currentCount + index + 1}`;
          const affirmation = parts[1] || "";
          const reflection = parts[2] || "";
          const soulQuestion = parts[3] || "";
          const actionPrompt = parts[4] || "";

          parsedCards.push({
            id: `import-${Date.now()}-${index}`,
            number: String(currentCount + parsedCards.length + 1).padStart(2, "0"),
            title: title.toUpperCase(),
            category: "Geral",
            affirmation,
            reflection,
            soulQuestion,
            actionPrompt,
          });
        }
      });

      if (parsedCards.length === 0) {
        throw new Error("Não foi possível identificar cartas válidas. Verifique o separador.");
      }

      onImportCards(parsedCards);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao processar formato das cartas.");
    }
  };

  const sampleTemplate =
    formatType === "pipe"
      ? `CORAGEM | Eu honro o meu medo e decido caminhar com o coração aberto. | Sentir medo faz parte da condição humana. A coragem não é a ausência de temor, mas a escolha consciente de agir com dignidade. | O que você faria hoje se soubesse que é seguro tentar? | Dê um pequeno passo em direção a algo que você vinha adiando.
PERDÃO | Eu liberto o passado para florescer no presente. | Perdoar não significa concordar com o erro, mas recusar-se a carregar o peso do rancor. | O que ainda precisa ser acolhido e solto em seu coração? | Escreva uma carta de desabafo e depois rasgue-a conscientemente.`
      : `Título; Afirmação; Reflexão; Pergunta da Alma; Prática
CORAGEM; Eu honro meu medo; Sentir medo faz parte; O que você faria hoje?; Dê um pequeno passo
PERDÃO; Eu liberto o passado; Perdoar liberta o coração; O que soltar?; Escreva e solte`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Upload size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100">
                Importação em Lote de Cartas
              </h2>
              <p className="text-xs text-neutral-400">
                Cole múltiplas cartas de uma só vez usando separadores.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3 text-xs text-neutral-300">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-neutral-200">Formato do Separador:</label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="format"
                checked={formatType === "pipe"}
                onChange={() => setFormatType("pipe")}
                className="text-amber-500 focus:ring-0"
              />
              <span>Barra Vertical ( | )</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="format"
                checked={formatType === "csv"}
                onChange={() => setFormatType("csv")}
                className="text-amber-500 focus:ring-0"
              />
              <span>Ponto e Vírgula ( ; )</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-neutral-200">Cole o texto das suas cartas:</label>
              <button
                type="button"
                onClick={() => setImportText(sampleTemplate)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Carregar Exemplo
              </button>
            </div>
            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Estrutura por linha:\nTÍTULO | Afirmação | Reflexão | Pergunta da Alma | Prática`}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleParseAndImport}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs shadow-lg transition-all"
          >
            Importar Cartas
          </button>
        </div>
      </div>
    </div>
  );
};
