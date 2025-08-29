// seed-data.js - Données de test et initialisation
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { db, auth } from './firebase-init.js';
import { COLLECTIONS, STATUS, DEFAULT_ADMIN } from './config.js';

class SeedManager {
  constructor() {
    this.isSeeding = false;
  }

  // Fonction principale de seeding
  async seedAll() {
    if (this.isSeeding) {
      console.log('Seeding already in progress...');
      return;
    }

    this.isSeeding = true;
    console.log('🌱 Starting database seeding...');

    try {
      // 1. Créer l'admin par défaut si nécessaire
      await this.createDefaultAdmin();
      
      // 2. Créer des créneaux d'exemple
      await this.createSampleSlots();
      
      // 3. Créer des événements d'exemple
      await this.createSampleEvents();
      
      // 4. Créer des avis d'exemple
      await this.createSampleReviews();
      
      // 5. Initialiser les contenus CMS
      await this.initializeCMS();
      
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
    } finally {
      this.isSeeding = false;
    }
  }

  // Créer l'admin par défaut si aucun admin n'existe
  async createDefaultAdmin() {
    console.log('👤 Checking for existing admin...');
    
    try {
      // Vérifier s'il existe déjà un admin
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('role', '==', 'admin')
      );
      const adminSnapshot = await getDocs(usersQuery);
      
      if (!adminSnapshot.empty) {
        console.log('✅ Admin already exists, skipping creation');
        return;
      }

      console.log('🔧 Creating default admin account...');
      
      // Créer le compte admin
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        DEFAULT_ADMIN.email, 
        DEFAULT_ADMIN.password
      );
      
      // Créer le document utilisateur avec le rôle admin
      await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
        email: DEFAULT_ADMIN.email,
        displayName: 'Administrateur',
        role: 'admin',
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Default admin created successfully');
      console.log('⚠️  IMPORTANT: Change the default password in production!');
      
      // Se déconnecter après la création
      await signOut(auth);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('✅ Admin email already exists');
      } else {
        console.error('❌ Error creating default admin:', error);
      }
    }
  }

  // Créer des créneaux d'exemple pour les 2 prochaines semaines
  async createSampleSlots() {
    console.log('📅 Creating sample slots...');
    
    const slots = [];
    const now = new Date();
    
    // Créer des créneaux pour les 14 prochains jours
    for (let day = 1; day <= 14; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);
      
      // Skip weekends pour cet exemple
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Créneaux du matin (9h, 10h, 11h)
      for (let hour of [9, 10, 11]) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        slots.push({
          startAt: Timestamp.fromDate(startTime),
          endAt: Timestamp.fromDate(endTime),
          location: this.getRandomLocation(),
          capacity: 1,
          bookedCount: 0,
          status: STATUS.OPEN,
          notes: 'Séance de coaching personnalisé'
        });
      }
      
      // Créneaux de l'après-midi (14h, 15h, 16h, 17h)
      for (let hour of [14, 15, 16, 17]) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        slots.push({
          startAt: Timestamp.fromDate(startTime),
          endAt: Timestamp.fromDate(endTime),
          location: this.getRandomLocation(),
          capacity: 1,
          bookedCount: 0,
          status: STATUS.OPEN,
          notes: 'Séance de coaching personnalisé'
        });
      }
    }
    
    // Sauvegarder les créneaux
    for (const slot of slots) {
      await addDoc(collection(db, COLLECTIONS.SLOTS), slot);
    }
    
    console.log(`✅ Created ${slots.length} sample slots`);
  }

  // Créer des événements d'exemple
  async createSampleEvents() {
    console.log('🎉 Creating sample events...');
    
    const events = [
      {
        title: 'Séance collective en plein air',
        description: 'Venez découvrir le fitness en extérieur ! Une séance dynamique et conviviale dans un cadre naturel. Accessible à tous les niveaux, cette session vous permettra de vous dépenser tout en profitant du grand air. Matériel fourni.',
        tags: ['fitness', 'exterieur', 'collectif'],
        location: 'Parc de la Maourine, Toulouse',
        startAt: Timestamp.fromDate(this.getDateInFuture(7, 10, 0)), // Dans 7 jours à 10h
        endAt: Timestamp.fromDate(this.getDateInFuture(7, 11, 30)), // Dans 7 jours à 11h30
        capacity: 8,
        attendeesCount: 0,
        status: STATUS.PUBLISHED,
        imageUrl: 'assets/placeholder.jpg'
      },
      {
        title: 'Atelier nutrition et sport',
        description: 'Apprenez à optimiser votre alimentation pour améliorer vos performances sportives. Cet atelier pratique vous donnera les clés pour bien manger avant, pendant et après l\'effort. Dégustation et conseils personnalisés inclus.',
        tags: ['nutrition', 'atelier', 'sante'],
        location: 'Studio La Bonne Routine',
        startAt: Timestamp.fromDate(this.getDateInFuture(10, 14, 0)), // Dans 10 jours à 14h
        endAt: Timestamp.fromDate(this.getDateInFuture(10, 16, 0)), // Dans 10 jours à 16h
        capacity: 12,
        attendeesCount: 0,
        status: STATUS.PUBLISHED,
        imageUrl: 'assets/placeholder.jpg'
      },
      {
        title: 'Challenge cardio-training',
        description: 'Relevez le défi ! Une séance intense de cardio-training pour repousser vos limites. Circuit training, HIIT et motivation garantie. Parfait pour les sportifs confirmés qui veulent se dépasser dans une ambiance fun et encourageante.',
        tags: ['cardio', 'challenge', 'intense'],
        location: 'Salle de sport partenaire',
        startAt: Timestamp.fromDate(this.getDateInFuture(14, 18, 0)), // Dans 14 jours à 18h
        endAt: Timestamp.fromDate(this.getDateInFuture(14, 19, 30)), // Dans 14 jours à 19h30
        capacity: 6,
        attendeesCount: 0,
        status: STATUS.PUBLISHED,
        imageUrl: 'assets/placeholder.jpg'
      }
    ];
    
    for (const event of events) {
      await addDoc(collection(db, COLLECTIONS.EVENTS), event);
    }
    
    console.log(`✅ Created ${events.length} sample events`);
  }

  // Créer des avis d'exemple
  async createSampleReviews() {
    console.log('⭐ Creating sample reviews...');
    
    const reviews = [
      {
        userId: 'sample-user-1',
        userName: 'Marie L.',
        rating: 5,
        text: 'Excellent coaching ! Myriam est très professionnelle et s\'adapte parfaitement à mon niveau. J\'ai retrouvé la motivation pour faire du sport grâce à son accompagnement personnalisé.',
        status: STATUS.APPROVED,
        pinned: true,
        createdAt: serverTimestamp()
      },
      {
        userId: 'sample-user-2',
        userName: 'Thomas R.',
        rating: 5,
        text: 'Je recommande vivement ! Les séances sont variées et motivantes. L\'approche bienveillante de Myriam m\'a permis de reprendre confiance en moi et d\'atteindre mes objectifs.',
        status: STATUS.APPROVED,
        pinned: false,
        createdAt: serverTimestamp()
      },
      {
        userId: 'sample-user-3',
        userName: 'Sophie M.',
        rating: 4,
        text: 'Très satisfaite de mon suivi personnalisé. Les exercices sont adaptés à mes besoins et la coach est à l\'écoute. Je sens une vraie progression depuis que j\'ai commencé.',
        status: STATUS.APPROVED,
        pinned: true,
        createdAt: serverTimestamp()
      }
    ];
    
    for (const review of reviews) {
      await addDoc(collection(db, COLLECTIONS.REVIEWS), review);
    }
    
    console.log(`✅ Created ${reviews.length} sample reviews`);
  }

  // Initialiser les contenus CMS
  async initializeCMS() {
    console.log('📝 Initializing CMS content...');
    
    const cmsContent = {
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
        `,
        updatedAt: serverTimestamp(),
        updatedBy: 'system'
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
        `,
        updatedAt: serverTimestamp(),
        updatedBy: 'system'
      },
      banner: {
        title: 'Bandeau d\'alerte',
        content: 'Nouveau ! Découvrez nos séances collectives en plein air. Inscription ouverte !',
        visible: true,
        updatedAt: serverTimestamp(),
        updatedBy: 'system'
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
        `,
        updatedAt: serverTimestamp(),
        updatedBy: 'system'
      }
    };
    
    for (const [docId, content] of Object.entries(cmsContent)) {
      await setDoc(doc(db, COLLECTIONS.CMS, docId), content);
    }
    
    console.log('✅ CMS content initialized');
  }

  // Utilitaires
  getRandomLocation() {
    const locations = [
      'À domicile',
      'Parc de la Maourine',
      'Salle de sport partenaire',
      'Prairie des Filtres',
      'Studio La Bonne Routine',
      'Jardin des Plantes'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getDateInFuture(days, hours = 0, minutes = 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Nettoyer toutes les données (pour les tests)
  async clearAllData() {
    console.log('🧹 Clearing all test data...');
    
    const collections = [
      COLLECTIONS.SLOTS,
      COLLECTIONS.BOOKINGS,
      COLLECTIONS.EVENTS,
      COLLECTIONS.REVIEWS,
      COLLECTIONS.CMS
    ];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = [];
      
      snapshot.forEach((doc) => {
        batch.push(doc.ref);
      });
      
      // Supprimer par lots de 500 (limite Firestore)
      while (batch.length > 0) {
        const batchToDelete = batch.splice(0, 500);
        const promises = batchToDelete.map(ref => ref.delete());
        await Promise.all(promises);
      }
    }
    
    console.log('✅ All test data cleared');
  }
}

// Instance globale
const seedManager = new SeedManager();

// Fonctions d'utilisation depuis la console
window.seedDatabase = () => seedManager.seedAll();
window.clearDatabase = () => seedManager.clearAllData();
window.createDefaultAdmin = () => seedManager.createDefaultAdmin();

// Export pour utilisation programmatique
export { seedManager };

// Instructions d'utilisation
console.log(`
🌱 Seed Data Manager chargé !

Pour initialiser la base de données avec des données d'exemple :
  - Tapez: seedDatabase()

Pour nettoyer toutes les données de test :
  - Tapez: clearDatabase()

Pour créer uniquement l'admin par défaut :
  - Tapez: createDefaultAdmin()

⚠️  ATTENTION: N'utilisez ces fonctions qu'en développement !
⚠️  IMPORTANT: Changez le mot de passe admin par défaut en production !
`);
