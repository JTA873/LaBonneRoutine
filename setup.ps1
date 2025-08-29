# Guide de démarrage rapide
# Exécutez ces commandes dans PowerShell

Write-Host "🚀 Initialisation du projet La Bonne Routine" -ForegroundColor Green

# Étape 1 : Vérifier que nous sommes dans le bon dossier
$currentPath = Get-Location
Write-Host "📁 Dossier actuel : $currentPath" -ForegroundColor Yellow

# Étape 2 : Initialiser Git si ce n'est pas fait
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initialisation de Git..." -ForegroundColor Blue
    git init
    git add .
    git commit -m "Initial commit - Site La Bonne Routine"
} else {
    Write-Host "✅ Git déjà initialisé" -ForegroundColor Green
}

# Étape 3 : Vérifier la configuration Firebase
$configFile = "js\config.js"
if (Test-Path $configFile) {
    $configContent = Get-Content $configFile -Raw
    if ($configContent -match "XXX") {
        Write-Host "⚠️  ATTENTION : Vous devez modifier js/config.js avec votre vraie configuration Firebase" -ForegroundColor Red
        Write-Host "📝 Ouvrez js/config.js et remplacez les XXX par vos vraies clés" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Configuration Firebase semble OK" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Fichier de configuration manquant" -ForegroundColor Red
}

# Étape 4 : Vérifier si Firebase CLI est installé
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "✅ Firebase CLI installé : $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI non installé" -ForegroundColor Red
    Write-Host "💡 Installez avec : npm install -g firebase-tools" -ForegroundColor Yellow
}

# Étape 5 : Instructions suivantes
Write-Host "`n📋 PROCHAINES ÉTAPES :" -ForegroundColor Cyan
Write-Host "1. Modifiez js/config.js avec votre configuration Firebase" -ForegroundColor White
Write-Host "2. Exécutez : firebase login" -ForegroundColor White
Write-Host "3. Exécutez : firebase init" -ForegroundColor White
Write-Host "4. Exécutez : firebase deploy" -ForegroundColor White
Write-Host "5. Ouvrez votre site et exécutez : seedDatabase() dans la console" -ForegroundColor White

Write-Host "`n🔗 Repository GitHub configuré pour : https://github.com/USERNAME/labonneroutine" -ForegroundColor Magenta
Write-Host "📖 Consultez GUIDE_DEPLOIEMENT.md pour les instructions détaillées" -ForegroundColor Magenta
