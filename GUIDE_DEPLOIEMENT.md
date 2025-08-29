# 🚀 GUIDE DE DÉPLOIEMENT - LA BONNE ROUTINE

## ✅ ÉTAPES PRÉCISES POUR METTRE EN LIGNE VOTRE SITE

### 📋 ÉTAPE 1 : CONFIGURATION FIREBASE

#### 1.1 Créer le projet Firebase
1. Aller sur https://console.firebase.google.com/
2. Cliquer "Ajouter un projet"
3. Nom du projet : `labonneroutine`
4. Activer Google Analytics (optionnel)
5. Créer le projet

#### 1.2 Activer les services
1. **Authentication** :
   - Aller dans "Authentication" > "Sign-in method"
   - Activer "E-mail/Mot de passe"
   - Optionnel : Activer "Google" 

2. **Firestore Database** :
   - Aller dans "Firestore Database"
   - Cliquer "Créer une base de données"
   - Mode production (les règles seront déployées plus tard)
   - Localisation : `europe-west1` (Belgique)

#### 1.3 Récupérer la configuration
1. Aller dans "Paramètres du projet" (⚙️)
2. Dans "Vos applications", cliquer "Ajouter une application" > Web
3. Nom de l'app : `La Bonne Routine`
4. Cocher "Configurer Firebase Hosting"
5. **COPIER LA CONFIGURATION** affichée

### 📋 ÉTAPE 2 : CONFIGURATION DU CODE

#### 2.1 Modifier js/config.js
Remplacer les `XXX` dans le fichier `js/config.js` par votre vraie configuration :

```javascript
export const FIREBASE_CONFIG = {
    apiKey: "VOTRE_VRAIE_API_KEY",
    authDomain: "labonneroutine.firebaseapp.com",
    projectId: "labonneroutine",
    storageBucket: "labonneroutine.appspot.com",
    messagingSenderId: "VOTRE_SENDER_ID",
    appId: "VOTRE_APP_ID"
};
```

#### 2.2 (Optionnel) Changer l'email admin
Dans `js/config.js`, modifier si souhaité :
```javascript
export const ADMIN_EMAILS = ["votre-email@gmail.com"];
export const DEFAULT_ADMIN = {
    email: "votre-email@gmail.com",
    password: "VotreMotDePasseTemporaire123!"
};
```

### 📋 ÉTAPE 3 : DÉPLOIEMENT SUR GITHUB

#### 3.1 Initialiser Git dans votre dossier
```bash
cd "c:\Users\PJTF09231\OneDrive - SNCF\Bureau\PERSO\COPILOTE\LBR"
git init
git add .
git commit -m "Initial commit - Site La Bonne Routine"
```

#### 3.2 Connecter au repository GitHub
```bash
git remote add origin https://github.com/VOTRE_USERNAME/labonneroutine.git
git branch -M main
git push -u origin main
```

### 📋 ÉTAPE 4 : INSTALLATION FIREBASE CLI

#### 4.1 Installer Firebase CLI
```bash
npm install -g firebase-tools
```

#### 4.2 Se connecter à Firebase
```bash
firebase login
```
→ Une page web s'ouvrira pour vous connecter à votre compte Google

### 📋 ÉTAPE 5 : INITIALISATION FIREBASE

#### 5.1 Initialiser Firebase dans le projet
```bash
cd "c:\Users\PJTF09231\OneDrive - SNCF\Bureau\PERSO\COPILOTE\LBR"
firebase init
```

#### 5.2 Configuration à sélectionner :
- **Services** : Sélectionner ✅ Firestore, ✅ Hosting
- **Projet** : Choisir votre projet `labonneroutine`
- **Firestore rules** : Utiliser le fichier existant `firestore.rules`
- **Firestore indexes** : Utiliser le fichier existant `firestore.indexes.json`
- **Dossier public** : Entrer `.` (point)
- **SPA** : Répondre `Y` (Oui)
- **Remplacer index.html** : Répondre `N` (Non)

### 📋 ÉTAPE 6 : DÉPLOIEMENT

#### 6.1 Déployer tout
```bash
firebase deploy
```

#### 6.2 Récupérer l'URL
Après le déploiement, notez l'URL fournie :
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/labonneroutine
Hosting URL: https://labonneroutine.web.app
```

### 📋 ÉTAPE 7 : INITIALISATION DES DONNÉES

#### 7.1 Ouvrir le site déployé
Aller sur `https://labonneroutine.web.app`

#### 7.2 Ouvrir la console du navigateur
- **Chrome/Edge** : F12 > Console
- **Firefox** : F12 > Console

#### 7.3 Exécuter le script d'initialisation
Copier-coller cette commande dans la console :
```javascript
seedDatabase()
```

#### 7.4 Vérifier la création
Vous devriez voir :
```
🌱 Starting database seeding...
👤 Checking for existing admin...
🔧 Creating default admin account...
✅ Default admin created successfully
📅 Creating sample slots...
✅ Created 70 sample slots
🎉 Creating sample events...
✅ Created 3 sample events
⭐ Creating sample reviews...
✅ Created 3 sample reviews
📝 Initializing CMS content...
✅ CMS content initialized
✅ Database seeding completed successfully!
```

### 📋 ÉTAPE 8 : PREMIÈRE CONNEXION ADMIN

#### 8.1 Tester la connexion admin
1. Aller sur `https://labonneroutine.web.app/login.html`
2. Se connecter avec :
   - **Email** : `jadetaraf@hotmail.fr` (ou votre email modifié)
   - **Mot de passe** : `123456789` (ou votre mot de passe modifié)

#### 8.2 Accéder à l'interface admin
- Cliquer sur "Mon compte" puis "Administration"
- Ou aller directement sur `https://labonneroutine.web.app/admin.html`

#### 8.3 IMPORTANT : Changer le mot de passe
1. Aller dans Firebase Console > Authentication > Users
2. Cliquer sur l'utilisateur admin
3. Cliquer "Reset password" pour définir un nouveau mot de passe sécurisé

### 📋 ÉTAPE 9 : VÉRIFICATIONS FINALES

#### 9.1 Tester les fonctionnalités
- ✅ Navigation entre les pages
- ✅ Affichage des créneaux sur la page réservation
- ✅ Affichage des événements
- ✅ Carrousel des avis sur l'accueil
- ✅ Interface admin fonctionnelle

#### 9.2 Configurer le domaine personnalisé (optionnel)
1. Dans Firebase Console > Hosting
2. Cliquer "Ajouter un domaine personnalisé"
3. Suivre les instructions pour configurer votre DNS

## 🔧 COMMANDES UTILES

### Déploiement sélectif
```bash
# Déployer uniquement le site
firebase deploy --only hosting

# Déployer uniquement les règles
firebase deploy --only firestore:rules
```

### Développement local
```bash
# Serveur local
firebase serve

# Émulateurs
firebase emulators:start
```

### Gestion Git
```bash
# Synchroniser avec GitHub
git add .
git commit -m "Description des modifications"
git push

# Voir le statut
git status
```

## 🆘 DÉPANNAGE

### Erreur "Firebase project not found"
```bash
firebase use --add
# Sélectionner votre projet labonneroutine
```

### Erreur de permissions Firestore
Vérifier que les règles sont bien déployées :
```bash
firebase deploy --only firestore:rules
```

### Site ne se charge pas
1. Vérifier la configuration dans `js/config.js`
2. Vérifier la console du navigateur pour les erreurs
3. Redéployer : `firebase deploy`

### Données manquantes
Réexécuter l'initialisation :
```javascript
clearDatabase()  // Nettoie tout
seedDatabase()   // Recrée les données
```

## 📞 SUPPORT

### Documentation officielle
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)

### Statut des services
- [Firebase Status](https://status.firebase.google.com/)

---

## ✅ CHECKLIST FINALE

- [ ] Projet Firebase créé
- [ ] Services activés (Auth, Firestore)
- [ ] Configuration copiée dans `js/config.js`
- [ ] Repository GitHub créé et synchronisé
- [ ] Firebase CLI installé et connecté
- [ ] `firebase init` exécuté
- [ ] `firebase deploy` réussi
- [ ] Données initialisées avec `seedDatabase()`
- [ ] Connexion admin testée
- [ ] Mot de passe admin changé
- [ ] Site fonctionnel vérifié

**🎉 VOTRE SITE EST EN LIGNE !**

URL finale : `https://labonneroutine.web.app`
