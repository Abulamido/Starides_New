# Firestore Rules Deployment Script
# This script safely deploys production Firestore rules with backup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firestore Rules Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Backup current rules
Write-Host "[1/5] Backing up current rules..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "firestore.rules.backup.$timestamp"
Copy-Item firestore.rules $backupFile
Write-Host "✓ Backup created: $backupFile" -ForegroundColor Green
Write-Host ""

# Step 2: Switch to production rules
Write-Host "[2/5] Switching to production rules..." -ForegroundColor Yellow
Copy-Item firestore.production.rules firestore.rules -Force
Write-Host "✓ Production rules activated" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy to Firebase
Write-Host "[3/5] Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Rules deployed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Deployment failed!" -ForegroundColor Red
    Write-Host "Rolling back to backup..." -ForegroundColor Yellow
    Copy-Item $backupFile firestore.rules -Force
    Write-Host "✓ Rolled back to previous rules" -ForegroundColor Green
    exit 1
}
Write-Host ""

# Step 4: Commit changes
Write-Host "[4/5] Committing changes to Git..." -ForegroundColor Yellow
git add firestore.rules firestore.production.rules $backupFile
git commit -m "feat: deploy production Firestore rules with role-based access control"
Write-Host "✓ Changes committed" -ForegroundColor Green
Write-Host ""

# Step 5: Summary
Write-Host "[5/5] Deployment Summary" -ForegroundColor Yellow
Write-Host "✓ Production rules deployed" -ForegroundColor Green
Write-Host "✓ Backup saved: $backupFile" -ForegroundColor Green
Write-Host "✓ Changes committed to Git" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Monitor Firebase Console for permission errors"
Write-Host "2. Test all user flows (customer, vendor, rider, admin)"
Write-Host "3. Check application logs for any issues"
Write-Host ""
Write-Host "To rollback if needed:" -ForegroundColor Yellow
Write-Host "  Copy-Item $backupFile firestore.rules -Force"
Write-Host "  firebase deploy --only firestore:rules"
