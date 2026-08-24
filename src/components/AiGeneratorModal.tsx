import React, { useState } from "react";
import { Sparkles, X, Wand2, BookOpen, Heart, Brain, Sun, ShieldAlert, Check } from "lucide-react";
import { CardItem, DeckConfig } from "../types";

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedCards: (cards: CardItem[], deckTitle?: string, deckSubtitle?: string) => void;
}

const THEME_IDEAS = [
  {
    title: "Ansiedade & Autocompaixão",
    desc: "Acalmar pensamentos acelerados, regulação do sistema nervoso e acolhimento.",
    prompt: "Ansiedade, Autocompaixão e Regulação Emocional",
  },
  {
    title: "Cura da Criança Interior",
    desc: "Reconectar com a espontaneidade, acolher feridas de infância e criar segurança.",
    prompt: "Cura da Criança Interior, Reparentalização e Acolhimento",
  },
  {
    title: "Limites Saudáveis & Autoestima",
    desc: "Aprender a dizer não sem culpa, honrar necessidades e fortalecer a dignidade.",
    prompt: "Limites Saudáveis, Autoestima e Não Violência",
  },
  {
    title: "Desfusão & TCC / ACT",
    desc: "Observar pensamentos sem se fundir a eles, valores essenciais e ação com propósito.",
    prompt: "Terapia de Aceitação e Compromisso (ACT), Desfusão Cognitiva e Valores",
  },
  {
    title: "Luto, Perdas & Travessia",
    desc: "Honrar a dor da perda, acolher a saudade e encontrar sentido no recomeço.",
    prompt: "Elaboração de Luto, Travessia e Reconstrução da Esperança",
  },
  {
    title: "Mindfulness & Presença Plena",
    desc: "Ancorar no momento presente, conexão somática e desaceleração consciente.",
    prompt: "Mindfulness, Presença Plena e Consciência Corporal",
  },
];

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedCards,
}) => {
  const [theme, setTheme] = useState("");
  const [cardCount, setCardCount] = useState<number>(10);
  const [tone, setTone] = useState("acolhedor, poético e terapeuticamente profundo");
  const [cardType, setCardType] = useState("terapia_integrativa");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError("Por favor, digite ou selecione um tema.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          count: cardCount,
          tone,
          cardType,
          language: "pt-BR",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao gerar cartas com IA.");
      }

      const data = await res.json();
      if (data && Array.isArray(data.cards)) {
        const formattedCards: CardItem[] = data.cards.map((c: any, index: number) => ({
          id: `ai-card-${Date.now()}-${index}`,
          number: c.number || String(index + 1).padStart(2, "0"),
          title: (c.title || `CARTA ${index + 1}`).toUpperCase(),
          category: c.category || "Terapia",
          affirmation: c.affirmation || "",
          reflection: c.reflection || "",
          soulQuestion: c.soulQuestion || "",
          actionPrompt: c.actionPrompt || "",
          quote: c.quote || "",
        }));

        onApplyGeneratedCards(formattedCards, data.deckTitle, data.deckSubtitle);
        onClose();
      } else {
        throw new Error("Formato de resposta inesperado do Gemini.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao conectar com o Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-neutral-950 font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100">
                Criador de Baralho Terapêutico com IA
              </h2>
              <p className="text-xs text-neutral-400">
                Gere cartas com afirmações, reflexões psicológicas e perguntas da alma.
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

        {/* Form Body */}
        <div className="py-4 space-y-4 text-xs text-neutral-300">
          {/* Theme Input */}
          <div>
            <label className="font-semibold text-neutral-200 block mb-1.5">
              Tema Terapêutico ou Abordagem
            </label>
            <input
              type="text"
              placeholder="Ex: Aceitação Radical, Autocompaixão, Criança Ferida, Emoções..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Preset Ideas Pills */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
              Ou escolha uma inspiração terapêutica:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THEME_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTheme(idea.prompt)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    theme === idea.prompt
                      ? "bg-amber-500/20 border-amber-500 text-amber-200"
                      : "bg-neutral-800/60 border-neutral-700/60 hover:bg-neutral-800 text-neutral-300"
                  }`}
                >
                  <div className="font-semibold text-neutral-200 text-xs flex items-center justify-between">
                    <span>{idea.title}</span>
                    {theme === idea.prompt && <Check size={13} className="text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{idea.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Tone */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-semibold text-neutral-200 block mb-1">
                Quantidade de Cartas
              </label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value={5}>5 Cartas (Rápido)</option>
                <option value={10}>10 Cartas (Recomendado)</option>
                <option value={15}>15 Cartas (Completo)</option>
                <option value={20}>20 Cartas (Baralho Grande)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-200 block mb-1">
                Tom das Mensagens
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="acolhedor, poético e profundamente reflexivo">Acolhedor & Poético</option>
                <option value="direto, prático e focado em TCC">Prático / Cognitivo (TCC)</option>
                <option value="espiritual, sistêmico e meditativo">Sistêmico & Ancestral</option>
                <option value="gentil e materno para criança interior">Criança Interior & Ternura</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 text-xs disabled:opacity-50"
          >
            <Wand2 size={16} className={isLoading ? "animate-spin" : ""} />
            <span>{isLoading ? "Gerando Cartas Profundas..." : `Gerar ${cardCount} Cartas com IA`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
