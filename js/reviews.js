// reviews.js - Gestion des avis et témoignages
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db, auth } from './firebase-init.js';
import { COLLECTIONS, STATUS } from './config.js';
import { showToast, showModal, hideModal } from './ui.js';

class ReviewsManager {
  constructor() {
    this.currentUser = null;
    this.unsubscribers = [];
    this.init();
  }

  async init() {
    // Écouter les changements d'authentification
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.loadReviews();
    });
  }

  // Charger les avis approuvés pour affichage public
  loadReviews() {
    const reviewsQuery = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('status', '==', STATUS.APPROVED),
      orderBy('pinned', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviews = [];
      snapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      this.displayReviews(reviews);
    });

    this.unsubscribers.push(unsubscribe);
  }

  // Afficher les avis dans le carrousel
  displayReviews(reviews) {
    const carousel = document.getElementById('reviews-carousel');
    if (!carousel) return;

    if (reviews.length === 0) {
      carousel.innerHTML = '<p class="text-center">Aucun avis pour le moment.</p>';
      return;
    }

    carousel.innerHTML = reviews.map(review => `
      <div class="review-card ${review.pinned ? 'pinned' : ''}">
        <div class="review-rating">
          ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
        </div>
        <p class="review-text">"${review.text}"</p>
        <div class="review-author">
          <strong>${review.userName || 'Client anonyme'}</strong>
          <span class="review-date">${this.formatDate(review.createdAt)}</span>
        </div>
        ${review.pinned ? '<div class="pinned-badge">Épinglé</div>' : ''}
      </div>
    `).join('');

    // Initialiser le carrousel si nécessaire
    this.initCarousel();
  }

  // Initialiser le carrousel (rotation automatique)
  initCarousel() {
    const carousel = document.getElementById('reviews-carousel');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.review-card');
    if (cards.length <= 1) return;

    let currentIndex = 0;
    const showCard = (index) => {
      cards.forEach((card, i) => {
        card.style.display = i === index ? 'block' : 'none';
      });
    };

    showCard(0);

    // Rotation automatique toutes les 5 secondes
    setInterval(() => {
      currentIndex = (currentIndex + 1) % cards.length;
      showCard(currentIndex);
    }, 5000);
  }

  // Soumettre un nouvel avis
  async submitReview(rating, text) {
    if (!this.currentUser) {
      showToast('Vous devez être connecté pour laisser un avis', 'error');
      return false;
    }

    if (!rating || rating < 1 || rating > 5) {
      showToast('Veuillez sélectionner une note entre 1 et 5 étoiles', 'error');
      return false;
    }

    if (!text || text.trim().length < 10) {
      showToast('Votre avis doit contenir au moins 10 caractères', 'error');
      return false;
    }

    try {
      await addDoc(collection(db, COLLECTIONS.REVIEWS), {
        userId: this.currentUser.uid,
        userName: this.currentUser.displayName || 'Client anonyme',
        rating: parseInt(rating),
        text: text.trim(),
        status: STATUS.PENDING,
        pinned: false,
        createdAt: serverTimestamp()
      });

      showToast('Votre avis a été soumis et sera publié après modération', 'success');
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      showToast('Erreur lors de la soumission de votre avis', 'error');
      return false;
    }
  }

  // Charger tous les avis pour l'admin
  loadAllReviewsForAdmin() {
    const reviewsQuery = query(
      collection(db, COLLECTIONS.REVIEWS),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviews = [];
      snapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      this.displayAdminReviews(reviews);
    });

    this.unsubscribers.push(unsubscribe);
  }

  // Afficher les avis dans l'interface admin
  displayAdminReviews(reviews) {
    const container = document.getElementById('admin-reviews');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-section-header">
        <h3>Gestion des avis (${reviews.length})</h3>
      </div>
      <div class="reviews-list">
        ${reviews.map(review => `
          <div class="review-item ${review.status}" data-review-id="${review.id}">
            <div class="review-header">
              <div class="review-info">
                <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                <span class="review-author">${review.userName}</span>
                <span class="review-date">${this.formatDate(review.createdAt)}</span>
                <span class="status-badge status-${review.status}">${this.getStatusLabel(review.status)}</span>
                ${review.pinned ? '<span class="pinned-badge">Épinglé</span>' : ''}
              </div>
              <div class="review-actions">
                ${review.status === STATUS.PENDING ? `
                  <button class="btn btn-success btn-sm" onclick="reviewsManager.approveReview('${review.id}')">
                    <i data-lucide="check"></i> Approuver
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="reviewsManager.rejectReview('${review.id}')">
                    <i data-lucide="x"></i> Rejeter
                  </button>
                ` : ''}
                ${review.status === STATUS.APPROVED ? `
                  <button class="btn btn-outline btn-sm" onclick="reviewsManager.togglePin('${review.id}', ${!review.pinned})">
                    <i data-lucide="${review.pinned ? 'pin-off' : 'pin'}"></i> ${review.pinned ? 'Désépingler' : 'Épingler'}
                  </button>
                  <button class="btn btn-warning btn-sm" onclick="reviewsManager.hideReview('${review.id}')">
                    <i data-lucide="eye-off"></i> Masquer
                  </button>
                ` : ''}
                <button class="btn btn-danger btn-sm" onclick="reviewsManager.deleteReview('${review.id}')">
                  <i data-lucide="trash-2"></i> Supprimer
                </button>
              </div>
            </div>
            <div class="review-content">
              <p>"${review.text}"</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Réinitialiser les icônes Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Approuver un avis
  async approveReview(reviewId) {
    try {
      await updateDoc(doc(db, COLLECTIONS.REVIEWS, reviewId), {
        status: STATUS.APPROVED
      });
      showToast('Avis approuvé', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      showToast('Erreur lors de l\'approbation', 'error');
    }
  }

  // Rejeter un avis
  async rejectReview(reviewId) {
    try {
      await updateDoc(doc(db, COLLECTIONS.REVIEWS, reviewId), {
        status: STATUS.REJECTED
      });
      showToast('Avis rejeté', 'success');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      showToast('Erreur lors du rejet', 'error');
    }
  }

  // Épingler/désépingler un avis
  async togglePin(reviewId, pinned) {
    try {
      await updateDoc(doc(db, COLLECTIONS.REVIEWS, reviewId), {
        pinned: pinned
      });
      showToast(pinned ? 'Avis épinglé' : 'Avis désépinglé', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'épinglage:', error);
      showToast('Erreur lors de l\'épinglage', 'error');
    }
  }

  // Masquer un avis
  async hideReview(reviewId) {
    try {
      await updateDoc(doc(db, COLLECTIONS.REVIEWS, reviewId), {
        status: STATUS.HIDDEN
      });
      showToast('Avis masqué', 'success');
    } catch (error) {
      console.error('Erreur lors du masquage:', error);
      showToast('Erreur lors du masquage', 'error');
    }
  }

  // Supprimer un avis
  async deleteReview(reviewId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.REVIEWS, reviewId));
      showToast('Avis supprimé', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  }

  // Utilitaires
  formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusLabel(status) {
    const labels = {
      [STATUS.PENDING]: 'En attente',
      [STATUS.APPROVED]: 'Approuvé',
      [STATUS.REJECTED]: 'Rejeté',
      [STATUS.HIDDEN]: 'Masqué'
    };
    return labels[status] || status;
  }

  // Nettoyer les écouteurs
  cleanup() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }
}

// Instance globale
const reviewsManager = new ReviewsManager();

// Gestionnaire pour le formulaire d'avis
document.addEventListener('DOMContentLoaded', () => {
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const rating = reviewForm.querySelector('input[name="rating"]:checked')?.value;
      const text = reviewForm.querySelector('textarea[name="review-text"]').value;
      
      const success = await reviewsManager.submitReview(rating, text);
      if (success) {
        reviewForm.reset();
        hideModal('review-modal');
      }
    });
  }

  // Gestion des étoiles cliquables
  const ratingInputs = document.querySelectorAll('.rating-input');
  ratingInputs.forEach((input, index) => {
    input.addEventListener('change', () => {
      const stars = document.querySelectorAll('.rating-star');
      stars.forEach((star, starIndex) => {
        star.classList.toggle('active', starIndex <= index);
      });
    });
  });
});

// Export pour utilisation globale
window.reviewsManager = reviewsManager;

export { reviewsManager };
