import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Search,
  Upload,
  ChevronRight,
  GripVertical,
  Edit3,
  Heart,
  MessageSquare,
  Compass,
  Eye,
  Lock,
  RotateCcw,
  RotateCw,
  AlertCircle,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { CardItem, DeckConfig, PublicationStatus, PUBLICATION_STATUS_MAP } from "../types";
import {
  PublicationStatusBadge,
  PublicationStatusDropdown,
  getStatusIcon,
} from "./PublicationStatusSelector";

interface DeckManagerProps {
  deck: DeckConfig;
  selectedCardId: string;
  onSelectCard: (id: string) => void;
  onAddCard: () => void;
  onDuplicateCard: (card: CardItem) => void;
  onDeleteCard: (id: string) => void;
  onUpdateCard: (id: string, updated: Partial<CardItem>) => void;
  onOpenBatchImport: () => void;
  onAiEnhanceCard: (card: CardItem) => void;
  isAiEnhancing?: boolean;
  isFlipped?: boolean;
  onToggleFlip?: () => void;
}

export const DeckManager: React.FC<DeckManagerProps> = ({
  deck,
  selectedCardId,
  onSelectCard,
  onAddCard,
  onDuplicateCard,
  onDeleteCard,
  onUpdateCard,
  onOpenBatchImport,
  onAiEnhanceCard,
  isAiEnhancing = false,
  isFlipped = false,
  onToggleFlip,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all_active");
  const isReadOnly = Boolean(deck.isReadOnly);

  // Counts by status & demo
  const statusCounts = deck.cards.reduce(
    (acc, card) => {
      const st = card.status || "published";
      acc[st] = (acc[st] || 0) + 1;
      if (st !== "trash") {
        acc.active = (acc.active || 0) + 1;
        if (card.isDemo) {
          acc.demo = (acc.demo || 0) + 1;
        }
      }
      return acc;
    },
    { active: 0, demo: 0 } as Record<string, number>
  );

  const trashCount = statusCounts["trash"] || 0;
  const demoCount = statusCounts["demo"] || 0;

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(deck.cards.map((c) => c.category).filter(Boolean))) as string[],
  ];

  const filteredCards = deck.cards.filter((c) => {
    const cardStatus = c.status || "published";

    // Status filter
    if (statusFilter === "demo") {
      if (!c.isDemo || cardStatus === "trash") return false;
    } else if (statusFilter === "all_active" && cardStatus === "trash") {
      return false; // Hide trash by default in active view
    } else if (
      statusFilter !== "all" &&
      statusFilter !== "all_active" &&
      statusFilter !== "demo" &&
      cardStatus !== statusFilter
    ) {
      return false;
    }

    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.affirmation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reflection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const currentCard = deck.cards.find((c) => c.id === selectedCardId) || filteredCards[0] || deck.cards[0];

  // Actions for card status
  const handleMoveToTrash = (cardId: string) => {
    onUpdateCard(cardId, {
      status: "trash",
      trashedAt: new Date().toISOString(),
    });
  };

  const handleRestoreCard = (cardId: string) => {
    onUpdateCard(cardId, {
      status: "draft",
      trashedAt: undefined,
    });
  };

  const handleEmptyTrash = () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir definitivamente todas as ${trashCount} cartas da lixeira? Esta ação não pode ser desfeita.`
      )
    ) {
      deck.cards
        .filter((c) => c.status === "trash")
        .forEach((c) => onDeleteCard(c.id));
    }
  };

  return (
    <aside className="w-80 md:w-96 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Read Only Notice if shared */}
      {isReadOnly && (
        <div className="bg-amber-950/60 border-b border-amber-800/60 px-3 py-2 text-xs text-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Eye size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">Modo Visualização ({deck.sharedBy || "Compartilhado"})</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono shrink-0">
            Leitura
          </span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="p-3 border-b border-neutral-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-neutral-200">
              Cartas do Baralho
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium">
              {deck.cards.length}
            </span>
            {demoCount > 0 && (
              <span
                onClick={() => setStatusFilter(statusFilter === "demo" ? "all_active" : "demo")}
                className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 cursor-pointer hover:bg-amber-500/30 transition-all"
                title="Filtrar cartas da degustação demo"
              >
                <Sparkles size={10} />
                {demoCount} demo
              </span>
            )}
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenBatchImport}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1 border border-neutral-700 transition-all cursor-pointer"
                title="Importar cartas em lote (CSV ou texto)"
              >
                <Upload size={14} />
                <span className="hidden sm:inline">Importar</span>
              </button>

              <button
                onClick={onAddCard}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>Nova Carta</span>
              </button>
            </div>
          )}
        </div>

        {/* Publication & Demo Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <button
            onClick={() => setStatusFilter("all_active")}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer font-medium ${
              statusFilter === "all_active"
                ? "bg-neutral-200 text-neutral-900 font-semibold shadow-xs"
                : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Ativas ({statusCounts.active || 0})
          </button>
          
          <button
            onClick={() => setStatusFilter("demo")}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "demo"
                ? "bg-amber-400 text-neutral-950 font-bold shadow-xs"
                : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 font-medium"
            }`}
            title="Mostrar apenas as cartas incluídas na versão de degustação gratuita"
          >
            <Sparkles size={11} className={statusFilter === "demo" ? "text-neutral-950" : "text-amber-400"} />
            Demo ({demoCount})
          </button>

          <button
            onClick={() => setStatusFilter("published")}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "published"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                : "bg-neutral-800/60 text-neutral-400 hover:text-emerald-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Publicadas ({statusCounts["published"] || 0})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "draft"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                : "bg-neutral-800/60 text-neutral-400 hover:text-amber-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Rascunho ({statusCounts["draft"] || 0})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "pending"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 font-semibold"
                : "bg-neutral-800/60 text-neutral-400 hover:text-orange-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Pendentes ({statusCounts["pending"] || 0})
          </button>
          <button
            onClick={() => setStatusFilter("scheduled")}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === "scheduled"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold"
                : "bg-neutral-800/60 text-neutral-400 hover:text-blue-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Agendadas ({statusCounts["scheduled"] || 0})
          </button>
          {trashCount > 0 && (
            <button
              onClick={() => setStatusFilter("trash")}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === "trash"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold"
                  : "bg-neutral-800/60 text-neutral-400 hover:text-rose-300"
              }`}
            >
              <Trash2 size={11} className="text-rose-400" />
              Lixeira ({trashCount})
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por título ou afirmação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Category Chips & Bulk Demo Shortcut */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium"
                    : "bg-neutral-800/60 text-neutral-400 hover:text-neutral-300"
                }`}
              >
                {cat === "all" ? "Todas categorias" : cat}
              </button>
            ))}
          </div>

          {!isReadOnly && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  deck.cards.forEach((c, idx) => {
                    if (c.status === "trash") return;
                    onUpdateCard(c.id, { isDemo: idx < 3 });
                  });
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 cursor-pointer whitespace-nowrap"
                title="Marcar as primeiras 3 cartas como Demo para teste rápido"
              >
                1ªs 3 Demo
              </button>
            </div>
          )}
        </div>

        {/* Trash Banner when viewing trash */}
        {statusFilter === "trash" && (
          <div className="bg-rose-950/40 border border-rose-800/50 rounded-lg p-2 flex items-center justify-between text-xs text-rose-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Trash2 size={13} className="text-rose-400" />
              Lixeira ({filteredCards.length})
            </span>
            {!isReadOnly && filteredCards.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-200 underline cursor-pointer"
              >
                Esvaziar Lixeira
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 scrollbar-thin">
        {filteredCards.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">
            {statusFilter === "demo"
              ? "Nenhuma carta marcada para a degustação demo. Marque cartas com a estrela para liberá-las no teste dos clientes!"
              : statusFilter === "trash"
              ? "A lixeira de cartas está vazia."
              : "Nenhuma carta encontrada para este filtro."}
          </div>
        ) : (
          filteredCards.map((c, idx) => {
            const isSelected = c.id === selectedCardId;
            const cardStatus = c.status || "published";
            const isTrashed = cardStatus === "trash";
            const isDemo = Boolean(c.isDemo);

            return (
              <div
                key={c.id}
                onClick={() => onSelectCard(c.id)}
                className={`group p-3 cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                  isSelected
                    ? "bg-amber-500/10 border-l-4 border-amber-500"
                    : "hover:bg-neutral-800/40 border-l-4 border-transparent"
                } ${isTrashed ? "opacity-75 bg-rose-950/10" : ""}`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* Number Badge */}
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-amber-500 text-neutral-950"
                        : "bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 text-neutral-300"
                    }`}
                  >
                    {c.number || String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4
                        className={`text-xs font-bold truncate uppercase tracking-wider ${
                          isSelected ? "text-amber-200" : "text-neutral-200"
                        }`}
                      >
                        {c.title || "Sem Título"}
                      </h4>

                      {/* Demo Badge */}
                      {isDemo && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-400/40 font-bold flex items-center gap-0.5 shrink-0"
                          title="Carta incluída na degustação / demo gratuita"
                        >
                          <Sparkles size={9} />
                          DEMO
                        </span>
                      )}

                      {c.category && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 truncate">
                          {c.category}
                        </span>
                      )}
                      {/* Card Status Indicator Pill */}
                      <PublicationStatusBadge
                        status={cardStatus}
                        scheduledAt={c.scheduledAt}
                        size="sm"
                        showScheduleDate={false}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 italic line-clamp-1 mt-0.5">
                      "{c.affirmation}"
                    </p>
                  </div>
                </div>

                {/* Card Row Action Buttons (Owner only) */}
                {!isReadOnly && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                    {/* Quick Demo Toggle Star */}
                    {!isTrashed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateCard(c.id, { isDemo: !isDemo });
                        }}
                        className={`p-1 rounded transition-all cursor-pointer ${
                          isDemo
                            ? "text-amber-400 hover:text-amber-300 bg-amber-500/20"
                            : "text-neutral-500 hover:text-amber-400 hover:bg-neutral-800"
                        }`}
                        title={
                          isDemo
                            ? "Carta Demo: Clique para remover do teste gratuito"
                            : "Tornar Carta Demo (disponível para degustação do cliente)"
                        }
                      >
                        <Sparkles size={13} />
                      </button>
                    )}

                    {isTrashed ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreCard(c.id);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 cursor-pointer"
                        title="Restaurar Carta da Lixeira"
                      >
                        <RotateCcw size={13} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateCard(c);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                          title="Duplicar Carta"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToTrash(c.id);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 cursor-pointer"
                          title="Mover para Lixeira"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Card Quick Content Editor Bottom Panel */}
      {currentCard && (
        <div className="p-3 bg-neutral-950/80 border-t border-neutral-800 flex flex-col gap-2.5 max-h-96 overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1">
              {isReadOnly ? <Eye size={12} className="text-amber-400" /> : <Edit3 size={12} className="text-amber-400" />}
              {isReadOnly ? "Detalhes da Carta #" : "Editar Carta #"}
              {currentCard.number}
            </span>

            <div className="flex items-center gap-1.5">
              {/* Ver Verso / Ver Frente Flip Toggle Button */}
              {onToggleFlip && (
                <button
                  type="button"
                  onClick={onToggleFlip}
                  className={`text-[11px] px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all cursor-pointer font-medium ${
                    isFlipped
                      ? "bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs"
                      : "bg-neutral-800 text-amber-300 hover:bg-neutral-700 hover:text-amber-200 border-neutral-700"
                  }`}
                  title={isFlipped ? "Ver Frente da Carta no Canvas" : "Ver Verso da Carta no Canvas"}
                >
                  <RotateCw size={11} className={`transition-transform duration-300 ${isFlipped ? "rotate-180" : ""}`} />
                  <span>{isFlipped ? "Ver Frente" : "Ver Verso"}</span>
                </button>
              )}

              {/* AI Enhance Card Button */}
              {!isReadOnly && (
                <button
                  onClick={() => onAiEnhanceCard(currentCard)}
                  disabled={isAiEnhancing}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                  title="Aprimorar linguagem e profundidade terapêutica com IA"
                >
                  <Sparkles size={12} className={isAiEnhancing ? "animate-spin" : ""} />
                  <span>{isAiEnhancing ? "Aprimorando..." : "Melhorar com IA"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Demo / Degustação Status Toggle Card */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              currentCard.isDemo
                ? "bg-gradient-to-r from-amber-950/40 via-amber-900/25 to-yellow-950/30 border-amber-500/40 shadow-xs"
                : "bg-neutral-900/90 border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    currentCard.isDemo
                      ? "bg-amber-500 text-neutral-950 shadow-xs"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  <Sparkles size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-100">
                      Degustação / Demo
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                        currentCard.isDemo
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {currentCard.isDemo ? "✨ Grátis no Demo" : "🔒 Apenas Completo"}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {currentCard.isDemo
                      ? "Clientes poderão experimentar esta carta gratuitamente antes da compra."
                      : "Liberada apenas após o cliente comprar o baralho completo."}
                  </p>
                </div>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCard(currentCard.id, { isDemo: !currentCard.isDemo })
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-xs ${
                    currentCard.isDemo
                      ? "bg-amber-500 hover:bg-amber-400 text-neutral-950"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
                  }`}
                >
                  {currentCard.isDemo ? (
                    <>
                      <CheckCircle2 size={12} />
                      <span>No Demo</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>Incluir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Publication Status Selector for Current Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider">
                Status da Carta
              </span>
              <span className="text-[11px] text-neutral-300 truncate block">
                {PUBLICATION_STATUS_MAP[currentCard.status || "published"].description}
              </span>
            </div>

            {!isReadOnly ? (
              <PublicationStatusDropdown
                status={currentCard.status || "published"}
                scheduledAt={currentCard.scheduledAt}
                onChangeStatus={(newStatus, scheduledAt) =>
                  onUpdateCard(currentCard.id, {
                    status: newStatus,
                    scheduledAt,
                    trashedAt: newStatus === "trash" ? new Date().toISOString() : undefined,
                  })
                }
                variant="compact"
              />
            ) : (
              <PublicationStatusBadge
                status={currentCard.status || "published"}
                scheduledAt={currentCard.scheduledAt}
                size="sm"
              />
            )}
          </div>

          {/* Trash Alert if Trashed */}
          {currentCard.status === "trash" && !isReadOnly && (
            <div className="bg-rose-950/60 border border-rose-800/60 rounded-lg p-2 text-xs text-rose-200 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
                Esta carta está na lixeira.
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleRestoreCard(currentCard.id)}
                  className="px-2 py-0.5 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white font-medium text-[11px]"
                >
                  Restaurar
                </button>
                <button
                  onClick={() => onDeleteCard(currentCard.id)}
                  className="px-2 py-0.5 rounded bg-rose-700/80 hover:bg-rose-600 text-white font-medium text-[11px]"
                >
                  Excluir Definitivo
                </button>
              </div>
            </div>
          )}

          {/* Title & Number */}
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="text-[10px] text-neutral-400 block mb-0.5">Nº</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={currentCard.number}
                onChange={(e) => onUpdateCard(currentCard.id, { number: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 font-mono text-center disabled:opacity-75"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] text-neutral-400 block mb-0.5">Título / Tema</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={currentCard.title}
                onChange={(e) => onUpdateCard(currentCard.id, { title: e.target.value.toUpperCase() })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 font-semibold uppercase disabled:opacity-75"
                placeholder="Ex: ACEITAÇÃO"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] text-neutral-400 block mb-0.5">Categoria / Tag</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={currentCard.category || ""}
              onChange={(e) => onUpdateCard(currentCard.id, { category: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 disabled:opacity-75"
              placeholder="Ex: Autoacolhimento, Emoções, Presença"
            />
          </div>

          {/* Main Affirmation */}
          <div>
            <label className="text-[10px] text-neutral-400 block mb-0.5">Afirmação / Mantra Principal</label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={currentCard.affirmation}
              onChange={(e) => onUpdateCard(currentCard.id, { affirmation: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 resize-none italic disabled:opacity-75"
              placeholder="Ex: Eu me permito ser quem sou..."
            />
          </div>

          {/* Reflection */}
          <div>
            <label className="text-[10px] text-neutral-400 block mb-0.5">Reflexão Terapêutica</label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={currentCard.reflection}
              onChange={(e) => onUpdateCard(currentCard.id, { reflection: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 resize-none disabled:opacity-75"
              placeholder="Explicação psicológica ou acolhimento..."
            />
          </div>

          {/* Soul Question */}
          <div>
            <label className="text-[10px] text-neutral-400 block mb-0.5">Pergunta da Alma</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={currentCard.soulQuestion}
              onChange={(e) => onUpdateCard(currentCard.id, { soulQuestion: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 italic disabled:opacity-75"
              placeholder="Pergunta para reflexão profunda..."
            />
          </div>

          {/* Action Prompt */}
          <div>
            <label className="text-[10px] text-neutral-400 block mb-0.5">Prática / Micro-exercício (Opcional)</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={currentCard.actionPrompt || ""}
              onChange={(e) => onUpdateCard(currentCard.id, { actionPrompt: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 disabled:opacity-75"
              placeholder="Ex: Respire fundo e anote 3 sentimentos..."
            />
          </div>
        </div>
      )}
    </aside>
  );
};

