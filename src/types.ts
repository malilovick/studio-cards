export type CardOrientation = "portrait" | "landscape";

export interface CardSizePreset {
  id: string;
  name: string;
  category: "standard" | "tarot" | "oracle" | "pocket" | "custom";
  widthMm: number;
  heightMm: number;
  description: string;
  aspectRatio: string;
}

export type PublicationStatus =
  | "published"     // Publicado (Publish): Visível para qualquer visitante do site / visualizadores
  | "unpublished"   // Despublicado (Unpublish): Item não poderá ser visualizado pelos visitantes
  | "draft"         // Rascunho (Draft): Conteúdo incompleto, visível apenas para o autor/usuários com permissão
  | "pending"       // Pendente (Pending): Aguarda a revisão e aprovação de alguém
  | "scheduled"     // Agendado (Future/Scheduled): Programado para ir ao ar automaticamente em data e hora futuras
  | "trash"         // Lixeira (Trash): Itens removidos que aguardam exclusão definitiva
  | "auto_draft";   // Rascunho automático (Auto-draft): Criado automaticamente durante a edição

export interface PublicationStatusInfo {
  id: PublicationStatus;
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  dotColor: string;
}

export const PUBLICATION_STATUS_MAP: Record<PublicationStatus, PublicationStatusInfo> = {
  published: {
    id: "published",
    label: "Publicado (Publish)",
    shortLabel: "Publicado",
    description: "Visível para qualquer visitante e terapeuta autorizado.",
    badgeBg: "bg-emerald-500/20",
    badgeText: "text-emerald-300",
    borderColor: "border-emerald-500/40",
    dotColor: "bg-emerald-400",
  },
  unpublished: {
    id: "unpublished",
    label: "Despublicado (Unpublish)",
    shortLabel: "Despublicado",
    description: "Item não poderá ser visualizado pelos visitantes.",
    badgeBg: "bg-neutral-800",
    badgeText: "text-neutral-400",
    borderColor: "border-neutral-700",
    dotColor: "bg-neutral-500",
  },
  draft: {
    id: "draft",
    label: "Rascunho (Draft)",
    shortLabel: "Rascunho",
    description: "Conteúdo incompleto, visível apenas para usuários com permissão.",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-300",
    borderColor: "border-amber-500/40",
    dotColor: "bg-amber-400",
  },
  pending: {
    id: "pending",
    label: "Pendente (Pending)",
    shortLabel: "Pendente",
    description: "Aguarda a revisão e aprovação de um terapeuta/responsável.",
    badgeBg: "bg-orange-500/20",
    badgeText: "text-orange-300",
    borderColor: "border-orange-500/40",
    dotColor: "bg-orange-400",
  },
  scheduled: {
    id: "scheduled",
    label: "Agendado (Scheduled)",
    shortLabel: "Agendado",
    description: "Programado para ir ao ar automaticamente em data e hora futuras.",
    badgeBg: "bg-blue-500/20",
    badgeText: "text-blue-300",
    borderColor: "border-blue-500/40",
    dotColor: "bg-blue-400",
  },
  trash: {
    id: "trash",
    label: "Lixeira (Trash)",
    shortLabel: "Lixeira",
    description: "Item removido aguardando exclusão definitiva ou restauração.",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-300",
    borderColor: "border-rose-500/40",
    dotColor: "bg-rose-400",
  },
  auto_draft: {
    id: "auto_draft",
    label: "Rascunho Automático (Auto-draft)",
    shortLabel: "Auto-draft",
    description: "Salvo sozinho pelo sistema enquanto você escreve.",
    badgeBg: "bg-purple-500/20",
    badgeText: "text-purple-300",
    borderColor: "border-purple-500/40",
    dotColor: "bg-purple-400",
  },
};

export interface CardItem {
  id: string;
  number: string; // e.g. "01"
  title: string; // e.g. "ACEITAÇÃO"
  category?: string; // e.g. "Presença", "Cura", "Emoções"
  affirmation: string; // e.g. "Eu me permito ser quem sou, sem precisar me encaixar nas expectativas de ninguém"
  reflection: string; // e.g. "Grande parte do sofrimento nasce quando tentamos nos tornar alguém diferente..."
  soulQuestion: string; // e.g. "Qual parte de mim ainda busca permissão para existir?"
  actionPrompt?: string; // e.g. "Faça 3 respirações profundas e anote um sentimento..."
  quote?: string;
  customImage?: string;
  customBgColor?: string;
  customTextColor?: string;
  
  // Publication Status for Card
  status?: PublicationStatus;
  scheduledAt?: string;
  trashedAt?: string;
  
  // Demo / Preview status
  isDemo?: boolean; // Indica se esta carta faz parte da degustação/demo gratuita para testes do cliente antes da compra
}

export interface ThemeColors {
  primaryAccent: string; // e.g. gold, bronze, terracotta #B8860B or #985E6D
  secondaryAccent: string; // e.g. blush #C48B9F or sage #7A9A8B
  backgroundBase: string; // e.g. #FFF9F5 or #FBF7F2
  backgroundGradientEnd?: string; // for soft watercolor fades
  cardSurface: string; // inner box bg e.g. #F5EAE6 or #FFFFFF
  textPrimary: string; // e.g. #4A2E35 or #2D3748
  textSecondary: string; // e.g. #7E5A65 or #555555
  borderAccent: string; // e.g. #D4AF37 or #E2C4C9
  badgeBg: string; // e.g. #6B3E4E
  badgeText: string; // e.g. #FFFFFF
  boxBg: string; // e.g. #F7ECE8 with slight opacity
}

export type BorderStyle = "double-gold" | "botanical-corners" | "classic-ornate" | "minimal-line" | "rounded-modern" | "none";
export type TopOrnament = "lotus" | "tree" | "sunburst" | "sacred-geometry" | "mandala" | "butterfly" | "heart" | "feather" | "none" | "custom-logo";
export type BackStyle = "tree-of-life" | "mandala-gold" | "botanical-zen" | "celestial-stars" | "minimal-brand" | "custom-image";

export interface CardBackConfig {
  id?: string;
  name?: string; // e.g. "Essência Rosê & Ouro Oficial"
  
  // Background
  bgType: "watercolor-pink" | "gradient" | "solid" | "custom-image";
  bgColor: string;
  bgGradientEnd?: string;
  bgOpacity: number; // 0.1 to 1.0
  customBgImage?: string; // image upload or URL

  // Frame / Moldura
  frameType: "golden-ornate" | "double-line" | "geometric" | "single-fine" | "custom-image" | "none";
  frameColor: string;
  frameOpacity: number;
  frameWidthMm?: number;
  customFrameImage?: string; // image upload for golden frame

  // Botanical Foliage Corners (Cantos de Folhagens)
  showCornerBotanicals: boolean;
  cornerBotanicalType: "watercolor-pink" | "golden-line" | "custom-images";
  cornerSize: number; // e.g. 40 to 120
  cornerOpacity: number;
  showTopLeftCorner?: boolean;
  showTopRightCorner?: boolean;
  showBottomLeftCorner?: boolean;
  showBottomRightCorner?: boolean;
  customTopLeftCornerImage?: string;
  customTopRightCornerImage?: string;
  customBottomLeftCornerImage?: string;
  customBottomRightCornerImage?: string;

  // Top Emblem / Logo (Árvore da Vida / Mandala / Logo)
  showTopEmblem: boolean;
  emblemType: "tree-of-life" | "mandala" | "lotus" | "sunburst" | "sacred-geometry" | "custom-logo" | "none";
  emblemSize: number; // e.g. 80 to 180
  emblemColor?: string;
  customEmblemImage?: string; // custom logo url/upload
  treePalette?: {
    pink: string;
    blue: string;
    white: string;
    trunk: string;
  };

  // Top Header Dots
  showHeaderDots?: boolean;

  // Collection Title / Eyebrow
  showCollectionEyebrow: boolean;
  collectionEyebrowText?: string; // e.g. "COLEÇÃO"
  collectionEyebrowFont?: string;
  collectionEyebrowSize?: number;
  collectionEyebrowTracking?: string;
  collectionEyebrowColor?: string;
  
  showCollectionTitle: boolean;
  collectionTitleText?: string; // override or uses deck.collectionName
  collectionTitleFont?: string;
  collectionTitleSize?: number;
  collectionTitleColor?: string;
  collectionTitleStyle?: "gold-gradient" | "solid" | "embossed";

  // Middle Divider
  showDivider: boolean;
  dividerType: "heart-line" | "lotus-line" | "mandala-line" | "simple-line" | "custom-image" | "none";
  dividerColor: string;
  dividerWidth: number;
  customDividerImage?: string;

  // Mantra / Subtitle Quote
  showQuote: boolean;
  quoteText?: string; // override or uses deck.deckSubtitle
  quoteFont?: string;
  quoteSize?: number;
  quoteColor?: string;
  quoteItalic?: boolean;
  quoteWithQuotes?: boolean; // includes "..."

  // Lower Ornament (Flor de Lótus do Meio/Inferior)
  showLowerOrnament: boolean;
  lowerOrnamentType: "lotus" | "heart" | "sun" | "custom-image" | "none";
  lowerOrnamentSize: number;
  lowerOrnamentColor?: string;
  customLowerOrnamentImage?: string;

  // Therapist / Signature Footer
  showAuthorSignature: boolean;
  signatureMode: "text-script" | "custom-image";
  authorName?: string; // override or uses deck.authorName
  signatureFont?: string;
  signatureSize?: number;
  signatureColor?: string;
  customSignatureImage?: string; // upload or preset

  // Author Specialty / Role
  showAuthorRole: boolean;
  authorRoleText?: string; // override or uses deck.authorRole
  authorRoleFont?: string;
  authorRoleSize?: number;
  authorRoleTracking?: string;
  authorRoleColor?: string;

  // Footer Dots / Bottom Accent
  showFooterAccent: boolean;
  footerAccentType: "three-dots" | "heart" | "none";
  footerAccentColor?: string;
}

export interface CardBackPreset {
  id: string;
  name: string;
  category: "oficial" | "botanico" | "zen" | "mandala" | "minimalista" | "celestial" | "personalizado";
  description: string;
  previewThumbnail?: string;
  backConfig: CardBackConfig;
  suggestedColors?: Partial<ThemeColors>;
}

export interface DeckStyleConfig {
  themeId: string;
  themeName: string;
  bgTexture: "watercolor-blush" | "linen-paper" | "botanical-foliage" | "golden-marble" | "celestial-night" | "sage-watercolor" | "clean-smooth" | "custom";
  customBgImage?: string;
  customBackBgImage?: string;
  bgOpacity: number; // 0.1 to 1.0
  colors: ThemeColors;
  borderStyle: BorderStyle;
  topOrnament: TopOrnament;
  bottomOrnament: TopOrnament | "signature";
  backStyle: BackStyle;
  
  // Custom Card Back Config
  backConfig?: CardBackConfig;
  
  // Typography
  titleFont: "Cinzel" | "Playfair Display" | "Cormorant Garamond" | "Marcellus" | "Montserrat" | "Prata";
  bodyFont: "Plus Jakarta Sans" | "Montserrat" | "Lora" | "Cormorant Garamond";
  signatureFont: "Alex Brush" | "Great Vibes" | "Cormorant Garamond" | "Cinzel";
  
  // Layout spacing and radii
  cornerRadiusMm: number; // e.g. 4mm or 5mm
  innerBoxRadiusMm: number; // e.g. 6mm
  showReflectionBox: boolean;
  showSoulQuestion: boolean;
  showActionPrompt: boolean;
  showCategoryPill: boolean;
  showTopCollectionName: boolean;
  
  // Foil / Print simulation
  simulateGoldFoil: boolean;
}

export interface DeckConfig {
  id: string;
  deckTitle: string; // e.g. "Baralho de Autocuidado & Cura"
  collectionName: string; // e.g. "COLEÇÃO ESSÊNCIA"
  deckSubtitle: string; // e.g. "Toda transformação começa quando você retorna para si."
  authorName: string; // e.g. "Luciana Castro"
  authorRole: string; // e.g. "TERAPIAS INTEGRATIVAS"
  authorLogoUrl?: string; // custom logo
  
  // Ownership & Sharing metadata
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
  sharedWithEmails?: string[]; // list of emails allowed to view
  shareMode?: "private" | "restricted" | "all_authorized"; // private: only owner, restricted: emails in sharedWithEmails, all_authorized: all whitelisted users
  
  // Publication Status for Deck / Collection
  status?: PublicationStatus;
  scheduledAt?: string;
  publishedAt?: string;
  trashedAt?: string;
  reviewerNotes?: string;
  
  createdAt?: string;
  updatedAt?: string;
  
  // Runtime flags
  isReadOnly?: boolean; // True if the current user is viewing a deck owned by someone else
  sharedBy?: string; // Display info of who shared this deck
  
  sizePresetId: string;
  customWidthMm: number;
  customHeightMm: number;
  bleedMm: number; // standard 3mm for professional printing
  safeMarginMm: number; // standard 4mm
  orientation: CardOrientation;
  
  style: DeckStyleConfig;
  cards: CardItem[];
}

export interface PrintSheetOptions {
  paperSize: "A4" | "A3" | "Letter";
  orientation: "portrait" | "landscape";
  showCropMarks: boolean; // Marcas de corte
  showBleedZone: boolean; // 3mm sangria
  showSafeZone: boolean; // Margem de segurança
  duplexMode: "front-back-interleaved" | "fronts-then-backs" | "front-only" | "back-only";
  cardsPerPage: number;
  dpi: 300 | 150 | 72;
}

export type UserRole = "superadmin" | "admin" | "editor" | "viewer" | "demo";
export type UserStatus = "active" | "suspended";

export interface AuthorizedUser {
  email: string;
  name?: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  addedBy?: string;
  addedAt?: string;
  lastLoginAt?: string;
  notes?: string;
}

export interface AccessRequest {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  message?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

