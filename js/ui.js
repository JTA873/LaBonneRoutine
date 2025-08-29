// UI.js - Interface utilisateur moderne et interactive
import { auth } from './firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Configuration globale
const CONFIG = {
    animations: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    breakpoints: {
        mobile: 768,
        tablet: 1024
    }
};

// État global de l'interface
let state = {
    mobileMenuOpen: false,
    currentUser: null,
    scrollY: 0,
    isScrolling: false
};

/**
 * Initialisation de l'interface utilisateur
 */
export function initializeUI() {
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeAuthUI();
    initializeMobileMenu();
    initializeFormValidation();
    initializeAccessibility();
    
    console.log('✅ Interface utilisateur initialisée');
}

/**
 * Navigation moderne avec effets de scroll
 */
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = 0;

    const updateNavbar = () => {
        const currentScrollY = window.scrollY;
        
        // Effet glassmorphism
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Auto-hide/show navigation
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
        state.scrollY = currentScrollY;
    };

    // Throttled scroll handler
    const handleScroll = () => {
        if (!state.isScrolling) {
            state.isScrolling = true;
            requestAnimationFrame(() => {
                updateNavbar();
                state.isScrolling = false;
            });
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    if (sections.length > 0) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        updateActiveNavLink(id);
                    }
                });
            },
            {
                rootMargin: '-20% 0px -80% 0px',
                threshold: 0
            }
        );

        sections.forEach(section => observer.observe(section));
    }

    // Smooth scroll avec animation personnalisée
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                smoothScrollTo(targetElement);
                closeMobileMenu();
            }
        });
    });
}

/**
 * Menu mobile moderne avec animations
 */
function initializeMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
        toggleMobileMenu();
    });

    // Fermer le menu en cliquant sur un lien
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Fermer le menu avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.mobileMenuOpen) {
            closeMobileMenu();
        }
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        if (state.mobileMenuOpen && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    state.mobileMenuOpen = !state.mobileMenuOpen;
    
    navToggle.setAttribute('aria-expanded', state.mobileMenuOpen);
    navMenu.classList.toggle('active', state.mobileMenuOpen);
    
    // Prévenir le scroll du body quand le menu est ouvert
    document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
    
    // Animation des liens du menu
    if (state.mobileMenuOpen) {
        animateMenuLinks();
    }
}

function closeMobileMenu() {
    if (!state.mobileMenuOpen) return;
    
    state.mobileMenuOpen = false;
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.setAttribute('aria-expanded', false);
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
}

function animateMenuLinks() {
    const links = document.querySelectorAll('.nav-menu .nav-link');
    links.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            link.style.opacity = '1';
            link.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

/**
 * Effets de scroll avancés
 */
function initializeScrollEffects() {
    // Parallax léger pour le hero
    const hero = document.querySelector('.hero');
    if (hero) {
        const parallaxElements = hero.querySelectorAll('.hero-visual, .floating-card');
        
        const handleParallax = () => {
            const scrolled = window.scrollY;
            const rate = scrolled * -0.1;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        };

        window.addEventListener('scroll', handleParallax, { passive: true });
    }

    // Animation au scroll pour les éléments
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        scrollObserver.observe(el);
    });

    // Cards hover effects
    initializeCardEffects();
}

/**
 * Effets de cartes modernes
 */
function initializeCardEffects() {
    const cards = document.querySelectorAll('.service-card, .pricing-card, .testimonial-slide');
    
    cards.forEach(card => {
        // Effet de suivi de la souris (simplifié pour mobile)
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

/**
 * Animation des compteurs
 */
export function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => observer.observe(counter));
}

/**
 * Gestion de l'authentification dans l'UI
 */
function initializeAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Observer les changements d'état d'auth
    onAuthStateChanged(auth, (user) => {
        state.currentUser = user;
        updateAuthUI(user);
    });

    // Gestion de la déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                showNotification('Vous êtes déconnecté', 'success');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erreur de déconnexion:', error);
                showNotification('Erreur de déconnexion', 'error');
            }
        });
    }
}

function updateAuthUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        loginBtn?.classList.add('hidden');
        dashboardBtn?.classList.remove('hidden');
        logoutBtn?.classList.remove('hidden');
        
        if (dashboardBtn) {
            dashboardBtn.textContent = `👋 ${user.displayName || user.email.split('@')[0]}`;
        }
    } else {
        loginBtn?.classList.remove('hidden');
        dashboardBtn?.classList.add('hidden');
        logoutBtn?.classList.add('hidden');
    }
}

/**
 * Animations d'entrée
 */
export function initializeAOS() {
    // Style CSS pour les animations
    const style = document.createElement('style');
    style.textContent = `
        [data-aos] {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        [data-aos].animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        [data-aos="fade-up"] {
            transform: translateY(30px);
        }
        
        [data-aos="fade-left"] {
            transform: translateX(30px);
        }
        
        [data-aos="fade-right"] {
            transform: translateX(-30px);
        }
        
        [data-aos="zoom-in"] {
            transform: scale(0.8);
        }
        
        [data-aos].animate-in[data-aos="zoom-in"] {
            transform: scale(1);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Validation de formulaires moderne
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validation en temps réel
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
        
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.required;
    
    clearFieldError(field);
    
    if (required && !value) {
        showFieldError(field, 'Ce champ est obligatoire');
        return false;
    }
    
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Email invalide');
            return false;
        }
    }
    
    if (field.name === 'password' && value) {
        if (value.length < 8) {
            showFieldError(field, 'Le mot de passe doit contenir au moins 8 caractères');
            return false;
        }
    }
    
    return true;
}

function validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = 'color: #EF4444; font-size: 0.875rem; margin-top: 0.25rem;';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Accessibilité
 */
function initializeAccessibility() {
    // Focus visible pour la navigation au clavier
    const style = document.createElement('style');
    style.textContent = `
        .js-focus-visible :focus:not(.focus-visible) {
            outline: none;
        }
        
        .focus-visible {
            outline: 2px solid #9E3728;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
    document.body.classList.add('js-focus-visible');
}

/**
 * Animations d'initialisation
 */
function initializeAnimations() {
    // Animations CSS dynamiques
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });
}

/**
 * Utilitaires
 */
function updateActiveNavLink(activeId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
        }
    });
}

function smoothScrollTo(element) {
    const headerHeight = document.querySelector('.navbar').offsetHeight;
    const targetPosition = element.offsetTop - headerHeight - 20;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * Système de notifications moderne
 */
export function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Fermer">×</button>
        </div>
    `;
    
    // Styles inline pour éviter les dépendances CSS
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border-left: 4px solid ${getNotificationColor(type)};
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        overflow: hidden;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.7;
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Gestion de la fermeture
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto-remove
    if (duration > 0) {
        setTimeout(() => removeNotification(notification), duration);
    }
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    return colors[type] || colors.info;
}

/**
 * Loading state management
 */
export function showLoading(text = 'Chargement...') {
    const loader = document.getElementById('loading-spinner');
    if (loader) {
        loader.classList.remove('hidden');
    }
}

export function hideLoading() {
    const loader = document.getElementById('loading-spinner');
    if (loader) {
        loader.classList.add('hidden');
    }
}

// Export pour l'initialisation
export { initializeUI as default };
