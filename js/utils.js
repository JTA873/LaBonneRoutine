// utils.js - Fonctions utilitaires
import { Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Validation d'email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation de numéro de téléphone français
export function isValidPhoneNumber(phone) {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

// Formatage des dates
export function formatDate(timestamp, options = {}) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
}

// Formatage des heures
export function formatTime(timestamp, options = {}) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleTimeString('fr-FR', { ...defaultOptions, ...options });
}

// Formatage date et heure complète
export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Créer un timestamp Firestore à partir d'une date
export function createTimestamp(date) {
  return Timestamp.fromDate(date instanceof Date ? date : new Date(date));
}

// Obtenir le début de la semaine
export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
  return new Date(d.setDate(diff));
}

// Obtenir la fin de la semaine
export function getEndOfWeek(date = new Date()) {
  const start = getStartOfWeek(date);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

// Générer un tableau de dates pour une semaine
export function getWeekDates(startDate = new Date()) {
  const start = getStartOfWeek(startDate);
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

// Vérifier si deux dates sont le même jour
export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  
  const d1 = date1.toDate ? date1.toDate() : new Date(date1);
  const d2 = date2.toDate ? date2.toDate() : new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// Vérifier si une date est dans le futur
export function isFutureDate(date) {
  if (!date) return false;
  
  const d = date.toDate ? date.toDate() : new Date(date);
  return d > new Date();
}

// Vérifier si une date est aujourd'hui
export function isToday(date) {
  return isSameDay(date, new Date());
}

// Calculer la différence en jours entre deux dates
export function daysDifference(date1, date2) {
  const d1 = date1.toDate ? date1.toDate() : new Date(date1);
  const d2 = date2.toDate ? date2.toDate() : new Date(date2);
  
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Sanitizer pour HTML (prévention XSS)
export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Échapper les caractères HTML
export function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Truncate text
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Générer un ID unique
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Validation de mot de passe
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Générer un mot de passe aléatoire
export function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// Copier du texte dans le presse-papiers
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Détecter si l'utilisateur est sur mobile
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Détecter si l'utilisateur est en mode sombre
export function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Gestion des paramètres URL
export function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function setUrlParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}

export function removeUrlParam(param) {
  const url = new URL(window.location);
  url.searchParams.delete(param);
  window.history.pushState({}, '', url);
}

// Formatter un nombre en euros
export function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Calculer la note moyenne
export function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

// Générer des étoiles pour l'affichage
export function generateStars(rating, maxStars = 5) {
  let stars = '';
  for (let i = 1; i <= maxStars; i++) {
    if (i <= rating) {
      stars += '★';
    } else if (i - 0.5 <= rating) {
      stars += '⭐';
    } else {
      stars += '☆';
    }
  }
  return stars;
}

// Storage utilities avec gestion d'erreur
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en localStorage:', error);
      return false;
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage:', error);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du localStorage:', error);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Erreur lors du nettoyage du localStorage:', error);
      return false;
    }
  }
};

// Analytics simples (sans dépendance externe)
export const analytics = {
  track(event, data = {}) {
    // Log simple pour le développement
    console.log('Analytics Event:', event, data);
    
    // Ici on pourrait intégrer Google Analytics, Mixpanel, etc.
    // gtag('event', event, data);
  },
  
  pageView(page) {
    this.track('page_view', { page });
  },
  
  userAction(action, category = 'user') {
    this.track(action, { category });
  }
};

// Gestion des erreurs globales
export function setupErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
    analytics.track('javascript_error', {
      message: event.error.message,
      filename: event.filename,
      lineno: event.lineno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejetée:', event.reason);
    analytics.track('promise_rejection', {
      reason: event.reason.toString()
    });
  });
}

// Performance monitoring simple
export const performance = {
  mark(name) {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },
  
  measure(name, startMark, endMark) {
    if (window.performance && window.performance.measure) {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      console.log(`Performance ${name}:`, measure.duration + 'ms');
      return measure.duration;
    }
  }
};

// Initialisation des utilitaires
document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling();
});
