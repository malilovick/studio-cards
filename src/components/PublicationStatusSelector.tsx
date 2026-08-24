import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  EyeOff,
  FileEdit,
  Clock,
  Calendar,
  Trash2,
  Sparkles,
  ChevronDown,
  Check,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { PublicationStatus, PUBLICATION_STATUS_MAP } from "../types";

export const getStatusIcon = (status: PublicationStatus | string = "draft", size = 14) => {
  switch (status as PublicationStatus) {
    case "published":
      return <Globe size={size} className="text-emerald-400" />;
    case "unpublished":
      return <EyeOff size={size} className="text-neutral-400" />;
    case "draft":
      return <FileEdit size={size} className="text-amber-400" />;
    case "pending":
      return <Clock size={size} className="text-orange-400" />;
    case "scheduled":
      return <Calendar size={size} className="text-blue-400" />;
    case "trash":
      return <Trash2 size={size} className="text-rose-400" />;
    case "auto_draft":
      return <Sparkles size={size} className="text-purple-400" />;
    default:
      return <FileEdit size={size} className="text-neutral-400" />;
  }
};

interface PublicationStatusBadgeProps {
  status?: PublicationStatus | string;
  scheduledAt?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showScheduleDate?: boolean;
  className?: string;
}

export const PublicationStatusBadge: React.FC<PublicationStatusBadgeProps> = ({
  status = "draft",
  scheduledAt,
  size = "md",
  showIcon = true,
  showScheduleDate = true,
  className = "",
}) => {
  const safeStatus = (status as PublicationStatus) || "draft";
  const info = PUBLICATION_STATUS_MAP[safeStatus] || PUBLICATION_STATUS_MAP.draft;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.2 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2 font-medium",
  }[size];

  const formatScheduledDate = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium transition-colors ${info.badgeBg} ${info.badgeText} ${info.borderColor} ${sizeClasses} ${className}`}
      title={info.description}
    >
      {showIcon && getStatusIcon(safeStatus, size === "sm" ? 11 : size === "lg" ? 16 : 13)}
      <span className="truncate">{info.shortLabel}</span>
      {safeStatus === "scheduled" && scheduledAt && showScheduleDate && (
        <span className="text-[10px] opacity-80 font-mono">
          ({formatScheduledDate(scheduledAt)})
        </span>
      )}
    </span>
  );
};

interface PublicationStatusDropdownProps {
  status?: PublicationStatus | string;
  scheduledAt?: string;
  onChangeStatus: (newStatus: PublicationStatus, scheduledAt?: string) => void;
  disabled?: boolean;
  variant?: "badge" | "button" | "compact" | "form";
  label?: string;
}

export const PublicationStatusDropdown: React.FC<PublicationStatusDropdownProps> = ({
  status = "draft",
  scheduledAt,
  onChangeStatus,
  disabled = false,
  variant = "badge",
  label,
}) => {
  const safeStatus = (status as PublicationStatus) || "draft";
  const [isOpen, setIsOpen] = useState(false);
  const [customScheduledDate, setCustomScheduledDate] = useState(scheduledAt || "");
  const [isSettingSchedule, setIsSettingSchedule] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentInfo = PUBLICATION_STATUS_MAP[safeStatus] || PUBLICATION_STATUS_MAP.draft;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsSettingSchedule(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectStatus = (newStatus: PublicationStatus) => {
    if (newStatus === "scheduled") {
      setIsSettingSchedule(true);
    } else {
      onChangeStatus(newStatus);
      setIsOpen(false);
      setIsSettingSchedule(false);
    }
  };

  const handleConfirmSchedule = () => {
    onChangeStatus("scheduled", customScheduledDate || new Date(Date.now() + 86400000).toISOString());
    setIsOpen(false);
    setIsSettingSchedule(false);
  };

  const statusesList: PublicationStatus[] = [
    "published",
    "unpublished",
    "draft",
    "pending",
    "scheduled",
    "auto_draft",
    "trash",
  ];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {label && <label className="text-[10px] text-neutral-400 block mb-1 font-medium">{label}</label>}

      {/* Trigger Button */}
      {variant === "form" ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-xs text-neutral-200 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            isOpen ? "ring-2 ring-amber-500/50 border-amber-500" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full ${currentInfo.dotColor} shrink-0`} />
            <span className="font-semibold truncate">{currentInfo.label}</span>
          </div>
          <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      ) : variant === "compact" ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all cursor-pointer disabled:opacity-60 ${currentInfo.badgeBg} ${currentInfo.badgeText} ${currentInfo.borderColor}`}
          title="Alterar status de publicação"
        >
          {getStatusIcon(safeStatus, 12)}
          <span>{currentInfo.shortLabel}</span>
          <ChevronDown size={11} className="opacity-70" />
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60 hover:brightness-110 ${currentInfo.badgeBg} ${currentInfo.badgeText} ${currentInfo.borderColor}`}
          title="Clique para alterar o status de publicação"
        >
          {getStatusIcon(safeStatus, 14)}
          <span>{currentInfo.shortLabel}</span>
          <ChevronDown size={12} className={`opacity-80 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-neutral-800 bg-neutral-950/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Status de Publicação
            </span>
          </div>

          {!isSettingSchedule ? (
            <div className="p-1.5 flex flex-col gap-0.5 max-h-80 overflow-y-auto scrollbar-thin">
              {statusesList.map((st) => {
                const info = PUBLICATION_STATUS_MAP[st];
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStatus(st)}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${info.badgeBg} border ${info.borderColor}`
                        : "hover:bg-neutral-800/80 text-neutral-300"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getStatusIcon(st, 15)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? info.badgeText : "text-neutral-200"
                          }`}
                        >
                          {info.label}
                        </span>
                        {isSelected && <Check size={14} className={info.badgeText} />}
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                        {info.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Schedule Sub-form */
            <div className="p-3 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                <Calendar size={15} />
                <span>Agendar Publicação Futura</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Escolha a data e hora em que este item deverá ser publicado automaticamente:
              </p>
              <input
                type="datetime-local"
                value={customScheduledDate}
                onChange={(e) => setCustomScheduledDate(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSettingSchedule(false)}
                  className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 rounded-md hover:bg-neutral-800"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSchedule}
                  className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
