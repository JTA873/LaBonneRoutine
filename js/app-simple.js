// Version simplifiée d'app.js pour le debug
class SimpleApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Initialisation simple de l\'application...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        try {
            // 1. Initialiser la navigation d'abord
            this.initNavigation();
            
            // 2. Initialiser les composants UI
            this.initUI();
            
            // 3. Essayer Firebase
            await this.tryInitFirebase();
            
            console.log('✅ Application initialisée');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            // Continuer même en cas d'erreur Firebase
            this.showMessage('Site en mode hors ligne', 'warning');
        }
    }

    async tryInitFirebase() {
        try {
            const { initializeFirebase } = await import('./firebase-init.js');
            const firebase = await initializeFirebase();
            
            // Initialiser l'authentification
            const { AuthManager } = await import('./auth.js');
            this.authManager = new AuthManager();
            await this.authManager.init();
            
            console.log('✅ Firebase et auth initialisés');
            
            // Initialiser les modules spécifiques à la page
            await this.initPageModules();
            
        } catch (error) {
            console.warn('⚠️ Firebase non disponible:', error.message);
            // L'app peut fonctionner en mode dégradé
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

    initUI() {
        // Créer le container de toasts s'il n'existe pas
        this.createToastContainer();
        
        // Animation du header au scroll
        const header = document.querySelector('.header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
        
        // Animations au scroll
        this.initScrollAnimations();
        
        // Initialiser Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
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
        document.querySelectorAll('.card, .service-card, .pricing-card, .review-card').forEach(el => {
            observer.observe(el);
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
            // Essayer d'initialiser le CMS
            try {
                const { CMSManager } = await import('./cms.js');
                this.cmsManager = new CMSManager();
                await this.cmsManager.init();
                console.log('✅ CMS initialisé');
            } catch (error) {
                console.warn('⚠️ CMS non disponible:', error.message);
            }

            // Essayer d'initialiser les avis
            try {
                const { ReviewsManager } = await import('./reviews.js');
                this.reviewsManager = new ReviewsManager();
                await this.reviewsManager.init();
                console.log('✅ Reviews initialisées');
            } catch (error) {
                console.warn('⚠️ Reviews non disponibles:', error.message);
            }

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
            const { AdminManager } = await import('./admin.js');
            this.adminManager = new AdminManager();
            await this.adminManager.init();
            console.log('✅ Page admin initialisée');
        } catch (error) {
            console.error('❌ Erreur page admin:', error);
        }
    }

    // Méthodes utilitaires
    showMessage(message, type = 'info', duration = 4000) {
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
}

// Initialiser l'application
const app = new SimpleApp();

// Exporter pour utilisation globale
window.app = app;

export default SimpleApp;
