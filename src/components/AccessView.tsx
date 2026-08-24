import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  UserCheck,
  Crown,
  AlertCircle,
  Sparkles,
  Trash2,
  Share2,
  Check,
  Copy,
  Info,
  Shield,
  Loader2,
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

interface AccessViewProps {
  currentUser: User | null;
  isAdmin: boolean;
  userRole?: UserRole;
}

export const AccessView: React.FC<AccessViewProps> = ({
  currentUser,
  isAdmin,
  userRole = "editor",
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "requests" | "invite" | "roles">("users");
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // New user invite state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("editor");
  const [newNotes, setNewNotes] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const currentUserEmail = currentUser?.email || "";

  useEffect(() => {
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
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const normEmail = normalizeEmail(newEmail);
    if (!normEmail || !normEmail.includes("@")) {
      setFormError("Informe um endereço de e-mail válido.");
      return;
    }

    setIsAddingUser(true);
    try {
      await addOrUpdateAuthorizedUser({
        email: normEmail,
        role: newRole,
        name: newName.trim() || undefined,
        adminEmail: currentUserEmail,
        notes: newNotes.trim() || undefined,
      });

      setFormSuccess(`Usuário ${normEmail} adicionado com sucesso com perfil de ${newRole}!`);
      setNewEmail("");
      setNewName("");
      setNewNotes("");
      setTimeout(() => setActiveTab("users"), 1200);
    } catch (err: any) {
      setFormError(err.message || "Erro ao adicionar usuário à lista de autorizados.");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleApprove = async (request: AccessRequest, role: UserRole = "editor") => {
    try {
      await approveAccessRequest(request, role, currentUserEmail);
    } catch (err: any) {
      alert("Erro ao aprovar solicitação: " + err.message);
    }
  };

  const handleReject = async (request: AccessRequest) => {
    if (!window.confirm(`Recusar solicitação de ${request.email}?`)) return;
    try {
      await rejectAccessRequest(request.id);
    } catch (err: any) {
      alert("Erro ao recusar solicitação: " + err.message);
    }
  };

  const handleRoleChange = async (targetUser: AuthorizedUser, newRoleVal: UserRole) => {
    if (isMasterOwner(targetUser.email) && newRoleVal !== "superadmin") {
      alert("O e-mail do proprietário principal deve permanecer como Super Admin.");
      return;
    }
    try {
      await setAuthorizedUserRole(targetUser.email, newRoleVal);
    } catch (err: any) {
      alert("Erro ao alterar papel do usuário: " + err.message);
    }
  };

  const handleStatusToggle = async (targetUser: AuthorizedUser) => {
    if (isMasterOwner(targetUser.email)) {
      alert("O proprietário principal não pode ser desativado.");
      return;
    }
    const newStatus: UserStatus = targetUser.status === "active" ? "suspended" : "active";
    try {
      await setAuthorizedUserStatus(targetUser.email, newStatus);
    } catch (err: any) {
      alert("Erro ao alterar status: " + err.message);
    }
  };

  const handleRemove = async (targetUser: AuthorizedUser) => {
    if (isMasterOwner(targetUser.email)) {
      alert("O proprietário principal não pode ser removido.");
      return;
    }
    if (!window.confirm(`Remover acesso de ${targetUser.email}? Ele não poderá mais acessar o estúdio.`)) {
      return;
    }
    try {
      await removeAuthorizedUser(targetUser.email);
    } catch (err: any) {
      alert("Erro ao remover usuário: " + err.message);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 sm:p-6 lg:p-8 select-none scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 flex items-center justify-center text-white shadow-lg">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2">
                <span>Gestão de Acessos & Permissões</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  RBAC
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Controle quem pode criar, editar, revisar ou apenas visualizar os baralhos terapêuticos.
              </p>
            </div>
          </div>

          {/* Quick Invite & Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copiedLink ? "Link Copiado!" : "Compartilhar Link"}</span>
            </button>

            <button
              onClick={() => setActiveTab("invite")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <UserPlus size={16} />
              <span>Convidar Usuário</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 w-fit">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "users"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Users size={14} />
              <span>Usuários Autorizados ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "requests"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Clock size={14} />
              <span>Solicitações Pendentes</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-neutral-950 animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("invite")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "invite"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <UserPlus size={14} />
              <span>Convidar</span>
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "roles"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <ShieldCheck size={14} />
              <span>Guia de Funções</span>
            </button>
          </div>

          {activeTab === "users" && (
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Filtrar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          )}
        </div>

        {/* TAB 1: AUTHORIZED USERS LIST */}
        {activeTab === "users" && (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-neutral-400 flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-amber-400" />
                <span className="text-xs">Carregando lista de acessos...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 space-y-3">
                <Users size={32} className="mx-auto text-neutral-600" />
                <p className="text-sm">Nenhum usuário encontrado para esta busca.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Usuário</th>
                      <th className="py-3.5 px-4">Função / Perfil</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Adicionado em</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredUsers.map((u) => {
                      const isOwner = isMasterOwner(u.email);
                      const isMe = u.email.toLowerCase() === currentUserEmail.toLowerCase();

                      return (
                        <tr key={u.email} className="hover:bg-neutral-800/40 transition-colors">
                          {/* User Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-neutral-100 flex items-center gap-1.5 truncate">
                                  <span>{u.name || u.email.split("@")[0]}</span>
                                  {isOwner && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                                      <Crown size={10} /> Dono
                                    </span>
                                  )}
                                  {isMe && (
                                    <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                                      Você
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-neutral-400 block truncate">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role Selector */}
                          <td className="py-3 px-4">
                            {isOwner ? (
                              <span className="text-xs font-bold text-purple-300">Super Admin</span>
                            ) : (
                              <select
                                value={u.role || "editor"}
                                onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
                              >
                                <option value="superadmin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Visualizador</option>
                                <option value="demo">Degustação (Demo)</option>
                              </select>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                u.status === "active"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === "active" ? "bg-emerald-400" : "bg-rose-400"
                                }`}
                              />
                              {u.status === "active" ? "Ativo" : "Suspenso"}
                            </span>
                          </td>

                          {/* Added At */}
                          <td className="py-3 px-4 text-neutral-400 text-[11px]">
                            {u.addedAt ? new Date(u.addedAt).toLocaleDateString("pt-BR") : "—"}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {!isOwner && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStatusToggle(u)}
                                  className="px-2 py-1 rounded-lg text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
                                  title={u.status === "active" ? "Suspender acesso" : "Reativar acesso"}
                                >
                                  {u.status === "active" ? "Suspender" : "Reativar"}
                                </button>
                                <button
                                  onClick={() => handleRemove(u)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Remover acesso"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENDING REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-3">
                <UserCheck size={32} className="mx-auto text-neutral-600" />
                <h3 className="text-sm font-semibold text-neutral-200">Tudo em dia!</h3>
                <p className="text-xs text-neutral-400">
                  Nenhuma solicitação de acesso aguardando autorização no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-100">{req.name || "Terapeuta"}</h4>
                        <span className="text-xs text-neutral-400 block">{req.email}</span>
                        {req.message && (
                          <p className="text-xs text-neutral-300 bg-neutral-950/80 p-2.5 rounded-xl mt-2 border border-neutral-800 italic">
                            "{req.message}"
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                        Pendente
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => handleApprove(req, "editor")}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle size={14} />
                        <span>Aprovar como Editor</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req, "viewer")}
                        className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs cursor-pointer"
                        title="Aprovar apenas como Visualizador"
                      >
                        Visualizador
                      </button>

                      <button
                        onClick={() => handleReject(req)}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 cursor-pointer"
                        title="Recusar solicitação"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INVITE NEW MEMBER */}
        {activeTab === "invite" && (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl">
            <form onSubmit={handleAddUser} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-neutral-100">Convidar Novo Usuário</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Adicione o e-mail do colega ou cliente diretamente à lista autorizada.
                </p>
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Endereço de E-mail (Google Login) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ex: colega@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Nome Completo ou Apelido
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Dra. Ana Beatriz"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Perfil de Permissão (Role) *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/60 cursor-pointer"
                  >
                    <option value="editor">Editor — Pode criar, editar cartas e exportar PDF</option>
                    <option value="admin">Admin — Pode gerenciar usuários e aprovar solicitações</option>
                    <option value="viewer">Visualizador — Apenas consulta baralhos autorizados</option>
                    <option value="demo">Degustação / Demo — Acesso restrito a cartas marcadas como Demo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Observações Internas (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Terapeuta convidada da clínica parceira"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isAddingUser ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Concedendo Acesso...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Autorizar Usuário</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: ROLES GUIDE (RBAC) */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                  <Crown size={15} />
                </div>
                <h3 className="text-sm font-bold text-neutral-100">Super Admin (Proprietário)</h3>
              </div>
              <p className="text-xs text-neutral-400">
                Acesso irrestrito a todos os baralhos, banco de dados Firestore, gerenciamento de administradores e configurações críticas do sistema.
              </p>
            </div>

            <div className="p-5 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  <ShieldCheck size={15} />
                </div>
                <h3 className="text-sm font-bold text-neutral-100">Admin</h3>
              </div>
              <p className="text-xs text-neutral-400">
                Pode aprovar e rejeitar solicitações de acesso de novos membros, convidar editores e gerenciar baralhos da organização.
              </p>
            </div>

            <div className="p-5 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  <Sparkles size={15} />
                </div>
                <h3 className="text-sm font-bold text-neutral-100">Editor (Terapeuta Criador)</h3>
              </div>
              <p className="text-xs text-neutral-400">
                Pode criar novos baralhos, redigir cartas, usar IA geradora Gemini, editar estilos, molduras e exportar arquivos gráficos de impressão em alta resolução.
              </p>
            </div>

            <div className="p-5 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-bold">
                  <Users size={15} />
                </div>
                <h3 className="text-sm font-bold text-neutral-100">Degustação / Demo de Clientes</h3>
              </div>
              <p className="text-xs text-neutral-400">
                Permissão especial para clientes antes da compra: conseguem interagir apenas com as cartas marcadas com o selo Demo, mantendo o restante do baralho bloqueado para conversão.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
