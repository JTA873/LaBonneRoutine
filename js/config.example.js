// Configuration Firebase - EXEMPLE
// Copiez ce fichier vers config.js et remplacez par vos vraies valeurs

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Configuration par défaut de l'admin (À CHANGER EN PRODUCTION !)
export const DEFAULT_ADMIN = {
    email: "admin@labonneroutine.com",
    password: "CHANGE_THIS_PASSWORD_IMMEDIATELY",
    name: "Jade Taraf",
    role: "admin"
};

// Configuration de l'application
export const APP_CONFIG = {
    siteName: "La Bonne Routine",
    siteDescription: "Coaching sportif personnalisé à Toulouse",
    maxBookingsPerUser: 10,
    bookingCancellationHours: 24,
    reviewModerationRequired: true,
    eventProposalModerationRequired: true
};
