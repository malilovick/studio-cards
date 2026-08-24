import React, { useState } from "react";
import {
  Palette,
  Layout,
  Type,
  Maximize2,
  Sparkles,
  Image as ImageIcon,
  User,
  ShieldCheck,
  Sliders,
  Check,
  ChevronDown,
  Upload,
  ExternalLink,
  Layers,
  Flower2,
  TreeDeciduous,
} from "lucide-react";
import { DeckConfig, DeckStyleConfig, TopOrnament, BorderStyle, BackStyle, CardBackConfig } from "../types";
import { CARD_SIZE_PRESETS, THEME_COLOR_PRESETS } from "../data/themePresets";
import { CARD_BACK_PRESETS } from "../data/cardBackPresets";

interface DesignSidebarProps {
  deck: DeckConfig;
  onUpdateDeck: (updated: Partial<DeckConfig>) => void;
  onUpdateStyle: (updated: Partial<DeckStyleConfig>) => void;
  onOpenCardBacksManager?: () => void;
}

export const DesignSidebar: React.FC<DesignSidebarProps> = ({
  deck,
  onUpdateDeck,
  onUpdateStyle,
  onOpenCardBacksManager,
}) => {
  const [activeTab, setActiveTab] = useState<"dimensions" | "colors" | "typography" | "ornaments" | "branding">("dimensions");

  const { style } = deck;
  const { colors } = style;

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>, isBack: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isBack) {
          onUpdateStyle({ customBackBgImage: result });
        } else {
          onUpdateStyle({ customBgImage: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateDeck({ authorLogoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-80 md:w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Tabs Header - 5-Column Compact Grid with Icons & Labels */}
      <div className="grid grid-cols-5 bg-neutral-950/80 border-b border-neutral-800 p-1.5 gap-1 shrink-0 select-none">
        {[
          { id: "dimensions", label: "Tamanho", icon: Maximize2, title: "Tamanho & Dimensões Gráficas" },
          { id: "colors", label: "Cores", icon: Palette, title: "Cores, Paletas & Texturas de Fundo" },
          { id: "typography", label: "Tipografia", icon: Type, title: "Tipografia & Fontes" },
          { id: "ornaments", label: "Molduras", icon: Sparkles, title: "Molduras, Símbolos & Bordas" },
          { id: "branding", label: "Verso", icon: User, title: "Verso & Marca do Autor" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              title={tab.title}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent"
              }`}
            >
              <Icon
                size={16}
                className={`mb-1 transition-transform ${
                  isActive ? "text-amber-400 scale-110" : "text-neutral-400"
                }`}
              />
              <span className="text-[10px] font-medium leading-tight truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-neutral-300 scrollbar-thin">
        {/* TAB 1: DIMENSIONS & SIZES */}
        {activeTab === "dimensions" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                Tamanhos Padronizados para Gráfica
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {CARD_SIZE_PRESETS.map((preset) => {
                  const isSelected = deck.sizePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateDeck({
                          sizePresetId: preset.id,
                          customWidthMm: preset.widthMm,
                          customHeightMm: preset.heightMm,
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500 text-amber-200"
                          : "bg-neutral-800/60 border-neutral-700/60 hover:bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-neutral-100 flex items-center gap-1.5">
                          {preset.name}
                          {isSelected && <Check size={14} className="text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {preset.widthMm} x {preset.heightMm} mm ({preset.description})
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom mm dimensions */}
            <div className="p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/50 space-y-3">
              <h4 className="font-semibold text-neutral-200 text-xs flex items-center justify-between">
                <span>Ajuste Fino de Dimensões (mm)</span>
                <span className="text-[10px] text-amber-400">Padrão Gráfica</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Largura (mm)</label>
                  <input
                    type="number"
                    min={40}
                    max={200}
                    value={deck.customWidthMm}
                    onChange={(e) => onUpdateDeck({ customWidthMm: Number(e.target.value) || 70 })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Altura (mm)</label>
                  <input
                    type="number"
                    min={40}
                    max={300}
                    value={deck.customHeightMm}
                    onChange={(e) => onUpdateDeck({ customHeightMm: Number(e.target.value) || 120 })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 text-center font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Sangria / Bleed (mm)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={deck.bleedMm}
                    onChange={(e) => onUpdateDeck({ bleedMm: Number(e.target.value) || 3 })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Raio do Canto (mm)</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={style.cornerRadiusMm}
                    onChange={(e) => onUpdateStyle({ cornerRadiusMm: Number(e.target.value) || 4 })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 text-center font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLORS & PALETTES */}
        {activeTab === "colors" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                Paletas Terapêuticas Predefinidas
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {THEME_COLOR_PRESETS.map((preset) => {
                  const isSelected = style.themeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateStyle({
                          themeId: preset.id,
                          themeName: preset.name,
                          colors: preset.colors,
                          ...preset.style,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500 text-amber-200"
                          : "bg-neutral-800/60 border-neutral-700/60 hover:bg-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Color Swatch Circles */}
                        <div className="flex items-center -space-x-1.5">
                          <div
                            className="w-5 h-5 rounded-full border border-neutral-900"
                            style={{ backgroundColor: preset.colors.primaryAccent }}
                          />
                          <div
                            className="w-5 h-5 rounded-full border border-neutral-900"
                            style={{ backgroundColor: preset.colors.secondaryAccent }}
                          />
                          <div
                            className="w-5 h-5 rounded-full border border-neutral-900"
                            style={{ backgroundColor: preset.colors.backgroundBase }}
                          />
                        </div>
                        <span className="font-medium text-xs text-neutral-100">{preset.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/50 space-y-2.5">
              <h4 className="font-semibold text-neutral-200 text-xs">Personalizar Cores da Carta</h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-lg">
                  <span className="text-[11px] text-neutral-300">Dourado / Acento</span>
                  <input
                    type="color"
                    value={colors.primaryAccent}
                    onChange={(e) =>
                      onUpdateStyle({
                        colors: { ...colors, primaryAccent: e.target.value, borderAccent: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-lg">
                  <span className="text-[11px] text-neutral-300">Floral / Blush</span>
                  <input
                    type="color"
                    value={colors.secondaryAccent}
                    onChange={(e) =>
                      onUpdateStyle({
                        colors: { ...colors, secondaryAccent: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-lg">
                  <span className="text-[11px] text-neutral-300">Fundo da Carta</span>
                  <input
                    type="color"
                    value={colors.backgroundBase}
                    onChange={(e) =>
                      onUpdateStyle({
                        colors: { ...colors, backgroundBase: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-lg">
                  <span className="text-[11px] text-neutral-300">Texto Principal</span>
                  <input
                    type="color"
                    value={colors.textPrimary}
                    onChange={(e) =>
                      onUpdateStyle({
                        colors: { ...colors, textPrimary: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-lg">
                  <span className="text-[11px] text-neutral-300">Badge / Pílula</span>
                  <input
                    type="color"
                    value={colors.badgeBg}
                    onChange={(e) =>
                      onUpdateStyle({
                        colors: { ...colors, badgeBg: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-800 p-2 rounded-lg">
                  <span className="text-[11px] text-neutral-300">Caixa Reflexão</span>
                  <input
                    type="color"
                    value={colors.boxBg}
                    onChange={(e) =>
                      onUpdateStyle({
                        colors: { ...colors, boxBg: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Custom Background Upload */}
            <div className="p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/50 space-y-2">
              <h4 className="font-semibold text-neutral-200 text-xs">Imagem de Fundo Personalizada (Frente)</h4>
              <p className="text-[11px] text-neutral-400">
                Envie uma textura em aquarela, marmorizado ou arte criada por você.
              </p>
              <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-neutral-700 hover:border-amber-500/50 rounded-xl cursor-pointer bg-neutral-800/50 text-neutral-300 hover:text-white transition-all">
                <Upload size={15} />
                <span className="text-xs">Enviar Imagem de Fundo (PNG/JPG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCustomBgUpload(e, false)}
                  className="hidden"
                />
              </label>

              {style.customBgImage && (
                <button
                  onClick={() => onUpdateStyle({ customBgImage: undefined })}
                  className="text-[11px] text-red-400 hover:underline block text-center w-full"
                >
                  Remover imagem de fundo personalizada
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === "typography" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider block mb-1.5">
                Fonte dos Títulos & Coleção
              </label>
              <select
                value={style.titleFont}
                onChange={(e) => onUpdateStyle({ titleFont: e.target.value as any })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Cinzel">Cinzel (Clássico & Imperial Dourado)</option>
                <option value="Playfair Display">Playfair Display (Serif Elegante & Poético)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Delicado & Terapêutico)</option>
                <option value="Marcellus">Marcellus (Harmonioso & Arquetípico)</option>
                <option value="Prata">Prata (Editorial Sofisticado)</option>
                <option value="Montserrat">Montserrat (Moderno & Minimalista)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider block mb-1.5">
                Fonte dos Textos de Reflexão
              </label>
              <select
                value={style.bodyFont}
                onChange={(e) => onUpdateStyle({ bodyFont: e.target.value as any })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Legibilidade Impecável)</option>
                <option value="Montserrat">Montserrat (Geométrico & Limpo)</option>
                <option value="Lora">Lora (Serif Confortável para Leitura)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Serif Fino)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider block mb-1.5">
                Fonte da Assinatura do Terapeuta (Verso)
              </label>
              <select
                value={style.signatureFont}
                onChange={(e) => onUpdateStyle({ signatureFont: e.target.value as any })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Alex Brush">Alex Brush (Caligrafia Fluida & Serena)</option>
                <option value="Great Vibes">Great Vibes (Assinatura Manuscrita Requintada)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Serif Clássico)</option>
                <option value="Cinzel">Cinzel (Formal & Em Caps)</option>
              </select>
            </div>

            {/* Layout Element Toggles */}
            <div className="p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/50 space-y-2.5">
              <h4 className="font-semibold text-neutral-200 text-xs">Exibição de Elementos na Frente</h4>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-neutral-300">Nome da Coleção no Topo</span>
                <input
                  type="checkbox"
                  checked={style.showTopCollectionName}
                  onChange={(e) => onUpdateStyle({ showTopCollectionName: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-neutral-300">Caixa de Reflexão Terapêutica</span>
                <input
                  type="checkbox"
                  checked={style.showReflectionBox}
                  onChange={(e) => onUpdateStyle({ showReflectionBox: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-neutral-300">Seção "Pergunta da Alma"</span>
                <input
                  type="checkbox"
                  checked={style.showSoulQuestion}
                  onChange={(e) => onUpdateStyle({ showSoulQuestion: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-neutral-300">Micro-prática de Ação</span>
                <input
                  type="checkbox"
                  checked={style.showActionPrompt}
                  onChange={(e) => onUpdateStyle({ showActionPrompt: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: ORNAMENTS & BORDERS */}
        {activeTab === "ornaments" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider block mb-2">
                Ícone / Símbolo do Topo da Carta
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "lotus", label: "Flor de Lótus" },
                    { id: "tree", label: "Árvore da Vida" },
                    { id: "sunburst", label: "Sol Radiante" },
                    { id: "sacred-geometry", label: "Geometria Sagrada" },
                    { id: "mandala", label: "Mandala Zen" },
                    { id: "butterfly", label: "Borboleta" },
                    { id: "none", label: "Nenhum" },
                  ] as { id: TopOrnament; label: string }[]
                ).map((ornament) => {
                  const isSelected = style.topOrnament === ornament.id;
                  return (
                    <button
                      key={ornament.id}
                      onClick={() => onUpdateStyle({ topOrnament: ornament.id })}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      <span className="text-[11px] font-medium">{ornament.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider block mb-2">
                Estilo de Moldura & Cantos
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "botanical-corners", label: "Cantos Botânicos / Aquarela" },
                    { id: "double-gold", label: "Linha Dupla Dourada" },
                    { id: "minimal-line", label: "Linha Fina Minimalista" },
                    { id: "none", label: "Sem Moldura Externa" },
                  ] as { id: BorderStyle; label: string }[]
                ).map((b) => {
                  const isSelected = style.borderStyle === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => onUpdateStyle({ borderStyle: b.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      <span className="text-xs font-medium">{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BRANDING & BACK DESIGN */}
        {activeTab === "branding" && (
          <div className="space-y-4">
            {/* Banner: Open Full Card Backs Manager */}
            {onOpenCardBacksManager && (
              <div className="p-3 bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-amber-600/15 rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Criador Avançado de Versos</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Acesse o menu dedicado para personalizar molduras douradas, folhagens botânicas, emblemas, frases e gerenciar sua biblioteca.
                </p>
                <button
                  onClick={onOpenCardBacksManager}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                >
                  <ExternalLink size={13} />
                  <span>Abrir Menu Criador de Versos</span>
                </button>
              </div>
            )}

            {/* Quick Card Back Preset Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Modelos de Verso
                </h3>
                <span className="text-[10px] text-amber-400">1-Clique para aplicar</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CARD_BACK_PRESETS.map((preset) => {
                  const isSelected =
                    style.backConfig?.id === preset.id ||
                    (preset.id === "essencia-rose-gold" && !style.backConfig?.id);
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateStyle({
                          backConfig: preset.backConfig,
                          backStyle: "custom-image",
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30"
                          : "bg-neutral-800/60 border-neutral-700 hover:bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold leading-tight line-clamp-1">{preset.name}</span>
                        {isSelected && <Check size={12} className="text-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 capitalize">
                        {preset.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deck Branding Inputs */}
            <div className="space-y-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/50">
              <h4 className="font-semibold text-neutral-200 text-xs">Textos & Identidade do Terapeuta</h4>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nome da Coleção (Verso & Frente)</label>
                <input
                  type="text"
                  value={deck.collectionName}
                  onChange={(e) => onUpdateDeck({ collectionName: e.target.value.toUpperCase() })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 uppercase font-semibold"
                  placeholder="Ex: COLEÇÃO ESSÊNCIA"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Mantra / Frase do Verso</label>
                <textarea
                  rows={2}
                  value={deck.deckSubtitle}
                  onChange={(e) => onUpdateDeck({ deckSubtitle: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 italic resize-none"
                  placeholder="Ex: Toda transformação começa quando você retorna para si."
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nome do Terapeuta / Autor(a)</label>
                <input
                  type="text"
                  value={deck.authorName}
                  onChange={(e) => onUpdateDeck({ authorName: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100"
                  placeholder="Ex: Luciana Castro"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Especialidade / Título Profissional</label>
                <input
                  type="text"
                  value={deck.authorRole}
                  onChange={(e) => onUpdateDeck({ authorRole: e.target.value.toUpperCase() })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 uppercase"
                  placeholder="Ex: TERAPIAS INTEGRATIVAS"
                />
              </div>

              {/* Logo upload */}
              <div className="pt-2">
                <label className="text-[11px] text-neutral-400 block mb-1">Logo da Clínica / Terapeuta (PNG Transparente)</label>
                <label className="flex items-center justify-center gap-2 p-2 border border-dashed border-neutral-700 hover:border-amber-500/50 rounded-lg cursor-pointer bg-neutral-800 text-neutral-300 hover:text-white transition-all">
                  <Upload size={14} />
                  <span className="text-xs">{deck.authorLogoUrl ? "Alterar Logo" : "Carregar Logo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Custom Back Background Upload */}
              <div className="pt-2 border-t border-neutral-700/50">
                <label className="text-[11px] text-neutral-400 block mb-1">Fundo Personalizado para o Verso</label>
                <label className="flex items-center justify-center gap-2 p-2 border border-dashed border-neutral-700 hover:border-amber-500/50 rounded-lg cursor-pointer bg-neutral-800 text-neutral-300 hover:text-white transition-all">
                  <Upload size={14} />
                  <span className="text-xs">Enviar Arte do Verso (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCustomBgUpload(e, true)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
