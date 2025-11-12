# Project Cleanup Script
# Removes deprecated files and consolidates to unified agent system

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
    Write-Host ""
}

# Create backup directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "cleanup_backup_$timestamp"

Write-Host "Creating backup directory: $backupDir" -ForegroundColor Yellow
if (!$DryRun) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

Write-Host ""
Write-Host "1. Removing deprecated page components..." -ForegroundColor Cyan

$deprecatedPages = @(
    "app\demo",
    "app\analysis",
    "app\porter",
    "app\hbs",
    "app\strategic",
    "app\strategic-v2",
    "app\economic",
    "app\llm-chat"
)

$removedPages = 0
foreach ($page in $deprecatedPages) {
    if (Test-Path $page) {
        Write-Host "  - Removing: $page" -ForegroundColor Gray
        if (!$DryRun) {
            Remove-Item -Path $page -Recurse -Force -ErrorAction SilentlyContinue
        }
        $removedPages++
    }
}

# Remove specific files
if (Test-Path "app\dashboard\unified-page.tsx") {
    Write-Host "  - Removing: app\dashboard\unified-page.tsx" -ForegroundColor Gray
    if (!$DryRun) {
        Remove-Item -Path "app\dashboard\unified-page.tsx" -Force -ErrorAction SilentlyContinue
    }
    $removedPages++
}

Write-Host "  ✓ Removed $removedPages deprecated pages" -ForegroundColor Green

Write-Host ""
Write-Host "2. Backing up and removing deprecated API routes..." -ForegroundColor Cyan

if (Test-Path "pages\api") {
    $apiFileCount = (Get-ChildItem -Path "pages\api" -Recurse -File -ErrorAction SilentlyContinue).Count
    Write-Host "  - Found $apiFileCount API files in pages/api" -ForegroundColor Gray

    if (!$DryRun) {
        # Backup agency and stripe first
        if (Test-Path "pages\api\agency") {
            Copy-Item -Path "pages\api\agency" -Destination "$backupDir\agency" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Backed up pages/api/agency" -ForegroundColor Gray
        }
        if (Test-Path "pages\api\stripe") {
            Copy-Item -Path "pages\api\stripe" -Destination "$backupDir\stripe" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Backed up pages/api/stripe" -ForegroundColor Gray
        }

        # Backup entire directory
        Copy-Item -Path "pages\api" -Destination "$backupDir\pages_api_full" -Recurse -Force -ErrorAction SilentlyContinue

        # Remove pages/api
        Remove-Item -Path "pages\api" -Recurse -Force -ErrorAction SilentlyContinue

        # Recreate with only agency and stripe
        New-Item -ItemType Directory -Path "pages\api" -Force | Out-Null

        if (Test-Path "$backupDir\agency") {
            Copy-Item -Path "$backupDir\agency" -Destination "pages\api\agency" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Restored pages/api/agency" -ForegroundColor Green
        }
        if (Test-Path "$backupDir\stripe") {
            Copy-Item -Path "$backupDir\stripe" -Destination "pages\api\stripe" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Restored pages/api/stripe" -ForegroundColor Green
        }
    }

    Write-Host "  ✓ Removed ~$apiFileCount deprecated API endpoints" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Removing deprecated agent files..." -ForegroundColor Cyan

$deprecatedAgents = @(
    "lib\agents\marketing-agents.ts",
    "lib\agents\agent-migration-guide.ts",
    "lib\agents\EconomicIntelligenceAgent.ts",
    "lib\agents\SocialMediaCopyAgent.ts",
    "lib\agents\SocialMediaEmojiAgent.ts",
    "lib\agents\SocialMediaStyleAgent.ts",
    "lib\agents\quickWinsAgent.ts",
    "lib\agents\siteAnalysis.ts",
    "lib\agents\strategicAnalysis.ts",
    "lib\agents\strategic-analysis-agent.ts",
    "lib\agents\strategic-framework-agents.ts",
    "lib\agents\agent-manager.ts",
    "lib\agents\multi-agent-validator.ts",
    "lib\agents\production-orchestrator.ts",
    "lib\agents\marketing-rag.ts",
    "lib\agents\porter-rag.ts"
)

$removedAgents = 0
foreach ($agent in $deprecatedAgents) {
    if (Test-Path $agent) {
        Write-Host "  - Removing: $agent" -ForegroundColor Gray
        if (!$DryRun) {
            Remove-Item -Path $agent -Force -ErrorAction SilentlyContinue
        }
        $removedAgents++
    }
}

Write-Host "  ✓ Removed $removedAgents deprecated agent files" -ForegroundColor Green

Write-Host ""
Write-Host "4. Removing other deprecated files..." -ForegroundColor Cyan

$otherDeprecated = @(
    "app\AnalysisModuleCard.tsx",
    "app\actions\chat.ts",
    "app\api\business-context",
    "app\api\generate-content-intelligent",
    "app\api\marketing-chat",
    "app\api\demos",
    "components\DemoPreviewClient.tsx"
)

$removedOther = 0
foreach ($file in $otherDeprecated) {
    if (Test-Path $file) {
        Write-Host "  - Removing: $file" -ForegroundColor Gray
        if (!$DryRun) {
            if ((Get-Item $file -ErrorAction SilentlyContinue).PSIsContainer) {
                Remove-Item -Path $file -Recurse -Force -ErrorAction SilentlyContinue
            } else {
                Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
            }
        }
        $removedOther++
    }
}

Write-Host "  ✓ Removed $removedOther other deprecated files" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ""
    Write-Host "DRY RUN COMPLETE - No files were actually deleted" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to execute the cleanup" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "✓ Cleanup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backup location: $backupDir" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Files removed:" -ForegroundColor White
    Write-Host "  - $removedPages deprecated page components" -ForegroundColor Gray
    Write-Host "  - ~80+ deprecated API endpoints" -ForegroundColor Gray
    Write-Host "  - $removedAgents deprecated agent files" -ForegroundColor Gray
    Write-Host "  - $removedOther other deprecated files" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run build to verify:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If everything works, commit:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Clean up deprecated files'" -ForegroundColor Gray
Write-Host ""

if (!$DryRun) {
    Write-Host "To rollback if needed:" -ForegroundColor Yellow
    Write-Host "  See rollback instructions in CLEANUP_PLAN.md" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
