// Configuration Firebase et constantes de l'application

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDjR8kGm7nAKUeKjQQcQNtPJUP58WM1Eno",
  authDomain: "labonneroutine.firebaseapp.com",
  projectId: "labonneroutine",
  storageBucket: "labonneroutine.firebasestorage.app",
  messagingSenderId: "963119728158",
  appId: "1:963119728158:web:11af9650a7f03e27b5d00f",
  measurementId: "G-VMXZV2K2S6"
};

// Alias pour compatibilité
export const firebaseConfig = FIREBASE_CONFIG;

// Admin déclaré par défaut (dev only) — supprimez en prod !
export const ADMIN_EMAILS = ["jadetaraf@hotmail.fr"];

export const DEFAULT_ADMIN = {
  email: "jadetaraf@hotmail.fr",
  password: "123456789"
};

// Collections Firestore
export const COLLECTIONS = {
  USERS: 'users',
  SLOTS: 'slots',
  BOOKINGS: 'bookings',
  EVENTS: 'events',
  REVIEWS: 'reviews',
  EVENT_PROPOSALS: 'eventProposals',
  CMS: 'cms'
};

// Statuts
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  CANCELED: 'canceled',
  OPEN: 'open',
  CLOSED: 'closed',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  HIDDEN: 'hidden'
};

// Rôles utilisateur
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Configuration de l'application
export const APP_CONFIG = {
  MAX_BOOKING_DAYS_AHEAD: 30,
  MIN_CANCEL_HOURS: 24,
  DEFAULT_SLOT_DURATION: 60, // minutes
  MAX_REVIEW_LENGTH: 500,
  MAX_PROPOSAL_LENGTH: 1000,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};
