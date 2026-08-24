import React from "react";
import { CardItem, DeckConfig } from "../types";
import {
  RenderOrnament,
  HeartFlourishDivider,
  BotanicalCornerFlourish,
  WatercolorCornerFoliage,
} from "./CardVisuals";
import { Heart, Moon, Sparkles } from "lucide-react";

interface CardFrontProps {
  card: CardItem;
  deck: DeckConfig;
  showBleedGuides?: boolean;
  scale?: number; // scale multiplier for preview or high-res
  customElementId?: string;
  isExporting?: boolean;
}

export const CardFront: React.FC<CardFrontProps> = ({
  card,
  deck,
  showBleedGuides = false,
  scale = 1,
  customElementId,
  isExporting = false,
}) => {
  const { style } = deck;
  const { colors } = style;

  // Calculate pixel dimensions from mm
  // 1 mm at 96 DPI = ~3.7795 px; for standard visual layout, we can use a base 4.5px per mm
  const mmToPx = 4.2;
  const baseWidthPx = deck.customWidthMm * mmToPx;
  const baseHeightPx = deck.customHeightMm * mmToPx;
  const bleedPx = showBleedGuides ? deck.bleedMm * mmToPx : 0;
  const safeMarginPx = deck.safeMarginMm * mmToPx;

  const width = baseWidthPx + (showBleedGuides ? bleedPx * 2 : 0);
  const height = baseHeightPx + (showBleedGuides ? bleedPx * 2 : 0);

  // Background style
  const getBackgroundStyle = () => {
    if (style.customBgImage) {
      return {
        backgroundImage: `url(${style.customBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    // Gradient / watercolor simulation
    return {
      background: `radial-gradient(ellipse at 50% 30%, ${colors.backgroundBase} 0%, ${colors.backgroundGradientEnd || colors.backgroundBase} 100%)`,
    };
  };

  return (
    <div
      id={customElementId || `card-front-${card.id}`}
      className="relative flex flex-col justify-between overflow-hidden text-center select-none shadow-md transition-shadow"
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        borderRadius: isExporting ? "0px" : `${style.cornerRadiusMm * mmToPx * scale}px`,
        ...getBackgroundStyle(),
        fontFamily: `"${style.bodyFont}", sans-serif`,
        color: colors.textPrimary,
      }}
    >
      {/* Bleed Overlay & Guides for Print Mode */}
      {showBleedGuides && (
        <>
          {/* Bleed Area (3mm outside cut line) */}
          <div
            className="absolute inset-0 border-2 border-dashed border-red-400/60 pointer-events-none z-30"
            title="Linha de Sangria (Bleed 3mm)"
          />
          {/* Cut Line (Tamanho Final da Carta) */}
          <div
            className="absolute border-2 border-amber-500/70 pointer-events-none z-30"
            style={{
              top: `${bleedPx * scale}px`,
              left: `${bleedPx * scale}px`,
              right: `${bleedPx * scale}px`,
              bottom: `${bleedPx * scale}px`,
              borderRadius: `${style.cornerRadiusMm * mmToPx * scale}px`,
            }}
            title="Linha de Corte da Gráfica"
          />
          {/* Safe Margin Zone (Margem de Segurança) */}
          <div
            className="absolute border border-dotted border-blue-400/50 pointer-events-none z-30"
            style={{
              top: `${(bleedPx + safeMarginPx) * scale}px`,
              left: `${(bleedPx + safeMarginPx) * scale}px`,
              right: `${(bleedPx + safeMarginPx) * scale}px`,
              bottom: `${(bleedPx + safeMarginPx) * scale}px`,
            }}
            title="Margem Segura para Textos"
          />
        </>
      )}

      {/* Outer Border Decor (Double Gold Line or Floral) */}
      <div
        className="absolute inset-[10px] pointer-events-none z-10 transition-all"
        style={{
          border: style.borderStyle === "double-gold"
            ? `1px solid ${colors.borderAccent}`
            : style.borderStyle === "botanical-corners"
            ? `1px solid ${colors.borderAccent}88`
            : style.borderStyle === "minimal-line"
            ? `1px solid ${colors.borderAccent}55`
            : "none",
          borderRadius: `${Math.max(style.cornerRadiusMm * mmToPx - 6, 2)}px`,
        }}
      >
        {style.borderStyle === "double-gold" && (
          <div
            className="absolute inset-[3px]"
            style={{
              border: `0.75px solid ${colors.borderAccent}66`,
              borderRadius: `${Math.max(style.cornerRadiusMm * mmToPx - 9, 2)}px`,
            }}
          />
        )}
      </div>

      {/* Botanical Corner Flourishes (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
      {style.borderStyle === "botanical-corners" && (
        <>
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <WatercolorCornerFoliage position="top-left" color={colors.secondaryAccent} size={64} />
          </div>
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <BotanicalCornerFlourish position="top-right" color={colors.primaryAccent} size={42} />
          </div>
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <BotanicalCornerFlourish position="bottom-left" color={colors.primaryAccent} size={42} />
          </div>
          <div className="absolute bottom-1 right-1 z-10 pointer-events-none">
            <WatercolorCornerFoliage position="bottom-right" color={colors.secondaryAccent} size={88} />
          </div>
        </>
      )}

      {/* Inner Content Padding */}
      <div
        className="relative z-20 flex flex-col justify-between h-full px-5 py-6"
        style={{
          paddingTop: `${Math.max(safeMarginPx, 18)}px`,
          paddingBottom: `${Math.max(safeMarginPx, 18)}px`,
          paddingLeft: `${Math.max(safeMarginPx, 16)}px`,
          paddingRight: `${Math.max(safeMarginPx, 16)}px`,
        }}
      >
        {/* TOP SECTION: Top Ornament, Collection Name, Pill Badge, Card Title */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Top Lotus / Icon */}
          <div className="flex justify-center mb-0.5">
            <RenderOrnament ornament={style.topOrnament} color={colors.primaryAccent} size={30} />
          </div>

          {/* Collection Name Eyebrow */}
          {style.showTopCollectionName && (
            <p
              className="text-[10px] tracking-[0.28em] uppercase font-medium"
              style={{
                color: colors.primaryAccent,
                fontFamily: `"${style.titleFont}", serif`,
              }}
            >
              {deck.collectionName || "COLEÇÃO ESSÊNCIA"}
            </p>
          )}

          {/* Pill Badge (Card Number) */}
          <div
            className="px-3.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider flex items-center justify-center shadow-xs"
            style={{
              backgroundColor: colors.badgeBg,
              color: colors.badgeText,
              minWidth: "38px",
            }}
          >
            {card.number || "01"}
          </div>

          {/* Card Main Title */}
          <h2
            className="text-[17px] sm:text-[18px] font-semibold tracking-[0.14em] uppercase mt-0.5"
            style={{
              fontFamily: `"${style.titleFont}", serif`,
              color: colors.textPrimary,
            }}
          >
            {card.title || "TÍTULO DA CARTA"}
          </h2>

          {/* Tiny Heart Divider */}
          <HeartFlourishDivider color={colors.primaryAccent} width={90} />
        </div>

        {/* MIDDLE SECTION: Main Affirmation (Central Quote) */}
        <div className="flex flex-col items-center justify-center my-auto px-2">
          <p
            className="text-[14.5px] leading-[1.45] font-semibold italic text-center"
            style={{
              fontFamily: `"${style.titleFont}", serif`,
              color: colors.textPrimary,
            }}
          >
            “{card.affirmation || "Afirmação terapêutica transformadora e profunda."}”
          </p>
          <div className="mt-2">
            <HeartFlourishDivider color={colors.primaryAccent} width={60} />
          </div>
        </div>

        {/* BOTTOM SECTION: Reflection Box & Soul Question */}
        <div className="flex flex-col gap-2.5 mt-auto">
          {/* Reflection Rounded Container */}
          {style.showReflectionBox && card.reflection && (
            <div
              className="rounded-2xl p-3 text-left shadow-2xs backdrop-blur-xs"
              style={{
                backgroundColor: `${colors.boxBg}`,
                borderRadius: `${style.innerBoxRadiusMm * 2.8}px`,
                border: `1px solid ${colors.borderAccent}40`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primaryAccent}25` }}
                >
                  <Heart size={9} style={{ color: colors.primaryAccent }} />
                </div>
                <span
                  className="text-[9px] tracking-[0.2em] font-semibold uppercase"
                  style={{
                    color: colors.primaryAccent,
                    fontFamily: `"${style.titleFont}", serif`,
                  }}
                >
                  REFLEXÃO
                </span>
              </div>
              <p
                className="text-[11.5px] leading-[1.4] text-neutral-800"
                style={{ color: colors.textSecondary }}
              >
                {card.reflection}
              </p>
            </div>
          )}

          {/* Soul Question Section */}
          {style.showSoulQuestion && card.soulQuestion && (
            <div className="text-left px-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primaryAccent}20` }}
                >
                  <Moon size={9} style={{ color: colors.primaryAccent }} />
                </div>
                <span
                  className="text-[9px] tracking-[0.2em] font-semibold uppercase"
                  style={{
                    color: colors.primaryAccent,
                    fontFamily: `"${style.titleFont}", serif`,
                  }}
                >
                  PERGUNTA DA ALMA
                </span>
              </div>
              <p
                className="text-[12.5px] leading-[1.35] font-medium italic"
                style={{
                  fontFamily: `"${style.titleFont}", serif`,
                  color: colors.textPrimary,
                }}
              >
                {card.soulQuestion}
              </p>
            </div>
          )}

          {/* Action Prompt (Micro-prática) if enabled */}
          {style.showActionPrompt && card.actionPrompt && (
            <div
              className="text-left px-2 py-1.5 rounded-lg flex items-start gap-1.5 bg-amber-500/5 border border-amber-500/15"
            >
              <Sparkles size={11} className="shrink-0 mt-0.5 text-amber-700" />
              <p className="text-[10px] leading-[1.3] text-amber-950 font-medium">
                <strong className="font-semibold">Prática:</strong> {card.actionPrompt}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
