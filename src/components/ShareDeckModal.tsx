import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Users,
  Lock,
  Globe,
  UserPlus,
  Trash2,
  Check,
  Eye,
  Copy,
  Info,
  Shield,
} from "lucide-react";
import { DeckConfig, AuthorizedUser } from "../types";
import { updateDeckSharing, subscribeAuthorizedUsers, PRE_AUTHORIZED_DEFAULT_USERS } from "../firebase";

interface ShareDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckConfig;
  currentUserEmail: string;
  onUpdateDeck: (updated: Partial<DeckConfig>) => void;
}

export const ShareDeckModal: React.FC<ShareDeckModalProps> = ({
  isOpen,
  onClose,
  deck,
  currentUserEmail,
  onUpdateDeck,
}) => {
  const [shareMode, setShareMode] = useState<"private" | "restricted" | "all_authorized">(
    deck.shareMode || "private"
  );
  const [sharedEmails, setSharedEmails] = useState<string[]>(
    deck.sharedWithEmails || []
  );
  const [newEmailInput, setNewEmailInput] = useState("");
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state with current deck
  useEffect(() => {
    if (isOpen) {
      setShareMode(deck.shareMode || "private");
      setSharedEmails(deck.sharedWithEmails || []);
      setSuccessMessage(null);
    }
  }, [isOpen, deck]);

  // Load authorized users list to suggest quick sharing
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeAuthorizedUsers((users) => {
      setAuthorizedUsers(users);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddEmail = (emailToAdd: string) => {
    const clean = emailToAdd.trim().toLowerCase();
    if (!clean) return;
    if (clean === currentUserEmail.toLowerCase()) {
      alert("Você já é o proprietário deste baralho.");
      return;
    }
    if (sharedEmails.includes(clean)) {
      alert("Este e-mail já está na lista de compartilhamento.");
      return;
    }
    setSharedEmails((prev) => [...prev, clean]);
    setNewEmailInput("");
    if (shareMode === "private") {
      setShareMode("restricted");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setSharedEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDeckSharing(deck.id, shareMode, sharedEmails);
      onUpdateDeck({
        shareMode,
        sharedWithEmails: sharedEmails,
      });
      setSuccessMessage("Configurações de compartilhamento atualizadas com sucesso!");
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Erro ao atualizar compartilhamento:", err);
      alert("Não foi possível salvar as configurações de compartilhamento no momento.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter suggested users that are not yet added
  const suggestedEmails = PRE_AUTHORIZED_DEFAULT_USERS.map((p) => p.email.toLowerCase())
    .concat(authorizedUsers.map((u) => u.email.toLowerCase()))
    .filter(
      (email, idx, arr) =>
        arr.indexOf(email) === idx &&
        email !== currentUserEmail.toLowerCase() &&
        !sharedEmails.includes(email)
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-100">
                Compartilhar Baralho
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-xs">
                "{deck.deckTitle}" • Modo Visualização
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

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Info Banner */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
            <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Acesso em Modo de Visualização:</strong> Os usuários convidados
              poderão navegar por todas as cartas, testar layouts e gerar folhas de
              impressão. Eles <strong>não podem alterar</strong> o seu baralho original. Se desejarem, poderão criar uma cópia própria para editar.
            </div>
          </div>

          {/* Visibility Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Nível de Visibilidade
            </label>

            <div className="space-y-2">
              {/* 1. Privado */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  shareMode === "private"
                    ? "bg-neutral-800 border-amber-500/60 ring-1 ring-amber-500/40"
                    : "bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="shareMode"
                  value="private"
                  checked={shareMode === "private"}
                  onChange={() => setShareMode("private")}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium text-sm text-neutral-200">
                    <Lock size={15} className="text-neutral-400" />
                    <span>Privado</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Somente você tem acesso a esta coleção.
                  </p>
                </div>
              </label>

              {/* 2. Restrito por e-mail */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  shareMode === "restricted"
                    ? "bg-neutral-800 border-amber-500/60 ring-1 ring-amber-500/40"
                    : "bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="shareMode"
                  value="restricted"
                  checked={shareMode === "restricted"}
                  onChange={() => setShareMode("restricted")}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium text-sm text-neutral-200">
                    <Users size={15} className="text-amber-400" />
                    <span>E-mails Específicos</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Somente os e-mails listados abaixo poderão visualizar.
                  </p>
                </div>
              </label>

              {/* 3. Todos Autorizados */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  shareMode === "all_authorized"
                    ? "bg-neutral-800 border-amber-500/60 ring-1 ring-amber-500/40"
                    : "bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/50"
                }`}
              >
                <input
                  type="radio"
                  name="shareMode"
                  value="all_authorized"
                  checked={shareMode === "all_authorized"}
                  onChange={() => setShareMode("all_authorized")}
                  className="mt-1 text-amber-500 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium text-sm text-neutral-200">
                    <Globe size={15} className="text-emerald-400" />
                    <span>Todos os Terapeutas Autorizados</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Qualquer colega autorizado no sistema pode visualizar esta coleção na aba "Compartilhados".
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Email Whitelist Section (if restricted or want to add specific users) */}
          {(shareMode === "restricted" || shareMode === "private") && (
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Convidar por E-mail Google
              </label>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEmail(newEmailInput);
                    }
                  }}
                  placeholder="exemplo@gmail.com"
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddEmail(newEmailInput)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus size={15} />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              {suggestedEmails.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] text-neutral-400 block mb-1.5">
                    Sugestões de colegas autorizados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedEmails.slice(0, 4).map((email) => (
                      <button
                        key={email}
                        type="button"
                        onClick={() => handleAddEmail(email)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>+ {email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared List */}
              <div className="space-y-2 pt-2">
                <span className="text-xs text-neutral-400 font-medium block">
                  Pessoas com acesso de visualização ({sharedEmails.length}):
                </span>

                {sharedEmails.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic py-2">
                    Nenhum e-mail adicionado individualmente.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {sharedEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
                      >
                        <div className="flex items-center gap-2 text-neutral-200">
                          <Eye size={14} className="text-amber-400" />
                          <span className="font-mono">{email}</span>
                          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400">
                            Visualizador
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                          title="Remover acesso"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Salvando..." : "Salvar Compartilhamento"}
          </button>
        </div>
      </div>
    </div>
  );
};
