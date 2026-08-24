import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  FolderKanban,
  Plus,
  Search,
  Sparkles,
  Share2,
  Copy,
  Trash2,
  Eye,
  RotateCcw,
  Calendar,
  Layers,
  BookOpen,
  Filter,
  CheckCircle2,
  ExternalLink,
  Users,
  Globe,
  Lock,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { DeckConfig, PublicationStatus, PUBLICATION_STATUS_MAP } from "../types";
import { DEFAULT_DECK, SAMPLE_DECKS } from "../data/sampleDecks";
import {
  createNewDeckInCloud,
  cloneDeckToMyAccount,
  deleteDeckFromCloud,
  saveDeckToCloud,
} from "../firebase";
import {
  PublicationStatusBadge,
  PublicationStatusDropdown,
} from "./PublicationStatusSelector";

interface CollectionsViewProps {
  user: User | null;
  myDecks: DeckConfig[];
  sharedDecks: DeckConfig[];
  currentDeck: DeckConfig;
  onSelectDeck: (deck: DeckConfig) => void;
  onOpenShareModal: (deck: DeckConfig) => void;
  onOpenStudio: () => void;
  onOpenAiModal?: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  user,
  myDecks,
  sharedDecks,
  currentDeck,
  onSelectDeck,
  onOpenShareModal,
  onOpenStudio,
  onOpenAiModal,
}) => {
  const [activeTab, setActiveTab] = useState<"my_decks" | "shared" | "create_new">("my_decks");
  const [statusFilter, setStatusFilter] = useState<string>("all_active");
  const [searchQuery, setSearchQuery] = useState("");

  // New deck creation form state
  const [newTitle, setNewTitle] = useState("");
  const [newCollection, setNewCollection] = useState("COLEÇÃO TERAPÊUTICA");
  const [newAuthorName, setNewAuthorName] = useState(user?.displayName || "Terapeuta");
  const [newAuthorRole, setNewAuthorRole] = useState("TERAPIAS INTEGRATIVAS");
  const [newStatus, setNewStatus] = useState<PublicationStatus>("draft");
  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<"essencia" | "tcc" | "blank">("essencia");
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Deck counts by status
  const myDeckStatusCounts = myDecks.reduce(
    (acc, d) => {
      const st = d.status || "draft";
      acc[st] = (acc[st] || 0) + 1;
      if (st !== "trash") {
        acc.active = (acc.active || 0) + 1;
      }
      return acc;
    },
    { active: 0 } as Record<string, number>
  );

  const filteredMyDecks = myDecks.filter((d) => {
    const st = d.status || "draft";
    if (statusFilter === "all_active" && st === "trash") return false;
    if (statusFilter !== "all" && statusFilter !== "all_active" && st !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (d.deckTitle && d.deckTitle.toLowerCase().includes(q)) ||
        (d.collectionName && d.collectionName.toLowerCase().includes(q)) ||
        (d.authorName && d.authorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredSharedDecks = sharedDecks.filter((d) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (d.deckTitle && d.deckTitle.toLowerCase().includes(q)) ||
        (d.collectionName && d.collectionName.toLowerCase().includes(q)) ||
        (d.authorName && d.authorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (!newTitle.trim()) {
      alert("Por favor, informe o título do novo baralho.");
      return;
    }

    setIsCreating(true);
    try {
      let baseDeck = DEFAULT_DECK;
      if (selectedTemplate === "tcc" && SAMPLE_DECKS[1]) {
        baseDeck = SAMPLE_DECKS[1];
      } else if (selectedTemplate === "blank") {
        baseDeck = {
          ...DEFAULT_DECK,
          cards: [
            {
              id: "card-1",
              number: "01",
              title: "CARTA INICIAL",
              category: "Reflexão",
              affirmation: "Eu acolho este momento com clareza e presença.",
              reflection: "Escreva aqui a reflexão principal desta carta.",
              soulQuestion: "Qual a sua verdade hoje?",
              actionPrompt: "Respire fundo e anote um sentimento.",
            },
          ],
        };
      }

      const created = await createNewDeckInCloud(
        user,
        newTitle.trim(),
        newCollection.trim() || "COLEÇÃO TERAPÊUTICA",
        {
          ...baseDeck,
          authorName: newAuthorName.trim() || "Terapeuta",
          authorRole: newAuthorRole.trim() || "TERAPIAS INTEGRATIVAS",
          status: newStatus,
          scheduledAt: newScheduledAt || undefined,
        }
      );

      onSelectDeck(created);
      onOpenStudio();
      setNewTitle("");
      setActiveTab("my_decks");
    } catch (err) {
      console.error("Erro ao criar baralho:", err);
      alert("Não foi possível criar o baralho no momento.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloneDeck = async (targetDeck: DeckConfig) => {
    if (!user) return;
    setActionLoadingId(targetDeck.id);
    try {
      const cloned = await cloneDeckToMyAccount(targetDeck, user);
      onSelectDeck(cloned);
      alert(`Cópia criada com sucesso! "${cloned.deckTitle}" adicionado aos seus baralhos.`);
      setActiveTab("my_decks");
    } catch (err) {
      console.error("Erro ao clonar:", err);
      alert("Não foi possível duplicar o baralho.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateDeckStatus = async (
    targetDeck: DeckConfig,
    newSt: PublicationStatus,
    schedAt?: string
  ) => {
    if (!user) return;
    setActionLoadingId(targetDeck.id);
    try {
      await saveDeckToCloud(
        {
          ...targetDeck,
          status: newSt,
          scheduledAt: schedAt,
          trashedAt: newSt === "trash" ? new Date().toISOString() : undefined,
        },
        targetDeck.ownerId || user.uid,
        targetDeck.ownerEmail || user.email || "",
        targetDeck.authorName || "Terapeuta"
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Não foi possível atualizar o status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePermanently = async (targetDeck: DeckConfig) => {
    if (!window.confirm(`Tem certeza que deseja excluir DEFINITIVAMENTE o baralho "${targetDeck.deckTitle}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setActionLoadingId(targetDeck.id);
    try {
      await deleteDeckFromCloud(targetDeck.id);
    } catch (err) {
      console.error("Erro ao excluir baralho:", err);
      alert("Não foi possível excluir o baralho.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 sm:p-6 lg:p-8 select-none scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center text-white shadow-lg">
              <FolderKanban size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
                Gerenciador de Coleções & Baralhos
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Organize todos os seus projetos de cartas, controle status de publicação e libere degustações demo.
              </p>
            </div>
          </div>

          {/* New Deck & AI Buttons */}
          <div className="flex items-center gap-2">
            {onOpenAiModal && (
              <button
                onClick={onOpenAiModal}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Gerar com IA</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("create_new")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus size={16} />
              <span>Novo Baralho</span>
            </button>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 w-fit">
            <button
              onClick={() => setActiveTab("my_decks")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "my_decks"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <FolderKanban size={14} />
              <span>Meus Baralhos ({myDecks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("shared")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "shared"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Users size={14} />
              <span>Compartilhados ({sharedDecks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("create_new")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "create_new"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Plus size={14} />
              <span>Criar Novo</span>
            </button>
          </div>

          {/* Search Box */}
          {activeTab !== "create_new" && (
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Pesquisar por título ou autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          )}
        </div>

        {/* Sub-Filters for Publication Status (My Decks Tab) */}
        {activeTab === "my_decks" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setStatusFilter("all_active")}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer font-medium ${
                statusFilter === "all_active"
                  ? "bg-neutral-800 text-amber-300 border border-neutral-700 font-bold"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Ativos ({myDeckStatusCounts.active || 0})
            </button>

            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === "published"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Publicados ({myDeckStatusCounts.published || 0})
            </button>

            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === "draft"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Rascunhos ({myDeckStatusCounts.draft || 0})
            </button>

            <button
              onClick={() => setStatusFilter("trash")}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === "trash"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Lixeira ({myDeckStatusCounts.trash || 0})
            </button>

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Todos ({myDecks.length})
            </button>
          </div>
        )}

        {/* TAB 1: MY DECKS GRID */}
        {activeTab === "my_decks" && (
          <div className="space-y-4">
            {filteredMyDecks.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-3">
                <FolderKanban size={32} className="mx-auto text-neutral-600" />
                <p className="text-sm text-neutral-400">
                  {statusFilter === "trash"
                    ? "Sua lixeira de baralhos está vazia."
                    : "Nenhum baralho encontrado para este filtro ou pesquisa."}
                </p>
                {statusFilter !== "trash" && (
                  <button
                    onClick={() => setActiveTab("create_new")}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Criar Primeiro Baralho</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMyDecks.map((deckItem) => {
                  const isCurrent = deckItem.id === currentDeck.id;
                  const isTrashed = deckItem.status === "trash";
                  const statusInfo = PUBLICATION_STATUS_MAP[deckItem.status || "draft"];
                  const demoCount = (deckItem.cards || []).filter((c) => c.isDemo && c.status !== "trash").length;
                  const isLoadingAction = actionLoadingId === deckItem.id;

                  return (
                    <div
                      key={deckItem.id}
                      className={`bg-neutral-900/90 rounded-2xl border transition-all p-5 flex flex-col justify-between relative group ${
                        isCurrent
                          ? "border-amber-500/50 shadow-xl ring-1 ring-amber-500/20"
                          : "border-neutral-800/90 hover:border-neutral-700"
                      }`}
                    >
                      {/* Loading Overlay */}
                      {isLoadingAction && (
                        <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-[2px] rounded-2xl z-20 flex items-center justify-center">
                          <Loader2 size={24} className="text-amber-400 animate-spin" />
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Header Line */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 truncate max-w-[140px]">
                            {deckItem.collectionName || "COLEÇÃO"}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {demoCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                                <Sparkles size={10} /> {demoCount} demo
                              </span>
                            )}

                            {!isTrashed && (
                              <PublicationStatusDropdown
                                status={deckItem.status || "draft"}
                                scheduledAt={deckItem.scheduledAt}
                                onChangeStatus={(newSt, schedAt) =>
                                  handleUpdateDeckStatus(deckItem, newSt, schedAt)
                                }
                              />
                            )}
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors truncate">
                            {deckItem.deckTitle || "Baralho Sem Título"}
                          </h3>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">
                            {deckItem.deckSubtitle || "Sem subtítulo"}
                          </p>
                        </div>

                        {/* Meta Tags */}
                        <div className="pt-2 flex items-center gap-3 text-[11px] text-neutral-400 border-t border-neutral-800/60">
                          <span className="font-semibold text-neutral-300">
                            {deckItem.cards?.length || 0} cartas
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {deckItem.authorName || "Terapeuta"}
                          </span>
                          {deckItem.shareMode === "all_authorized" && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">Público Colegas</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                        {isTrashed ? (
                          <>
                            <button
                              onClick={() => handleUpdateDeckStatus(deckItem, "draft")}
                              className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <RotateCcw size={13} />
                              <span>Restaurar Baralho</span>
                            </button>
                            <button
                              onClick={() => handleDeletePermanently(deckItem)}
                              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
                              title="Excluir Definitivamente"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                onSelectDeck(deckItem);
                                onOpenStudio();
                              }}
                              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isCurrent
                                  ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md"
                                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                              }`}
                            >
                              <Sparkles size={13} />
                              <span>{isCurrent ? "Editando Agora" : "Abrir no Estúdio"}</span>
                            </button>

                            <button
                              onClick={() => onOpenShareModal(deckItem)}
                              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Compartilhar Coleção"
                            >
                              <Share2 size={14} />
                            </button>

                            <button
                              onClick={() => handleCloneDeck(deckItem)}
                              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Duplicar Coleção"
                            >
                              <Copy size={14} />
                            </button>

                            <button
                              onClick={() => handleUpdateDeckStatus(deckItem, "trash")}
                              className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Mover para Lixeira"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHARED WITH ME */}
        {activeTab === "shared" && (
          <div className="space-y-4">
            {filteredSharedDecks.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-3">
                <Users size={32} className="mx-auto text-neutral-600" />
                <p className="text-sm text-neutral-400">
                  Nenhum baralho compartilhado diretamente com você no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSharedDecks.map((deckItem) => {
                  const isCurrent = deckItem.id === currentDeck.id;
                  const demoCount = (deckItem.cards || []).filter((c) => c.isDemo && c.status !== "trash").length;

                  return (
                    <div
                      key={deckItem.id}
                      className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-5 flex flex-col justify-between relative group hover:border-neutral-700 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                            {deckItem.collectionName || "COLEÇÃO"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            Compartilhado
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors truncate">
                            {deckItem.deckTitle}
                          </h3>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">
                            {deckItem.deckSubtitle || "Sem subtítulo"}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center gap-3 text-[11px] text-neutral-400 border-t border-neutral-800/60">
                          <span className="font-semibold text-neutral-300">
                            {deckItem.cards?.length || 0} cartas
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            Autor: {deckItem.authorName || "Terapeuta"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            onSelectDeck(deckItem);
                            onOpenStudio();
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Visualizar no Estúdio</span>
                        </button>

                        <button
                          onClick={() => handleCloneDeck(deckItem)}
                          className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Fazer uma cópia para a sua conta"
                        >
                          <Copy size={13} />
                          <span>Clonar / Editar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE NEW DECK FORM */}
        {activeTab === "create_new" && (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl">
            <form onSubmit={handleCreateDeck} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-100">Criar Novo Baralho Terapêutico</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Configure o título, a coleção e escolha o modelo inicial de cartas.
                </p>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 block">
                  Escolha o Modelo Inicial:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setSelectedTemplate("essencia")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === "essencia"
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-200"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="text-xs font-bold block text-neutral-100">
                      ✨ Essência da Cura
                    </span>
                    <span className="text-[11px] block mt-1 leading-snug">
                      12 cartas de reflexão profunda, autocuidado e espiritualidade.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate("tcc")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === "tcc"
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-200"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="text-xs font-bold block text-neutral-100">
                      🧠 TCC & Reestruturação
                    </span>
                    <span className="text-[11px] block mt-1 leading-snug">
                      6 cartas para questionamento de pensamentos automáticos.
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate("blank")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === "blank"
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-200"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="text-xs font-bold block text-neutral-100">
                      📄 Em Branco
                    </span>
                    <span className="text-[11px] block mt-1 leading-snug">
                      Começar com 1 carta virgem e estruturar livremente.
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Título do Baralho *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cartas do Autocuidado"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Nome da Coleção
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: COLEÇÃO TERAPÊUTICA"
                    value={newCollection}
                    onChange={(e) => setNewCollection(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Nome do Autor / Terapeuta
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Juliana Silveira"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Status de Publicação Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PublicationStatus)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60 cursor-pointer"
                  >
                    <option value="draft">Rascunho (Draft)</option>
                    <option value="published">Publicado (Publish)</option>
                    <option value="pending">Pendente (Pending)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("my_decks")}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Criando Baralho...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Criar e Abrir no Estúdio</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
