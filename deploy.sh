#!/bin/bash
# Script de déploiement automatisé - La Bonne Routine
# Usage: ./deploy.sh [dev|prod]

set -e  # Arrêt en cas d'erreur

# Configuration
PROJECT_NAME="La Bonne Routine"
ENVIRONMENT=${1:-dev}

echo "🚀 Déploiement de $PROJECT_NAME en mode $ENVIRONMENT"

# Vérifications préliminaires
echo "📋 Vérifications préliminaires..."

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI non trouvé. Installation..."
    npm install -g firebase-tools
fi

# Vérifier la connexion Firebase
echo "🔐 Vérification de l'authentification Firebase..."
firebase login --no-localhost 2>/dev/null || {
    echo "🔑 Connexion à Firebase requise..."
    firebase login
}

# Vérifier la configuration Firebase
if [ ! -f "firebase.json" ]; then
    echo "❌ Configuration Firebase manquante. Exécution de firebase init..."
    firebase init
fi

# Configuration selon l'environnement
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "🏭 Configuration PRODUCTION"
    
    # Vérifications de sécurité pour la production
    echo "🔍 Vérifications de sécurité..."
    
    # Vérifier que le mot de passe admin par défaut n'est pas utilisé
    if grep -q "123456789" js/config.js; then
        echo "⚠️  ATTENTION: Mot de passe admin par défaut détecté!"
        echo "   Veuillez changer le mot de passe admin avant le déploiement en production."
        read -p "   Continuer quand même? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Vérifier que la configuration Firebase est complète
    if grep -q "XXX" js/config.js; then
        echo "❌ Configuration Firebase incomplète détectée dans js/config.js"
        echo "   Veuillez compléter la configuration avant le déploiement."
        exit 1
    fi
    
    # Supprimer les fichiers de développement
    echo "🧹 Suppression des fichiers de développement..."
    if [ -f "test-seed.html" ]; then
        rm test-seed.html
        echo "   ✅ test-seed.html supprimé"
    fi
    
    # Optionnel: Minification des assets (si terser est installé)
    if command -v terser &> /dev/null; then
        echo "📦 Minification des fichiers JavaScript..."
        mkdir -p dist/js
        for file in js/*.js; do
            if [ -f "$file" ]; then
                terser "$file" -o "dist/${file}" -c -m
            fi
        done
        
        # Minification CSS
        if command -v cleancss &> /dev/null; then
            echo "📦 Minification des fichiers CSS..."
            mkdir -p dist/css
            cleancss -o dist/css/styles.css css/styles.css
        fi
    fi
    
else
    echo "🔧 Configuration DÉVELOPPEMENT"
fi

# Validation des fichiers critiques
echo "✅ Validation des fichiers critiques..."
required_files=(
    "index.html"
    "js/config.js"
    "js/firebase-init.js"
    "js/auth.js"
    "js/booking.js"
    "js/events.js"
    "js/reviews.js"
    "js/cms.js"
    "js/admin.js"
    "js/ui.js"
    "js/utils.js"
    "css/styles.css"
    "firestore.rules"
    "storage.rules"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    fi
done

echo "✅ Tous les fichiers critiques sont présents"

# Déploiement des règles Firestore
echo "🛡️  Déploiement des règles Firestore..."
firebase deploy --only firestore:rules

# Déploiement des règles Storage
echo "🗂️  Déploiement des règles Storage..."
firebase deploy --only storage:rules

# Déploiement des index Firestore (si présent)
if [ -f "firestore.indexes.json" ]; then
    echo "📊 Déploiement des index Firestore..."
    firebase deploy --only firestore:indexes
fi

# Test de la configuration Firebase
echo "🧪 Test de la configuration Firebase..."
node -e "
const config = require('./js/config.js');
if (!config.firebaseConfig.apiKey || config.firebaseConfig.apiKey === 'XXX') {
    console.log('❌ Configuration Firebase invalide');
    process.exit(1);
}
console.log('✅ Configuration Firebase valide');
"

# Déploiement du site
echo "🌐 Déploiement du site web..."
firebase deploy --only hosting

# Récupération de l'URL du site
SITE_URL=$(firebase hosting:channel:list | grep -E "live|main" | awk '{print $4}' | head -1)

if [ -z "$SITE_URL" ]; then
    SITE_URL=$(firebase use | grep "using" | awk '{print $4}')
    SITE_URL="https://${SITE_URL}.web.app"
fi

echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "🌐 URL du site: $SITE_URL"
echo ""

if [ "$ENVIRONMENT" = "prod" ]; then
    echo "📋 ACTIONS POST-DÉPLOIEMENT PRODUCTION:"
    echo "   1. ⚠️  Changer le mot de passe admin immédiatement"
    echo "   2. 🧪 Tester toutes les fonctionnalités"
    echo "   3. 🌱 Initialiser la base de données avec des vraies données"
    echo "   4. 📊 Configurer le monitoring Firebase"
    echo "   5. 🔔 Mettre en place les alertes de sécurité"
else
    echo "📋 PROCHAINES ÉTAPES DÉVELOPPEMENT:"
    echo "   1. 🌱 Initialiser la base avec: $SITE_URL/test-seed.html"
    echo "   2. 🧪 Tester avec les données d'exemple"
    echo "   3. 🔧 Développer et tester les nouvelles fonctionnalités"
fi

echo ""
echo "📖 Consultez CHECKLIST.md pour la validation complète"
echo "📚 Consultez README.md pour la documentation complète"
