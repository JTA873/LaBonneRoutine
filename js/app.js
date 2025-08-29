// Navigation et gestion globale de l'app
class AppManager {
    constructor() {
        this.currentUser = null;
        this.modules = new Map();
        this.init();
    }

    async init() {
        console.log('🚀 Initialisation de l\'application...');
        
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            await this.initializeApp();
        }
    }

    async initializeApp() {
        try {
            // 1. Initialiser Firebase
            await this.initFirebase();
            
            // 2. Initialiser l'authentification
            await this.initAuth();
            
            // 3. Initialiser la navigation
            this.initNavigation();
            
            // 4. Initialiser les composants UI
            this.initUI();
            
            // 5. Initialiser les modules spécifiques à la page
            await this.initPageModules();
            
            console.log('✅ Application initialisée avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur de chargement de l\'application');
        }
    }

    async initFirebase() {
        try {
            const { initializeFirebase } = await import('./firebase-init.js');
            await initializeFirebase();
            console.log('✅ Firebase initialisé');
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            throw error;
        }
    }

    async initAuth() {
        try {
            const { AuthManager } = await import('./auth.js');
            this.authManager = new AuthManager();
            await this.authManager.init();
            
            // Écouter les changements d'authentification
            this.authManager.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.updateNavigation(user);
            });
            
            console.log('✅ Authentification initialisée');
        } catch (error) {
            console.error('❌ Erreur authentification:', error);
        }
    }

    initNavigation() {
        // Navigation mobile hamburger
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navOverlay = document.querySelector('.nav-overlay');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });
        }

        if (navOverlay) {
            navOverlay.addEventListener('click', () => {
                this.closeNavigation();
            });
        }

        // Fermer la navigation sur les liens
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeNavigation();
            });
        });

        // Navigation smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        console.log('✅ Navigation initialisée');
    }

    closeNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
        document.body.classList.remove('nav-open');
    }

    updateNavigation(user) {
        const authLogin = document.getElementById('auth-login');
        const authDashboard = document.getElementById('auth-dashboard');
        const authLogout = document.getElementById('auth-logout');
        const adminLink = document.getElementById('admin-link');

        if (user) {
            // Utilisateur connecté
            if (authLogin) authLogin.style.display = 'none';
            if (authDashboard) authDashboard.style.display = 'inline-block';
            if (authLogout) authLogout.style.display = 'inline-block';
            
            // Afficher le lien admin si c'est un admin
            if (adminLink && user.role === 'admin') {
                adminLink.style.display = 'inline-block';
            }
        } else {
            // Utilisateur non connecté
            if (authLogin) authLogin.style.display = 'inline-block';
            if (authDashboard) authDashboard.style.display = 'none';
            if (authLogout) authLogout.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
        }
    }

    initUI() {
        // Initialiser les toasts
        this.createToastContainer();
        
        // Initialiser les modales
        this.initModals();
        
        // Animations au scroll
        this.initScrollAnimations();
        
        // Gestion des erreurs globales
        this.initErrorHandling();
        
        console.log('✅ UI initialisée');
    }

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    initModals() {
        // Fermer les modales avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });

        // Fermer les modales en cliquant sur l'overlay
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observer tous les éléments avec animation
        document.querySelectorAll('.card, .service-item, .pricing-card, .review-card').forEach(el => {
            observer.observe(el);
        });
    }

    initErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Erreur JavaScript:', event.error);
            this.showError('Une erreur inattendue s\'est produite');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejetée:', event.reason);
            this.showError('Erreur de connexion');
        });
    }

    async initPageModules() {
        const currentPage = this.getCurrentPage();
        console.log(`📄 Initialisation des modules pour: ${currentPage}`);

        try {
            switch (currentPage) {
                case 'index':
                    await this.initHomePage();
                    break;
                case 'reserve':
                    await this.initBookingPage();
                    break;
                case 'events':
                    await this.initEventsPage();
                    break;
                case 'admin':
                    await this.initAdminPage();
                    break;
                case 'dashboard':
                    await this.initDashboardPage();
                    break;
                default:
                    console.log('Aucun module spécifique pour cette page');
            }
        } catch (error) {
            console.error(`❌ Erreur lors de l'initialisation de ${currentPage}:`, error);
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    async initHomePage() {
        try {
            // Initialiser le CMS
            const { CMSManager } = await import('./cms.js');
            this.cmsManager = new CMSManager();
            await this.cmsManager.init();

            // Initialiser les avis
            const { ReviewsManager } = await import('./reviews.js');
            this.reviewsManager = new ReviewsManager();
            await this.reviewsManager.init();

            console.log('✅ Page d\'accueil initialisée');
        } catch (error) {
            console.error('❌ Erreur page d\'accueil:', error);
        }
    }

    async initBookingPage() {
        try {
            const { BookingManager } = await import('./booking.js');
            this.bookingManager = new BookingManager();
            await this.bookingManager.init();
            console.log('✅ Page de réservation initialisée');
        } catch (error) {
            console.error('❌ Erreur page de réservation:', error);
        }
    }

    async initEventsPage() {
        try {
            const { EventsManager } = await import('./events.js');
            this.eventsManager = new EventsManager();
            await this.eventsManager.init();
            console.log('✅ Page événements initialisée');
        } catch (error) {
            console.error('❌ Erreur page événements:', error);
        }
    }

    async initAdminPage() {
        try {
            // Vérifier les droits admin
            if (!this.currentUser || this.currentUser.role !== 'admin') {
                window.location.href = 'login.html';
                return;
            }

            const { AdminManager } = await import('./admin.js');
            this.adminManager = new AdminManager();
            await this.adminManager.init();
            console.log('✅ Page admin initialisée');
        } catch (error) {
            console.error('❌ Erreur page admin:', error);
        }
    }

    async initDashboardPage() {
        try {
            // Vérifier la connexion
            if (!this.currentUser) {
                window.location.href = 'login.html';
                return;
            }

            // Initialiser le dashboard utilisateur
            console.log('✅ Dashboard utilisateur initialisé');
        } catch (error) {
            console.error('❌ Erreur dashboard:', error);
        }
    }

    // Méthodes utilitaires
    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" type="button">&times;</button>
            </div>
        `;

        // Événement de fermeture
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => toast.remove());

        container.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-suppression
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');

        // Focus sur le premier élément focusable
        const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Initialiser l'application
const app = new AppManager();

// Exporter pour utilisation globale
window.app = app;

export default AppManager;
