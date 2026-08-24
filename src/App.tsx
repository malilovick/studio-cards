import React, { useState, useEffect, useRef } from "react";
import { User } from "firebase/auth";
import { CardItem, DeckConfig, DeckStyleConfig, UserRole } from "./types";
import { DEFAULT_DECK_CONFIG } from "./data/sampleDecks";
import { Navbar } from "./components/Navbar";
import { AdminSidebar, AdminTab } from "./components/AdminSidebar";
import { DashboardView } from "./components/DashboardView";
import { CollectionsView } from "./components/CollectionsView";
import { AccessView } from "./components/AccessView";
import { DocsView } from "./components/DocsView";
import { CardBacksView } from "./components/CardBacksView";
import { DeckManager } from "./components/DeckManager";
import { DesignSidebar } from "./components/DesignSidebar";
import { CardCanvas } from "./components/CardCanvas";
import { CardFront } from "./components/CardFront";
import { CardBack } from "./components/CardBack";
import { AiGeneratorModal } from "./components/AiGeneratorModal";
import { ExportModal } from "./components/ExportModal";
import { PrintGuideModal } from "./components/PrintGuideModal";
import { BatchImportModal } from "./components/BatchImportModal";
import { LoginScreen } from "./components/LoginScreen";
import { AccessDeniedScreen } from "./components/AccessDeniedScreen";
import { UserManagementModal } from "./components/UserManagementModal";
import { CollectionsModal } from "./components/CollectionsModal";
import { ShareDeckModal } from "./components/ShareDeckModal";
import {
  auth,
  checkUserAuthorization,
  subscribeAccessRequests,
  saveDeckToCloud,
  subscribeUserDecks,
  cloneDeckToMyAccount,
} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Layers, Loader2 } from "lucide-react";

export function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("editor");
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Admin Navigation & Gmail-style layout state
  const [currentTab, setCurrentTab] = useState<AdminTab>("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return window.innerWidth < 1280;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Collections & Multi-Deck State
  const [myDecks, setMyDecks] = useState<DeckConfig[]>([]);
  const [sharedDecks, setSharedDecks] = useState<DeckConfig[]>([]);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [deckToShare, setDeckToShare] = useState<DeckConfig | null>(null);

  // User Management Modal
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  // Cloud sync
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [lastCloudSave, setLastCloudSave] = useState<string | null>(null);

  // Active Deck State
  const [deck, setDeck] = useState<DeckConfig>(() => {
    try {
      const saved = localStorage.getItem("terapia_cards_deck_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao carregar estado salvo:", e);
    }
    return DEFAULT_DECK_CONFIG;
  });

  const [selectedCardId, setSelectedCardId] = useState<string>(() => {
    return deck.cards[0]?.id || "card-1";
  });

  const [viewMode, setViewMode] = useState<"focus" | "grid" | "sheet" | "stack">("focus");
  const [isCanvasFlipped, setIsCanvasFlipped] = useState(false);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrintGuideOpen, setIsPrintGuideOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  // Mobile sidebar drawers
  const [mobileTab, setMobileTab] = useState<"cards" | "canvas" | "design">("canvas");

  // Authentication & Authorization Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      setCurrentUser(user);

      if (user) {
        try {
          const authStatus = await checkUserAuthorization(user);
          setIsAuthorized(authStatus.isAuthorized);
          setIsAdmin(authStatus.isAdmin);
          setUserRole(authStatus.role);
        } catch (err) {
          console.error("Erro ao verificar autorização:", err);
          setIsAuthorized(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthorized(false);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time user decks (Owned + Shared)
  useEffect(() => {
    if (!currentUser?.email || !isAuthorized) return;

    const unsub = subscribeUserDecks(currentUser.email, (mine, shared) => {
      setMyDecks(mine);
      setSharedDecks(shared);

      // If user hasn't customized their local deck or active deck matches a cloud deck, sync
      if (mine.length > 0 && deck.id === DEFAULT_DECK_CONFIG.id) {
        const first = mine[0];
        setDeck(first);
        if (first.cards.length > 0) {
          setSelectedCardId(first.cards[0].id);
        }
      }
    });

    return () => unsub();
  }, [currentUser, isAuthorized]);

  // Listen to pending requests for Admin badge
  useEffect(() => {
    if (!isAdmin) return;
    const unsubReqs = subscribeAccessRequests((reqs) => {
      const pending = reqs.filter((r) => r.status === "pending");
      setPendingRequestsCount(pending.length);
    });
    return () => unsubReqs();
  }, [isAdmin]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("terapia_cards_deck_v1", JSON.stringify(deck));
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }
  }, [deck]);

  // Cloud Save handler
  const handleSaveToCloud = async () => {
    if (!currentUser || !isAuthorized || !currentUser.email) return;
    if (deck.isReadOnly) {
      alert("Este baralho está em modo de visualização. Faça uma cópia para salvar edições.");
      return;
    }

    setIsSavingToCloud(true);
    try {
      await saveDeckToCloud(
        deck,
        currentUser.uid,
        currentUser.email,
        currentUser.displayName || currentUser.email.split("@")[0]
      );
      setLastCloudSave(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      alert("Baralho salvo com sucesso na nuvem!");
    } catch (e) {
      console.error("Erro ao salvar na nuvem:", e);
      alert("Não foi possível salvar na nuvem no momento.");
    } finally {
      setIsSavingToCloud(false);
    }
  };

  // Switch Active Deck
  const handleSelectDeck = (newDeck: DeckConfig) => {
    setDeck(newDeck);
    if (newDeck.cards && newDeck.cards.length > 0) {
      setSelectedCardId(newDeck.cards[0].id);
    }
  };

  // Clone Active Deck to My Account
  const handleCloneActiveDeck = async () => {
    if (!currentUser) return;
    try {
      const cloned = await cloneDeckToMyAccount(deck, currentUser);
      setDeck(cloned);
      if (cloned.cards && cloned.cards.length > 0) {
        setSelectedCardId(cloned.cards[0].id);
      }
      alert(`Cópia editável criada com sucesso! Agora você é o proprietário de "${cloned.deckTitle}".`);
    } catch (e) {
      console.error("Erro ao clonar baralho:", e);
      alert("Não foi possível criar a cópia editável.");
    }
  };

  // Clone any target Deck to My Account and switch to it
  const handleCloneDeckDirect = async (targetDeck: DeckConfig) => {
    if (!currentUser) return;
    try {
      const cloned = await cloneDeckToMyAccount(targetDeck, currentUser);
      setDeck(cloned);
      if (cloned.cards && cloned.cards.length > 0) {
        setSelectedCardId(cloned.cards[0].id);
      }
      alert(`Cópia editável criada com sucesso! Agora você é o proprietário de "${cloned.deckTitle}".`);
      setCurrentTab("studio");
    } catch (e) {
      console.error("Erro ao clonar baralho:", e);
      alert("Não foi possível criar a cópia editável.");
    }
  };

  // Open Share Modal for a specific deck or current deck
  const handleOpenShareModal = (targetDeck?: DeckConfig) => {
    const d = targetDeck || deck;
    if (d.isReadOnly) {
      alert("Você só pode gerenciar o compartilhamento de baralhos que você mesmo criou.");
      return;
    }
    setDeckToShare(d);
    setIsShareModalOpen(true);
  };

  // Update handlers
  const handleUpdateDeck = (updated: Partial<DeckConfig>) => {
    if (deck.isReadOnly) return;
    setDeck((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateStyle = (updated: Partial<DeckStyleConfig>) => {
    if (deck.isReadOnly) return;
    setDeck((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        ...updated,
      },
    }));
  };

  const handleLoadDeckPreset = (newDeck: DeckConfig) => {
    if (deck.isReadOnly) return;
    setDeck(newDeck);
    if (newDeck.cards.length > 0) {
      setSelectedCardId(newDeck.cards[0].id);
    }
  };

  const handleAddCard = () => {
    if (deck.isReadOnly) return;
    const newNumber = String(deck.cards.length + 1).padStart(2, "0");
    const newCard: CardItem = {
      id: `card-${Date.now()}`,
      number: newNumber,
      title: "NOVA CARTA",
      category: "Reflexão",
      affirmation: "Eu me permito acolher este momento com serenidade e abertura.",
      reflection:
        "Cada instante traz a oportunidade de recomeçar com mais clareza, gentileza e verdade interior.",
      soulQuestion: "Qual verdade do seu coração pede para ser escutada hoje?",
      actionPrompt: "Feche os olhos, respire fundo 3 vezes e sinta o seu coração.",
    };

    setDeck((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
    setSelectedCardId(newCard.id);
  };

  const handleDuplicateCard = (card: CardItem) => {
    if (deck.isReadOnly) return;
    const newCard: CardItem = {
      ...card,
      id: `card-${Date.now()}`,
      number: String(deck.cards.length + 1).padStart(2, "0"),
      title: `${card.title} (CÓPIA)`,
    };

    setDeck((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
    setSelectedCardId(newCard.id);
  };

  const handleDeleteCard = (id: string) => {
    if (deck.isReadOnly) return;
    if (deck.cards.length <= 1) return;
    const newCards = deck.cards.filter((c) => c.id !== id);
    setDeck((prev) => ({ ...prev, cards: newCards }));
    if (selectedCardId === id && newCards.length > 0) {
      setSelectedCardId(newCards[0].id);
    }
  };

  const handleUpdateCard = (id: string, updated: Partial<CardItem>) => {
    if (deck.isReadOnly) return;
    setDeck((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    }));
  };

  const handleApplyAiCards = (cards: CardItem[], deckTitle?: string, deckSubtitle?: string) => {
    if (deck.isReadOnly) return;
    setDeck((prev) => ({
      ...prev,
      deckTitle: deckTitle || prev.deckTitle,
      deckSubtitle: deckSubtitle || prev.deckSubtitle,
      cards: cards,
    }));
    if (cards.length > 0) {
      setSelectedCardId(cards[0].id);
    }
  };

  const handleBatchImport = (importedCards: CardItem[]) => {
    if (deck.isReadOnly) return;
    setDeck((prev) => ({
      ...prev,
      cards: [...prev.cards, ...importedCards],
    }));
    if (importedCards.length > 0) {
      setSelectedCardId(importedCards[0].id);
    }
  };

  const handleAiEnhanceCard = async (card: CardItem) => {
    if (deck.isReadOnly) return;
    setIsAiEnhancing(true);
    try {
      const res = await fetch("/api/enhance-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardTitle: card.title,
          affirmation: card.affirmation,
          reflection: card.reflection,
          soulQuestion: card.soulQuestion,
          category: card.category,
        }),
      });

      if (!res.ok) throw new Error("Falha ao aprimorar com IA");

      const enhanced = await res.json();
      handleUpdateCard(card.id, {
        affirmation: enhanced.affirmation || card.affirmation,
        reflection: enhanced.reflection || card.reflection,
        soulQuestion: enhanced.soulQuestion || card.soulQuestion,
        actionPrompt: enhanced.actionPrompt || card.actionPrompt,
        category: enhanced.category || card.category,
      });
    } catch (err) {
      console.error(err);
      alert("Não foi possível aprimorar a carta com IA no momento.");
    } finally {
      setIsAiEnhancing(false);
    }
  };

  // Map of hidden elements for high-res export rendering
  const frontElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const backExportElementRef = useRef<HTMLElement | null>(null);

  // 1. Initial Loading Spinner
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center text-neutral-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-500 p-0.5 flex items-center justify-center mb-4 animate-pulse">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-300">
            <Layers size={24} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 size={16} className="animate-spin text-amber-400" />
          <span>Verificando credenciais de acesso seguro...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Show Google Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // 3. Authenticated but Unauthorized: Show Access Denied & Request Screen
  if (!isAuthorized) {
    return (
      <AccessDeniedScreen
        user={currentUser}
        onRefreshAuth={async () => {
          setAuthLoading(true);
          const st = await checkUserAuthorization(currentUser);
          setIsAuthorized(st.isAuthorized);
          setIsAdmin(st.isAdmin);
          setUserRole(st.role);
          setAuthLoading(false);
        }}
      />
    );
  }

  // 4. Authorized Workspace
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Expandable / Collapsible Hamburger Admin Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        user={currentUser}
        isAdmin={isAdmin}
        userRole={userRole}
        pendingRequestsCount={pendingRequestsCount}
        totalDecksCount={myDecks.length + sharedDecks.length}
        activeDeckCardsCount={deck.cards.length}
        activeDeckTitle={deck.deckTitle}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Workspace Area (Top Navbar + Dynamic View) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar
          currentTab={currentTab}
          onChangeTab={(tab) => setCurrentTab(tab)}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          deck={deck}
          onUpdateDeck={handleUpdateDeck}
          onLoadDeckPreset={handleLoadDeckPreset}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenPrintGuide={() => setCurrentTab("docs")}
          onOpenBatchImport={() => setIsBatchImportOpen(true)}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          user={currentUser}
          isAdmin={isAdmin}
          userRole={userRole}
          pendingRequestsCount={pendingRequestsCount}
          onOpenUserManagement={() => setCurrentTab("access")}
          isSavingToCloud={isSavingToCloud}
          onSaveToCloud={handleSaveToCloud}
          onOpenCollectionsModal={() => setCurrentTab("collections")}
          onOpenShareModal={() => handleOpenShareModal()}
          onCloneActiveDeck={handleCloneActiveDeck}
        />

        {/* 1. VIEW: HOME (DASHBOARD) */}
        {currentTab === "home" && (
          <DashboardView
            user={currentUser}
            userRole={userRole}
            isAdmin={isAdmin}
            myDecks={myDecks}
            sharedDecks={sharedDecks}
            activeDeck={deck}
            onSelectDeck={(d) => {
              handleSelectDeck(d);
              setCurrentTab("studio");
            }}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenBatchImport={() => setIsBatchImportOpen(true)}
            onOpenPrintGuide={() => setCurrentTab("docs")}
            onOpenShareModal={(d) => handleOpenShareModal(d)}
            onCloneDeck={handleCloneDeckDirect}
            pendingRequestsCount={pendingRequestsCount}
            lastCloudSave={lastCloudSave}
          />
        )}

        {/* 2. VIEW: COLEÇÕES */}
        {currentTab === "collections" && (
          <CollectionsView
            user={currentUser}
            myDecks={myDecks}
            sharedDecks={sharedDecks}
            currentDeck={deck}
            onSelectDeck={(d) => {
              handleSelectDeck(d);
              setCurrentTab("studio");
            }}
            onOpenShareModal={(d) => handleOpenShareModal(d)}
            onOpenStudio={() => setCurrentTab("studio")}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {/* 3. VIEW: ACESSO */}
        {currentTab === "access" && (
          <AccessView
            currentUser={currentUser}
            isAdmin={isAdmin}
            userRole={userRole}
          />
        )}

        {/* 4. VIEW: DOCS */}
        {currentTab === "docs" && <DocsView />}

        {/* 5. VIEW: VERSOS DAS CARTAS (CRIADOR E GERENCIADOR DE VERSOS) */}
        {currentTab === "card-backs" && (
          <CardBacksView
            deck={deck}
            onUpdateDeck={handleUpdateDeck}
            onUpdateStyle={handleUpdateStyle}
            onNavigateToStudio={() => setCurrentTab("studio")}
          />
        )}

        {/* 6. VIEW: ESTÚDIO (Canvas + DeckManager + DesignSidebar) */}
        {currentTab === "studio" && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-neutral-900 border-b border-neutral-800 text-xs">
              <button
                onClick={() => setMobileTab("cards")}
                className={`flex-1 py-2 font-medium text-center border-b-2 transition-all ${
                  mobileTab === "cards"
                    ? "border-amber-500 text-amber-400 font-semibold"
                    : "border-transparent text-neutral-400"
                }`}
              >
                Cartas ({deck.cards.length})
              </button>
              <button
                onClick={() => setMobileTab("canvas")}
                className={`flex-1 py-2 font-medium text-center border-b-2 transition-all ${
                  mobileTab === "canvas"
                    ? "border-amber-500 text-amber-400 font-semibold"
                    : "border-transparent text-neutral-400"
                }`}
              >
                Visualizador 3D
              </button>
              <button
                onClick={() => setMobileTab("design")}
                className={`flex-1 py-2 font-medium text-center border-b-2 transition-all ${
                  mobileTab === "design"
                    ? "border-amber-500 text-amber-400 font-semibold"
                    : "border-transparent text-neutral-400"
                }`}
              >
                Design & Gráfica
              </button>
            </div>

            {/* Main Studio Body: 3-Column Layout */}
            <div className="flex-1 flex overflow-hidden relative min-h-0">
              {/* Left Column: Deck & Cards Manager */}
              <div className={`${mobileTab === "cards" ? "flex" : "hidden"} lg:flex h-full`}>
                <DeckManager
                  deck={deck}
                  selectedCardId={selectedCardId}
                  onSelectCard={(id) => {
                    setSelectedCardId(id);
                    setMobileTab("canvas");
                  }}
                  onAddCard={handleAddCard}
                  onDuplicateCard={handleDuplicateCard}
                  onDeleteCard={handleDeleteCard}
                  onUpdateCard={handleUpdateCard}
                  onOpenBatchImport={() => setIsBatchImportOpen(true)}
                  onAiEnhanceCard={handleAiEnhanceCard}
                  isAiEnhancing={isAiEnhancing}
                  isFlipped={isCanvasFlipped}
                  onToggleFlip={() => setIsCanvasFlipped((prev) => !prev)}
                />
              </div>

              {/* Center Column: Interactive Visual 3D Canvas */}
              <div className={`${mobileTab === "canvas" ? "flex" : "hidden"} lg:flex flex-1 h-full`}>
                <CardCanvas
                  deck={deck}
                  selectedCardId={selectedCardId}
                  onSelectCard={setSelectedCardId}
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                  isFlipped={isCanvasFlipped}
                  onToggleFlip={() => setIsCanvasFlipped((prev) => !prev)}
                  onToggleDemoCard={(id) => {
                    const targetCard = deck.cards.find((c) => c.id === id);
                    if (targetCard) {
                      handleUpdateCard(id, { isDemo: !targetCard.isDemo });
                    }
                  }}
                />
              </div>

              {/* Right Column: Design & Print Inspector */}
              <div className={`${mobileTab === "design" ? "flex" : "hidden"} lg:flex h-full`}>
                <DesignSidebar
                  deck={deck}
                  onUpdateDeck={handleUpdateDeck}
                  onUpdateStyle={handleUpdateStyle}
                  onOpenCardBacksManager={() => setCurrentTab("card-backs")}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HIDDEN OFFSCREEN RENDER TARGETS FOR HIGH-RES EXPORT */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-100">
        {/* Master Back for Export */}
        <div
          ref={(el) => {
            backExportElementRef.current = el;
          }}
          id="export-card-back-master"
        >
          <CardBack deck={deck} showBleedGuides={false} isExporting={true} />
        </div>

        {/* All Front Cards for Export */}
        {deck.cards.map((card) => (
          <div
            key={`export-${card.id}`}
            id={`export-${card.id}`}
            ref={(el) => {
              if (el) {
                frontElementsRef.current.set(card.id, el);
              } else {
                frontElementsRef.current.delete(card.id);
              }
            }}
          >
            <CardFront card={card} deck={deck} showBleedGuides={false} isExporting={true} />
          </div>
        ))}
      </div>

      {/* MODALS */}
      {/* 1. Collections & Multi-Deck Manager Modal */}
      <CollectionsModal
        isOpen={isCollectionsOpen}
        onClose={() => setIsCollectionsOpen(false)}
        currentDeck={deck}
        myDecks={myDecks}
        sharedDecks={sharedDecks}
        user={currentUser}
        onSelectDeck={handleSelectDeck}
        onOpenShareModal={(d) => handleOpenShareModal(d)}
      />

      {/* 2. Share Deck Modal */}
      {deckToShare && (
        <ShareDeckModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setDeckToShare(null);
          }}
          deck={deckToShare}
          currentUser={currentUser}
          onDeckUpdated={(updated) => {
            if (deck.id === updated.id) {
              setDeck((prev) => ({ ...prev, ...updated }));
            }
            setDeckToShare((prev) => (prev ? { ...prev, ...updated } : null));
          }}
        />
      )}

      {/* 3. AI Generation Modal */}
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyGeneratedCards={handleApplyAiCards}
      />

      {/* 4. PDF / PNG Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        deck={deck}
        frontElementsMap={frontElementsRef.current}
        backElement={backExportElementRef.current}
      />

      {/* 5. Print & Graphics Guide Modal */}
      <PrintGuideModal
        isOpen={isPrintGuideOpen}
        onClose={() => setIsPrintGuideOpen(false)}
      />

      {/* 6. Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        onImportCards={handleBatchImport}
        currentCount={deck.cards.length}
      />

      {/* 7. Access / Whitelist Management Modal (for Admins) */}
      <UserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        currentUserEmail={currentUser.email || ""}
      />
    </div>
  );
}

export default App;


