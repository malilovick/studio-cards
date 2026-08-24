import React from "react";
import { User } from "firebase/auth";
import {
  Layers,
  FolderKanban,
  Users,
  Sparkles,
  Printer,
  Cloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  BookOpen,
  FileSpreadsheet,
  Share2,
  Crown,
  Eye,
  Copy,
  Scissors,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { DeckConfig, UserRole, PUBLICATION_STATUS_MAP } from "../types";
import { AdminTab } from "./AdminSidebar";

interface DashboardViewProps {
  user: User | null;
  userRole?: UserRole;
  isAdmin: boolean;
  myDecks: DeckConfig[];
  sharedDecks: DeckConfig[];
  activeDeck: DeckConfig;
  onSelectDeck: (deck: DeckConfig) => void;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenAiModal: () => void;
  onOpenExportModal: () => void;
  onOpenBatchImport: () => void;
  onOpenPrintGuide: () => void;
  onOpenShareModal: (deck: DeckConfig) => void;
  onCloneDeck: (deck: DeckConfig) => void;
  pendingRequestsCount?: number;
  lastCloudSave?: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  userRole = "editor",
  isAdmin,
  myDecks,
  sharedDecks,
  activeDeck,
  onSelectDeck,
  onNavigateTab,
  onOpenAiModal,
  onOpenExportModal,
  onOpenBatchImport,
  onOpenPrintGuide,
  onOpenShareModal,
  onCloneDeck,
  pendingRequestsCount = 0,
  lastCloudSave,
}) => {
  // Aggregate stats
  const allDecks = [...myDecks, ...sharedDecks];
  const totalDecks = allDecks.length;
  
  // Total cards count
  const totalCards = allDecks.reduce((sum, d) => sum + (d.cards?.length || 0), 0);
  
  // Total demo cards count across all decks
  const totalDemoCards = allDecks.reduce((sum, d) => {
    const demoInDeck = (d.cards || []).filter((c) => c.isDemo && c.status !== "trash").length;
    return sum + demoInDeck;
  }, 0);

  // Status breakdown
  const publishedDecksCount = allDecks.filter((d) => (d.status || "published") === "published").length;
  const draftDecksCount = allDecks.filter((d) => (d.status || "draft") === "draft").length;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bom dia" : currentHour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 sm:p-6 lg:p-8 select-none scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-amber-950/30 p-5 sm:p-6 rounded-2xl border border-neutral-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Painel Administrativo
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-xs text-neutral-400">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
              {greeting}, {user?.displayName || (user?.email ? user.email.split("@")[0] : "Terapeuta")} 👋
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Crie, gerencie, publique e exporte baralhos terapêuticos com padronização gráfica profissional para impressão e degustação online.
            </p>
          </div>

          {/* Quick Primary Actions in Header */}
          <div className="flex items-center gap-2.5 relative z-10 shrink-0">
            <button
              onClick={() => onNavigateTab("studio")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Abrir Estúdio</span>
            </button>
            <button
              onClick={() => onNavigateTab("collections")}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FolderKanban size={16} />
              <span>Ver Coleções</span>
            </button>
          </div>
        </div>

        {/* Pending Requests Alert for Admins */}
        {isAdmin && pendingRequestsCount > 0 && (
          <div className="bg-gradient-to-r from-orange-950/60 via-amber-950/40 to-neutral-900 p-4 rounded-2xl border border-orange-500/40 shadow-lg flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-100">
                  {pendingRequestsCount} {pendingRequestsCount === 1 ? "solicitação de acesso pendente" : "solicitações de acesso pendentes"}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Novos colegas de equipe solicitaram acesso para visualizar ou editar os baralhos.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("access")}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <span>Revisar Acessos</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* KPI Metrics Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Decks */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400">Coleções & Baralhos</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <FolderKanban size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
                {totalDecks}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                <span>{myDecks.length} meus</span>
                <span>•</span>
                <span>{sharedDecks.length} compartilhados</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Cards */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400">Total de Cartas</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
                {totalCards}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                <span className="text-amber-300 font-medium">
                  {activeDeck.cards?.length || 0} no baralho ativo
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Demo / Degustação */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400">Cartas na Degustação Demo</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight flex items-center gap-2">
                {totalDemoCards}
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Grátis
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 truncate">
                Liberadas para teste prévio dos clientes
              </p>
            </div>
          </div>

          {/* Card 4: Sincronização & Nuvem */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400">Nuvem & Sincronização</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Cloud size={16} />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-emerald-300 tracking-tight flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Firestore Ativo</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 truncate">
                {lastCloudSave ? `Último salvamento às ${lastCloudSave}` : "Sincronização em tempo real"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              <span>Ações Rápidas & Ferramentas</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Action 1: Novo Baralho */}
            <button
              onClick={() => onNavigateTab("collections")}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between h-32"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block group-hover:text-amber-300 transition-colors">
                  Novo Baralho
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Criar do zero ou template
                </span>
              </div>
            </button>

            {/* Action 2: Gerador IA */}
            <button
              onClick={onOpenAiModal}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between h-32"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block group-hover:text-rose-300 transition-colors">
                  Gerador IA
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Criar 10-50 cartas com Gemini
                </span>
              </div>
            </button>

            {/* Action 3: Importar CSV/JSON */}
            <button
              onClick={onOpenBatchImport}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between h-32"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block group-hover:text-emerald-300 transition-colors">
                  Importar Lote
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Carregar CSV ou JSON
                </span>
              </div>
            </button>

            {/* Action 4: Exportar PDF / Gráfica */}
            <button
              onClick={onOpenExportModal}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between h-32"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Printer size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block group-hover:text-sky-300 transition-colors">
                  Exportar PDF
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Montagem A4 300 DPI
                </span>
              </div>
            </button>

            {/* Action 5: Guia Gráfica */}
            <button
              onClick={() => onNavigateTab("docs")}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between h-32"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block group-hover:text-purple-300 transition-colors">
                  Guia Gráfica
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Sangria, papéis e corte
                </span>
              </div>
            </button>

            {/* Action 6: Gestão de Acessos */}
            <button
              onClick={() => onNavigateTab("access")}
              className="p-4 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer flex flex-col justify-between h-32"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block group-hover:text-teal-300 transition-colors">
                  Acessos & Time
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Whitelist e permissões
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Active Deck & Recent Collections Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                <FolderKanban size={14} className="text-amber-400" />
                <span>Baralhos & Coleções Ativas</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Selecione uma coleção para editar no estúdio ou compartilhar com colegas
              </p>
            </div>

            <button
              onClick={() => onNavigateTab("collections")}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas ({allDecks.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDecks.slice(0, 6).map((d) => {
              const isActive = d.id === activeDeck.id;
              const statusInfo = PUBLICATION_STATUS_MAP[d.status || "draft"];
              const demoCount = (d.cards || []).filter((c) => c.isDemo && c.status !== "trash").length;
              const isReadOnly = Boolean(d.isReadOnly);

              return (
                <div
                  key={d.id}
                  className={`bg-neutral-900/90 rounded-2xl border transition-all p-5 flex flex-col justify-between relative group ${
                    isActive
                      ? "border-amber-500/50 shadow-xl ring-1 ring-amber-500/20"
                      : "border-neutral-800/90 hover:border-neutral-700"
                  }`}
                >
                  {/* Top Row: Category & Status */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 truncate max-w-[140px]">
                        {d.collectionName || "Coleção"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {demoCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                            <Sparkles size={10} /> {demoCount} demo
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.badgeBg} ${statusInfo.badgeText} ${statusInfo.borderColor}`}
                        >
                          {statusInfo.shortLabel}
                        </span>
                      </div>
                    </div>

                    {/* Deck Title */}
                    <div>
                      <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors truncate">
                        {d.deckTitle || "Baralho Sem Título"}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {d.deckSubtitle || "Sem subtítulo"}
                      </p>
                    </div>

                    {/* Meta info */}
                    <div className="pt-2 flex items-center gap-3 text-[11px] text-neutral-400 border-t border-neutral-800/60">
                      <span className="font-semibold text-neutral-300">
                        {d.cards?.length || 0} cartas
                      </span>
                      <span>•</span>
                      <span className="truncate">
                        Por {d.authorName || "Terapeuta"}
                      </span>
                      {isReadOnly && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400/90">Somente leitura</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        onSelectDeck(d);
                        onNavigateTab("studio");
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md"
                          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                      }`}
                    >
                      <Sparkles size={13} />
                      <span>{isActive ? "Continuar Editando" : "Abrir no Estúdio"}</span>
                    </button>

                    <button
                      onClick={() => onOpenShareModal(d)}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Compartilhar Coleção"
                    >
                      <Share2 size={14} />
                    </button>

                    <button
                      onClick={() => onCloneDeck(d)}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Duplicar / Fazer Cópia"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphic Prep & Print Quick Summary */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <Scissors size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">
                  Padrões Gráficos Profissionais para Impressão
                </h3>
                <p className="text-xs text-neutral-400">
                  Todas as cartas geradas respeitam rigorosamente a área de sangria e margem de segurança gráfica.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("docs")}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer hidden sm:flex items-center gap-1"
            >
              <span>Abrir Manual Completo</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <span className="text-xs font-bold text-amber-400 block">Sangria de 3mm (Bleed)</span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Fundo estendido para garantir que o corte da guilhotina não deixe bordas brancas indesejadas.
              </p>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <span className="text-xs font-bold text-emerald-400 block">Margem Segura de 4mm</span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Todo texto, reflexão e ornatos posicionados a salvo do corte e do manuseio dos pacientes.
              </p>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
              <span className="text-xs font-bold text-sky-400 block">Resolução Ultra HD 300 DPI</span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Exportação vetorial e bitmaps ultra nítidos prontos para papéis Couché 300g e Cartão Triplex 350g.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
