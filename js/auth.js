// Gestion de l'authentification
import { auth, db } from './firebase-init.js';
import { COLLECTIONS, ROLES, ADMIN_EMAILS, DEFAULT_ADMIN } from './config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentUser = null;

// Update UI based on authentication state
export function updateAuthUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const reviewButton = document.getElementById('review-button');
    
    if (user) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (dashboardBtn) {
            dashboardBtn.style.display = 'inline-block';
            dashboardBtn.classList.remove('hidden');
            dashboardBtn.textContent = user.displayName ? `${user.displayName}` : 'Mon compte';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.classList.remove('hidden');
        }
        if (reviewButton) reviewButton.style.display = 'inline-block';
        
        // Update user name display
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = user.displayName || user.email;
        }
    } else {
        // User is not logged in
        if (loginBtn) {
            loginBtn.style.display = 'inline-block';
            loginBtn.classList.remove('hidden');
        }
        if (signupBtn) {
            signupBtn.style.display = 'inline-block';
            signupBtn.classList.remove('hidden');
        }
        if (dashboardBtn) {
            dashboardBtn.style.display = 'none';
            dashboardBtn.classList.add('hidden');
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
            logoutBtn.classList.add('hidden');
        }
        if (reviewButton) reviewButton.style.display = 'none';
        
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = '';
        }
    }
}

// Initialize auth and create default admin if needed
export async function initAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                const userDoc = await getUserData(user.uid);
                currentUser = { ...user, ...userDoc };
                updateAuthUI(currentUser);
                resolve(currentUser);
            } else {
                // User is signed out
                currentUser = null;
                updateAuthUI(null);
                
                // Check if we need to create default admin
                await createDefaultAdminIfNeeded();
                resolve(null);
            }
        });
    });
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Login with email and password
export async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userData = await getUserData(userCredential.user.uid);
        currentUser = { ...userCredential.user, ...userData };
        return currentUser;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

// Sign up with email and password
export async function signupWithEmail(email, password, additionalData = {}) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile if displayName provided
        if (additionalData.displayName) {
            await updateProfile(userCredential.user, {
                displayName: additionalData.displayName
            });
        }
        
        // Create user document
        const userData = {
            email: email,
            displayName: additionalData.displayName || '',
            phone: additionalData.phone || '',
            instagram: additionalData.instagram || '',
            role: ADMIN_EMAILS.includes(email) ? ROLES.ADMIN : ROLES.USER,
            createdAt: serverTimestamp()
        };
        
        await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), userData);
        
        currentUser = { ...userCredential.user, ...userData };
        return currentUser;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

// Login with Google
export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        
        // Check if user document exists, create if not
        const userDoc = await getUserData(userCredential.user.uid);
        if (!userDoc) {
            const userData = {
                email: userCredential.user.email,
                displayName: userCredential.user.displayName || '',
                phone: '',
                instagram: '',
                role: ADMIN_EMAILS.includes(userCredential.user.email) ? ROLES.ADMIN : ROLES.USER,
                createdAt: serverTimestamp()
            };
            
            await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), userData);
            currentUser = { ...userCredential.user, ...userData };
        } else {
            currentUser = { ...userCredential.user, ...userDoc };
        }
        
        return currentUser;
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

// Reset password
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
        currentUser = null;
    } catch (error) {
        throw new Error('Erreur lors de la déconnexion');
    }
}

// Update user profile
export async function updateUserProfile(data) {
    if (!currentUser) throw new Error('Utilisateur non connecté');
    
    try {
        // Update auth profile if displayName changed
        if (data.displayName !== currentUser.displayName) {
            await updateProfile(auth.currentUser, {
                displayName: data.displayName
            });
        }
        
        // Update Firestore document
        await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.uid), {
            ...data,
            updatedAt: serverTimestamp()
        });
        
        // Update current user object
        Object.assign(currentUser, data);
        
        return currentUser;
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour du profil');
    }
}

// Get user data from Firestore
async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Create default admin if no admin exists
async function createDefaultAdminIfNeeded() {
    try {
        // Check if any admin exists
        const adminQuery = query(
            collection(db, COLLECTIONS.USERS),
            where('role', '==', ROLES.ADMIN)
        );
        const adminSnapshot = await getDocs(adminQuery);
        
        if (adminSnapshot.empty) {
            console.log('No admin found, creating default admin...');
            
            // Create default admin account
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                DEFAULT_ADMIN.email, 
                DEFAULT_ADMIN.password
            );
            
            // Create admin user document
            const adminData = {
                email: DEFAULT_ADMIN.email,
                displayName: 'Administrateur',
                phone: '',
                instagram: '',
                role: ROLES.ADMIN,
                createdAt: serverTimestamp()
            };
            
            await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), adminData);
            
            console.log('Default admin created successfully');
            console.warn('⚠️ IMPORTANT: Changez le mot de passe admin en production !');
            
            // Sign out after creating admin
            await signOut(auth);
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
}

// Convert Firebase auth error codes to user-friendly messages
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
        'auth/invalid-email': 'Adresse email invalide',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
        'auth/network-request-failed': 'Erreur de connexion réseau',
        'auth/popup-closed-by-user': 'Connexion annulée',
        'auth/cancelled-popup-request': 'Connexion annulée'
    };
    
    return errorMessages[errorCode] || 'Une erreur est survenue lors de l\'authentification';
}
