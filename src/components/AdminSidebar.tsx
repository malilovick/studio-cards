import React from "react";
import { User } from "firebase/auth";
import {
  Home,
  FolderKanban,
  Users,
  BookOpen,
  Palette,
  Sparkles,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Crown,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileText,
  HelpCircle,
  Clock,
  Printer,
  Sparkle,
  Image as ImageIcon,
} from "lucide-react";
import { UserRole } from "../types";
import { logOut } from "../firebase";

export type AdminTab = "home" | "collections" | "studio" | "card-backs" | "access" | "docs";

interface AdminSidebarProps {
  currentTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user: User | null;
  isAdmin: boolean;
  userRole?: UserRole;
  pendingRequestsCount?: number;
  totalDecksCount?: number;
  activeDeckCardsCount?: number;
  activeDeckTitle?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAiModal?: () => void;
  onOpenExportModal?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onChangeTab,
  isCollapsed,
  onToggleCollapse,
  user,
  isAdmin,
  userRole = "editor",
  pendingRequestsCount = 0,
  totalDecksCount = 0,
  activeDeckCardsCount = 0,
  activeDeckTitle = "Baralho Ativo",
  isMobileOpen = false,
  onCloseMobile,
  onOpenAiModal,
  onOpenExportModal,
}) => {
  const navItems = [
    {
      id: "home" as AdminTab,
      label: "Home",
      sublabel: "Dashboard & Visão Geral",
      icon: Home,
      badge: null,
      color: "text-amber-400",
    },
    {
      id: "collections" as AdminTab,
      label: "Coleções",
      sublabel: "Gerenciar Baralhos",
      icon: FolderKanban,
      badge: totalDecksCount > 0 ? `${totalDecksCount}` : null,
      badgeColor: "bg-neutral-800 text-amber-300 border border-neutral-700",
      color: "text-rose-400",
    },
    {
      id: "studio" as AdminTab,
      label: "Estúdio de Criação",
      sublabel: activeDeckTitle,
      icon: Palette,
      badge: activeDeckCardsCount > 0 ? `${activeDeckCardsCount} cartas` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
      color: "text-amber-300",
    },
    {
      id: "card-backs" as AdminTab,
      label: "Versos das Cartas",
      sublabel: "Criador & Galeria de Versos",
      icon: Sparkles,
      badge: "Novo",
      badgeColor: "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30",
      color: "text-amber-400",
    },
    {
      id: "access" as AdminTab,
      label: "Acesso",
      sublabel: "Usuários & Permissões",
      icon: Users,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
      badgeColor: "bg-orange-500 text-neutral-950 font-bold animate-pulse",
      color: "text-emerald-400",
      requireAdmin: false,
    },
    {
      id: "docs" as AdminTab,
      label: "Docs",
      sublabel: "Guia da Gráfica & Ajuda",
      icon: BookOpen,
      badge: null,
      color: "text-sky-400",
    },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "superadmin":
        return { label: "Super Admin", bg: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      case "admin":
        return { label: "Admin", bg: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "editor":
        return { label: "Editor", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "viewer":
        return { label: "Visualizador", bg: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "demo":
        return { label: "Degustação", bg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" };
      default:
        return { label: "Usuário", bg: "bg-neutral-800 text-neutral-400 border-neutral-700" };
    }
  };

  const roleInfo = getRoleBadge(userRole);

  const sidebarContent = (
    <aside
      className={`h-full bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between transition-all duration-300 select-none ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Top Header / Hamburger Toggle */}
      <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0 pl-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-500 to-amber-400 p-0.5 flex items-center justify-center text-white shadow-md shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-neutral-100 tracking-tight truncate leading-tight flex items-center gap-1.5">
                <span>TerapiaCards</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] text-neutral-400 truncate">Painel de Administração</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-500 to-amber-400 p-0.5 flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Expandir Menu"
            >
              <Sparkles size={18} />
            </div>
          </div>
        )}

        {/* Hamburger / Collapse Button */}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all cursor-pointer shrink-0"
            title="Recolher Menu (Gmail style)"
            aria-label="Recolher Menu"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 px-2 py-3 space-y-1.5 overflow-y-auto scrollbar-thin">
        {/* Quick Action Button in Expanded Mode */}
        {!isCollapsed ? (
          <div className="mb-3 px-1">
            <button
              onClick={() => onChangeTab("studio")}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs py-2.5 px-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-amber-500/20 active:scale-[0.98]"
            >
              <Palette size={16} />
              <span>Abrir Estúdio de Cartas</span>
            </button>
          </div>
        ) : (
          <div className="mb-3 flex justify-center">
            <button
              onClick={() => onChangeTab("studio")}
              className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 rounded-xl shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              title="Abrir Estúdio de Cartas"
            >
              <Palette size={18} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center rounded-xl transition-all cursor-pointer group relative ${
                  isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 justify-between"
                } ${
                  isActive
                    ? "bg-neutral-800/90 text-amber-300 font-semibold border border-neutral-700/80 shadow-xs"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80 border border-transparent"
                }`}
                title={isCollapsed ? `${item.label} - ${item.sublabel}` : undefined}
              >
                {/* Active Left Pill Accent */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full" />
                )}

                <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} min-w-0`}>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-neutral-900 text-neutral-400 group-hover:text-neutral-200 group-hover:bg-neutral-800"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {!isCollapsed && (
                    <div className="text-left min-w-0">
                      <span className="text-xs font-semibold block leading-tight truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 block leading-tight truncate font-normal">
                        {item.sublabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Badge if available */}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1 ${
                      item.badgeColor || "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Notification Dot in Collapsed Mode */}
                {isCollapsed && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-neutral-950 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Quick Links in Expanded Mode */}
        {!isCollapsed && (
          <div className="pt-4 mt-4 border-t border-neutral-800/60 space-y-1">
            <div className="px-3 pb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Ferramentas Rápidas
              </span>
            </div>

            {onOpenAiModal && (
              <button
                onClick={onOpenAiModal}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Gerador IA de Cartas</span>
              </button>
            )}

            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <Printer size={14} className="text-emerald-400" />
                <span>Exportar PDF / Gráfica</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Profile & Footer Section */}
      <div className="p-2.5 border-t border-neutral-800/80 bg-neutral-950/80">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800/80 min-w-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Usuário"}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-amber-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-neutral-200 truncate leading-tight">
                    {user?.displayName || (user?.email ? user.email.split("@")[0] : "Terapeuta")}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${roleInfo.bg}`}
                  >
                    {roleInfo.label}
                  </span>
                </div>
              </div>

              <button
                onClick={() => logOut()}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                title="Sair da Conta"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Usuário"}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40 cursor-pointer"
                title={`${user.displayName || user.email} (${roleInfo.label})`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center cursor-pointer"
                title={`${user?.displayName || user?.email} (${roleInfo.label})`}
              >
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>
            )}

            <button
              onClick={() => logOut()}
              className="p-2 rounded-lg text-neutral-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0 z-30">{sidebarContent}</div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
