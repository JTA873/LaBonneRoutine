# La Bonne Routine - Site Web Complet

## 📋 Description

# La Bonne Routine 🧘‍♀️

Site web officiel pour les services de coaching et développement personnel de La Bonne Routine.

## 🌟 Fonctionnalités

- **🔐 Authentification** : Connexion sécurisée avec Firebase Auth
- **📅 Réservations** : Système de réservation de créneaux de coaching
- **🎉 Événements** : Organisation d'événements collaboratifs
- **⭐ Avis clients** : Système de témoignages et évaluations
- **👥 Interface admin** : Gestion complète du contenu et des réservations
- **📱 Responsive** : Design adaptatif pour tous les appareils

## 🎨 Design

- **Couleurs** : Rouge passion (#9E3728), Beige chaleureux (#F6EFE9)
- **Typography** : Inter pour une lisibilité optimale
- **Accessibilité** : Conforme aux standards WCAG

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Backend** : Firebase (Firestore, Authentication, Hosting)
- **Sécurité** : Règles Firestore strictes, validation côté client et serveur

## 🚀 Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/VOTRE_USERNAME/labonneroutine.git
   cd labonneroutine
   ```

2. **Configurer Firebase**
   - Créez un projet sur [Firebase Console](https://console.firebase.google.com)
   - Modifiez `js/config.js` avec vos clés Firebase
   - Activez Authentication (Email/Password + Google)
   - Créez une base Firestore

3. **Déployer**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy
   ```

4. **Initialiser les données**
   - Ouvrez votre site
   - Ouvrez la console du navigateur (F12)
   - Tapez : `seedDatabase()`

## 📋 Structure du projet

```
├── index.html          # Page d'accueil
├── login.html          # Authentification
├── dashboard.html      # Tableau de bord utilisateur
├── admin.html          # Interface administrateur
├── events.html         # Gestion des événements
├── reserve.html        # Réservations
├── contact.html        # Contact
├── css/
│   └── styles.css      # Styles principaux
├── js/
│   ├── config.js       # Configuration Firebase
│   ├── firebase-init.js # Initialisation Firebase
│   ├── auth.js         # Authentification
│   ├── ui.js           # Interface utilisateur
│   ├── booking.js      # Système de réservation
│   ├── events.js       # Gestion des événements
│   └── ...            # Autres modules
├── firebase.json       # Configuration Firebase Hosting
├── firestore.rules     # Règles de sécurité Firestore
└── storage.rules       # Règles de sécurité Storage
```

## 🔧 Configuration

### Firebase Config (js/config.js)
```javascript
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    projectId: "VOTRE_PROJECT_ID",
    // ... autres clés
};
```

### Admin par défaut
- **Email** : jadetaraf@hotmail.fr
- **Mot de passe** : 123456789
- **Rôle** : admin

## 📱 Pages

- **🏠 Accueil** : Présentation des services, tarifs, témoignages
- **🔐 Connexion** : Authentification utilisateurs
- **📊 Dashboard** : Espace personnel utilisateur
- **⚙️ Admin** : Interface de gestion (réservé admin)
- **🎪 Événements** : Événements collaboratifs
- **📅 Réservation** : Prise de rendez-vous
- **📞 Contact** : Formulaire de contact

## 🔒 Sécurité

- Règles Firestore strictes avec authentification obligatoire
- Validation des données côté client et serveur
- Contrôle d'accès basé sur les rôles
- Protection contre les injections et attaques XSS

## 📈 Analytics

Le site intègre Google Analytics pour le suivi des performances et du comportement utilisateur.

## 🤝 Contact

- **Site web** : [labonneroutine.web.app](https://labonneroutine.web.app)
- **Email** : contact@labonneroutine.fr
- **Coach** : Jade Taraf

## 📄 Licence

© 2024 La Bonne Routine. Tous droits réservés.

---

*Développé avec ❤️ pour accompagner votre développement personnel* 
Développé avec HTML/CSS/JavaScript vanilla et Firebase pour l'authentification, la base de données et l'hébergement.

**Baseline :** Le mouvement, une stratégie durable pour préserver sa santé à long terme

## 🚀 Fonctionnalités

### ✅ Authentification Firebase
- Inscription/connexion par email/mot de passe
- Connexion Google (optionnelle)
- Gestion des rôles (user/admin)
- Reset de mot de passe

### ✅ Système de réservation
- Créneaux créés par l'admin
- Réservation par les utilisateurs connectés
- Gestion des conflits et capacité
- Annulation possible
- Export CSV pour l'admin

### ✅ Événements collaboratifs
- Publication d'événements par l'admin
- Inscription des utilisateurs
- Système de commentaires modérés
- Propositions d'événements par les utilisateurs

### ✅ Avis et témoignages
- Soumission d'avis par les utilisateurs (1-5 étoiles)
- Modération par l'admin (pending/approved/rejected)
- Carrousel d'avis sur la page d'accueil
- Épinglage d'avis importants

### ✅ CMS léger
- Édition des sections Services, Tarifs, Bandeau d'alerte, Badges
- Interface d'édition pour l'admin
- Cache en localStorage pour les performances

### ✅ Interface d'administration
- Tableau de bord avec statistiques
- Gestion des réservations
- Modération des avis et événements
- Export CSV des données
- Gestion des utilisateurs

## 🎨 Charte graphique

### Couleurs
```css
--rouge: #9E3728 (terracotta/rouge brique)
--beige: #F6EFE9 (fond clair)
--noir: #111111 (texte principal)
--gris: #666666 (texte secondaire)
```

### Typographies
- **Titres :** Montserrat (700)
- **Texte courant :** Inter (400, 600)

### Style
- Design minimal et épuré
- Aplats de couleur rouge pour les sections importantes
- Grands titres avec beaucoup d'espaces blancs
- Icônes Lucide pour les éléments d'interface

## 📁 Structure du projet

```
/
├── index.html              # Page d'accueil
├── login.html              # Authentification
├── dashboard.html          # Espace utilisateur
├── admin.html              # Interface d'administration
├── events.html             # Événements et activités
├── reserve.html            # Réservation de créneaux
├── contact.html            # Contact et informations
├── firebase.json           # Configuration Firebase
├── firestore.rules         # Règles de sécurité Firestore
├── storage.rules           # Règles de sécurité Storage
├── robots.txt              # SEO - directives robots
├── sitemap.xml             # SEO - plan du site
├── /assets/
│   ├── logo.svg            # Logo La Bonne Routine
│   └── placeholder.jpg     # Image de placeholder
├── /css/
│   └── styles.css          # Styles principaux
└── /js/
    ├── config.js           # Configuration Firebase et constantes
    ├── firebase-init.js    # Initialisation Firebase
    ├── auth.js             # Gestion authentification
    ├── ui.js               # Interface utilisateur (modals, toasts)
    ├── booking.js          # Système de réservation
    ├── events.js           # Gestion des événements
    ├── reviews.js          # Système d'avis
    ├── cms.js              # Gestion de contenu
    ├── admin.js            # Interface d'administration
    ├── utils.js            # Fonctions utilitaires
    └── seed-data.js        # Données de test et initialisation
```

## 🔧 Installation et configuration

### 1. Création du projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet
3. Activer les services suivants :

#### Authentication
- Aller dans Authentication > Sign-in method
- Activer "Email/Password"
- Optionnel : Activer "Google" (configurer OAuth)

#### Firestore Database
- Créer une base de données Firestore
- Commencer en mode test (rules publiques temporairement)
- Les règles de sécurité seront déployées automatiquement

#### Storage
- Activer Firebase Storage
- Les règles seront déployées automatiquement

#### Hosting
- Activer Firebase Hosting

### 2. Configuration locale

1. **Cloner/télécharger le projet**
   ```bash
   # Si vous avez Git
   git clone [votre-repo]
   cd labonne-routine
   ```

2. **Installer Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Se connecter à Firebase**
   ```bash
   firebase login
   ```

4. **Initialiser le projet Firebase**
   ```bash
   firebase init
   ```
   - Sélectionner : Firestore, Hosting, Storage
   - Choisir votre projet Firebase
   - Accepter les fichiers de règles existants
   - Public directory : `.` (point, pas `public`)

5. **Configurer les clés Firebase**
   
   Dans Firebase Console > Project Settings > General > Your apps :
   - Copier la configuration Firebase
   - Remplacer les valeurs `XXX` dans `js/config.js` :

   ```javascript
   export const FIREBASE_CONFIG = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

### 3. Déploiement

1. **Déployer les règles et le site**
   ```bash
   firebase deploy
   ```

2. **Initialiser la base de données avec des données de test**
   - Ouvrir votre site déployé
   - Ouvrir la console développeur (F12)
   - Taper : `seedDatabase()`
   - Cela créera :
     - Le compte admin par défaut
     - Des créneaux d'exemple
     - Des événements d'exemple
     - Des avis d'exemple
     - Les contenus CMS

### 4. Configuration de production

#### ⚠️ SÉCURITÉ IMPORTANTE

1. **Changer le mot de passe admin**
   - Se connecter avec : `jadetaraf@hotmail.fr` / `123456789`
   - Aller dans le profil et changer le mot de passe
   - **OU** supprimer complètement `DEFAULT_ADMIN` de `config.js`

2. **Déployer les règles de sécurité**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

3. **Configurer les index Firestore**
   - Les index peuvent être créés automatiquement lors de l'utilisation
   - Ou manuellement dans Firebase Console > Firestore > Indexes

## 📊 Indexes Firestore recommandés

Créer ces index dans Firebase Console > Firestore > Indexes :

```
Collection: events
Fields: status (Ascending), startAt (Ascending)

Collection: reviews  
Fields: status (Ascending), pinned (Descending), createdAt (Descending)

Collection: slots
Fields: startAt (Ascending), status (Ascending)

Collection: bookings
Fields: userId (Ascending), createdAt (Descending)
```

## 🔍 Tests et validation

### Checklist de vérification

1. **Authentification**
   - [ ] Inscription d'un nouvel utilisateur
   - [ ] Connexion/déconnexion
   - [ ] Reset de mot de passe
   - [ ] Connexion admin avec rôle correct

2. **Réservations**
   - [ ] Affichage des créneaux disponibles
   - [ ] Réservation d'un créneau
   - [ ] Annulation d'une réservation
   - [ ] Export CSV depuis l'admin

3. **Événements**
   - [ ] Affichage des événements publiés
   - [ ] Inscription à un événement
   - [ ] Ajout d'un commentaire
   - [ ] Proposition d'événement (modération)

4. **Avis**
   - [ ] Soumission d'un avis
   - [ ] Modération depuis l'admin
   - [ ] Affichage dans le carrousel de la home

5. **CMS**
   - [ ] Modification du contenu depuis l'admin
   - [ ] Affichage mis à jour sur le site
   - [ ] Gestion du bandeau d'alerte

## 🛠️ Développement

### Serveur local
```bash
# Utiliser un serveur local pour le développement
python -m http.server 8000
# ou
npx serve .
# ou
php -S localhost:8000
```

### Debug
- Ouvrir les outils développeur (F12)
- Console pour voir les logs
- Network pour vérifier les requêtes Firebase
- Application > LocalStorage pour voir le cache

### Structure des données Firestore

#### Users
```javascript
{
  displayName: "string",
  email: "string", 
  role: "user" | "admin",
  phone?: "string",
  createdAt: timestamp
}
```

#### Slots
```javascript
{
  startAt: timestamp,
  endAt: timestamp,
  location: "string",
  capacity: number,
  bookedCount: number,
  status: "open" | "closed",
  notes?: "string"
}
```

#### Bookings
```javascript
{
  slotId: "string",
  userId: "string", 
  createdAt: timestamp,
  status: "active" | "canceled"
}
```

#### Events
```javascript
{
  title: "string",
  description: "string",
  tags: ["string"],
  imageUrl?: "string",
  location: "string",
  startAt: timestamp,
  endAt: timestamp,
  capacity: number,
  attendeesCount: number,
  status: "draft" | "published"
}
```

#### Reviews
```javascript
{
  userId: "string",
  userName: "string",
  rating: number, // 1-5
  text: "string",
  status: "pending" | "approved" | "rejected" | "hidden",
  pinned: boolean,
  createdAt: timestamp
}
```

## 📞 Support

**Contact :** 
- Email : contact.lbrcoaching@gmail.com
- Téléphone : 06 40 24 06 16
- Instagram : @labonne.routine

**Coach :** Myriam TARAF - Coach sportif diplômée d'État

---

## 🔒 Notes de sécurité

- ✅ Règles Firestore restrictives appliquées
- ✅ Validation côté client et serveur
- ✅ Modération de tout contenu utilisateur
- ✅ Authentification requise pour les actions sensibles
- ⚠️ **Changer le mot de passe admin par défaut**
- ⚠️ **Supprimer ou modifier DEFAULT_ADMIN en production**

## 📈 SEO et Performance

- ✅ Meta tags Open Graph et Twitter Cards
- ✅ Sitemap.xml et robots.txt
- ✅ Images optimisées et lazy loading
- ✅ Cache localStorage pour les performances
- ✅ CDN pour les bibliothèques externes
- ✅ Compression et mise en cache côté serveur

## 🎯 Tarifs

### Tarifs Classiques
- 75 € TTC - 1 séance
- 65 € / séance - Pack 5 séances  
- 60 € / séance - Pack 10 séances
- 55 € / séance - Pack 20 séances

### Tarifs Service à la Personne (SAP)
- 90 € TTC - 1 séance
- 80 € / séance - Pack 5 séances
- 75 € / séance - Pack 10 séances  
- 70 € / séance - Pack 20 séances

**Avantages :** SAP agréé, Réduction d'impôt 50%, Chèques-Vacances ANCV acceptés
