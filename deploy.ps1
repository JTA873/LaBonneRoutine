# Script de déploiement PowerShell - La Bonne Routine
# Usage: .\deploy.ps1 [dev|prod]

param(
    [string]$Environment = "dev"
)

# Configuration
$PROJECT_NAME = "La Bonne Routine"
$ErrorActionPreference = "Stop"

Write-Host "🚀 Déploiement de $PROJECT_NAME en mode $Environment" -ForegroundColor Green

# Vérifications préliminaires
Write-Host "📋 Vérifications préliminaires..." -ForegroundColor Yellow

# Vérifier que Firebase CLI est installé
try {
    firebase --version | Out-Null
} catch {
    Write-Host "❌ Firebase CLI non trouvé. Installation..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Vérifier la connexion Firebase
Write-Host "🔐 Vérification de l'authentification Firebase..." -ForegroundColor Yellow
try {
    firebase projects:list --json | Out-Null
} catch {
    Write-Host "🔑 Connexion à Firebase requise..." -ForegroundColor Yellow
    firebase login
}

# Vérifier la configuration Firebase
if (-not (Test-Path "firebase.json")) {
    Write-Host "❌ Configuration Firebase manquante. Exécution de firebase init..." -ForegroundColor Red
    firebase init
}

# Configuration selon l'environnement
if ($Environment -eq "prod") {
    Write-Host "🏭 Configuration PRODUCTION" -ForegroundColor Magenta
    
    # Vérifications de sécurité pour la production
    Write-Host "🔍 Vérifications de sécurité..." -ForegroundColor Yellow
    
    # Vérifier que le mot de passe admin par défaut n'est pas utilisé
    $configContent = Get-Content "js/config.js" -Raw
    if ($configContent -match "123456789") {
        Write-Host "⚠️  ATTENTION: Mot de passe admin par défaut détecté!" -ForegroundColor Red
        Write-Host "   Veuillez changer le mot de passe admin avant le déploiement en production." -ForegroundColor Yellow
        $response = Read-Host "   Continuer quand même? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            exit 1
        }
    }
    
    # Vérifier que la configuration Firebase est complète
    if ($configContent -match "XXX") {
        Write-Host "❌ Configuration Firebase incomplète détectée dans js/config.js" -ForegroundColor Red
        Write-Host "   Veuillez compléter la configuration avant le déploiement." -ForegroundColor Yellow
        exit 1
    }
    
    # Supprimer les fichiers de développement
    Write-Host "🧹 Suppression des fichiers de développement..." -ForegroundColor Yellow
    if (Test-Path "test-seed.html") {
        Remove-Item "test-seed.html"
        Write-Host "   ✅ test-seed.html supprimé" -ForegroundColor Green
    }
    
} else {
    Write-Host "🔧 Configuration DÉVELOPPEMENT" -ForegroundColor Cyan
}

# Validation des fichiers critiques
Write-Host "✅ Validation des fichiers critiques..." -ForegroundColor Yellow
$requiredFiles = @(
    "index.html",
    "js/config.js",
    "js/firebase-init.js",
    "js/auth.js",
    "js/booking.js",
    "js/events.js",
    "js/reviews.js",
    "js/cms.js",
    "js/admin.js",
    "js/ui.js",
    "js/utils.js",
    "css/styles.css",
    "firestore.rules",
    "storage.rules"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Fichier manquant: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Tous les fichiers critiques sont présents" -ForegroundColor Green

# Déploiement des règles Firestore
Write-Host "🛡️  Déploiement des règles Firestore..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

# Déploiement des règles Storage
Write-Host "🗂️  Déploiement des règles Storage..." -ForegroundColor Yellow
firebase deploy --only storage:rules

# Déploiement des index Firestore (si présent)
if (Test-Path "firestore.indexes.json") {
    Write-Host "📊 Déploiement des index Firestore..." -ForegroundColor Yellow
    firebase deploy --only firestore:indexes
}

# Test de la configuration Firebase
Write-Host "🧪 Test de la configuration Firebase..." -ForegroundColor Yellow
try {
    $configTest = Get-Content "js/config.js" -Raw
    if ($configTest -match "apiKey.*XXX" -or -not ($configTest -match "apiKey")) {
        throw "Configuration Firebase invalide"
    }
    Write-Host "✅ Configuration Firebase valide" -ForegroundColor Green
} catch {
    Write-Host "❌ Configuration Firebase invalide" -ForegroundColor Red
    exit 1
}

# Déploiement du site
Write-Host "🌐 Déploiement du site web..." -ForegroundColor Yellow
firebase deploy --only hosting

# Récupération de l'URL du site
try {
    $project = (firebase use --json | ConvertFrom-Json).active
    $siteUrl = "https://$project.web.app"
} catch {
    $siteUrl = "Voir Firebase Console pour l'URL"
}

Write-Host ""
Write-Host "🎉 Déploiement terminé avec succès!" -ForegroundColor Green
Write-Host "🌐 URL du site: $siteUrl" -ForegroundColor Cyan
Write-Host ""

if ($Environment -eq "prod") {
    Write-Host "📋 ACTIONS POST-DÉPLOIEMENT PRODUCTION:" -ForegroundColor Magenta
    Write-Host "   1. ⚠️  Changer le mot de passe admin immédiatement" -ForegroundColor Red
    Write-Host "   2. 🧪 Tester toutes les fonctionnalités" -ForegroundColor Yellow
    Write-Host "   3. 🌱 Initialiser la base de données avec des vraies données" -ForegroundColor Yellow
    Write-Host "   4. 📊 Configurer le monitoring Firebase" -ForegroundColor Yellow
    Write-Host "   5. 🔔 Mettre en place les alertes de sécurité" -ForegroundColor Yellow
} else {
    Write-Host "📋 PROCHAINES ÉTAPES DÉVELOPPEMENT:" -ForegroundColor Cyan
    Write-Host "   1. 🌱 Initialiser la base avec: $siteUrl/test-seed.html" -ForegroundColor Yellow
    Write-Host "   2. 🧪 Tester avec les données d'exemple" -ForegroundColor Yellow
    Write-Host "   3. 🔧 Développer et tester les nouvelles fonctionnalités" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📖 Consultez CHECKLIST.md pour la validation complète" -ForegroundColor Blue
Write-Host "📚 Consultez README.md pour la documentation complète" -ForegroundColor Blue
