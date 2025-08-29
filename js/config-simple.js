// Configuration Firebase simplifiée - SANS STORAGE
// Version gratuite avec Hosting + Firestore seulement

export const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com", 
    projectId: "votre-projet-id",
    // storageBucket supprimé - pas besoin de Storage payant
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Configuration simple sans stockage fichiers
export const APP_CONFIG = {
    siteName: "La Bonne Routine",
    siteDescription: "Coaching sportif personnalisé à Toulouse",
    maxBookingsPerUser: 10,
    bookingCancellationHours: 24,
    // Pas d'upload d'images - utilisation d'images externes ou base64
    useExternalImages: true,
    defaultAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    logoUrl: "./assets/logo.svg" // Logo local
};

// Admin par défaut (À CHANGER EN PRODUCTION !)
export const DEFAULT_ADMIN = {
    email: "admin@labonneroutine.com",
    password: "CHANGEZ_MOI_IMMEDIATEMENT",
    name: "Jade Taraf",
    role: "admin"
};

// Collections Firestore (sans références Storage)
export const COLLECTIONS = {
    USERS: 'users',
    SLOTS: 'slots', 
    BOOKINGS: 'bookings',
    EVENTS: 'events',
    REVIEWS: 'reviews',
    CMS: 'cms'
    // EVENT_PROPOSALS supprimé pour simplifier
};
