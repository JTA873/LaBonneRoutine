// Configuration Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { FIREBASE_CONFIG } from './config.js';

// Initialiser Firebase avec la vraie configuration
const app = initializeApp(FIREBASE_CONFIG);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export de l'app pour d'autres usages
export default app;