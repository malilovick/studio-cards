import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  UserCheck,
  Crown,
  AlertCircle,
  X,
  Sparkles,
  Inbox,
  Shield,
  Info,
} from "lucide-react";
import {
  subscribeAuthorizedUsers,
  subscribeAccessRequests,
  addOrUpdateAuthorizedUser,
  setAuthorizedUserStatus,
  setAuthorizedUserRole,
  removeAuthorizedUser,
  approveAccessRequest,
  rejectAccessRequest,
  isMasterOwner,
  normalizeEmail,
} from "../firebase";
import { AuthorizedUser, AccessRequest, UserRole, UserStatus } from "../types";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("editor");
  const [newNotes, setNewNotes] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubUsers = subscribeAuthorizedUsers((loadedUsers) => {
      setUsers(loadedUsers);
      setLoading(false);
    });

    const unsubRequests = subscribeAccessRequests((loadedRequests) => {
      setRequests(loadedRequests);
    });

    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.notes && u.notes.toLowerCase().includes(q))
    );
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanEmail = normalizeEmail(newEmail);
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setFormError("Insira um endereço de e-mail do Google válido.");
      return;
    }

    try {
      setIsAddingUser(true);
      await addOrUpdateAuthorizedUser({
        email: cleanEmail,
        name: newName.trim(),
        role: newRole,
        notes: newNotes.trim(),
        adminEmail: currentUserEmail,
      });

      setFormSuccess(`Usuário ${cleanEmail} autorizado com sucesso!`);
      setNewEmail("");
      setNewName("");
      setNewNotes("");
      setTimeout(() => setFormSuccess(null), 3500);
    } catch (err: any) {
      console.error("Erro ao adicionar usuário:", err);
      setFormError(err.message || "Erro ao autorizar usuário.");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleToggleStatus = async (user: AuthorizedUser) => {
    const newStatus: UserStatus = user.status === "active" ? "suspended" : "active";
    try {
      await setAuthorizedUserStatus(user.email, newStatus);
    } catch (err: any) {
      alert(err.message || "Erro ao alterar status.");
    }
  };

  const handleChangeRole = async (user: AuthorizedUser, role: UserRole) => {
    try {
      await setAuthorizedUserRole(user.email, role);
    } catch (err: any) {
      alert(err.message || "Erro ao alterar função.");
    }
  };

  const handleRemoveUser = async (user: AuthorizedUser) => {
    if (isMasterOwner(user.email)) {
      alert("Não é possível remover a conta do proprietário principal.");
      return;
    }
    if (
      window.confirm(
        `Tem certeza que deseja revogar o acesso da conta ${user.email}?`
      )
    ) {
      try {
        await removeAuthorizedUser(user.email);
      } catch (err: any) {
        alert(err.message || "Erro ao revogar acesso.");
      }
    }
  };

  const handleApprove = async (req: AccessRequest, role: UserRole) => {
    try {
      await approveAccessRequest(req, role, currentUserEmail);
    } catch (err) {
      console.error("Erro ao aprovar solicitação:", err);
      alert("Erro ao aprovar solicitação.");
    }
  };

  const handleReject = async (req: AccessRequest) => {
    if (window.confirm(`Recusar solicitação de ${req.email}?`)) {
      try {
        await rejectAccessRequest(req.id);
      } catch (err) {
        console.error("Erro ao recusar solicitação:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                Controle de Acessos & Permissões
              </h2>
              <p className="text-xs text-neutral-400">
                Gerencie quais contas do Google têm permissão para acessar e criar baralhos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-neutral-800 flex items-center gap-4 bg-neutral-950/40 shrink-0">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "border-amber-500 text-amber-400 font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Users size={16} />
            <span>Usuários Autorizados ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-2 relative ${
              activeTab === "requests"
                ? "border-amber-500 text-amber-400 font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Inbox size={16} />
            <span>Solicitações de Acesso</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "users" ? (
            <>
              {/* Add New Authorized User Section */}
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-3">
                  <UserPlus size={16} className="text-amber-400" />
                  <span>Autorizar Nova Conta do Google</span>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle size={15} />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                      E-mail Google *
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-3 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="usuario@gmail.com"
                        className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl py-2 pl-9 pr-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                      Nome / Identificação
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Dra. Ana Paula"
                      className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-neutral-400 font-medium mb-1">
                      Função de Acesso
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-neutral-100 outline-none cursor-pointer"
                    >
                      <option value="editor">✨ Editor (Cria & Exporta Cartas)</option>
                      <option value="admin">👑 Administrador (Acesso Total)</option>
                      <option value="viewer">👁️ Visualizador (Apenas Leitura)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      disabled={isAddingUser}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                    >
                      <UserPlus size={14} />
                      <span>{isAddingUser ? "Salvando..." : "Autorizar"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Users List & Search */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="text-xs text-neutral-400">
                    Contas liberadas com permissão de login no sistema
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por e-mail ou nome..."
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl py-1.5 pl-9 pr-3 text-xs text-neutral-200 outline-none"
                    />
                  </div>
                </div>

                {/* Table of Users */}
                <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl overflow-hidden">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-xs">
                      {searchQuery
                        ? "Nenhum usuário corresponde à busca."
                        : "Nenhum usuário cadastrado além do administrador principal."}
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-800/60">
                      {filteredUsers.map((user) => {
                        const isOwner = isMasterOwner(user.email);
                        const isCurrent = normalizeEmail(user.email) === normalizeEmail(currentUserEmail);

                        return (
                          <div
                            key={user.email}
                            className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-900/40 transition-all"
                          >
                            {/* User Avatar & Info */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.name || user.email}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full border border-neutral-700 object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600/30 to-rose-600/30 border border-neutral-700 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0">
                                  {(user.name || user.email).charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-neutral-200 truncate">
                                    {user.name || user.email.split("@")[0]}
                                  </span>
                                  {isOwner && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                                      <Crown size={10} />
                                      <span>PROPRIETÁRIO</span>
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-[10px] text-emerald-400 font-medium">
                                      (Você)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
                                  <Mail size={11} className="text-neutral-400" />
                                  <span>{user.email}</span>
                                </div>
                                {user.notes && (
                                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                                    Nota: {user.notes}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions & Role */}
                            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                              {/* Role Selector */}
                              {isOwner ? (
                                <span className="px-3 py-1 bg-amber-950/40 text-amber-300 text-xs font-semibold rounded-lg border border-amber-800/40">
                                  Super Admin
                                </span>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                                  className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-neutral-600"
                                >
                                  <option value="editor">Editor</option>
                                  <option value="admin">Administrador</option>
                                  <option value="viewer">Visualizador</option>
                                </select>
                              )}

                              {/* Status Toggle */}
                              {!isOwner && (
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                    user.status === "active"
                                      ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40"
                                      : "bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40"
                                  }`}
                                  title={user.status === "active" ? "Clique para suspender" : "Clique para reativar"}
                                >
                                  {user.status === "active" ? "Ativo" : "Suspenso"}
                                </button>
                              )}

                              {/* Remove Button */}
                              {!isOwner && (
                                <button
                                  onClick={() => handleRemoveUser(user)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                                  title="Revogar Acesso"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Access Requests */
            <div>
              <div className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                <Info size={14} className="text-amber-400" />
                <span>
                  Profissionais que fizeram login com Google e estão aguardando sua autorização
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="bg-neutral-950/40 border border-neutral-800/80 rounded-2xl p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-200">
                    Nenhuma solicitação pendente
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                    Todas as solicitações de acesso foram analisadas. Novos pedidos de profissionais aparecerão aqui em tempo real.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        {req.photoURL ? (
                          <img
                            src={req.photoURL}
                            alt={req.name || req.email}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full border border-neutral-700 object-cover shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 font-bold shrink-0 mt-0.5">
                            {(req.name || req.email).charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-200">
                              {req.name || req.email.split("@")[0]}
                            </span>
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Clock size={11} />
                              <span>{new Date(req.createdAt).toLocaleDateString("pt-BR")}</span>
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Mail size={12} />
                            <span>{req.email}</span>
                          </div>
                          {req.message && (
                            <div className="mt-2 text-xs bg-neutral-900 border border-neutral-800/80 p-2.5 rounded-xl text-neutral-300 italic">
                              "{req.message}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleApprove(req, "editor")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck size={14} />
                          <span>Aprovar (Editor)</span>
                        </button>
                        <button
                          onClick={() => handleApprove(req, "admin")}
                          className="bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Crown size={14} />
                          <span>Aprovar (Admin)</span>
                        </button>
                        <button
                          onClick={() => handleReject(req)}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                          title="Recusar Solicitação"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-amber-400" />
            <span>Somente administradores autorizados podem gerenciar permissões</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-medium transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
