// admin.js - Interface d'administration avancée
import { 
  collection, 
  query, 
  orderBy, 
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from './firebase-init.js';
import { COLLECTIONS, STATUS } from './config.js';
import { showToast, showModal, hideModal } from './ui.js';

class AdminManager {
  constructor() {
    this.currentUser = null;
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    this.setupNavigation();
    this.loadDashboard();
  }

  // Configuration de la navigation admin
  setupNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        this.switchView(view);
      });
    });
  }

  // Changer de vue dans l'interface admin
  switchView(view) {
    // Mettre à jour la navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });

    // Masquer tous les contenus
    document.querySelectorAll('.admin-content').forEach(content => {
      content.style.display = 'none';
    });

    // Afficher le contenu sélectionné
    const targetContent = document.getElementById(`admin-${view}`);
    if (targetContent) {
      targetContent.style.display = 'block';
    }

    this.currentView = view;

    // Charger les données pour la vue
    switch (view) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'bookings':
        this.loadBookings();
        break;
      case 'events':
        this.loadEvents();
        break;
      case 'reviews':
        if (window.reviewsManager) {
          window.reviewsManager.loadAllReviewsForAdmin();
        }
        break;
      case 'cms':
        if (window.cmsManager) {
          window.cmsManager.createEditInterface();
        }
        break;
      case 'users':
        this.loadUsers();
        break;
    }
  }

  // Charger le tableau de bord
  async loadDashboard() {
    try {
      const stats = await this.getStats();
      const recentActivity = await this.getRecentActivity();
      
      this.displayDashboard(stats, recentActivity);
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
      showToast('Erreur lors du chargement du tableau de bord', 'error');
    }
  }

  // Obtenir les statistiques
  async getStats() {
    const stats = {
      totalBookings: 0,
      activeBookings: 0,
      totalEvents: 0,
      pendingReviews: 0,
      totalUsers: 0
    };

    try {
      // Réservations totales
      const bookingsSnapshot = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
      stats.totalBookings = bookingsSnapshot.size;
      stats.activeBookings = bookingsSnapshot.docs.filter(doc => 
        doc.data().status === STATUS.ACTIVE
      ).length;

      // Événements
      const eventsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
      stats.totalEvents = eventsSnapshot.size;

      // Avis en attente
      const pendingReviewsQuery = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('status', '==', STATUS.PENDING)
      );
      const pendingReviewsSnapshot = await getDocs(pendingReviewsQuery);
      stats.pendingReviews = pendingReviewsSnapshot.size;

      // Utilisateurs
      const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      stats.totalUsers = usersSnapshot.size;

    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
    }

    return stats;
  }

  // Obtenir l'activité récente
  async getRecentActivity() {
    const activities = [];

    try {
      // Réservations récentes
      const recentBookingsQuery = query(
        collection(db, COLLECTIONS.BOOKINGS),
        orderBy('createdAt', 'desc')
      );
      const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
      
      recentBookingsSnapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'booking',
          message: `Nouvelle réservation`,
          date: data.createdAt,
          status: data.status
        });
      });

      // Avis récents
      const recentReviewsQuery = query(
        collection(db, COLLECTIONS.REVIEWS),
        orderBy('createdAt', 'desc')
      );
      const recentReviewsSnapshot = await getDocs(recentReviewsQuery);
      
      recentReviewsSnapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        activities.push({
          type: 'review',
          message: `Nouvel avis (${data.rating}/5)`,
          date: data.createdAt,
          status: data.status
        });
      });

      // Trier par date
      activities.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });

    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité récente:', error);
    }

    return activities.slice(0, 10);
  }

  // Afficher le tableau de bord
  displayDashboard(stats, activities) {
    const container = document.getElementById('admin-dashboard');
    if (!container) return;

    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Tableau de bord</h2>
        <p>Vue d'ensemble de votre activité</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="calendar"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.totalBookings}</h3>
            <p>Réservations totales</p>
            <small>${stats.activeBookings} actives</small>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="users"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.totalEvents}</h3>
            <p>Événements</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="star"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.pendingReviews}</h3>
            <p>Avis en attente</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i data-lucide="user"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.totalUsers}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-activity">
          <h3>Activité récente</h3>
          <div class="activity-list">
            ${activities.map(activity => `
              <div class="activity-item ${activity.status}">
                <div class="activity-icon">
                  <i data-lucide="${activity.type === 'booking' ? 'calendar' : 'star'}"></i>
                </div>
                <div class="activity-content">
                  <p>${activity.message}</p>
                  <small>${this.formatDate(activity.date)}</small>
                </div>
                <span class="status-badge status-${activity.status}">${this.getStatusLabel(activity.status)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Réinitialiser les icônes Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Charger les réservations avec export CSV
  async loadBookings() {
    try {
      const bookingsQuery = query(
        collection(db, COLLECTIONS.BOOKINGS),
        orderBy('createdAt', 'desc')
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const bookings = [];
      for (const doc of bookingsSnapshot.docs) {
        const bookingData = doc.data();
        
        // Récupérer les détails du slot
        const slotDoc = await getDocs(query(
          collection(db, COLLECTIONS.SLOTS),
          where('__name__', '==', bookingData.slotId)
        ));
        
        const slotData = slotDoc.docs[0]?.data() || {};
        
        // Récupérer les détails de l'utilisateur
        const userDoc = await getDocs(query(
          collection(db, COLLECTIONS.USERS),
          where('__name__', '==', bookingData.userId)
        ));
        
        const userData = userDoc.docs[0]?.data() || {};
        
        bookings.push({
          id: doc.id,
          ...bookingData,
          slot: slotData,
          user: userData
        });
      }
      
      this.displayBookings(bookings);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      showToast('Erreur lors du chargement des réservations', 'error');
    }
  }

  // Afficher les réservations
  displayBookings(bookings) {
    const container = document.getElementById('admin-bookings');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-section-header">
        <h3>Gestion des réservations (${bookings.length})</h3>
        <button class="btn btn-primary" onclick="adminManager.exportBookingsCSV()">
          <i data-lucide="download"></i> Exporter CSV
        </button>
      </div>
      
      <div class="bookings-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date/Heure</th>
              <th>Client</th>
              <th>Contact</th>
              <th>Lieu</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(booking => `
              <tr class="booking-row ${booking.status}">
                <td>
                  <strong>${this.formatDateTime(booking.slot.startAt)}</strong><br>
                  <small>${this.formatDateTime(booking.slot.endAt)}</small>
                </td>
                <td>
                  <strong>${booking.user.displayName || 'N/A'}</strong><br>
                  <small>${booking.user.email || 'N/A'}</small>
                </td>
                <td>
                  <small>${booking.user.phone || 'N/A'}</small>
                </td>
                <td>${booking.slot.location || 'N/A'}</td>
                <td>
                  <span class="status-badge status-${booking.status}">
                    ${this.getStatusLabel(booking.status)}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    ${booking.status === STATUS.ACTIVE ? `
                      <button class="btn btn-warning btn-sm" onclick="adminManager.cancelBooking('${booking.id}')">
                        <i data-lucide="x"></i> Annuler
                      </button>
                    ` : ''}
                    <button class="btn btn-danger btn-sm" onclick="adminManager.deleteBooking('${booking.id}')">
                      <i data-lucide="trash-2"></i> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Réinitialiser les icônes Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Exporter les réservations en CSV
  async exportBookingsCSV() {
    try {
      const bookingsSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.BOOKINGS), orderBy('createdAt', 'desc'))
      );
      
      const csvData = [];
      csvData.push(['Date', 'Heure début', 'Heure fin', 'Client', 'Email', 'Téléphone', 'Lieu', 'Statut', 'Date réservation']);
      
      for (const doc of bookingsSnapshot.docs) {
        const booking = doc.data();
        
        // Récupérer les détails du slot et de l'utilisateur
        // (même logique que dans loadBookings)
        
        csvData.push([
          this.formatDate(booking.slot?.startAt),
          this.formatTime(booking.slot?.startAt),
          this.formatTime(booking.slot?.endAt),
          booking.user?.displayName || 'N/A',
          booking.user?.email || 'N/A',
          booking.user?.phone || 'N/A',
          booking.slot?.location || 'N/A',
          this.getStatusLabel(booking.status),
          this.formatDate(booking.createdAt)
        ]);
      }
      
      this.downloadCSV(csvData, 'reservations_lbr.csv');
      showToast('Export CSV généré avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      showToast('Erreur lors de l\'export CSV', 'error');
    }
  }

  // Télécharger un fichier CSV
  downloadCSV(data, filename) {
    const csvContent = data.map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Annuler une réservation
  async cancelBooking(bookingId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await updateDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId), {
        status: STATUS.CANCELED
      });
      
      showToast('Réservation annulée', 'success');
      this.loadBookings(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      showToast('Erreur lors de l\'annulation', 'error');
    }
  }

  // Supprimer une réservation
  async deleteBooking(bookingId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette réservation ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId));
      
      showToast('Réservation supprimée', 'success');
      this.loadBookings(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  }

  // Charger les utilisateurs
  async loadUsers() {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'))
      );
      
      const users = [];
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      this.displayUsers(users);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      showToast('Erreur lors du chargement des utilisateurs', 'error');
    }
  }

  // Afficher les utilisateurs
  displayUsers(users) {
    const container = document.getElementById('admin-users');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-section-header">
        <h3>Gestion des utilisateurs (${users.length})</h3>
      </div>
      
      <div class="users-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr class="user-row">
                <td><strong>${user.displayName || 'N/A'}</strong></td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                  <span class="role-badge role-${user.role || 'user'}">
                    ${user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-outline btn-sm" onclick="adminManager.toggleUserRole('${user.id}', '${user.role}')">
                      <i data-lucide="user-check"></i> 
                      ${user.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Réinitialiser les icônes Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Changer le rôle d'un utilisateur
  async toggleUserRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promouvoir' : 'rétrograder';
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        role: newRole
      });
      
      showToast(`Utilisateur ${action === 'promouvoir' ? 'promu' : 'rétrogradé'} avec succès`, 'success');
      this.loadUsers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      showToast('Erreur lors du changement de rôle', 'error');
    }
  }

  // Utilitaires de formatage
  formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR');
  }

  formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status) {
    const labels = {
      [STATUS.ACTIVE]: 'Actif',
      [STATUS.CANCELED]: 'Annulé',
      [STATUS.PENDING]: 'En attente',
      [STATUS.APPROVED]: 'Approuvé',
      [STATUS.REJECTED]: 'Rejeté',
      [STATUS.OPEN]: 'Ouvert',
      [STATUS.CLOSED]: 'Fermé'
    };
    return labels[status] || status;
  }
}

// Instance globale
const adminManager = new AdminManager();

// Export pour utilisation globale
window.adminManager = adminManager;

export { adminManager };
