// Testimonials.js - Gestion moderne du carrousel de témoignages
import { db } from './firebase-init.js';
import { collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Initialise le carrousel de témoignages moderne
 */
export async function initializeTestimonials() {
    try {
        const testimonials = await loadTestimonials();
        if (testimonials.length > 0) {
            renderTestimonials(testimonials);
            initializeCarousel(testimonials.length);
        } else {
            renderFallbackTestimonials();
        }
    } catch (error) {
        console.warn('Erreur chargement témoignages:', error);
        renderFallbackTestimonials();
    }
}

/**
 * Charge les témoignages depuis Firestore
 */
async function loadTestimonials() {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'),
            limit(6)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
        return [];
    }
}

/**
 * Témoignages de fallback si la base de données n'est pas accessible
 */
function renderFallbackTestimonials() {
    const fallbackTestimonials = [
        {
            id: 'fallback-1',
            userName: 'Marie L.',
            userEmail: 'marie@example.com',
            rating: 5,
            comment: 'Une expérience transformatrice ! Jade m\'a aidée à retrouver confiance en moi et à mettre en place des routines qui changent vraiment ma vie au quotidien.',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b15c?w=150&h=150&fit=crop&crop=face',
            serviceType: 'coaching'
        },
        {
            id: 'fallback-2',
            userName: 'Thomas K.',
            userEmail: 'thomas@example.com',
            rating: 5,
            comment: 'Les ateliers SAP sont géniaux ! L\'ambiance bienveillante et les outils concrets m\'ont permis de mieux gérer mon stress et d\'améliorer mes relations.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            serviceType: 'sap'
        },
        {
            id: 'fallback-3',
            userName: 'Sophie M.',
            userEmail: 'sophie@example.com',
            rating: 5,
            comment: 'Un accompagnement personnalisé exceptionnel. Grâce à Jade, j\'ai enfin trouvé l\'équilibre entre ma vie professionnelle et personnelle. Je recommande vivement !',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            serviceType: 'developpement'
        }
    ];
    
    renderTestimonials(fallbackTestimonials);
    initializeCarousel(fallbackTestimonials.length);
}

/**
 * Affiche les témoignages dans l'interface
 */
function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    container.innerHTML = testimonials.map((testimonial, index) => `
        <div class="testimonial-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <div class="testimonial-content">
                <div class="testimonial-quote">
                    ${testimonial.comment}
                </div>
                
                <div class="testimonial-rating">
                    ${generateStarRating(testimonial.rating)}
                </div>
                
                <div class="testimonial-author">
                    <img src="${testimonial.avatar || generateAvatar(testimonial.userName)}" 
                         alt="${testimonial.userName}" 
                         class="author-avatar"
                         loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,${generateDefaultAvatar()}'">
                    
                    <div class="author-info">
                        <h4>${testimonial.userName}</h4>
                        <p>${getServiceLabel(testimonial.serviceType)}</p>
                        ${testimonial.createdAt ? `<time class="testimonial-date" datetime="${testimonial.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()}">
                            ${formatDate(testimonial.createdAt)}
                        </time>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Initialise le carrousel interactif
 */
function initializeCarousel(totalSlides) {
    if (totalSlides <= 1) return;

    let currentSlide = 0;
    let autoplayInterval;
    const autoplayDelay = 5000;
    
    // Créer les contrôles
    createCarouselControls(totalSlides);
    
    // Fonctions de navigation
    const showSlide = (index) => {
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.carousel-dot');
        
        // Masquer toutes les slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Afficher la slide active
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        
        // Mettre à jour les dots
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        
        currentSlide = index;
    };
    
    const nextSlide = () => {
        const next = (currentSlide + 1) % totalSlides;
        showSlide(next);
    };
    
    const prevSlide = () => {
        const prev = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(prev);
    };
    
    // Gestion des événements
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
    }
    
    // Gestion des dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoplay();
        });
    });
    
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoplay();
        }
    });
    
    // Autoplay
    const startAutoplay = () => {
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    };
    
    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    };
    
    const resetAutoplay = () => {
        stopAutoplay();
        startAutoplay();
    };
    
    // Pause autoplay au hover
    const carousel = document.querySelector('.testimonials-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
    }
    
    // Pause autoplay si l'onglet n'est pas visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });
    
    // Démarrer l'autoplay
    startAutoplay();
    
    // Gestion du swipe sur mobile
    let startX = 0;
    let endX = 0;
    
    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });
    }
    
    const handleSwipe = () => {
        const diff = startX - endX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide(); // Swipe gauche
            } else {
                prevSlide(); // Swipe droite
            }
            resetAutoplay();
        }
    };
}

/**
 * Crée les contrôles du carrousel
 */
function createCarouselControls(totalSlides) {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer) return;

    // Créer les dots
    const dots = Array.from({ length: totalSlides }, (_, index) => 
        `<button class="carousel-dot ${index === 0 ? 'active' : ''}" 
                aria-label="Aller au témoignage ${index + 1}" 
                data-slide="${index}"></button>`
    ).join('');
    
    dotsContainer.innerHTML = dots;
}

/**
 * Génère les étoiles pour le rating
 */
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    
    let stars = '';
    
    // Étoiles pleines
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star star-full">★</span>';
    }
    
    // Demi-étoile
    if (hasHalfStar) {
        stars += '<span class="star star-half">★</span>';
    }
    
    // Étoiles vides
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star star-empty">☆</span>';
    }
    
    return stars;
}

/**
 * Génère un avatar basé sur le nom
 */
function generateAvatar(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="75" r="75" fill="${color}"/>
            <text x="75" y="90" font-family="Arial, sans-serif" font-size="60" 
                  fill="white" text-anchor="middle" font-weight="bold">${firstLetter}</text>
        </svg>
    `)}`;
}

/**
 * Avatar par défaut en cas d'erreur
 */
function generateDefaultAvatar() {
    return btoa(`
        <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
            <circle cx="75" cy="75" r="75" fill="#E5E7EB"/>
            <path d="M75 65c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15z" fill="#9CA3AF"/>
            <path d="M75 85c-16.569 0-30 13.431-30 30v10h60v-10c0-16.569-13.431-30-30-30z" fill="#9CA3AF"/>
        </svg>
    `);
}

/**
 * Convertit le type de service en label lisible
 */
function getServiceLabel(serviceType) {
    const labels = {
        'coaching': 'Coaching Individuel',
        'developpement': 'Développement Personnel',
        'sap': 'Atelier SAP',
        'decouverte': 'Séance Découverte'
    };
    return labels[serviceType] || 'Client';
}

/**
 * Formate la date du témoignage
 */
function formatDate(timestamp) {
    if (!timestamp) return '';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return '';
    }
}

// Ajouter les styles CSS pour les témoignages
const style = document.createElement('style');
style.textContent = `
    .star {
        color: #F59E0B;
        font-size: 1.25rem;
        margin-right: 2px;
    }
    
    .star-empty {
        color: #E5E7EB;
    }
    
    .star-half {
        background: linear-gradient(90deg, #F59E0B 50%, #E5E7EB 50%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .testimonial-date {
        font-size: 0.875rem;
        color: var(--gris);
        font-style: italic;
    }
`;
document.head.appendChild(style);

export default initializeTestimonials;
