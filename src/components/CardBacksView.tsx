import React, { useState, useEffect, useRef } from "react";
import { DeckConfig, CardBackConfig, CardBackPreset } from "../types";
import { CARD_BACK_PRESETS, DEFAULT_CARD_BACK_CONFIG } from "../data/cardBackPresets";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";
import {
  Sparkles,
  Layers,
  Palette,
  Image as ImageIcon,
  Type,
  Maximize2,
  Minimize2,
  RotateCw,
  Download,
  Check,
  Plus,
  Trash2,
  Copy,
  Undo,
  Upload,
  Eye,
  Sliders,
  Sparkle,
  BookmarkCheck,
  Flower2,
  TreeDeciduous,
  Heart,
  Grid,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Square as SquareIcon,
  FolderPlus,
  Edit2,
  FilePlus2,
  X,
} from "lucide-react";

interface CardBacksViewProps {
  deck: DeckConfig;
  onUpdateDeck: (updates: Partial<DeckConfig>) => void;
  onUpdateStyle: (updates: Partial<DeckConfig["style"]>) => void;
  onNavigateToStudio?: () => void;
}

export const CardBacksView: React.FC<CardBacksViewProps> = ({
  deck,
  onUpdateDeck,
  onUpdateStyle,
  onNavigateToStudio,
}) => {
  // Current active working config
  const [activeConfig, setActiveConfig] = useState<CardBackConfig>(() => {
    return deck.style.backConfig || { ...DEFAULT_CARD_BACK_CONFIG };
  });

  // User-saved custom presets list
  const [customPresets, setCustomPresets] = useState<CardBackPreset[]>(() => {
    try {
      const saved = localStorage.getItem("terapia_custom_card_backs_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao carregar versos salvos:", e);
    }
    return [];
  });

  // Selected Preset ID
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    activeConfig.id || "essencia-rose-gold"
  );

  // Editor Tabs
  type EditorTab = "background" | "frame" | "botanicals" | "emblem" | "typography" | "dividers";
  const [activeTab, setActiveTab] = useState<EditorTab>("background");

  // Category filter
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Modal: Create New Card Back
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("Meu Novo Verso");
  const [newModelBase, setNewModelBase] = useState<string>("oficial");
  const [newModelCustomBg, setNewModelCustomBg] = useState<string | null>(null);

  // Preview options
  const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);
  const [previewScale, setPreviewScale] = useState<number>(0.9);
  const [showBleed, setShowBleed] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync if deck changes from external
  useEffect(() => {
    if (deck.style.backConfig) {
      setActiveConfig(deck.style.backConfig);
    }
  }, [deck.style.backConfig]);

  // Persist custom presets
  const saveCustomPresetsToStorage = (newList: CardBackPreset[]) => {
    setCustomPresets(newList);
    try {
      localStorage.setItem("terapia_custom_card_backs_v1", JSON.stringify(newList));
    } catch (e) {
      console.error("Erro ao persistir:", e);
    }
  };

  // Helper to update active config
  const updateConfig = (updates: Partial<CardBackConfig>) => {
    const updated = { ...activeConfig, ...updates };
    setActiveConfig(updated);
  };

  // Apply to active deck
  const handleApplyToCurrentDeck = () => {
    onUpdateStyle({
      backConfig: activeConfig,
      backStyle: "custom-image",
    });
    showToast("Verso aplicado ao baralho ativo com sucesso!");
  };

  // Quick direct save / update of active custom preset
  const handleSaveActiveChanges = () => {
    const isCustom = customPresets.some((p) => p.id === selectedPresetId);
    if (isCustom) {
      const updatedList = customPresets.map((p) => {
        if (p.id === selectedPresetId) {
          return {
            ...p,
            name: activeConfig.name || p.name,
            backConfig: { ...activeConfig },
          };
        }
        return p;
      });
      saveCustomPresetsToStorage(updatedList);
      showToast(`Alterações salvas no modelo "${activeConfig.name || "Personalizado"}"!`);
    } else {
      // If it's a built-in preset, open save as new preset flow
      handleSaveAsPreset();
    }
  };

  // Save as new preset
  const handleSaveAsPreset = () => {
    const name = prompt("Digite um nome para este modelo de verso:", activeConfig.name ? `${activeConfig.name} (Cópia)` : "Meu Verso Personalizado");
    if (!name) return;

    const newId = `custom-back-${Date.now()}`;
    const newPreset: CardBackPreset = {
      id: newId,
      name,
      category: "personalizado",
      description: "Modelo personalizado criado no editor de versos.",
      backConfig: {
        ...activeConfig,
        id: newId,
        name,
      },
    };

    const updated = [newPreset, ...customPresets];
    saveCustomPresetsToStorage(updated);
    setSelectedPresetId(newPreset.id);
    setActiveConfig(newPreset.backConfig);
    showToast(`Modelo "${name}" salvo na sua biblioteca!`);
  };

  // Create new from modal
  const handleConfirmCreateNew = () => {
    const name = newModelName.trim() || "Meu Novo Verso";
    const newId = `custom-back-${Date.now()}`;

    let baseConfig: CardBackConfig = { ...DEFAULT_CARD_BACK_CONFIG };

    if (newModelBase === "current") {
      baseConfig = { ...activeConfig };
    } else if (newModelBase === "blank") {
      baseConfig = {
        ...DEFAULT_CARD_BACK_CONFIG,
        bgType: "solid",
        bgColor: "#FAF7F2",
        frameType: "none",
        showCornerBotanicals: false,
        emblemType: "none",
        showDivider: false,
        showLowerOrnament: false,
        showFooterAccent: false,
        customBgImage: "",
      };
    } else if (newModelBase === "custom-bg" && newModelCustomBg) {
      baseConfig = {
        ...DEFAULT_CARD_BACK_CONFIG,
        bgType: "custom-image",
        customBgImage: newModelCustomBg,
      };
    } else {
      const foundPreset = CARD_BACK_PRESETS.find((p) => p.id === newModelBase);
      if (foundPreset) {
        baseConfig = { ...foundPreset.backConfig };
      }
    }

    baseConfig.id = newId;
    baseConfig.name = name;

    const newPreset: CardBackPreset = {
      id: newId,
      name,
      category: "personalizado",
      description: "Modelo personalizado criado no editor de versos.",
      backConfig: baseConfig,
    };

    const updated = [newPreset, ...customPresets];
    saveCustomPresetsToStorage(updated);
    setSelectedPresetId(newPreset.id);
    setActiveConfig(baseConfig);
    setIsCreateModalOpen(false);
    setNewModelName("Meu Novo Verso");
    setNewModelCustomBg(null);
    showToast(`Novo modelo "${name}" criado! Personalize as camadas à direita.`);
  };

  // Duplicate an existing preset directly
  const handleDuplicatePreset = (preset: CardBackPreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newName = `${preset.name} (Cópia)`;
    const newId = `custom-back-${Date.now()}`;

    const newPreset: CardBackPreset = {
      id: newId,
      name: newName,
      category: "personalizado",
      description: `Cópia baseada em ${preset.name}`,
      backConfig: {
        ...preset.backConfig,
        id: newId,
        name: newName,
      },
    };

    const updated = [newPreset, ...customPresets];
    saveCustomPresetsToStorage(updated);
    setSelectedPresetId(newPreset.id);
    setActiveConfig(newPreset.backConfig);
    showToast(`Cópia "${newName}" criada e carregada!`);
  };

  // Rename custom preset
  const handleRenamePreset = (preset: CardBackPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt("Digite o novo nome para este modelo:", preset.name);
    if (!newName || newName === preset.name) return;

    const updatedList = customPresets.map((p) => {
      if (p.id === preset.id) {
        return {
          ...p,
          name: newName,
          backConfig: { ...p.backConfig, name: newName },
        };
      }
      return p;
    });

    saveCustomPresetsToStorage(updatedList);
    if (selectedPresetId === preset.id) {
      setActiveConfig((prev) => ({ ...prev, name: newName }));
    }
    showToast(`Modelo renomeado para "${newName}"`);
  };

  // Select a preset
  const handleSelectPreset = (preset: CardBackPreset) => {
    setSelectedPresetId(preset.id);
    setActiveConfig({ ...preset.backConfig });
    showToast(`Carregado: ${preset.name}`);
  };

  // Delete custom preset
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Deseja realmente excluir este modelo salvo?")) return;
    const filtered = customPresets.filter((p) => p.id !== id);
    saveCustomPresetsToStorage(filtered);
    if (selectedPresetId === id) {
      const fallback = filtered[0] || CARD_BACK_PRESETS[0];
      setSelectedPresetId(fallback.id);
      setActiveConfig(fallback.backConfig);
    }
    showToast("Modelo excluído da sua biblioteca.");
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Generic Image Uploader helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: keyof CardBackConfig
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("A imagem selecionada deve ter menos de 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateConfig({ [fieldKey]: dataUrl });
      showToast("Imagem carregada!");
    };
    reader.readAsDataURL(file);
  };

  // Modal Custom BG upload helper
  const handleModalBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewModelCustomBg(event.target?.result as string);
      setNewModelBase("custom-bg");
    };
    reader.readAsDataURL(file);
  };

  // All presets combined
  const allPresets = [...CARD_BACK_PRESETS, ...customPresets];
  const filteredPresets = allPresets.filter((p) => {
    if (filterCategory === "all") return true;
    if (filterCategory === "custom") return p.category === "personalizado";
    return p.category === filterCategory;
  });

  const isCurrentPresetCustom = customPresets.some((p) => p.id === selectedPresetId);

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden relative">
      {/* Top Banner / Header */}
      <header className="h-16 px-6 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-amber-400/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-100">Criador & Galeria de Versos</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
                Alta Resolução 300 DPI
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Personalize cada detalhe do verso: molduras douradas, folhagens, árvores sagradas, tipografia e assinatura.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {saveSuccessMsg && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fade-in">
              <BookmarkCheck size={14} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* PROMINENT BUTTON: + NOVO VERSO */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-98 cursor-pointer"
            title="Criar um novo modelo de verso a partir do zero ou de uma base"
          >
            <Plus size={15} className="stroke-[3]" />
            <span>Novo Verso</span>
          </button>

          {/* Save Changes / Save as New */}
          <button
            onClick={handleSaveActiveChanges}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title={isCurrentPresetCustom ? "Salvar alterações neste modelo" : "Salvar como novo modelo personalizado"}
          >
            <BookmarkCheck size={14} className="text-amber-400" />
            <span>{isCurrentPresetCustom ? "Salvar Alterações" : "Salvar Modelo"}</span>
          </button>

          <button
            onClick={handleApplyToCurrentDeck}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Aplicar este verso às cartas do baralho atual"
          >
            <Check size={15} />
            <span>Aplicar ao Baralho</span>
          </button>

          {onNavigateToStudio && (
            <button
              onClick={onNavigateToStudio}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Ir para o Estúdio</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace: 3 Columns (Presets Sidebar, Preview Center, Controls Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Preset Catalog */}
        <aside className="w-76 border-r border-neutral-800/80 bg-neutral-900/60 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-neutral-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-amber-400" />
                Biblioteca de Versos
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Criar novo modelo de verso"
                >
                  <Plus size={12} />
                  <span>Novo</span>
                </button>
                <span className="text-[11px] text-neutral-500">({allPresets.length})</span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { id: "all", label: "Todos" },
                { id: "custom", label: "Meus Salvos" },
                { id: "oficial", label: "Oficial" },
                { id: "botanico", label: "Botânico" },
                { id: "mandala", label: "Mandala" },
                { id: "zen", label: "Zen" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    filterCategory === tab.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                      : "bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presets List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {/* Primary Action Card: + Adicionar Novo Verso */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full p-3 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-left transition-all group flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 text-amber-400 group-hover:text-neutral-950 flex items-center justify-center transition-all shrink-0">
                <Plus size={16} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200 block">
                  + Adicionar Novo Verso
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  Iniciar do zero, duplicar ou importar arte
                </span>
              </div>
            </button>

            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const isCustom = preset.category === "personalizado";

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md"
                      : "bg-neutral-850/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4
                      className={`text-xs font-bold leading-snug transition-colors truncate ${
                        isSelected ? "text-amber-300" : "text-neutral-200 group-hover:text-white"
                      }`}
                    >
                      {preset.name}
                    </h4>

                    {/* Quick action buttons for preset */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Duplicate button */}
                      <button
                        onClick={(e) => handleDuplicatePreset(preset, e)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-amber-300 p-1 rounded transition-opacity cursor-pointer"
                        title="Duplicar este modelo para criar uma nova variação"
                      >
                        <Copy size={12} />
                      </button>

                      {/* Rename (custom only) */}
                      {isCustom && (
                        <button
                          onClick={(e) => handleRenamePreset(preset, e)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-200 p-1 rounded transition-opacity cursor-pointer"
                          title="Renomear modelo"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}

                      {/* Delete (custom only) */}
                      {isCustom && (
                        <button
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer"
                          title="Excluir modelo salvo"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-2">
                    {preset.description}
                  </p>

                  {/* Micro Visual Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-neutral-800 text-neutral-300 rounded border border-neutral-700/60">
                      {preset.backConfig.bgType}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-neutral-800 text-neutral-300 rounded border border-neutral-700/60">
                      {preset.backConfig.emblemType}
                    </span>
                    {preset.backConfig.showCornerBotanicals && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-rose-950/40 text-rose-300 rounded border border-rose-800/40">
                        Folhagens
                      </span>
                    )}
                    {isCustom && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                        Personalizado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Live Card Canvas Preview */}
        <main className="flex-1 bg-neutral-950/90 flex flex-col items-center justify-between p-6 relative overflow-hidden">
          {/* Top Controls Toolbar */}
          <div className="w-full max-w-xl flex items-center justify-between bg-neutral-900/80 border border-neutral-800 px-4 py-2 rounded-2xl backdrop-blur-md z-10 shadow-lg">
            {/* 3D Flip Toggle */}
            <button
              onClick={() => setIsPreviewFlipped(!isPreviewFlipped)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isPreviewFlipped
                  ? "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                  : "bg-amber-500/20 border border-amber-500/40 text-amber-300"
              }`}
            >
              <RotateCw size={13} className="transition-transform duration-300" />
              <span>{isPreviewFlipped ? "Visualizando: FRENTE" : "Visualizando: VERSO"}</span>
            </button>

            {/* Bleed Guide Toggle */}
            <button
              onClick={() => setShowBleed(!showBleed)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                showBleed
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-neutral-200"
              }`}
              title="Exibe margem de corte e sangria gráfica de 3mm"
            >
              Guias de Corte
            </button>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Zoom:</span>
              <input
                type="range"
                min="0.6"
                max="1.3"
                step="0.05"
                value={previewScale}
                onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-neutral-400 w-8">{Math.round(previewScale * 100)}%</span>
            </div>
          </div>

          {/* Central Card Display with Realistic Card Shadow */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div
              className="relative transition-transform duration-500 rounded-2xl"
              style={{
                perspective: "1000px",
              }}
            >
              <div
                className="transition-all duration-300 drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "center center",
                }}
              >
                {!isPreviewFlipped ? (
                  <CardBack
                    deck={deck}
                    overrideBackConfig={activeConfig}
                    showBleedGuides={showBleed}
                    scale={1}
                  />
                ) : (
                  <CardFront
                    card={
                      deck.cards[0] || {
                        id: "preview-1",
                        number: 1,
                        title: "Conexão Interior",
                        category: "Autoconhecimento",
                        reflection: "Quando você silencia o barulho externo, a sua verdade mais profunda encontra espaço para florescer.",
                        soulQuestion: "O que o seu coração tem tentado lhe dizer?",
                        actionPrompt: "Feche os olhos por 2 minutos e respire profundamente.",
                      }
                    }
                    deck={deck}
                    showBleedGuides={showBleed}
                    scale={1}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Card Dimensions & Status Footer */}
          <div className="w-full max-w-xl flex items-center justify-between text-neutral-400 text-xs py-1 px-4 border border-neutral-800/80 bg-neutral-900/60 rounded-xl">
            <span>
              Tamanho: <strong className="text-neutral-200">{deck.customWidthMm} × {deck.customHeightMm} mm</strong> (
              {deck.sizePresetId.toUpperCase()})
            </span>
            <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <Sparkle size={12} />
              {activeConfig.name || "Verso em Tempo Real"}
            </span>
          </div>
        </main>

        {/* Right Column: Deep Layer-by-Layer Customization Inspector */}
        <aside className="w-96 border-l border-neutral-800/80 bg-neutral-900/80 flex flex-col shrink-0 overflow-hidden">
          {/* Active Model Name Bar with Save Actions */}
          <div className="p-3 border-b border-neutral-800 bg-neutral-900/95 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block tracking-wider">
                Editando Modelo
              </span>
              <input
                type="text"
                value={activeConfig.name || "Meu Verso"}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="bg-transparent text-amber-300 font-bold text-xs w-full focus:outline-none border-b border-transparent focus:border-amber-500/50"
                placeholder="Nome do Verso..."
              />
            </div>
            <button
              onClick={handleSaveAsPreset}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium flex items-center gap-1 border border-neutral-700 shrink-0 cursor-pointer"
              title="Salvar como um novo modelo cópia"
            >
              <Copy size={12} />
              <span>Salvar Cópia</span>
            </button>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="grid grid-cols-3 gap-1 p-2 border-b border-neutral-800 bg-neutral-900">
            {[
              { id: "background" as EditorTab, label: "Fundo", icon: Palette },
              { id: "frame" as EditorTab, label: "Moldura", icon: SquareIcon },
              { id: "botanicals" as EditorTab, label: "Folhas", icon: Flower2 },
              { id: "emblem" as EditorTab, label: "Emblema", icon: TreeDeciduous },
              { id: "typography" as EditorTab, label: "Textos", icon: Type },
              { id: "dividers" as EditorTab, label: "Detalhes", icon: Heart },
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                      : "bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* TAB 1: BACKGROUND */}
            {activeTab === "background" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="font-bold text-neutral-200 block">Tipo de Fundo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "watercolor-pink", label: "Aquarela Rosê (Oficial)" },
                      { id: "gradient", label: "Degradê Radial" },
                      { id: "solid", label: "Cor Sólida" },
                      { id: "custom-image", label: "Arte Própria (Upload)" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateConfig({ bgType: t.id as any })}
                        className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                          activeConfig.bgType === t.id
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                            : "bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Pickers */}
                {activeConfig.bgType !== "custom-image" && (
                  <div className="space-y-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Cor Base do Fundo
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeConfig.bgColor || "#F3D3D9"}
                          onChange={(e) => updateConfig({ bgColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-neutral-700 bg-neutral-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={activeConfig.bgColor || "#F3D3D9"}
                          onChange={(e) => updateConfig({ bgColor: e.target.value })}
                          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100"
                        />
                      </div>
                    </div>

                    {activeConfig.bgType === "gradient" && (
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">
                          Cor Secundária do Degradê
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeConfig.bgGradientEnd || "#EBBEC7"}
                            onChange={(e) => updateConfig({ bgGradientEnd: e.target.value })}
                            className="w-8 h-8 rounded-lg border border-neutral-700 bg-neutral-800 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={activeConfig.bgGradientEnd || "#EBBEC7"}
                            onChange={(e) => updateConfig({ bgGradientEnd: e.target.value })}
                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100"
                          />
                        </div>
                      </div>
                    )}

                    {/* Background Opacity */}
                    <div className="pt-2 border-t border-neutral-700/40">
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Opacidade do Fundo</span>
                        <span>{Math.round((activeConfig.bgOpacity ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1"
                        step="0.05"
                        value={activeConfig.bgOpacity ?? 1}
                        onChange={(e) => updateConfig({ bgOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Custom Background Image Uploader */}
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-amber-400" />
                      Arte de Fundo Personalizada
                    </label>
                    {activeConfig.customBgImage && (
                      <button
                        onClick={() => updateConfig({ customBgImage: "" })}
                        className="text-neutral-400 hover:text-red-400 text-[10px] cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Faça upload da sua arte de fundo (ex: <code>background-tras-fundo.png</code>). Dimensão recomendada: 825 × 1425 px (300 DPI).
                  </p>

                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl bg-neutral-900/60 cursor-pointer transition-all hover:bg-neutral-800/50">
                    <Upload size={20} className="text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-neutral-200">
                      {activeConfig.customBgImage ? "Substituir Imagem de Fundo" : "Selecionar Imagem de Fundo"}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">PNG ou JPG até 8MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleFileUpload(e, "customBgImage");
                        updateConfig({ bgType: "custom-image" });
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: FRAME (Moldura) */}
            {activeTab === "frame" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="font-bold text-neutral-200 block">Estilo da Moldura</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "golden-ornate", label: "Dourada com Cantos Ornados" },
                      { id: "double-line", label: "Linha Dupla Refinada" },
                      { id: "single-fine", label: "Linha Fina Minimalista" },
                      { id: "custom-image", label: "Moldura em PNG (Upload)" },
                      { id: "none", label: "Sem Moldura" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateConfig({ frameType: f.id as any })}
                        className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                          activeConfig.frameType === f.id
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                            : "bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeConfig.frameType !== "none" && (
                  <div className="space-y-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Cor da Moldura
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeConfig.frameColor || "#C5A059"}
                          onChange={(e) => updateConfig({ frameColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-neutral-700 bg-neutral-800 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={activeConfig.frameColor || "#C5A059"}
                          onChange={(e) => updateConfig({ frameColor: e.target.value })}
                          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Opacidade da Moldura</span>
                        <span>{Math.round((activeConfig.frameOpacity ?? 0.85) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={activeConfig.frameOpacity ?? 0.85}
                        onChange={(e) => updateConfig({ frameOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Custom Frame Asset Upload */}
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <SquareIcon size={14} className="text-amber-400" />
                      Upload Moldura Transparente (PNG)
                    </label>
                    {activeConfig.customFrameImage && (
                      <button
                        onClick={() => updateConfig({ customFrameImage: "" })}
                        className="text-neutral-400 hover:text-red-400 text-[10px] cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Use sua própria moldura em formato PNG com fundo transparente (ex: <code>moldura-fundo.png</code>).
                  </p>
                  <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl bg-neutral-900/60 cursor-pointer transition-all hover:bg-neutral-800/50">
                    <Upload size={18} className="text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-neutral-200">
                      {activeConfig.customFrameImage ? "Substituir Moldura PNG" : "Upload Moldura PNG"}
                    </span>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) => {
                        handleFileUpload(e, "customFrameImage");
                        updateConfig({ frameType: "custom-image" });
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: BOTANICALS (Folhagens nos Cantos) */}
            {activeTab === "botanicals" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60">
                  <div>
                    <label className="font-bold text-neutral-200 block">Ativar Folhagens nos Cantos</label>
                    <p className="text-[11px] text-neutral-400">Ramos florais botânicos nos 4 cantos da carta</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeConfig.showCornerBotanicals}
                    onChange={(e) => updateConfig({ showCornerBotanicals: e.target.checked })}
                    className="accent-amber-500 w-5 h-5 rounded cursor-pointer"
                  />
                </div>

                {activeConfig.showCornerBotanicals && (
                  <div className="space-y-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60">
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Tamanho dos Cantos Botânicos</span>
                        <span>{activeConfig.cornerSize ?? 85}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="140"
                        step="5"
                        value={activeConfig.cornerSize ?? 85}
                        onChange={(e) => updateConfig({ cornerSize: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                        <span>Opacidade</span>
                        <span>{Math.round((activeConfig.cornerOpacity ?? 0.85) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1"
                        step="0.05"
                        value={activeConfig.cornerOpacity ?? 0.85}
                        onChange={(e) => updateConfig({ cornerOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Corner Custom PNG Uploads */}
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
                  <h4 className="font-semibold text-neutral-200">Upload de Folhas Individuais (PNG)</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <label className="p-2 border border-neutral-700 hover:border-amber-500/60 rounded-lg bg-neutral-900/60 cursor-pointer block text-center">
                      <span className="block font-medium text-neutral-300">Topo Esquerda</span>
                      <span className="text-[10px] text-amber-400">
                        {activeConfig.customTopLeftCornerImage ? "✓ Carregada" : "+ Upload PNG"}
                      </span>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleFileUpload(e, "customTopLeftCornerImage")}
                        className="hidden"
                      />
                    </label>

                    <label className="p-2 border border-neutral-700 hover:border-amber-500/60 rounded-lg bg-neutral-900/60 cursor-pointer block text-center">
                      <span className="block font-medium text-neutral-300">Topo Direita</span>
                      <span className="text-[10px] text-amber-400">
                        {activeConfig.customTopRightCornerImage ? "✓ Carregada" : "+ Upload PNG"}
                      </span>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleFileUpload(e, "customTopRightCornerImage")}
                        className="hidden"
                      />
                    </label>

                    <label className="p-2 border border-neutral-700 hover:border-amber-500/60 rounded-lg bg-neutral-900/60 cursor-pointer block text-center">
                      <span className="block font-medium text-neutral-300">Rodapé Esquerda</span>
                      <span className="text-[10px] text-amber-400">
                        {activeConfig.customBottomLeftCornerImage ? "✓ Carregada" : "+ Upload PNG"}
                      </span>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleFileUpload(e, "customBottomLeftCornerImage")}
                        className="hidden"
                      />
                    </label>

                    <label className="p-2 border border-neutral-700 hover:border-amber-500/60 rounded-lg bg-neutral-900/60 cursor-pointer block text-center">
                      <span className="block font-medium text-neutral-300">Rodapé Direita</span>
                      <span className="text-[10px] text-amber-400">
                        {activeConfig.customBottomRightCornerImage ? "✓ Carregada" : "+ Upload PNG"}
                      </span>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleFileUpload(e, "customBottomRightCornerImage")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: EMBLEM & LOGO */}
            {activeTab === "emblem" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="font-bold text-neutral-200 block">Emblema Central Superior</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "tree-of-life", label: "Árvore da Vida Floral (Oficial)" },
                      { id: "mandala", label: "Mandala Dourada Sagrada" },
                      { id: "lotus", label: "Flor de Lótus Sagrada" },
                      { id: "custom-logo", label: "Logo Próprio (Upload)" },
                      { id: "none", label: "Sem Emblema Superior" },
                    ].map((em) => (
                      <button
                        key={em.id}
                        onClick={() => updateConfig({ emblemType: em.id as any })}
                        className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                          activeConfig.emblemType === em.id
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                            : "bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        }`}
                      >
                        {em.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tree Foliage Color Config if Tree of Life */}
                {activeConfig.emblemType === "tree-of-life" && (
                  <div className="space-y-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60">
                    <label className="font-semibold text-neutral-200 block">Cores da Copa da Árvore</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">Rosa Pastel</span>
                        <input
                          type="color"
                          value={activeConfig.treePalette?.pink || "#E9B6C2"}
                          onChange={(e) =>
                            updateConfig({
                              treePalette: {
                                ...(activeConfig.treePalette || { pink: "#E9B6C2", blue: "#A3C3D9", white: "#FFFFFF", trunk: "#FFFFFF" }),
                                pink: e.target.value,
                              },
                            })
                          }
                          className="w-full h-8 rounded border border-neutral-700 bg-neutral-800 cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">Azul Pastel</span>
                        <input
                          type="color"
                          value={activeConfig.treePalette?.blue || "#A3C3D9"}
                          onChange={(e) =>
                            updateConfig({
                              treePalette: {
                                ...(activeConfig.treePalette || { pink: "#E9B6C2", blue: "#A3C3D9", white: "#FFFFFF", trunk: "#FFFFFF" }),
                                blue: e.target.value,
                              },
                            })
                          }
                          className="w-full h-8 rounded border border-neutral-700 bg-neutral-800 cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">Tronco / Branco</span>
                        <input
                          type="color"
                          value={activeConfig.treePalette?.trunk || "#FFFFFF"}
                          onChange={(e) =>
                            updateConfig({
                              treePalette: {
                                ...(activeConfig.treePalette || { pink: "#E9B6C2", blue: "#A3C3D9", white: "#FFFFFF", trunk: "#FFFFFF" }),
                                trunk: e.target.value,
                              },
                            })
                          }
                          className="w-full h-8 rounded border border-neutral-700 bg-neutral-800 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Logo Upload */}
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-amber-400" />
                      Upload do Logo ou Emblema (PNG)
                    </label>
                    {activeConfig.customEmblemImage && (
                      <button
                        onClick={() => updateConfig({ customEmblemImage: "" })}
                        className="text-neutral-400 hover:text-red-400 text-[10px] cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Substitua o emblema superior pelo logotipo da sua clínica ou projeto terapêutico (PNG com fundo transparente).
                  </p>
                  <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl bg-neutral-900/60 cursor-pointer transition-all hover:bg-neutral-800/50">
                    <Upload size={18} className="text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-neutral-200">
                      {activeConfig.customEmblemImage ? "Substituir Logo PNG" : "Selecionar Logo PNG"}
                    </span>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) => {
                        handleFileUpload(e, "customEmblemImage");
                        updateConfig({ emblemType: "custom-logo" });
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: TYPOGRAPHY & TEXTS */}
            {activeTab === "typography" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60">
                  <h4 className="font-bold text-neutral-200">Textos do Verso</h4>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Prefixo Superior (Tracking Aberto)
                    </label>
                    <input
                      type="text"
                      value={activeConfig.collectionEyebrowText ?? "COLEÇÃO"}
                      onChange={(e) => updateConfig({ collectionEyebrowText: e.target.value.toUpperCase() })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 uppercase"
                      placeholder="COLEÇÃO"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Nome Principal da Coleção (Display)
                    </label>
                    <input
                      type="text"
                      value={activeConfig.collectionTitleText ?? deck.collectionName}
                      onChange={(e) => {
                        updateConfig({ collectionTitleText: e.target.value.toUpperCase() });
                        onUpdateDeck({ collectionName: e.target.value.toUpperCase() });
                      }}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 uppercase font-semibold"
                      placeholder="ESSÊNCIA"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Frase / Mantra Terapêutico (Itálico)
                    </label>
                    <textarea
                      rows={2}
                      value={activeConfig.quoteText ?? deck.subtitle}
                      onChange={(e) => {
                        updateConfig({ quoteText: e.target.value });
                        onUpdateDeck({ subtitle: e.target.value });
                      }}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 resize-none"
                      placeholder="Mantra reflexivo..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Nome do Terapeuta / Autor
                    </label>
                    <input
                      type="text"
                      value={activeConfig.authorName ?? deck.author}
                      onChange={(e) => {
                        updateConfig({ authorName: e.target.value });
                        onUpdateDeck({ author: e.target.value });
                      }}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100"
                      placeholder="Nome do Terapeuta"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">
                      Especialidade / Rótulo Profissional
                    </label>
                    <input
                      type="text"
                      value={activeConfig.authorRoleText ?? "TERAPIAS INTEGRATIVAS"}
                      onChange={(e) => updateConfig({ authorRoleText: e.target.value.toUpperCase() })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 uppercase"
                      placeholder="TERAPIAS INTEGRATIVAS"
                    />
                  </div>
                </div>

                {/* Signature Custom PNG Upload */}
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <Type size={14} className="text-amber-400" />
                      Assinatura Digitalizada (PNG)
                    </label>
                    {activeConfig.customSignatureImage && (
                      <button
                        onClick={() => updateConfig({ customSignatureImage: "" })}
                        className="text-neutral-400 hover:text-red-400 text-[10px] cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Se possuir uma assinatura digitalizada em PNG transparente (ex: <code>assinatura.png</code>), envie aqui para substituir o texto tipográfico.
                  </p>
                  <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl bg-neutral-900/60 cursor-pointer transition-all hover:bg-neutral-800/50">
                    <Upload size={18} className="text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-neutral-200">
                      {activeConfig.customSignatureImage ? "Substituir Assinatura PNG" : "Upload Assinatura PNG"}
                    </span>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) => handleFileUpload(e, "customSignatureImage")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 6: DIVIDERS & LOTUS BOTTOM */}
            {activeTab === "dividers" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60">
                  <h4 className="font-bold text-neutral-200">Divisores & Símbolos Especiais</h4>

                  {/* Center Heart Divider */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-neutral-200 block">Divisor Central com Coração</span>
                      <span className="text-[10px] text-neutral-400">Linha decorativa após o nome da coleção</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={activeConfig.showDivider !== false}
                      onChange={(e) => updateConfig({ showDivider: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {/* Bottom Lotus */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-700/40">
                    <div>
                      <span className="font-medium text-neutral-200 block">Flor de Lótus Inferior</span>
                      <span className="text-[10px] text-neutral-400">Lótus dourado no rodapé antes do autor</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={activeConfig.showLowerOrnament !== false}
                      onChange={(e) => updateConfig({ showLowerOrnament: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {/* Bottom Finishing Dots */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-700/40">
                    <div>
                      <span className="font-medium text-neutral-200 block">Pontos Dourados de Acabamento</span>
                      <span className="text-[10px] text-neutral-400">3 pontos sutis no rodapé final</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={activeConfig.showFooterAccent !== false}
                      onChange={(e) => updateConfig({ showFooterAccent: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Custom Divider Asset Upload */}
                <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <Heart size={14} className="text-amber-400" />
                      Upload Divisor Central Próprio (PNG)
                    </label>
                    {activeConfig.customDividerImage && (
                      <button
                        onClick={() => updateConfig({ customDividerImage: "" })}
                        className="text-neutral-400 hover:text-red-400 text-[10px] cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <label className="flex flex-col items-center justify-center p-3 border border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl bg-neutral-900/60 cursor-pointer transition-all hover:bg-neutral-800/50">
                    <Upload size={18} className="text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-neutral-200">
                      {activeConfig.customDividerImage ? "Substituir Divisor PNG" : "Upload Divisor PNG"}
                    </span>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) => handleFileUpload(e, "customDividerImage")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CRIAR NOVO MODELO DE VERSO                                        */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <FilePlus2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">Criar Novo Modelo de Verso</h3>
                  <p className="text-[11px] text-neutral-400">
                    Escolha uma base para começar e personalize cada camada
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Field 1: Model Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 mb-1.5">
                  Nome do Novo Modelo
                </label>
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="Ex: Verso Ouro Imperial, Coleção Despertar, etc."
                  className="w-full bg-neutral-800/90 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Field 2: Base Template Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 mb-1.5">
                  Escolha o Ponto de Partida
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      id: "oficial",
                      name: "Aquarela Rosê & Ouro (Oficial)",
                      desc: "Base clássica com árvore sagrada, moldura ouro e folhagens",
                      icon: Sparkles,
                    },
                    {
                      id: "current",
                      name: "Duplicar Modelo Atual",
                      desc: "Copia exatamente o verso que está em edição agora",
                      icon: Copy,
                    },
                    {
                      id: "botanico-zen",
                      name: "Botânico Floral",
                      desc: "Foco em folhagens delicadas e flor de lótus central",
                      icon: Flower2,
                    },
                    {
                      id: "mandala-imperial",
                      name: "Mandala Dourada Sagrada",
                      desc: "Mandala mística central com acabamento geométrico",
                      icon: TreeDeciduous,
                    },
                    {
                      id: "blank",
                      name: "Do Zero (Em Branco / Minimalista)",
                      desc: "Fundo limpo e suave sem molduras ou ilustrações prévias",
                      icon: SquareIcon,
                    },
                    {
                      id: "custom-bg",
                      name: "Upload de Fundo Completo",
                      desc: "Carregar imagem de arte própria (PNG/JPG do Canva ou Photoshop)",
                      icon: Upload,
                    },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = newModelBase === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewModelBase(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40"
                            : "bg-neutral-800/60 border-neutral-700/80 hover:bg-neutral-800 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <Icon size={14} className={isSelected ? "text-amber-400" : "text-neutral-400"} />
                            {opt.name}
                          </span>
                          {isSelected && <Check size={14} className="text-amber-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-neutral-400 leading-snug">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload image if custom-bg is selected */}
              {newModelBase === "custom-bg" && (
                <div className="p-3 bg-neutral-800/80 rounded-xl border border-amber-500/40 space-y-2 animate-fade-in">
                  <label className="block text-[11px] font-bold text-amber-300">
                    Selecione a Imagem de Fundo (PNG / JPG)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-amber-500/50 hover:border-amber-400 rounded-lg bg-neutral-900/60 cursor-pointer transition-colors">
                    <Upload size={16} className="text-amber-400" />
                    <span className="text-xs text-neutral-200">
                      {newModelCustomBg ? "✓ Imagem selecionada (clique para trocar)" : "Fazer upload do arquivo de imagem"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleModalBgUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-2 bg-neutral-900/90">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateNew}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Criar e Personalizar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
