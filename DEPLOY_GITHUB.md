# 🚀 Guide de Déploiement GitHub + Firebase

## 📋 Prérequis
- [x] Repository GitHub créé
- [ ] Git installé localement
- [ ] Firebase CLI installé
- [ ] Projet Firebase créé

## 🔗 **Étape 1 : Connecter au repository GitHub**

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter l'origine GitHub (remplacez par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Vérifier la connexion
git remote -v
```

## ⚙️ **Étape 2 : Configuration Firebase**

1. **Créer un projet Firebase :**
   - Aller sur https://console.firebase.google.com
   - Créer un nouveau projet
   - Activer Authentication, Firestore, Storage, Hosting

2. **Récupérer la configuration :**
   - Project Settings > General > Your apps > Web app
   - Copier la configuration

3. **Configurer localement :**
   ```bash
   # Copier le fichier d'exemple
   copy js\config.example.js js\config.js
   
   # Éditer js/config.js avec vos vraies valeurs Firebase
   ```

## 🔥 **Étape 3 : Installer Firebase CLI**

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser Firebase dans le projet
firebase init
```

**Sélections lors de firebase init :**
- ✅ Firestore
- ✅ Functions (optionnel)
- ✅ Hosting
- ✅ Storage

## 📤 **Étape 4 : Premier commit**

```bash
# Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# Premier commit
git commit -m "🎉 Initial commit - La Bonne Routine website"

# Pousser vers GitHub
git push -u origin main
```

## 🌐 **Étape 5 : Déploiement**

### **Option A : Déploiement manuel**
```bash
# Déployer vers Firebase
firebase deploy
```

### **Option B : Déploiement automatisé (recommandé)**
```bash
# Utiliser le script PowerShell
.\deploy.ps1 dev    # Pour développement
.\deploy.ps1 prod   # Pour production
```

## 🤖 **Étape 6 : Configuration GitHub Actions (Optionnel)**

Créer `.github/workflows/deploy.yml` pour le déploiement automatique :

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install -g firebase-tools
      - run: firebase deploy --token "$FIREBASE_TOKEN"
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## 🔐 **Étape 7 : Sécurité**

### **GitHub Secrets** (pour GitHub Actions) :
1. Aller dans votre repo > Settings > Secrets
2. Ajouter `FIREBASE_TOKEN` :
   ```bash
   firebase login:ci  # Générer le token
   ```

### **Variables d'environnement** :
- Ne jamais commiter `js/config.js` avec vraies valeurs
- Utiliser `config.example.js` comme template
- Documenter la configuration requise

## 📊 **Étape 8 : Initialisation des données**

```bash
# Après déploiement, aller sur :
https://VOTRE-SITE.web.app/test-seed.html

# Initialiser la base de données
# ⚠️ Supprimer test-seed.html en production !
```

## 🧪 **Étape 9 : Tests**

Utiliser `CHECKLIST.md` pour valider :
- [ ] Authentification fonctionne
- [ ] Réservations fonctionnent
- [ ] Interface admin accessible
- [ ] Données se sauvegardent

## 📈 **Workflow de développement recommandé**

```bash
# 1. Développement local
git checkout -b feature/nouvelle-fonctionnalite

# 2. Tests locaux
firebase serve  # Test local

# 3. Commit et push
git add .
git commit -m "✨ Add nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 4. Pull Request sur GitHub
# 5. Merge vers main
# 6. Déploiement automatique (si GitHub Actions configuré)
```

## 🆘 **Dépannage**

### **Erreur Git :**
```bash
# Si erreur "Git not found"
winget install Git.Git
# Puis redémarrer le terminal
```

### **Erreur Firebase :**
```bash
# Si erreur de permissions
firebase login --reauth
```

### **Erreur de configuration :**
- Vérifier que `js/config.js` existe
- Vérifier les valeurs Firebase dans config.js
- Vérifier les règles Firestore

## 📞 **Support**

- 📚 **Documentation complète :** `README.md`
- ✅ **Validation :** `CHECKLIST.md`
- 🐛 **Issues :** GitHub Issues de votre repository
- 🔥 **Firebase :** Console Firebase pour logs d'erreur
