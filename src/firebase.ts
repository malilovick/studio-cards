import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { AuthorizedUser, AccessRequest, UserRole, UserStatus, DeckConfig } from "./types";

// Pre-authorized default users
export interface PreAuthorizedUserConfig {
  email: string;
  name: string;
  role: UserRole;
  notes: string;
  isOwner?: boolean;
}

export const PRE_AUTHORIZED_DEFAULT_USERS: PreAuthorizedUserConfig[] = [
  {
    email: "vianallmarcos@gmail.com",
    name: "Marcos Viana",
    role: "admin",
    notes: "Proprietário & Administrador Principal",
    isOwner: true,
  },
  {
    email: "malilovick@gmail.com",
    name: "Mali Lovick",
    role: "admin",
    notes: "Administradora Pré-autorizada",
    isOwner: true,
  },
  {
    email: "lucianacastroterapeuta@gmail.com",
    name: "Luciana Castro",
    role: "editor",
    notes: "Terapeuta Pré-autorizada",
    isOwner: false,
  },
];

// Primary master admin / owner emails (can always access & manage authorizations)
export const MASTER_OWNER_EMAILS = [
  "vianallmarcos@gmail.com",
  "malilovick@gmail.com",
  "lucianacastroterapeuta@gmail.com",
];

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Firestore with specific database ID if provided
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || "(default)"
);

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Log out
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Normalizes email to lowercase trimmed
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if an email is master owner
 */
export function isMasterOwner(email?: string | null): boolean {
  if (!email) return false;
  const norm = normalizeEmail(email);
  return MASTER_OWNER_EMAILS.some((e) => normalizeEmail(e) === norm);
}

/**
 * Check authorization state for a user
 */
export async function checkUserAuthorization(user: User): Promise<{
  isAuthorized: boolean;
  isAdmin: boolean;
  role: UserRole;
  authRecord?: AuthorizedUser;
}> {
  if (!user.email) {
    return { isAuthorized: false, isAdmin: false, role: "viewer" };
  }

  const email = normalizeEmail(user.email);

  // Check if user is in PRE_AUTHORIZED_DEFAULT_USERS
  const preAuth = PRE_AUTHORIZED_DEFAULT_USERS.find(
    (p) => normalizeEmail(p.email) === email
  );

  if (preAuth) {
    try {
      const userRef = doc(db, "authorized_users", email);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const record: AuthorizedUser = {
          email,
          name: user.displayName || preAuth.name,
          photoURL: user.photoURL || undefined,
          role: preAuth.role,
          status: "active",
          addedBy: "sistema",
          addedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          notes: preAuth.notes,
        };
        await setDoc(userRef, record);
        return {
          isAuthorized: true,
          isAdmin: preAuth.role === "admin",
          role: preAuth.role,
          authRecord: record,
        };
      } else {
        const data = userSnap.data() as AuthorizedUser;
        // Update last login timestamp and info
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          photoURL: user.photoURL || data.photoURL || undefined,
          name: user.displayName || data.name || preAuth.name,
          status: "active",
        }).catch(() => {});
        return {
          isAuthorized: true,
          isAdmin: data.role === "admin" || preAuth.role === "admin",
          role: data.role || preAuth.role,
          authRecord: { ...data, status: "active" },
        };
      }
    } catch (err) {
      console.warn("Could not sync pre-authorized user in Firestore:", err);
      return {
        isAuthorized: true,
        isAdmin: preAuth.role === "admin",
        role: preAuth.role,
        authRecord: {
          email,
          name: user.displayName || preAuth.name,
          role: preAuth.role,
          status: "active",
          notes: preAuth.notes,
        },
      };
    }
  }

  // Check in authorized_users collection
  try {
    const userRef = doc(db, "authorized_users", email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as AuthorizedUser;
      if (data.status === "active") {
        // Update last login timestamp
        updateDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          photoURL: user.photoURL || data.photoURL,
          name: user.displayName || data.name,
        }).catch(() => {});

        return {
          isAuthorized: true,
          isAdmin: data.role === "admin",
          role: data.role || "editor",
          authRecord: data,
        };
      } else {
        return {
          isAuthorized: false,
          isAdmin: false,
          role: data.role,
          authRecord: data,
        };
      }
    }
  } catch (err) {
    console.error("Error verifying authorization record in Firestore:", err);
  }

  return { isAuthorized: false, isAdmin: false, role: "viewer" };
}

/**
 * Fetch list of all authorized users
 */
export async function getAuthorizedUsers(): Promise<AuthorizedUser[]> {
  try {
    const usersCol = collection(db, "authorized_users");
    const snap = await getDocs(usersCol);
    const users: AuthorizedUser[] = [];
    snap.forEach((d) => {
      users.push(d.data() as AuthorizedUser);
    });
    return users.sort((a, b) => (a.email > b.email ? 1 : -1));
  } catch (err) {
    console.error("Error fetching authorized users:", err);
    throw err;
  }
}

/**
 * Subscribe to real-time authorized users changes
 */
export function subscribeAuthorizedUsers(callback: (users: AuthorizedUser[]) => void) {
  const usersCol = collection(db, "authorized_users");
  return onSnapshot(
    usersCol,
    (snap) => {
      const usersMap = new Map<string, AuthorizedUser>();
      snap.forEach((d) => {
        const u = d.data() as AuthorizedUser;
        usersMap.set(normalizeEmail(u.email), u);
      });

      // Ensure all pre-authorized users exist
      PRE_AUTHORIZED_DEFAULT_USERS.forEach(async (pre) => {
        const norm = normalizeEmail(pre.email);
        if (!usersMap.has(norm)) {
          const newUser: AuthorizedUser = {
            email: norm,
            name: pre.name,
            role: pre.role,
            status: "active",
            addedBy: "sistema",
            addedAt: new Date().toISOString(),
            notes: pre.notes,
          };
          usersMap.set(norm, newUser);
          // Try seeding to firestore
          try {
            await setDoc(doc(db, "authorized_users", norm), newUser);
          } catch (e) {
            console.warn("Auto-seeding pre-authorized user in background:", e);
          }
        }
      });

      const users = Array.from(usersMap.values()).sort((a, b) =>
        a.email > b.email ? 1 : -1
      );
      callback(users);
    },
    (err) => {
      console.error("Firestore onSnapshot error for authorized users:", err);
    }
  );
}

/**
 * Add or update an authorized user (Admin only)
 */
export async function addOrUpdateAuthorizedUser(params: {
  email: string;
  name?: string;
  role: UserRole;
  notes?: string;
  adminEmail: string;
}): Promise<void> {
  const email = normalizeEmail(params.email);
  if (!email || !email.includes("@")) {
    throw new Error("Por favor, insira um e-mail válido da conta Google.");
  }

  const userRef = doc(db, "authorized_users", email);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    await updateDoc(userRef, {
      role: params.role,
      name: params.name || snap.data()?.name || "",
      notes: params.notes ?? snap.data()?.notes ?? "",
      status: "active",
    });
  } else {
    const newRecord: AuthorizedUser = {
      email,
      name: params.name || "",
      role: params.role,
      status: "active",
      addedBy: params.adminEmail,
      addedAt: new Date().toISOString(),
      notes: params.notes || "",
    };
    await setDoc(userRef, newRecord);
  }
}

/**
 * Toggle user status (active / suspended)
 */
export async function setAuthorizedUserStatus(
  email: string,
  status: UserStatus
): Promise<void> {
  const normEmail = normalizeEmail(email);
  if (isMasterOwner(normEmail)) {
    throw new Error("Não é permitido suspender a conta do proprietário principal.");
  }
  const userRef = doc(db, "authorized_users", normEmail);
  await updateDoc(userRef, { status });
}

/**
 * Change user role
 */
export async function setAuthorizedUserRole(
  email: string,
  role: UserRole
): Promise<void> {
  const normEmail = normalizeEmail(email);
  const userRef = doc(db, "authorized_users", normEmail);
  await updateDoc(userRef, { role });
}

/**
 * Remove an authorized user
 */
export async function removeAuthorizedUser(email: string): Promise<void> {
  const normEmail = normalizeEmail(email);
  if (isMasterOwner(normEmail)) {
    throw new Error("Não é possível remover a conta do proprietário principal.");
  }
  const userRef = doc(db, "authorized_users", normEmail);
  await deleteDoc(userRef);
}

/**
 * Submit an access request when an unauthorized user logs in
 */
export async function submitAccessRequest(user: User, message?: string): Promise<void> {
  if (!user.email) return;
  const email = normalizeEmail(user.email);
  const requestId = email.replace(/[^a-zA-Z0-9]/g, "_");
  const reqRef = doc(db, "access_requests", requestId);

  const requestData: AccessRequest = {
    id: requestId,
    email,
    name: user.displayName || "",
    photoURL: user.photoURL || undefined,
    message: message || "Gostaria de solicitar autorização para criar baralhos terapêuticos.",
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  await setDoc(reqRef, requestData);
}

/**
 * Check if current user has an existing access request
 */
export async function getExistingAccessRequest(user: User): Promise<AccessRequest | null> {
  if (!user.email) return null;
  const email = normalizeEmail(user.email);
  const requestId = email.replace(/[^a-zA-Z0-9]/g, "_");
  const reqRef = doc(db, "access_requests", requestId);
  const snap = await getDoc(reqRef);
  if (snap.exists()) {
    return snap.data() as AccessRequest;
  }
  return null;
}

/**
 * Subscribe to pending access requests (Admin only)
 */
export function subscribeAccessRequests(callback: (requests: AccessRequest[]) => void) {
  const requestsCol = collection(db, "access_requests");
  return onSnapshot(
    requestsCol,
    (snap) => {
      const requests: AccessRequest[] = [];
      snap.forEach((d) => {
        requests.push(d.data() as AccessRequest);
      });
      requests.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      callback(requests);
    },
    (err) => {
      console.error("Firestore onSnapshot error for access requests:", err);
    }
  );
}

/**
 * Approve access request
 */
export async function approveAccessRequest(
  request: AccessRequest,
  role: UserRole,
  adminEmail: string
): Promise<void> {
  // 1. Add to authorized_users
  await addOrUpdateAuthorizedUser({
    email: request.email,
    name: request.name,
    role,
    notes: `Aprovado via solicitação de acesso: "${request.message || ""}"`,
    adminEmail,
  });

  // 2. Mark request as approved or delete
  const reqRef = doc(db, "access_requests", request.id);
  await updateDoc(reqRef, { status: "approved" });
}

/**
 * Reject / Delete access request
 */
export async function rejectAccessRequest(requestId: string): Promise<void> {
  const reqRef = doc(db, "access_requests", requestId);
  await deleteDoc(reqRef);
}

/**
 * Save or update a Deck in Firestore.
 * Automatically tracks owner, timestamps, and share settings.
 */
export async function saveDeckToCloud(
  deck: DeckConfig,
  userId: string,
  userEmail: string,
  userName?: string
): Promise<void> {
  const normEmail = normalizeEmail(userEmail);
  const deckRef = doc(db, "decks", deck.id);

  // Check if document exists to preserve original owner/creation date if not specified
  let originalOwnerEmail = deck.ownerEmail || normEmail;
  let originalOwnerId = deck.ownerId || userId;
  let originalCreatedAt = deck.createdAt || new Date().toISOString();
  let sharedWithEmails = deck.sharedWithEmails || [];
  let shareMode = deck.shareMode || "private";

  try {
    const snap = await getDoc(deckRef);
    if (snap.exists()) {
      const existing = snap.data();
      originalOwnerEmail = existing.ownerEmail || existing.authorEmail || originalOwnerEmail;
      originalOwnerId = existing.ownerId || existing.authorId || originalOwnerId;
      originalCreatedAt = existing.createdAt || originalCreatedAt;
      if (existing.sharedWithEmails && !deck.sharedWithEmails) {
        sharedWithEmails = existing.sharedWithEmails;
      }
      if (existing.shareMode && !deck.shareMode) {
        shareMode = existing.shareMode;
      }
    }
  } catch (e) {
    console.warn("Error reading existing deck doc before save:", e);
  }

  // Clean runtime-only helper fields before saving
  const { isReadOnly, sharedBy, ...cleanDeck } = deck;

  const payload: any = {
    ...cleanDeck,
    ownerId: originalOwnerId,
    ownerEmail: normalizeEmail(originalOwnerEmail),
    ownerName: deck.ownerName || userName || cleanDeck.authorName || "Terapeuta",
    authorId: originalOwnerId,
    authorEmail: normalizeEmail(originalOwnerEmail),
    sharedWithEmails: sharedWithEmails.map(normalizeEmail),
    shareMode,
    createdAt: originalCreatedAt,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(deckRef, payload, { merge: true });
}

/**
 * Create a new deck for the current user
 */
export async function createNewDeckInCloud(
  user: User,
  title: string,
  collectionName?: string,
  baseTemplate?: Partial<DeckConfig>
): Promise<DeckConfig> {
  const userEmail = normalizeEmail(user.email || "");
  const deckId = `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const newDeck: DeckConfig = {
    id: deckId,
    deckTitle: title.trim() || "Nova Coleção de Cartas",
    collectionName: collectionName?.trim() || "COLEÇÃO TERAPÊUTICA",
    deckSubtitle: baseTemplate?.deckSubtitle || "Frases de reflexão e autocuidado.",
    authorName: baseTemplate?.authorName || user.displayName || "Terapeuta",
    authorRole: baseTemplate?.authorRole || "TERAPIAS INTEGRATIVAS",
    authorLogoUrl: baseTemplate?.authorLogoUrl || "",
    
    ownerId: user.uid,
    ownerEmail: userEmail,
    ownerName: user.displayName || "Terapeuta",
    sharedWithEmails: [],
    shareMode: "private",
    status: baseTemplate?.status || "draft",
    scheduledAt: baseTemplate?.scheduledAt || "",
    publishedAt: baseTemplate?.status === "published" ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    sizePresetId: baseTemplate?.sizePresetId || "tarot-standard",
    customWidthMm: baseTemplate?.customWidthMm || 70,
    customHeightMm: baseTemplate?.customHeightMm || 120,
    bleedMm: baseTemplate?.bleedMm || 3,
    safeMarginMm: baseTemplate?.safeMarginMm || 4,
    orientation: baseTemplate?.orientation || "portrait",
    
    style: baseTemplate?.style || {
      themeId: "blush-essence",
      themeName: "Coleção Essência",
      bgTexture: "watercolor-blush",
      bgOpacity: 0.95,
      colors: {
        primaryAccent: "#B37A56",
        secondaryAccent: "#C5889A",
        backgroundBase: "#FDF5F2",
        backgroundGradientEnd: "#F9E4DC",
        cardSurface: "#FFFFFF",
        textPrimary: "#4E2B38",
        textSecondary: "#6E4452",
        borderAccent: "#D69F7E",
        badgeBg: "#623545",
        badgeText: "#FFFFFF",
        boxBg: "#F6ECE9",
      },
      borderStyle: "botanical-corners",
      topOrnament: "lotus",
      bottomOrnament: "lotus",
      backStyle: "tree-of-life",
      titleFont: "Cinzel",
      bodyFont: "Plus Jakarta Sans",
      signatureFont: "Alex Brush",
      cornerRadiusMm: 4,
      innerBoxRadiusMm: 6,
      showReflectionBox: true,
      showSoulQuestion: true,
      showActionPrompt: true,
      showCategoryPill: true,
      showTopCollectionName: true,
      simulateGoldFoil: true,
    },
    cards: baseTemplate?.cards && baseTemplate.cards.length > 0 ? baseTemplate.cards : [
      {
        id: `card-${Date.now()}-1`,
        number: "01",
        title: "NOVA CARTA",
        category: "Reflexão",
        affirmation: "Eu me permito vivenciar este momento com serenidade e abertura.",
        reflection: "Cada instante traz uma oportunidade para nos reconectarmos com a nossa verdadeira essência.",
        soulQuestion: "O que o meu coração deseja expressar hoje?",
        actionPrompt: "Feche os olhos por 1 minuto e respire profundamente.",
      }
    ],
  };

  await saveDeckToCloud(newDeck, user.uid, userEmail, user.displayName || undefined);
  return newDeck;
}

/**
 * Clone an existing deck into the current user's workspace
 */
export async function cloneDeckToMyAccount(
  deckToClone: DeckConfig,
  user: User
): Promise<DeckConfig> {
  const userEmail = normalizeEmail(user.email || "");
  const newDeckId = `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Deep clone cards with new IDs
  const clonedCards = deckToClone.cards.map((c, idx) => ({
    ...c,
    id: `card-${Date.now()}-${idx + 1}`,
  }));

  const clonedDeck: DeckConfig = {
    ...deckToClone,
    id: newDeckId,
    deckTitle: `${deckToClone.deckTitle} (Minha Cópia)`,
    ownerId: user.uid,
    ownerEmail: userEmail,
    ownerName: user.displayName || "Terapeuta",
    sharedWithEmails: [],
    shareMode: "private",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isReadOnly: false,
    sharedBy: undefined,
    cards: clonedCards,
  };

  await saveDeckToCloud(clonedDeck, user.uid, userEmail, user.displayName || undefined);
  return clonedDeck;
}

/**
 * Delete a deck from cloud
 */
export async function deleteDeckFromCloud(deckId: string): Promise<void> {
  const deckRef = doc(db, "decks", deckId);
  await deleteDoc(deckRef);
}

/**
 * Share a deck with specific users or update share mode
 */
export async function updateDeckSharing(
  deckId: string,
  shareMode: "private" | "restricted" | "all_authorized",
  sharedWithEmails: string[]
): Promise<void> {
  const deckRef = doc(db, "decks", deckId);
  const normalizedEmails = sharedWithEmails.map(normalizeEmail).filter(Boolean);
  await updateDoc(deckRef, {
    shareMode,
    sharedWithEmails: normalizedEmails,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Subscribe to real-time decks: separates into "myDecks" and "sharedDecks"
 */
export function subscribeUserDecks(
  userEmail: string,
  callback: (myDecks: DeckConfig[], sharedDecks: DeckConfig[]) => void
) {
  const normEmail = normalizeEmail(userEmail);
  const decksCol = collection(db, "decks");

  return onSnapshot(
    decksCol,
    (snap) => {
      const myDecks: DeckConfig[] = [];
      const sharedDecks: DeckConfig[] = [];

      snap.forEach((d) => {
        const data = d.data() as DeckConfig;
        const ownerEmail = normalizeEmail(data.ownerEmail || (data as any).authorEmail || "");
        const sharedEmails = (data.sharedWithEmails || []).map(normalizeEmail);
        const isMyDeck = ownerEmail === normEmail;

        if (isMyDeck) {
          myDecks.push({
            ...data,
            isReadOnly: false,
          });
        } else {
          // Check if shared with current user:
          const isDirectlyShared = sharedEmails.includes(normEmail);
          const isAllAuthorizedShared = data.shareMode === "all_authorized";

          if (isDirectlyShared || isAllAuthorizedShared) {
            sharedDecks.push({
              ...data,
              isReadOnly: true,
              sharedBy: data.ownerName || data.authorName || ownerEmail || "Colega Terapeuta",
            });
          }
        }
      });

      // Sort by updatedAt descending
      myDecks.sort((a, b) => ((b.updatedAt || "") > (a.updatedAt || "") ? 1 : -1));
      sharedDecks.sort((a, b) => ((b.updatedAt || "") > (a.updatedAt || "") ? 1 : -1));

      callback(myDecks, sharedDecks);
    },
    (err) => {
      console.error("Error subscribing to decks in Firestore:", err);
    }
  );
}

/**
 * Cloud Deck Storage: Load Decks from Firestore (one-shot)
 */
export async function loadDecksFromCloud(userEmail: string): Promise<{ myDecks: DeckConfig[]; sharedDecks: DeckConfig[] }> {
  try {
    const normEmail = normalizeEmail(userEmail);
    const decksCol = collection(db, "decks");
    const snap = await getDocs(decksCol);
    const myDecks: DeckConfig[] = [];
    const sharedDecks: DeckConfig[] = [];

    snap.forEach((d) => {
      const data = d.data() as DeckConfig;
      const ownerEmail = normalizeEmail(data.ownerEmail || (data as any).authorEmail || "");
      const sharedEmails = (data.sharedWithEmails || []).map(normalizeEmail);
      const isMyDeck = ownerEmail === normEmail;

      if (isMyDeck) {
        myDecks.push({
          ...data,
          isReadOnly: false,
        });
      } else if (sharedEmails.includes(normEmail) || data.shareMode === "all_authorized") {
        sharedDecks.push({
          ...data,
          isReadOnly: true,
          sharedBy: data.ownerName || data.authorName || ownerEmail,
        });
      }
    });

    return { myDecks, sharedDecks };
  } catch (err) {
    console.error("Error loading decks from cloud:", err);
    return { myDecks: [], sharedDecks: [] };
  }
}
