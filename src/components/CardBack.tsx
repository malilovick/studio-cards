import React from "react";
import { DeckConfig, CardBackConfig } from "../types";
import { DEFAULT_CARD_BACK_CONFIG } from "../data/cardBackPresets";
import {
  TreeOfLifeIcon,
  LotusIcon,
  MandalaIcon,
  SunburstIcon,
  SacredGeometryIcon,
  HeartFlourishDivider,
  GoldenOrnateFrame,
  BotanicalBranchCorner,
  BotanicalCornerFlourish,
  WatercolorCornerFoliage,
} from "./CardVisuals";

interface CardBackProps {
  deck: DeckConfig;
  showBleedGuides?: boolean;
  scale?: number;
  customElementId?: string;
  isExporting?: boolean;
  overrideBackConfig?: CardBackConfig;
}

export const CardBack: React.FC<CardBackProps> = ({
  deck,
  showBleedGuides = false,
  scale = 1,
  customElementId,
  isExporting = false,
  overrideBackConfig,
}) => {
  const { style } = deck;
  const { colors } = style;

  // Merge backConfig with default fallbacks
  const back: CardBackConfig = {
    ...DEFAULT_CARD_BACK_CONFIG,
    ...(style.backConfig || {}),
    ...(overrideBackConfig || {}),
  };

  const mmToPx = 4.2;
  const baseWidthPx = deck.customWidthMm * mmToPx;
  const baseHeightPx = deck.customHeightMm * mmToPx;
  const bleedPx = showBleedGuides ? deck.bleedMm * mmToPx : 0;
  const safeMarginPx = deck.safeMarginMm * mmToPx;

  const width = baseWidthPx + (showBleedGuides ? bleedPx * 2 : 0);
  const height = baseHeightPx + (showBleedGuides ? bleedPx * 2 : 0);

  // Background style computation
  const getBackgroundStyle = (): React.CSSProperties => {
    const customImg = back.customBgImage || style.customBackBgImage;
    if (customImg) {
      return {
        backgroundImage: `url(${customImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    if (back.bgType === "watercolor-pink") {
      return {
        background: `radial-gradient(ellipse at 50% 35%, #F7DFE4 0%, #F1CAD3 50%, #E9B2BF 100%)`,
      };
    }

    if (back.bgType === "solid") {
      return {
        backgroundColor: back.bgColor || colors.backgroundBase,
      };
    }

    // Default gradient
    const startColor = back.bgColor || colors.backgroundBase;
    const endColor = back.bgGradientEnd || colors.backgroundGradientEnd || colors.secondaryAccent;
    return {
      background: `radial-gradient(ellipse at 50% 40%, ${startColor} 0%, ${endColor} 100%)`,
    };
  };

  // Emblem renderer
  const renderEmblem = () => {
    if (!back.showTopEmblem || back.emblemType === "none") return null;

    if (back.customEmblemImage || (back.emblemType === "custom-logo" && deck.authorLogoUrl)) {
      const src = back.customEmblemImage || deck.authorLogoUrl;
      return (
        <div className="p-2 max-w-[160px] mx-auto flex items-center justify-center">
          <img
            src={src}
            alt="Emblema / Logo"
            className="max-h-24 max-w-[140px] object-contain drop-shadow-xs"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    const emblemColor = back.emblemColor || colors.primaryAccent;
    const size = back.emblemSize || 135;

    switch (back.emblemType) {
      case "tree-of-life":
        return (
          <div className="drop-shadow-xs transition-transform">
            <TreeOfLifeIcon
              color={emblemColor}
              size={size}
              palette={
                back.treePalette || {
                  pink: "#E9B6C2",
                  blue: "#A3C3D9",
                  white: "#FFFFFF",
                  trunk: "#FFFFFF",
                }
              }
            />
          </div>
        );
      case "mandala":
        return (
          <div className="drop-shadow-xs p-1">
            <MandalaIcon color={emblemColor} size={size * 0.85} />
          </div>
        );
      case "lotus":
        return (
          <div className="drop-shadow-xs p-1">
            <LotusIcon color={emblemColor} size={size * 0.75} />
          </div>
        );
      case "sunburst":
        return (
          <div className="drop-shadow-xs p-1">
            <SunburstIcon color={emblemColor} size={size * 0.7} />
          </div>
        );
      case "sacred-geometry":
        return (
          <div className="drop-shadow-xs p-1">
            <SacredGeometryIcon color={emblemColor} size={size * 0.75} />
          </div>
        );
      default:
        return (
          <div className="drop-shadow-xs">
            <TreeOfLifeIcon color={emblemColor} size={size} />
          </div>
        );
    }
  };

  // Divider renderer
  const renderDivider = () => {
    if (!back.showDivider || back.dividerType === "none") return null;

    if (back.customDividerImage) {
      return (
        <img
          src={back.customDividerImage}
          alt="Divisor"
          className="max-h-6 max-w-[140px] object-contain mx-auto my-1 pointer-events-none"
          referrerPolicy="no-referrer"
        />
      );
    }

    const divColor = back.dividerColor || colors.primaryAccent;
    const divWidth = back.dividerWidth || 100;

    if (back.dividerType === "heart-line") {
      return <HeartFlourishDivider color={divColor} width={divWidth} />;
    }

    if (back.dividerType === "lotus-line") {
      return (
        <div className="flex items-center justify-center gap-2 my-1" style={{ width: `${divWidth}px` }}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-current to-current" style={{ color: divColor }} />
          <LotusIcon color={divColor} size={14} />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-current to-current" style={{ color: divColor }} />
        </div>
      );
    }

    if (back.dividerType === "mandala-line") {
      return (
        <div className="flex items-center justify-center gap-2 my-1" style={{ width: `${divWidth}px` }}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-current to-current" style={{ color: divColor }} />
          <MandalaIcon color={divColor} size={14} />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-current to-current" style={{ color: divColor }} />
        </div>
      );
    }

    return (
      <div
        className="h-[1px] my-1 mx-auto bg-gradient-to-r from-transparent via-current to-transparent opacity-70"
        style={{ width: `${divWidth}px`, color: divColor }}
      />
    );
  };

  // Lower ornament renderer
  const renderLowerOrnament = () => {
    if (!back.showLowerOrnament || back.lowerOrnamentType === "none") return null;

    if (back.customLowerOrnamentImage) {
      return (
        <img
          src={back.customLowerOrnamentImage}
          alt="Ornamento"
          className="max-h-7 object-contain mx-auto mt-0.5"
          referrerPolicy="no-referrer"
        />
      );
    }

    const ornColor = back.lowerOrnamentColor || colors.primaryAccent;
    const ornSize = back.lowerOrnamentSize || 26;

    if (back.lowerOrnamentType === "lotus") {
      return (
        <div className="mt-0.5 drop-shadow-xs">
          <LotusIcon color={ornColor} size={ornSize} />
        </div>
      );
    }

    if (back.lowerOrnamentType === "heart") {
      return (
        <div className="mt-0.5 opacity-80" style={{ color: ornColor }}>
          <svg width={ornSize * 0.6} height={ornSize * 0.6} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      );
    }

    return null;
  };

  const collectionNameDisplay =
    back.collectionTitleText !== undefined && back.collectionTitleText !== ""
      ? back.collectionTitleText
      : deck.collectionName.replace(/^COLEÇÃO\s+/i, "") || "ESSÊNCIA";

  const quoteDisplay =
    back.quoteText !== undefined && back.quoteText !== ""
      ? back.quoteText
      : deck.deckSubtitle || "Toda transformação começa quando você retorna para si.";

  const authorNameDisplay =
    back.authorName !== undefined && back.authorName !== ""
      ? back.authorName
      : deck.authorName || "Luciana Castro";

  const authorRoleDisplay =
    back.authorRoleText !== undefined && back.authorRoleText !== ""
      ? back.authorRoleText
      : deck.authorRole || "TERAPIAS INTEGRATIVAS";

  return (
    <div
      id={customElementId || "card-back-master"}
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
          <div
            className="absolute inset-0 border-2 border-dashed border-red-400/60 pointer-events-none z-30"
            title="Linha de Sangria (Bleed 3mm)"
          />
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

      {/* Frame / Outer Border */}
      {back.frameType !== "none" && (
        <>
          {back.frameType === "golden-ornate" ? (
            <GoldenOrnateFrame
              color={back.frameColor || colors.primaryAccent}
              opacity={back.frameOpacity ?? 0.85}
              cornerRadius={Math.max(style.cornerRadiusMm * mmToPx - 6, 2)}
              customImage={back.customFrameImage}
            />
          ) : back.frameType === "double-line" ? (
            <div
              className="absolute inset-[10px] pointer-events-none z-10"
              style={{
                border: `1px solid ${back.frameColor || colors.borderAccent}`,
                borderRadius: `${Math.max(style.cornerRadiusMm * mmToPx - 6, 2)}px`,
                opacity: back.frameOpacity ?? 0.8,
              }}
            >
              <div
                className="absolute inset-[3px]"
                style={{
                  border: `0.75px solid ${back.frameColor || colors.borderAccent}`,
                  borderRadius: `${Math.max(style.cornerRadiusMm * mmToPx - 9, 2)}px`,
                  opacity: 0.5,
                }}
              />
            </div>
          ) : back.customFrameImage ? (
            <img
              src={back.customFrameImage}
              alt="Moldura"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
              style={{ opacity: back.frameOpacity ?? 0.9 }}
              referrerPolicy="no-referrer"
            />
          ) : null}
        </>
      )}

      {/* Botanical Corner Foliages (4 Cantos) */}
      {back.showCornerBotanicals && (
        <>
          {back.showTopLeftCorner !== false && (
            <BotanicalBranchCorner
              position="top-left"
              color={colors.secondaryAccent}
              size={back.cornerSize || 85}
              opacity={back.cornerOpacity ?? 0.85}
              customImage={back.customTopLeftCornerImage}
            />
          )}
          {back.showTopRightCorner !== false && (
            <BotanicalBranchCorner
              position="top-right"
              color={colors.secondaryAccent}
              size={back.cornerSize || 85}
              opacity={back.cornerOpacity ?? 0.85}
              customImage={back.customTopRightCornerImage}
            />
          )}
          {back.showBottomLeftCorner !== false && (
            <BotanicalBranchCorner
              position="bottom-left"
              color={colors.secondaryAccent}
              size={back.cornerSize || 85}
              opacity={back.cornerOpacity ?? 0.85}
              customImage={back.customBottomLeftCornerImage}
            />
          )}
          {back.showBottomRightCorner !== false && (
            <BotanicalBranchCorner
              position="bottom-right"
              color={colors.secondaryAccent}
              size={back.cornerSize || 85}
              opacity={back.cornerOpacity ?? 0.85}
              customImage={back.customBottomRightCornerImage}
            />
          )}
        </>
      )}

      {/* Top Header Dots / Flourish (Optional) */}
      {back.showHeaderDots && (
        <div className="relative z-20 flex justify-center items-center gap-1.5 pt-4">
          <div
            className="w-1 h-1 rounded-full opacity-60"
            style={{ backgroundColor: back.frameColor || colors.primaryAccent }}
          />
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill={back.frameColor || colors.primaryAccent}
            className="opacity-70"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <div
            className="w-1 h-1 rounded-full opacity-60"
            style={{ backgroundColor: back.frameColor || colors.primaryAccent }}
          />
        </div>
      )}

      {/* Inner Central Content */}
      <div
        className="relative z-20 flex flex-col justify-between items-center h-full px-5 pb-4 pt-1"
        style={{
          paddingLeft: `${Math.max(safeMarginPx, 18)}px`,
          paddingRight: `${Math.max(safeMarginPx, 18)}px`,
        }}
      >
        {/* Main Central Emblem & Texts */}
        <div className="flex flex-col items-center justify-center my-auto w-full gap-1.5">
          {/* Top Emblem */}
          {renderEmblem()}

          {/* Collection Title Eyebrow & Name */}
          <div className="flex flex-col items-center mt-1">
            {back.showCollectionEyebrow && (
              <span
                className="font-medium tracking-widest uppercase transition-all"
                style={{
                  color: back.collectionEyebrowColor || colors.primaryAccent,
                  fontFamily: `"${back.collectionEyebrowFont || style.titleFont}", serif`,
                  fontSize: `${back.collectionEyebrowSize || 11}px`,
                  letterSpacing: back.collectionEyebrowTracking || "0.32em",
                }}
              >
                {back.collectionEyebrowText || "COLEÇÃO"}
              </span>
            )}

            {back.showCollectionTitle && (
              <h1
                className="font-bold tracking-[0.22em] uppercase mt-0.5 transition-all"
                style={{
                  color: back.collectionTitleColor || colors.primaryAccent,
                  fontFamily: `"${back.collectionTitleFont || style.titleFont}", serif`,
                  fontSize: `${back.collectionTitleSize || 22}px`,
                  textShadow:
                    back.collectionTitleStyle === "gold-gradient"
                      ? "0 1px 2px rgba(184, 134, 11, 0.25)"
                      : undefined,
                }}
              >
                {collectionNameDisplay}
              </h1>
            )}
          </div>

          {/* Middle Divider */}
          {renderDivider()}

          {/* Subtitle / Therapeutic Mantra Quote */}
          {back.showQuote && quoteDisplay && (
            <p
              className="leading-[1.4] font-medium max-w-[210px] text-center my-0.5 transition-all"
              style={{
                fontFamily: `"${back.quoteFont || style.titleFont}", serif`,
                color: back.quoteColor || colors.textPrimary,
                fontSize: `${back.quoteSize || 13.5}px`,
                fontStyle: back.quoteItalic !== false ? "italic" : "normal",
              }}
            >
              {back.quoteWithQuotes !== false ? `“${quoteDisplay}”` : quoteDisplay}
            </p>
          )}

          {/* Lower Lotus Ornament */}
          {renderLowerOrnament()}
        </div>

        {/* Therapist / Signature & Specialty Footer */}
        <div className="flex flex-col items-center pb-1">
          {back.showAuthorSignature && (
            <>
              {back.signatureMode === "custom-image" || back.customSignatureImage ? (
                <img
                  src={back.customSignatureImage || deck.authorLogoUrl}
                  alt="Assinatura"
                  className="max-h-12 max-w-[160px] object-contain mx-auto mb-0.5"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  className="leading-tight font-normal tracking-wide capitalize transition-all"
                  style={{
                    fontFamily: `"${back.signatureFont || style.signatureFont}", cursive`,
                    color: back.signatureColor || colors.primaryAccent,
                    fontSize: `${back.signatureSize || 26}px`,
                  }}
                >
                  {authorNameDisplay}
                </span>
              )}
            </>
          )}

          {back.showAuthorRole && authorRoleDisplay && (
            <span
              className="font-semibold uppercase mt-0.5 transition-all"
              style={{
                color: back.authorRoleColor || colors.primaryAccent,
                fontFamily: `"${back.authorRoleFont || style.titleFont}", serif`,
                fontSize: `${back.authorRoleSize || 8.5}px`,
                letterSpacing: back.authorRoleTracking || "0.25em",
              }}
            >
              {authorRoleDisplay}
            </span>
          )}

          {/* Footer dots or heart accent */}
          {back.showFooterAccent && (
            <div className="flex items-center justify-center gap-1 mt-1 opacity-75">
              {back.footerAccentType === "heart" ? (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill={back.footerAccentColor || colors.primaryAccent}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <>
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: back.footerAccentColor || colors.primaryAccent }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: back.footerAccentColor || colors.primaryAccent }}
                  />
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: back.footerAccentColor || colors.primaryAccent }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
