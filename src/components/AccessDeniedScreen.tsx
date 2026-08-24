import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { ShieldAlert, Send, LogOut, CheckCircle2, Clock, Mail, AlertTriangle } from "lucide-react";
import { logOut, submitAccessRequest, getExistingAccessRequest } from "../firebase";
import { AccessRequest } from "../types";

interface AccessDeniedScreenProps {
  user: User;
  onRefreshAuth?: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({ user, onRefreshAuth }) => {
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<AccessRequest | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [loadingReq, setLoadingReq] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadReq() {
      try {
        const req = await getExistingAccessRequest(user);
        if (mounted) {
          setExistingRequest(req);
        }
      } catch (e) {
        console.error("Erro ao verificar solicitação:", e);
      } finally {
        if (mounted) setLoadingReq(false);
      }
    }
    loadReq();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitAccessRequest(user, requestMessage);
      setJustSubmitted(true);
      const req = await getExistingAccessRequest(user);
      setExistingRequest(req);
    } catch (err) {
      console.error("Erro ao enviar solicitação:", err);
      alert("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-4 text-neutral-100 font-sans">
      <div className="max-w-lg w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
          <ShieldAlert size={34} />
        </div>

        <h1 className="text-2xl font-serif font-bold text-neutral-100 mb-2">
          Acesso Restrito ao Baralho
        </h1>

        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          Sua conta Google foi autenticada com sucesso, porém este e-mail ainda não consta na lista de profissionais autorizados pelo administrador.
        </p>

        {/* User Google Account Card */}
        <div className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 mb-6 flex items-center gap-3.5 text-left">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "Avatar"}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full border border-neutral-700 object-cover shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 font-bold shrink-0">
              {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-neutral-200 truncate">
              {user.displayName || "Usuário Google"}
            </div>
            <div className="text-xs text-neutral-400 truncate flex items-center gap-1.5 mt-0.5">
              <Mail size={12} className="text-neutral-400" />
              <span>{user.email}</span>
            </div>
          </div>

          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
            Não Autorizado
          </span>
        </div>

        {/* Request Form or Status */}
        {existingRequest || justSubmitted ? (
          <div className="w-full bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-5 mb-6 text-left flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 size={18} />
              <span>Solicitação de Acesso Enviada</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              O administrador foi notificado. Assim que seu e-mail for liberado, você poderá acessar todas as ferramentas de criação de cartas.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-300/80 mt-1 pt-2 border-t border-emerald-900/40">
              <Clock size={12} />
              <span>Status: Aguardando aprovação pelo administrador</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendRequest} className="w-full text-left mb-6">
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Solicitar Autorização ao Administrador
            </label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Ex: Olá Marcos! Sou psicóloga e gostaria de criar baralhos para meus pacientes..."
              className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-amber-500/70 rounded-xl p-3 text-xs text-neutral-200 outline-none transition-all resize-none h-20 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 w-full bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>Enviando solicitação...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>Enviar Solicitação de Acesso</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Buttons */}
        <div className="w-full flex items-center gap-3">
          <button
            onClick={() => onRefreshAuth && onRefreshAuth()}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium py-2.5 px-4 rounded-xl border border-neutral-700 transition-all"
          >
            Verificar Novamente
          </button>
          <button
            onClick={() => logOut()}
            className="flex-1 bg-neutral-950 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-300 text-xs font-medium py-2.5 px-4 rounded-xl border border-neutral-800 hover:border-rose-800/60 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut size={13} />
            <span>Trocar de Conta</span>
          </button>
        </div>

      </div>
    </div>
  );
};
