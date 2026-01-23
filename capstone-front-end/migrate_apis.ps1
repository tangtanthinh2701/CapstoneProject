# Migration Script - Replace old API files with new ones

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Migration Script" -ForegroundColor Cyan
Write-Host "Replacing old API files with new ones" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$modelsPath = "D:\CapstoneProject\capstone-front-end\src\models"

# Backup old files first
Write-Host "Step 1: Creating backup..." -ForegroundColor Yellow
$backupPath = "D:\CapstoneProject\capstone-front-end\src\models\_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (!(Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath | Out-Null
}

# Files to backup and replace
$filesToMigrate = @(
    "contract.api.ts",
    "carbonCredit.api.ts",
    "payment.api.ts",
    "dashboard.api.ts",
    "notification.api.ts"
)

foreach ($file in $filesToMigrate) {
    $sourcePath = Join-Path $modelsPath $file
    if (Test-Path $sourcePath) {
        $backupFilePath = Join-Path $backupPath $file
        Copy-Item $sourcePath $backupFilePath -Force
        Write-Host "  Backed up: $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 2: Replacing files..." -ForegroundColor Yellow

# Replace files
$replacements = @{
    "contract.api.new.ts" = "contract.api.ts"
    "carbonCredit.api.new.ts" = "carbonCredit.api.ts"
    "payment.api.new.ts" = "payment.api.ts"
    "dashboard.api.new.ts" = "dashboard.api.ts"
    "notification.api.new.ts" = "notification.api.ts"
}

foreach ($newFile in $replacements.Keys) {
    $oldFile = $replacements[$newFile]
    $newPath = Join-Path $modelsPath $newFile
    $oldPath = Join-Path $modelsPath $oldFile

    if (Test-Path $newPath) {
        Copy-Item $newPath $oldPath -Force
        Remove-Item $newPath -Force
        Write-Host "  Replaced: $oldFile" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration completed!" -ForegroundColor Green
Write-Host "Backup location: $backupPath" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes in your IDE" -ForegroundColor White
Write-Host "2. Update Service files to use new APIs" -ForegroundColor White
Write-Host "3. Update Components/Pages to use new API structure" -ForegroundColor White
Write-Host "4. Test each module thoroughly" -ForegroundColor White
Write-Host ""

