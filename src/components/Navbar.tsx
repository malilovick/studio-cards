import React from "react";
import { User } from "firebase/auth";
import {
  Menu,
  Sparkles,
  Printer,
  BookOpen,
  Layers,
  ShieldCheck,
  LogOut,
  Cloud,
  Share2,
  Eye,
  Copy,
  FolderKanban,
  CheckCircle2,
  Home,
  Users,
  Palette,
  ChevronRight,
} from "lucide-react";
import { DeckConfig, UserRole, PublicationStatus } from "../types";
import { logOut } from "../firebase";
import {
  PublicationStatusBadge,
  PublicationStatusDropdown,
} from "./PublicationStatusSelector";
import { AdminTab } from "./AdminSidebar";

interface NavbarProps {
  currentTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  deck: DeckConfig;
  onUpdateDeck: (updated: Partial<DeckConfig>) => void;
  onLoadDeckPreset: (deck: DeckConfig) => void;
  onOpenAiModal: () => void;
  onOpenExportModal: () => void;
  onOpenPrintGuide: () => void;
  onOpenBatchImport: () => void;
  viewMode: "focus" | "grid" | "sheet" | "stack";
  onChangeViewMode: (mode: "focus" | "grid" | "sheet" | "stack") => void;
  user: User | null;
  isAdmin: boolean;
  userRole?: UserRole;
  pendingRequestsCount?: number;
  onOpenUserManagement: () => void;
  isSavingToCloud?: boolean;
  onSaveToCloud?: () => void;
  onOpenCollectionsModal: () => void;
  onOpenShareModal: () => void;
  onCloneActiveDeck: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onChangeTab,
  onToggleSidebar,
  onOpenMobileSidebar,
  isSidebarCollapsed,
  deck,
  onUpdateDeck,
  onLoadDeckPreset,
  onOpenAiModal,
  onOpenExportModal,
  onOpenPrintGuide,
  onOpenBatchImport,
  viewMode,
  onChangeViewMode,
  user,
  isAdmin,
  userRole = "editor",
  pendingRequestsCount = 0,
  onOpenUserManagement,
  isSavingToCloud = false,
  onSaveToCloud,
  onOpenCollectionsModal,
  onOpenShareModal,
  onCloneActiveDeck,
}) => {
  const isReadOnly = Boolean(deck.isReadOnly);

  const getBreadcrumb = () => {
    switch (currentTab) {
      case "home":
        return { label: "Home", sub: "Dashboard Geral", icon: Home };
      case "collections":
        return { label: "Coleções", sub: "Meus Baralhos", icon: FolderKanban };
      case "access":
        return { label: "Acesso", sub: "Usuários & Permissões", icon: Users };
      case "docs":
        return { label: "Docs", sub: "Guia da Gráfica & Ajuda", icon: BookOpen };
      case "studio":
      default:
        return { label: "Estúdio", sub: deck.deckTitle || "Baralho", icon: Palette };
    }
  };

  const currentCrumb = getBreadcrumb();
  const CrumbIcon = currentCrumb.icon;

  return (
    <header className="bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 z-40 sticky top-0 select-none">
      {/* Left: Hamburger Button & Navigation Context */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Drawer Trigger (md:hidden) */}
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 md:hidden transition-colors cursor-pointer shrink-0"
          title="Abrir Menu Lateral"
        >
          <Menu size={18} />
        </button>

        {/* Desktop Hamburger / Rail Collapse Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 hidden md:flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title={isSidebarCollapsed ? "Expandir Menu (Gmail style)" : "Recolher Menu"}
        >
          <Menu size={18} />
        </button>

        {/* View Breadcrumb / Title */}
        {currentTab !== "studio" ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <CrumbIcon size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="font-semibold text-neutral-200">{currentCrumb.label}</span>
                <ChevronRight size={12} className="text-neutral-500" />
                <span className="truncate">{currentCrumb.sub}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Studio Deck Title & Status Header */
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onOpenCollectionsModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700/80 transition-all cursor-pointer shrink-0 shadow-xs"
              title="Trocar Baralho / Coleções"
            >
              <FolderKanban size={14} className="text-amber-400" />
              <span className="text-xs font-semibold hidden lg:inline">Coleções</span>
            </button>

            <div className="h-5 w-px bg-neutral-800 hidden sm:block shrink-0" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={deck.deckTitle}
                  onChange={(e) => onUpdateDeck({ deckTitle: e.target.value })}
                  className={`bg-transparent text-neutral-100 font-bold text-xs sm:text-sm px-1.5 py-0.5 rounded outline-none border border-transparent max-w-[160px] sm:max-w-xs md:max-w-sm truncate ${
                    isReadOnly
                      ? "cursor-default text-amber-200/90 font-serif"
                      : "focus:bg-neutral-800/60 focus:border-neutral-700"
                  }`}
                  title={isReadOnly ? "Baralho em modo de visualização" : "Clique para renomear seu baralho"}
                />

                {/* Deck Publication Status Selector */}
                {!isReadOnly ? (
                  <PublicationStatusDropdown
                    status={deck.status || "draft"}
                    scheduledAt={deck.scheduledAt}
                    onChangeStatus={(newStatus, scheduledAt) =>
                      onUpdateDeck({
                        status: newStatus,
                        scheduledAt,
                        publishedAt: newStatus === "published" ? new Date().toISOString() : deck.publishedAt,
                        trashedAt: newStatus === "trash" ? new Date().toISOString() : undefined,
                      })
                    }
                    variant="compact"
                  />
                ) : (
                  <PublicationStatusBadge
                    status={deck.status || "draft"}
                    scheduledAt={deck.scheduledAt}
                    size="sm"
                  />
                )}

                <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300/90 font-semibold border border-neutral-700/60 shrink-0 hidden sm:inline">
                  {deck.cards.length} cartas
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Quick Action Buttons & Cloud Sync */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Navigation Quick Switches */}
        {currentTab !== "home" && (
          <button
            onClick={() => onChangeTab("home")}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer"
            title="Ir para o Dashboard Home"
          >
            <Home size={15} className="text-amber-400" />
            <span className="hidden md:inline font-semibold">Dashboard</span>
          </button>
        )}

        {/* If in other view, show Open Studio button */}
        {currentTab !== "studio" ? (
          <button
            onClick={() => onChangeTab("studio")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Palette size={15} />
            <span>Abrir Estúdio</span>
          </button>
        ) : (
          /* Studio specific buttons */
          <>
            {/* Cloud Save Button */}
            {!isReadOnly && onSaveToCloud && (
              <button
                onClick={onSaveToCloud}
                disabled={isSavingToCloud}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer"
                title="Salvar baralho na nuvem Firestore"
              >
                <Cloud size={15} className={isSavingToCloud ? "animate-pulse text-amber-400" : "text-neutral-400"} />
                <span className="hidden md:inline">{isSavingToCloud ? "Salvando..." : "Salvar"}</span>
              </button>
            )}

            {/* Share Button */}
            {!isReadOnly && (
              <button
                onClick={onOpenShareModal}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer"
                title="Compartilhar baralho com colegas"
              >
                <Share2 size={15} className="text-amber-400" />
                <span className="hidden sm:inline font-medium">Compartilhar</span>
              </button>
            )}

            {/* AI Generator Button */}
            <button
              onClick={onOpenAiModal}
              disabled={isReadOnly}
              className={`flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-semibold text-xs px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ${
                isReadOnly ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={isReadOnly ? "Faça uma cópia do baralho para gerar novas cartas" : "Gerar cartas com IA Gemini"}
            >
              <Sparkles size={15} />
              <span className="hidden sm:inline">Criar com IA</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
