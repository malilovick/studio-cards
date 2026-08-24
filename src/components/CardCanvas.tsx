import React, { useState } from "react";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Scissors,
  Layers,
  LayoutGrid,
  CreditCard,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Lock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { CardItem, DeckConfig } from "../types";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";

interface CardCanvasProps {
  deck: DeckConfig;
  selectedCardId: string;
  onSelectCard: (id: string) => void;
  viewMode: "focus" | "grid" | "sheet" | "stack";
  onChangeViewMode: (mode: "focus" | "grid" | "sheet" | "stack") => void;
  onToggleDemoCard?: (id: string) => void;
  isFlipped?: boolean;
  onToggleFlip?: () => void;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  deck,
  selectedCardId,
  onSelectCard,
  viewMode,
  onChangeViewMode,
  onToggleDemoCard,
  isFlipped: propIsFlipped,
  onToggleFlip: propOnToggleFlip,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = propIsFlipped !== undefined ? propIsFlipped : internalFlipped;
  const setIsFlipped = (val: boolean) => {
    if (propOnToggleFlip && propIsFlipped !== undefined) {
      propOnToggleFlip();
    } else {
      setInternalFlipped(val);
    }
  };

  const [zoom, setZoom] = useState(1);
  const [showBleedGuides, setShowBleedGuides] = useState(false);
  const [showAllAsBack, setShowAllAsBack] = useState(false);
  const [demoTrialPreview, setDemoTrialPreview] = useState(false);

  const currentIndex = deck.cards.findIndex((c) => c.id === selectedCardId);
  const currentCard = deck.cards[currentIndex >= 0 ? currentIndex : 0] || deck.cards[0];
  const demoCardsCount = deck.cards.filter((c) => c.isDemo && c.status !== "trash").length;

  const mmToPx = 4.2;
  const baseWidthPx = deck.customWidthMm * mmToPx;
  const baseHeightPx = deck.customHeightMm * mmToPx;
  const bleedPx = showBleedGuides ? deck.bleedMm * mmToPx : 0;
  const cardWidth = baseWidthPx + (showBleedGuides ? bleedPx * 2 : 0);
  const cardHeight = baseHeightPx + (showBleedGuides ? bleedPx * 2 : 0);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectCard(deck.cards[currentIndex - 1].id);
    } else {
      onSelectCard(deck.cards[deck.cards.length - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < deck.cards.length - 1) {
      onSelectCard(deck.cards[currentIndex + 1].id);
    } else {
      onSelectCard(deck.cards[0].id);
    }
  };

  const handleToggleFlip = () => {
    if (viewMode === "grid" || viewMode === "sheet" || viewMode === "stack") {
      setShowAllAsBack(!showAllAsBack);
    } else {
      if (propOnToggleFlip) {
        propOnToggleFlip();
      } else {
        setInternalFlipped(!internalFlipped);
      }
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-neutral-950/90 relative overflow-hidden select-none">
      {/* Floating Toolbar Controls - Clean Unified Icon Bar with Tooltips */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-neutral-900/95 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-neutral-800 shadow-2xl flex items-center gap-1.5 text-xs">
        {/* GROUP 1: VIEW MODES (Foco Único, Grade, Folha Impressa, Leque 3D) */}
        <div className="flex items-center gap-1 bg-neutral-950/60 p-0.5 rounded-xl border border-neutral-800/80">
          {/* 1. Foco Único */}
          <div className="relative group">
            <button
              onClick={() => onChangeViewMode("focus")}
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                viewMode === "focus"
                  ? "bg-amber-500 text-neutral-950 shadow-xs font-bold"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              }`}
              title="Foco Único (Visualizar e girar carta individual)"
              aria-label="Foco Único"
            >
              <CreditCard size={16} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl">
                Foco Único
              </div>
            </div>
          </div>

          {/* 2. Visão em Grade */}
          <div className="relative group">
            <button
              onClick={() => onChangeViewMode("grid")}
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                viewMode === "grid"
                  ? "bg-amber-500 text-neutral-950 shadow-xs font-bold"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              }`}
              title={`Visão em Grade (${deck.cards.length} cartas)`}
              aria-label="Visão em Grade"
            >
              <LayoutGrid size={16} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl">
                Grade ({deck.cards.length})
              </div>
            </div>
          </div>

          {/* 3. Folha Impressa (A4) */}
          <div className="relative group">
            <button
              onClick={() => onChangeViewMode("sheet")}
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                viewMode === "sheet"
                  ? "bg-amber-500 text-neutral-950 shadow-xs font-bold"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              }`}
              title="Folha Impressa (Montagem A4 para gráfica)"
              aria-label="Folha Impressa"
            >
              <Printer size={16} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl">
                Folha Impressa (A4)
              </div>
            </div>
          </div>

          {/* 4. Leque 3D */}
          <div className="relative group">
            <button
              onClick={() => onChangeViewMode("stack")}
              className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                viewMode === "stack"
                  ? "bg-amber-500 text-neutral-950 shadow-xs font-bold"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              }`}
              title="Leque 3D (Apresentação interativa do baralho)"
              aria-label="Leque 3D"
            >
              <Layers size={16} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl">
                Leque 3D
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-[1px] h-5 bg-neutral-800 mx-0.5" />

        {/* GROUP 2: ACTION CONTROLS (VER VERSO & GUIAS GRÁFICAS & DEGUSTAÇÃO DEMO) */}
        <div className="flex items-center gap-1.5">
          {/* 5. Flip Card (Ver Verso / Ver Frente) */}
          <button
            onClick={handleToggleFlip}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              (viewMode === "grid" || viewMode === "sheet" || viewMode === "stack" ? showAllAsBack : isFlipped)
                ? "bg-amber-500 text-neutral-950 shadow-md font-bold"
                : "bg-neutral-800/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60"
            }`}
            title={
              viewMode === "grid"
                ? showAllAsBack
                  ? "Mostrar Frentes de Todas as Cartas"
                  : "Mostrar Versos de Todas as Cartas"
                : viewMode === "sheet"
                ? showAllAsBack
                  ? "Mostrar Folha de Frentes"
                  : "Mostrar Folha de Versos"
                : viewMode === "stack"
                ? showAllAsBack
                  ? "Mostrar Leque de Frentes"
                  : "Mostrar Leque de Versos"
                : isFlipped
                ? "Clique para Ver Frente da Carta"
                : "Clique para Ver Verso da Carta"
            }
            aria-label="Girar carta"
          >
            <RotateCw
              size={14}
              className={`transition-transform duration-500 ${
                (viewMode === "grid" || viewMode === "sheet" || viewMode === "stack" ? showAllAsBack : isFlipped)
                  ? "rotate-180"
                  : ""
              }`}
            />
            <span className="whitespace-nowrap">
              {viewMode === "grid"
                ? showAllAsBack
                  ? "Ver Frentes"
                  : "Ver Versos"
                : viewMode === "sheet"
                ? showAllAsBack
                  ? "Ver Frentes (A4)"
                  : "Ver Versos (A4)"
                : viewMode === "stack"
                ? showAllAsBack
                  ? "Leque Frentes"
                  : "Leque Versos"
                : isFlipped
                ? "Ver Frente"
                : "Ver Verso"}
            </span>
          </button>

          {/* 6. Guias Gráficas (Sangria & Corte) */}
          <div className="relative group">
            <button
              onClick={() => setShowBleedGuides(!showBleedGuides)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                showBleedGuides
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border border-transparent"
              }`}
              title="Alternar Guias Gráficas (Sangria, Linha de Corte e Margem Segura)"
              aria-label="Guias Gráficas"
            >
              <Scissors size={16} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl">
                {showBleedGuides ? "Ocultar Guias Gráficas" : "Exibir Guias Gráficas"}
              </div>
            </div>
          </div>

          {/* 7. Modo Teste de Degustação / Demo Simulador (Como o cliente vê antes de comprar) */}
          <div className="relative group">
            <button
              onClick={() => setDemoTrialPreview(!demoTrialPreview)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                demoTrialPreview
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-bold shadow-md"
                  : "text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 border border-transparent"
              }`}
              title={`Simular Degustação Demo do Cliente (${demoCardsCount} cartas liberadas)`}
              aria-label="Simular Degustação Demo"
            >
              <Sparkles size={16} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl">
                {demoTrialPreview ? "Sair da Visão Degustação" : `Visão Demo Cliente (${demoCardsCount} cartas)`}
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-[1px] h-5 bg-neutral-800 mx-0.5" />

        {/* GROUP 3: ZOOM CONTROLS */}
        <div className="flex items-center gap-0.5">
          {/* Zoom Out */}
          <div className="relative group">
            <button
              onClick={() => setZoom(Math.max(0.6, zoom - 0.15))}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              title="Reduzir Zoom"
              aria-label="Reduzir Zoom"
            >
              <ZoomOut size={15} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xl">
                Reduzir
              </div>
            </div>
          </div>

          {/* Reset Zoom / Scale Badge */}
          <div className="relative group">
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 rounded-lg text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Resetar Zoom (100%)"
              aria-label="Resetar Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xl">
                Zoom 100%
              </div>
            </div>
          </div>

          {/* Zoom In */}
          <div className="relative group">
            <button
              onClick={() => setZoom(Math.min(1.8, zoom + 0.15))}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              title="Aumentar Zoom"
              aria-label="Aumentar Zoom"
            >
              <ZoomIn size={15} />
            </button>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xl">
                Aumentar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode Simulation Top Banner */}
      {demoTrialPreview && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 bg-amber-500/90 text-neutral-950 px-4 py-1.5 rounded-full font-semibold text-xs flex items-center gap-2 shadow-xl animate-in slide-in-from-top-2">
          <Sparkles size={14} />
          <span>
            Simulando Visão do Cliente na Degustação: <strong>{demoCardsCount} cartas liberadas</strong> para teste gratuito
          </span>
          <button
            onClick={() => setDemoTrialPreview(false)}
            className="text-[10px] bg-neutral-950 text-amber-300 px-2 py-0.5 rounded-full hover:bg-neutral-900 ml-1 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Guide Legend Banner */}
      {showBleedGuides && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-neutral-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-800 text-[10px] text-neutral-400 flex items-center gap-4 shadow-lg animate-in fade-in duration-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400/80 border border-red-500 inline-block" />
            Sangria ({deck.bleedMm}mm)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Linha de Corte ({deck.customWidthMm}x{deck.customHeightMm}mm)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400/80 inline-block" />
            Margem Segura ({deck.safeMarginMm}mm)
          </span>
        </div>
      )}

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto scrollbar-thin">
        {/* VIEW MODE 1: SINGLE CARD FOCUS (with 3D Flip) */}
        {viewMode === "focus" && currentCard && (
          <div className="flex flex-col items-center justify-center gap-4 relative">
            <div className="flex items-center justify-center gap-6 relative">
              {/* Prev Card Arrow */}
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 shadow-xl transition-all active:scale-95 z-20 cursor-pointer"
                title="Carta Anterior"
              >
                <ChevronLeft size={22} />
              </button>

              {/* 3D Card Container */}
              <div
                className="relative transition-transform duration-500 ease-out"
                style={{
                  perspective: "1400px",
                  transform: `scale(${zoom})`,
                }}
              >
                {/* Card Demo Pill Floating Indicator */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                  {currentCard.isDemo ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Sparkles size={11} />
                      Carta Demo (Liberada para degustação)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-800/80 text-neutral-400 text-[10px] font-medium flex items-center gap-1">
                      <Lock size={10} />
                      Exclusiva do Baralho Completo
                    </span>
                  )}
                </div>

                {/* Locked Overlay if in customer demo preview and card is not demo */}
                {demoTrialPreview && !currentCard.isDemo && (
                  <div className="absolute inset-0 z-30 bg-neutral-950/85 backdrop-blur-[3px] rounded-xl flex flex-col items-center justify-center p-6 text-center border border-amber-500/30">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3 shadow-lg">
                      <Lock size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-neutral-100 mb-1">
                      Carta Bloqueada no Demo
                    </h4>
                    <p className="text-xs text-neutral-400 max-w-xs mb-3">
                      Esta carta faz parte do baralho completo. Na degustação, o cliente vê as cartas marcadas como Demo para experimentar antes de comprar.
                    </p>
                    {onToggleDemoCard && (
                      <button
                        onClick={() => onToggleDemoCard(currentCard.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Sparkles size={13} />
                        Liberar no Demo
                      </button>
                    )}
                  </div>
                )}

                {/* The Flippable 3D Card */}
                <div
                  className="relative transition-all duration-700 ease-in-out cursor-pointer select-none"
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                  onClick={() => setIsFlipped(!isFlipped)}
                  title="Clique na carta para alternar entre Frente e Verso"
                >
                  {/* Front Face */}
                  <div
                    className="absolute inset-0 rounded-xl shadow-2xl transition-opacity duration-300"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(0deg)",
                      zIndex: isFlipped ? 0 : 2,
                      pointerEvents: isFlipped ? "none" : "auto",
                    }}
                  >
                    <CardFront
                      card={currentCard}
                      deck={deck}
                      showBleedGuides={showBleedGuides}
                    />
                  </div>

                  {/* Back Face (Flipped) */}
                  <div
                    className="absolute inset-0 rounded-xl shadow-2xl transition-opacity duration-300"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      zIndex: isFlipped ? 2 : 0,
                      pointerEvents: isFlipped ? "auto" : "none",
                    }}
                  >
                    <CardBack
                      deck={deck}
                      showBleedGuides={showBleedGuides}
                    />
                  </div>
                </div>
              </div>

              {/* Next Card Arrow */}
              <button
                onClick={handleNext}
                className="p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 shadow-xl transition-all active:scale-95 z-20 cursor-pointer"
                title="Próxima Carta"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Quick interactive flip button below card */}
            <div className="z-20 mt-2">
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg border transition-all cursor-pointer ${
                  isFlipped
                    ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-300 font-bold"
                    : "bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border-amber-500/30 hover:border-amber-500/60"
                }`}
              >
                <RotateCw size={13} className={`transition-transform duration-500 ${isFlipped ? "rotate-180" : ""}`} />
                <span>{isFlipped ? "Exibindo VERSO (Clique para ver a Frente)" : "Exibindo FRENTE (Clique para ver o Verso)"}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: GRID OF ALL CARDS */}
        {viewMode === "grid" && (
          <div className="w-full h-full max-w-6xl mx-auto p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-neutral-400">
                Mostrando <strong className="text-neutral-200">{deck.cards.length} cartas</strong> •{" "}
                <span className="text-amber-300 font-semibold">{demoCardsCount} no Demo de degustação</span>
              </div>
              <button
                onClick={() => setShowAllAsBack(!showAllAsBack)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw size={13} className={showAllAsBack ? "rotate-180 transition-transform" : ""} />
                <span>{showAllAsBack ? "Mostrar Frentes" : "Mostrar Versos"}</span>
              </button>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            >
              {deck.cards.map((card) => {
                const isSelected = card.id === selectedCardId;
                const isLockedInDemoPreview = demoTrialPreview && !card.isDemo;

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      onSelectCard(card.id);
                      onChangeViewMode("focus");
                    }}
                    className={`cursor-pointer rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl relative group ${
                      isSelected ? "ring-4 ring-amber-500" : ""
                    }`}
                  >
                    {/* Demo Corner Ribbon */}
                    {card.isDemo && (
                      <div className="absolute top-2 right-2 z-20 bg-amber-500 text-neutral-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-amber-300">
                        <Sparkles size={10} />
                        DEMO
                      </div>
                    )}

                    {/* Customer Trial Locked Overlay */}
                    {isLockedInDemoPreview && (
                      <div className="absolute inset-0 z-20 bg-neutral-950/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-3 text-center border border-neutral-700/60">
                        <Lock size={18} className="text-amber-400/90 mb-1" />
                        <span className="text-[11px] font-bold text-neutral-200">
                          Bloqueado no Demo
                        </span>
                        <span className="text-[9px] text-neutral-400 mt-0.5">
                          Apenas no Baralho Completo
                        </span>
                      </div>
                    )}

                    {showAllAsBack ? (
                      <CardBack deck={deck} scale={0.75} />
                    ) : (
                      <CardFront card={card} deck={deck} scale={0.75} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE 3: PRINT SHEET SIMULATION (A4) */}
        {viewMode === "sheet" && (
          <div className="flex flex-col items-center gap-4 max-w-full overflow-auto py-8">
            <div className="flex items-center gap-3">
              <div className="text-xs text-neutral-400 text-center">
                Simulação de Montagem em <strong className="text-neutral-200">Folha A4</strong> para Gráfica (Frente e Verso Alinhados)
              </div>
              <button
                onClick={() => setShowAllAsBack(!showAllAsBack)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer font-medium shadow-sm transition-all"
              >
                <RotateCw size={12} className={showAllAsBack ? "rotate-180 transition-transform" : ""} />
                <span>{showAllAsBack ? "Ver Folha de Frentes" : "Ver Folha de Versos"}</span>
              </button>
            </div>

            <div
              className="bg-white rounded-lg shadow-2xl p-6 flex flex-wrap gap-4 justify-center items-center border border-neutral-300"
              style={{
                width: "680px",
                minHeight: "900px",
                transform: `scale(${zoom * 0.9})`,
                transformOrigin: "top center",
              }}
            >
              {deck.cards.slice(0, 4).map((card) => (
                <div key={card.id} className="border border-neutral-300 relative rounded-lg overflow-hidden">
                  {card.isDemo && !showAllAsBack && (
                    <span className="absolute top-1 right-1 z-10 bg-amber-500 text-neutral-950 text-[8px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                      DEMO
                    </span>
                  )}
                  {showAllAsBack ? (
                    <CardBack deck={deck} showBleedGuides={true} scale={0.65} />
                  ) : (
                    <CardFront card={card} deck={deck} showBleedGuides={true} scale={0.65} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW MODE 4: 3D DECK FAN STACK */}
        {viewMode === "stack" && (
          <div className="flex flex-col items-center justify-center h-full relative">
            <div className="absolute top-14 z-20">
              <button
                onClick={() => setShowAllAsBack(!showAllAsBack)}
                className="px-3.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 text-xs rounded-xl border border-amber-500/30 flex items-center gap-1.5 cursor-pointer shadow-xl font-medium transition-all"
              >
                <RotateCw size={12} className={showAllAsBack ? "rotate-180 transition-transform" : ""} />
                <span>{showAllAsBack ? "Mostrar Leque de Frentes" : "Mostrar Leque de Versos"}</span>
              </button>
            </div>

            <div
              className="flex items-center justify-center h-full relative mt-8"
              style={{ transform: `scale(${zoom})` }}
            >
              <div className="relative w-80 h-96 flex items-center justify-center">
                {deck.cards.slice(0, 7).map((card, i) => {
                  const total = Math.min(deck.cards.length, 7);
                  const angle = (i - Math.floor(total / 2)) * 8;
                  const offsetX = (i - Math.floor(total / 2)) * 32;

                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        onSelectCard(card.id);
                        onChangeViewMode("focus");
                      }}
                      className="absolute cursor-pointer transition-all duration-300 hover:z-50 hover:scale-105"
                      style={{
                        transform: `translateX(${offsetX}px) rotate(${angle}deg)`,
                        transformOrigin: "bottom center",
                        zIndex: i,
                      }}
                    >
                      {card.isDemo && !showAllAsBack && (
                        <span className="absolute top-2 right-2 z-30 bg-amber-500 text-neutral-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md">
                          DEMO
                        </span>
                      )}
                      {showAllAsBack ? (
                        <CardBack deck={deck} scale={0.8} />
                      ) : (
                        <CardFront card={card} deck={deck} scale={0.8} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

