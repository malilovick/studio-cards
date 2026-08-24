import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  X,
  Layers,
  Plus,
  Share2,
  Copy,
  Trash2,
  Eye,
  Edit3,
  Calendar,
  Lock,
  Users,
  Globe,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Loader2,
  BookOpen,
  RotateCcw,
  AlertTriangle,
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
  getStatusIcon,
} from "./PublicationStatusSelector";

interface CollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDeck: DeckConfig;
  myDecks: DeckConfig[];
  sharedDecks: DeckConfig[];
  user: User;
  onSelectDeck: (deck: DeckConfig) => void;
  onOpenShareModal: (deck: DeckConfig) => void;
}

export const CollectionsModal: React.FC<CollectionsModalProps> = ({
  isOpen,
  onClose,
  currentDeck,
  myDecks,
  sharedDecks,
  user,
  onSelectDeck,
  onOpenShareModal,
}) => {
  const [activeTab, setActiveTab] = useState<"my_decks" | "shared_with_me" | "create_new">(
    "my_decks"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all_active");

  // New deck creation form state
  const [newTitle, setNewTitle] = useState("");
  const [newCollection, setNewCollection] = useState("COLEÇÃO TERAPÊUTICA");
  const [newAuthorName, setNewAuthorName] = useState(user.displayName || "Terapeuta");
  const [newAuthorRole, setNewAuthorRole] = useState("TERAPIAS INTEGRATIVAS");
  const [newStatus, setNewStatus] = useState<PublicationStatus>("draft");
  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<"essencia" | "tcc" | "blank">("essencia");
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

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
    if (statusFilter === "all_active") {
      return st !== "trash";
    }
    if (statusFilter === "all") {
      return true;
    }
    return st === statusFilter;
  });

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Por favor, informe o título do baralho.");
      return;
    }

    setIsCreating(true);
    try {
      let baseTemplate: Partial<DeckConfig> | undefined;
      if (selectedTemplate === "essencia") {
        baseTemplate = {
          ...DEFAULT_DECK,
          deckTitle: newTitle.trim(),
          collectionName: newCollection.trim(),
          authorName: newAuthorName.trim(),
          authorRole: newAuthorRole.trim(),
          status: newStatus,
          scheduledAt: newStatus === "scheduled" ? newScheduledAt : undefined,
          publishedAt: newStatus === "published" ? new Date().toISOString() : undefined,
        };
      } else if (selectedTemplate === "tcc") {
        const tcc = SAMPLE_DECKS["deck-tcc"];
        baseTemplate = {
          ...tcc,
          deckTitle: newTitle.trim(),
          collectionName: newCollection.trim(),
          authorName: newAuthorName.trim(),
          authorRole: newAuthorRole.trim(),
          status: newStatus,
          scheduledAt: newStatus === "scheduled" ? newScheduledAt : undefined,
          publishedAt: newStatus === "published" ? new Date().toISOString() : undefined,
        };
      } else {
        baseTemplate = {
          deckTitle: newTitle.trim(),
          collectionName: newCollection.trim(),
          authorName: newAuthorName.trim(),
          authorRole: newAuthorRole.trim(),
          status: newStatus,
          scheduledAt: newStatus === "scheduled" ? newScheduledAt : undefined,
          publishedAt: newStatus === "published" ? new Date().toISOString() : undefined,
          cards: [],
        };
      }

      const created = await createNewDeckInCloud(
        user,
        newTitle.trim(),
        newCollection.trim(),
        baseTemplate
      );

      onSelectDeck(created);
      onClose();
    } catch (err) {
      console.error("Erro ao criar novo baralho:", err);
      alert("Erro ao criar baralho no banco de dados.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateDeckStatus = async (
    deckToUpdate: DeckConfig,
    updatedStatus: PublicationStatus,
    scheduledAt?: string
  ) => {
    setActionLoadingId(deckToUpdate.id);
    try {
      const updatedDeck: DeckConfig = {
        ...deckToUpdate,
        status: updatedStatus,
        scheduledAt: updatedStatus === "scheduled" ? scheduledAt : undefined,
        publishedAt:
          updatedStatus === "published" ? new Date().toISOString() : deckToUpdate.publishedAt,
        trashedAt: updatedStatus === "trash" ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      await saveDeckToCloud(
        updatedDeck,
        user.uid,
        user.email || "",
        user.displayName || undefined
      );
      if (currentDeck.id === deckToUpdate.id) {
        onSelectDeck(updatedDeck);
      }
    } catch (err) {
      console.error("Erro ao atualizar status do baralho:", err);
      alert("Erro ao alterar o status do baralho.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMoveToTrash = async (deckItem: DeckConfig) => {
    await handleUpdateDeckStatus(deckItem, "trash");
  };

  const handleRestoreDeck = async (deckItem: DeckConfig) => {
    await handleUpdateDeckStatus(deckItem, "draft");
  };

  const handleClone = async (deckToClone: DeckConfig) => {
    setActionLoadingId(deckToClone.id);
    try {
      const cloned = await cloneDeckToMyAccount(deckToClone, user);
      onSelectDeck(cloned);
      setActiveTab("my_decks");
      alert(`Cópia criada com sucesso! Agora você está editando "${cloned.deckTitle}".`);
    } catch (err) {
      console.error("Erro ao clonar baralho:", err);
      alert("Não foi possível duplicar o baralho.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (deckId: string, title: string) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir permanentemente o baralho "${title}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }
    setActionLoadingId(deckId);
    try {
      await deleteDeckFromCloud(deckId);
      // If current active deck was deleted, switch to first available or default
      if (currentDeck.id === deckId) {
        const remaining = myDecks.filter((d) => d.id !== deckId);
        if (remaining.length > 0) {
          onSelectDeck(remaining[0]);
        } else {
          onSelectDeck(DEFAULT_DECK);
        }
      }
    } catch (err) {
      console.error("Erro ao excluir baralho:", err);
      alert("Não foi possível excluir o baralho.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-500 to-amber-400 p-0.5 flex items-center justify-center text-white shadow-md">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-100">
                Minhas Coleções & Baralhos
              </h3>
              <p className="text-xs text-neutral-400">
                Gerencie seus baralhos terapêuticos e controle os status de publicação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-neutral-800 bg-neutral-900/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("my_decks")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "my_decks"
                  ? "border-amber-500 text-amber-300 bg-neutral-800/80"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Layers size={15} />
              <span>Meus Baralhos ({myDecks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("shared_with_me")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "shared_with_me"
                  ? "border-amber-500 text-amber-300 bg-neutral-800/80"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Eye size={15} />
              <span>Compartilhados Comigo ({sharedDecks.length})</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab("create_new")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 mb-2 shadow-xs ${
              activeTab === "create_new"
                ? "bg-amber-500 text-neutral-950"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
            }`}
          >
            <Plus size={15} />
            <span>+ Novo Baralho</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: MEUS BARALHOS */}
          {activeTab === "my_decks" && (
            <div className="space-y-4">
              {/* Publication Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  onClick={() => setStatusFilter("all_active")}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer font-medium ${
                    statusFilter === "all_active"
                      ? "bg-neutral-200 text-neutral-900 font-bold shadow-xs"
                      : "bg-neutral-800/80 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Ativos ({myDeckStatusCounts.active || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("published")}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "published"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                      : "bg-neutral-800/60 text-neutral-400 hover:text-emerald-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Publicados ({myDeckStatusCounts["published"] || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "draft"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                      : "bg-neutral-800/60 text-neutral-400 hover:text-amber-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Rascunhos ({myDeckStatusCounts["draft"] || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "pending"
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold"
                      : "bg-neutral-800/60 text-neutral-400 hover:text-orange-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Pendentes ({myDeckStatusCounts["pending"] || 0})
                </button>
                <button
                  onClick={() => setStatusFilter("scheduled")}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === "scheduled"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold"
                      : "bg-neutral-800/60 text-neutral-400 hover:text-blue-300"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Agendados ({myDeckStatusCounts["scheduled"] || 0})
                </button>
                {(myDeckStatusCounts["trash"] || 0) > 0 && (
                  <button
                    onClick={() => setStatusFilter("trash")}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === "trash"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                        : "bg-neutral-800/60 text-neutral-400 hover:text-rose-300"
                    }`}
                  >
                    <Trash2 size={12} className="text-rose-400" />
                    Lixeira ({myDeckStatusCounts["trash"]})
                  </button>
                )}
              </div>

              {filteredMyDecks.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-2xl">
                  <Layers size={36} className="mx-auto text-neutral-600 mb-3" />
                  <h4 className="text-sm font-medium text-neutral-300">
                    {statusFilter === "trash"
                      ? "Nenhum baralho na lixeira"
                      : "Nenhuma coleção encontrada para este status"}
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4">
                    {statusFilter === "trash"
                      ? "Itens descartados aparecerão aqui antes da exclusão definitiva."
                      : "Crie um novo baralho do zero ou modifique o status dos baralhos existentes."}
                  </p>
                  {statusFilter !== "trash" && (
                    <button
                      onClick={() => setActiveTab("create_new")}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold cursor-pointer"
                    >
                      + Criar Novo Baralho
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMyDecks.map((deckItem) => {
                    const isCurrent = currentDeck.id === deckItem.id;
                    const isLoading = actionLoadingId === deckItem.id;
                    const deckStatus = deckItem.status || "draft";
                    const isTrashed = deckStatus === "trash";

                    return (
                      <div
                        key={deckItem.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? "bg-neutral-850 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg shadow-amber-950/20"
                            : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700"
                        } ${isTrashed ? "bg-rose-950/10 border-rose-900/40" : ""}`}
                      >
                        <div>
                          {/* Top Row: Status + Share Badges */}
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Publication Status Selector Dropdown */}
                              <PublicationStatusDropdown
                                status={deckStatus}
                                scheduledAt={deckItem.scheduledAt}
                                onChangeStatus={(newSt, schAt) =>
                                  handleUpdateDeckStatus(deckItem, newSt, schAt)
                                }
                                disabled={isLoading}
                                variant="compact"
                              />

                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                                {deckItem.cards?.length || 0} cartas
                              </span>

                              {(() => {
                                const dCount = (deckItem.cards || []).filter((c) => c.isDemo && c.status !== "trash").length;
                                return dCount > 0 ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                    <Sparkles size={10} /> {dCount} demo
                                  </span>
                                ) : null;
                              })()}

                              {deckItem.shareMode === "all_authorized" ? (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                                  <Globe size={11} /> Público Colegas
                                </span>
                              ) : deckItem.shareMode === "restricted" &&
                                (deckItem.sharedWithEmails?.length || 0) > 0 ? (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                                  <Users size={11} /> {deckItem.sharedWithEmails?.length}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center gap-1">
                                  <Lock size={11} /> Privado
                                </span>
                              )}
                            </div>

                            {isCurrent && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 size={12} /> Ativo no Editor
                              </span>
                            )}
                          </div>

                          {/* Deck Title & Info */}
                          <h4 className="font-serif text-base font-bold text-neutral-100 line-clamp-1">
                            {deckItem.deckTitle}
                          </h4>
                          <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                            {deckItem.collectionName || "Sem categoria"} • {deckItem.authorName}
                          </p>
                          {deckItem.updatedAt && (
                            <p className="text-[11px] text-neutral-500 mt-2 flex items-center gap-1">
                              <Calendar size={12} /> Atualizado em {formatDate(deckItem.updatedAt)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 mt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onSelectDeck(deckItem);
                                onClose();
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isCurrent
                                  ? "bg-amber-500 text-neutral-950 hover:bg-amber-400"
                                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
                              }`}
                            >
                              <Edit3 size={13} />
                              <span>{isCurrent ? "Editando" : "Abrir"}</span>
                            </button>

                            <button
                              onClick={() => onOpenShareModal(deckItem)}
                              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                              title="Compartilhar com colegas"
                            >
                              <Share2 size={14} />
                            </button>

                            <button
                              onClick={() => handleClone(deckItem)}
                              disabled={isLoading}
                              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                              title="Duplicar baralho"
                            >
                              <Copy size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {isTrashed ? (
                              <>
                                <button
                                  onClick={() => handleRestoreDeck(deckItem)}
                                  disabled={isLoading}
                                  className="px-2 py-1 rounded-xl text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Restaurar da lixeira"
                                >
                                  <RotateCcw size={12} />
                                  <span>Restaurar</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(deckItem.id, deckItem.deckTitle)}
                                  disabled={isLoading}
                                  className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer"
                                  title="Excluir definitivamente"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleMoveToTrash(deckItem)}
                                disabled={isLoading}
                                className="p-1.5 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Mover para Lixeira"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPARTILHADOS COMIGO */}
          {activeTab === "shared_with_me" && (
            <div className="space-y-4">
              {sharedDecks.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-neutral-800 rounded-2xl">
                  <Eye size={36} className="mx-auto text-neutral-600 mb-3" />
                  <h4 className="text-sm font-medium text-neutral-300">
                    Nenhum baralho compartilhado com você no momento
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                    Quando outro terapeuta autorizar seu e-mail para visualizar uma coleção, ela aparecerá automaticamente aqui.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sharedDecks.map((deckItem) => {
                    const isCurrent = currentDeck.id === deckItem.id;
                    const isLoading = actionLoadingId === deckItem.id;

                    return (
                      <div
                        key={deckItem.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? "bg-neutral-850 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg shadow-amber-950/20"
                            : "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        <div>
                          {/* Badges */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                                <Eye size={11} /> Visualização
                              </span>
                              <PublicationStatusBadge
                                status={deckItem.status || "published"}
                                scheduledAt={deckItem.scheduledAt}
                                size="sm"
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400">
                              {deckItem.cards?.length || 0} cartas
                            </span>
                          </div>

                          <h4 className="font-serif text-base font-bold text-neutral-100 line-clamp-1">
                            {deckItem.deckTitle}
                          </h4>
                          <p className="text-xs text-amber-400/90 line-clamp-1 mt-0.5">
                            Compartilhado por: {deckItem.sharedBy || deckItem.ownerName || deckItem.authorName}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                            {deckItem.collectionName} • {deckItem.deckSubtitle}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 mt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              onSelectDeck({
                                ...deckItem,
                                isReadOnly: true,
                              });
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer"
                          >
                            <Eye size={13} className="text-amber-400" />
                            <span>Visualizar</span>
                          </button>

                          <button
                            onClick={() => handleClone(deckItem)}
                            disabled={isLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title="Criar uma cópia para editar no seu perfil"
                          >
                            {isLoading ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Copy size={13} />
                            )}
                            <span>Fazer Cópia Editável</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CRIAR NOVO BARALHO */}
          {activeTab === "create_new" && (
            <form onSubmit={handleCreateDeck} className="space-y-5 max-w-xl mx-auto py-2">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Título da Nova Coleção *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Baralho de Cura Interior & Presença"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                      Nome da Coleção / Categoria
                    </label>
                    <input
                      type="text"
                      value={newCollection}
                      onChange={(e) => setNewCollection(e.target.value)}
                      placeholder="Ex: COLEÇÃO ESSÊNCIA"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                      Nome do Autor(a) / Terapeuta
                    </label>
                    <input
                      type="text"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      placeholder="Ex: Luciana Castro"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Initial Status Selector */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Status de Publicação Inicial
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["draft", "auto_draft", "published", "pending"] as PublicationStatus[]).map(
                      (st) => {
                        const info = PUBLICATION_STATUS_MAP[st];
                        const isSelected = newStatus === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setNewStatus(st)}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                              isSelected
                                ? `${info.badgeBg} ${info.borderColor} ring-1 ring-amber-500/40`
                                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(st, 13)}
                              <span
                                className={`text-xs font-semibold ${
                                  isSelected ? info.badgeText : "text-neutral-300"
                                }`}
                              >
                                {info.shortLabel}
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Template Selection */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-neutral-300 block mb-2">
                    Escolha um Ponto de Partida
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate("essencia")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTemplate === "essencia"
                          ? "bg-neutral-800 border-amber-500 text-neutral-100 ring-1 ring-amber-500/50"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="font-semibold text-xs text-amber-300 mb-1">
                        🌸 Coleção Essência
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-400">
                        12 cartas prontas com afirmações, reflexões e perguntas de alma.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTemplate("tcc")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTemplate === "tcc"
                          ? "bg-neutral-800 border-amber-500 text-neutral-100 ring-1 ring-amber-500/50"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="font-semibold text-xs text-emerald-300 mb-1">
                        🌿 TCC & Mindfulness
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-400">
                        10 cartas focadas em regulação emocional e autocompaixão.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTemplate("blank")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTemplate === "blank"
                          ? "bg-neutral-800 border-amber-500 text-neutral-100 ring-1 ring-amber-500/50"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="font-semibold text-xs text-neutral-200 mb-1">
                        ✨ Em Branco
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-400">
                        Comece do zero inserindo seus próprios textos e cartas.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("my_decks")}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Criando Baralho...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Criar e Abrir Baralho</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Sincronização em Nuvem Ativa ({user.email})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
