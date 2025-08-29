// cms.js - Système de gestion de contenu léger
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db, auth } from './firebase-init.js';
import { COLLECTIONS } from './config.js';
import { showToast } from './ui.js';

class CMSManager {
  constructor() {
    this.currentUser = null;
    this.cache = new Map();
    this.unsubscribers = [];
    this.init();
  }

  async init() {
    // Écouter les changements d'authentification
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
    });

    // Charger le cache depuis localStorage
    this.loadFromLocalStorage();
    
    // Écouter les mises à jour en temps réel
    this.setupRealtimeListeners();
  }

  // Configuration des documents CMS par défaut
  getDefaultContent() {
    return {
      services: {
        title: 'Nos Services',
        content: `
          <div class="services-grid">
            <div class="service-item">
              <h3>Accompagnement sur-mesure</h3>
              <p>Programmes personnalisés selon vos objectifs et votre niveau</p>
            </div>
            <div class="service-item">
              <h3>Coaching à domicile, en salle ou en extérieur</h3>
              <p>Flexibilité totale pour s'adapter à votre emploi du temps</p>
            </div>
            <div class="service-item">
              <h3>Bilan personnalisé et suivi adapté</h3>
              <p>Évaluation complète et ajustement continu du programme</p>
            </div>
            <div class="service-item">
              <h3>Sport santé, remise en forme, perte de poids, prise de masse</h3>
              <p>Objectifs variés pour répondre à tous vos besoins</p>
            </div>
            <div class="service-item">
              <h3>Accessible à tous les niveaux</h3>
              <p>Du débutant au sportif confirmé</p>
            </div>
          </div>
        `
      },
      pricing: {
        title: 'Nos Tarifs',
        content: `
          <div class="pricing-container">
            <div class="pricing-section">
              <h3>Tarifs Classiques</h3>
              <div class="pricing-grid">
                <div class="price-item">
                  <span class="price">75 €</span>
                  <span class="description">1 séance</span>
                </div>
                <div class="price-item featured">
                  <span class="price">65 €</span>
                  <span class="description">Pack 5 séances</span>
                  <span class="unit">/ séance</span>
                </div>
                <div class="price-item">
                  <span class="price">60 €</span>
                  <span class="description">Pack 10 séances</span>
                  <span class="unit">/ séance</span>
                </div>
                <div class="price-item">
                  <span class="price">55 €</span>
                  <span class="description">Pack 20 séances</span>
                  <span class="unit">/ séance</span>
                </div>
              </div>
            </div>
            <div class="pricing-section">
              <h3>Tarifs Service à la Personne (SAP)</h3>
              <div class="pricing-grid">
                <div class="price-item">
                  <span class="price">90 €</span>
                  <span class="description">1 séance</span>
                </div>
                <div class="price-item">
                  <span class="price">80 €</span>
                  <span class="description">Pack 5 séances</span>
                  <span class="unit">/ séance</span>
                </div>
                <div class="price-item featured">
                  <span class="price">75 €</span>
                  <span class="description">Pack 10 séances</span>
                  <span class="unit">/ séance</span>
                </div>
                <div class="price-item">
                  <span class="price">70 €</span>
                  <span class="description">Pack 20 séances</span>
                  <span class="unit">/ séance</span>
                </div>
              </div>
            </div>
          </div>
        `
      },
      banner: {
        title: 'Bandeau d\'alerte',
        content: '',
        visible: false
      },
      badges: {
        title: 'Badges et certifications',
        content: `
          <div class="badges-container">
            <div class="badge-item">
              <strong>Service à la Personne</strong>
              <p>Agréé SAP - Prestations de qualité</p>
            </div>
            <div class="badge-item">
              <strong>Réduction d'impôt 50%</strong>
              <p>Crédit d'impôt immédiat</p>
            </div>
            <div class="badge-item">
              <strong>Chèques-Vacances ANCV</strong>
              <p>Paiement accepté</p>
            </div>
          </div>
        `
      }
    };
  }

  // Écouter les mises à jour en temps réel
  setupRealtimeListeners() {
    const cmsRef = collection(db, COLLECTIONS.CMS);
    
    const unsubscribe = onSnapshot(cmsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const docData = change.doc.data();
          this.cache.set(change.doc.id, docData);
          this.updateDisplay(change.doc.id, docData);
        }
      });
      
      // Sauvegarder en localStorage
      this.saveToLocalStorage();
    });

    this.unsubscribers.push(unsubscribe);
  }

  // Charger le contenu depuis le cache ou Firestore
  async loadContent(contentId) {
    // Vérifier d'abord le cache
    if (this.cache.has(contentId)) {
      return this.cache.get(contentId);
    }

    try {
      const docRef = doc(db, COLLECTIONS.CMS, contentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache.set(contentId, data);
        return data;
      } else {
        // Créer le contenu par défaut s'il n'existe pas
        const defaultContent = this.getDefaultContent()[contentId];
        if (defaultContent) {
          await this.saveContent(contentId, defaultContent);
          return defaultContent;
        }
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du contenu ${contentId}:`, error);
    }

    return null;
  }

  // Sauvegarder le contenu
  async saveContent(contentId, content) {
    if (!this.currentUser) {
      showToast('Vous devez être connecté pour modifier le contenu', 'error');
      return false;
    }

    try {
      const docRef = doc(db, COLLECTIONS.CMS, contentId);
      const dataToSave = {
        ...content,
        updatedAt: serverTimestamp(),
        updatedBy: this.currentUser.uid
      };

      await setDoc(docRef, dataToSave, { merge: true });
      
      // Mettre à jour le cache
      this.cache.set(contentId, dataToSave);
      
      showToast('Contenu mis à jour avec succès', 'success');
      return true;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du contenu ${contentId}:`, error);
      showToast('Erreur lors de la sauvegarde', 'error');
      return false;
    }
  }

  // Mettre à jour l'affichage du contenu
  updateDisplay(contentId, content) {
    const elements = document.querySelectorAll(`[data-cms="${contentId}"]`);
    
    elements.forEach(element => {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = content.content || '';
      } else {
        element.innerHTML = content.content || '';
      }
    });

    // Cas spécial pour le bandeau d'alerte
    if (contentId === 'banner') {
      this.updateBanner(content);
    }

    // Réinitialiser les icônes Lucide si nécessaire
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Gérer l'affichage du bandeau d'alerte
  updateBanner(bannerContent) {
    const banner = document.getElementById('alert-banner');
    if (!banner) return;

    if (bannerContent.visible && bannerContent.content) {
      banner.innerHTML = `
        <div class="container">
          <div class="banner-content">
            ${bannerContent.content}
            <button class="banner-close" onclick="this.parentElement.parentElement.parentElement.style.display='none'">
              <i data-lucide="x"></i>
            </button>
          </div>
        </div>
      `;
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  }

  // Charger tous les contenus
  async loadAllContent() {
    const contentIds = Object.keys(this.getDefaultContent());
    const promises = contentIds.map(id => this.loadContent(id));
    
    try {
      const results = await Promise.all(promises);
      contentIds.forEach((id, index) => {
        if (results[index]) {
          this.updateDisplay(id, results[index]);
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des contenus:', error);
    }
  }

  // Interface d'édition pour l'admin
  createEditInterface() {
    const container = document.getElementById('cms-editor');
    if (!container) return;

    const defaultContent = this.getDefaultContent();
    
    container.innerHTML = `
      <div class="cms-editor">
        <h3>Éditeur de contenu</h3>
        ${Object.entries(defaultContent).map(([key, config]) => `
          <div class="cms-section" data-section="${key}">
            <div class="cms-section-header">
              <h4>${config.title}</h4>
              <button class="btn btn-primary btn-sm" onclick="cmsManager.saveSection('${key}')">
                <i data-lucide="save"></i> Sauvegarder
              </button>
            </div>
            <div class="cms-section-content">
              ${key === 'banner' ? `
                <div class="banner-controls">
                  <label class="checkbox-label">
                    <input type="checkbox" id="banner-visible" ${this.cache.get(key)?.visible ? 'checked' : ''}>
                    Afficher le bandeau
                  </label>
                </div>
              ` : ''}
              <textarea 
                class="cms-textarea" 
                data-section="${key}"
                placeholder="Contenu..."
                rows="${key === 'banner' ? '3' : '10'}"
              >${this.cache.get(key)?.content || config.content}</textarea>
              <div class="cms-preview">
                <h5>Aperçu :</h5>
                <div class="preview-content" data-cms="${key}">
                  ${this.cache.get(key)?.content || config.content}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Réinitialiser les icônes Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Ajouter les gestionnaires d'événements pour la prévisualisation
    this.setupPreviewHandlers();
  }

  // Gérer la prévisualisation en temps réel
  setupPreviewHandlers() {
    const textareas = document.querySelectorAll('.cms-textarea');
    
    textareas.forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const section = e.target.dataset.section;
        const preview = document.querySelector(`.preview-content[data-cms="${section}"]`);
        if (preview) {
          preview.innerHTML = e.target.value;
        }
      });
    });
  }

  // Sauvegarder une section depuis l'interface d'édition
  async saveSection(sectionId) {
    const textarea = document.querySelector(`.cms-textarea[data-section="${sectionId}"]`);
    if (!textarea) return;

    const content = {
      content: textarea.value
    };

    // Cas spécial pour le bandeau
    if (sectionId === 'banner') {
      const visibleCheckbox = document.getElementById('banner-visible');
      content.visible = visibleCheckbox ? visibleCheckbox.checked : false;
    }

    await this.saveContent(sectionId, content);
  }

  // Gestion du localStorage pour le cache
  saveToLocalStorage() {
    try {
      const cacheData = {};
      this.cache.forEach((value, key) => {
        cacheData[key] = value;
      });
      localStorage.setItem('lbr_cms_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem('lbr_cms_cache');
      if (cached) {
        const cacheData = JSON.parse(cached);
        Object.entries(cacheData).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis localStorage:', error);
    }
  }

  // Nettoyer les écouteurs
  cleanup() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }
}

// Instance globale
const cmsManager = new CMSManager();

// Charger le contenu au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  cmsManager.loadAllContent();
});

// Export pour utilisation globale
window.cmsManager = cmsManager;

export { cmsManager };
