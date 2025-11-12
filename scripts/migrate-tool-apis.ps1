# PowerShell Script to Migrate Tool APIs to Unified Agent System
# This script updates all tool APIs to use the new tool-agent-helper

$toolsDir = "app\api\tools"
$tools = @(
    "email-writer",
    "review-responder",
    "ad-copy",
    "faq-builder",
    "gmb-post",
    "local-seo-meta",
    "location-page",
    "video-script",
    "newsletter",
    "job-description",
    "policy-generator",
    "win-back-email",
    "loyalty-program",
    "referral-request",
    "landing-page",
    "sales-sequence",
    "objection-handler",
    "positioning-statement",
    "case-study",
    "social-testimonial",
    "apology-email",
    "crisis-communication",
    "service-packages",
    "auto-response",
    "booking-confirmation",
    "invoice-followup",
    "partnership-pitch",
    "pricing-strategy",
    "sponsorship-pitch",
    "networking-followup",
    "why-choose-us",
    "usp-generator",
    "negative-review",
    "testimonial-request"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tool API Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$newTemplate = @'
import { NextResponse } from "next/server";
import { executeToolAgent, validateToolRequest } from "@/lib/agents/tool-agent-helper";

/**
 * {TOOL_NAME} API Route
 * Uses unified agent system for consistency and proper agentic framework
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("{TOOL_ID} request:", {
      business_name: body.business_name,
      business_type: body.business_type,
      has_website_analysis: !!body.website_analysis,
    });

    // Validate request
    validateToolRequest(body);

    // Execute using unified agent system
    const result = await executeToolAgent('{TOOL_ID}', body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("{TOOL_NAME} generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate {TOOL_NAME}",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
'@

foreach ($tool in $tools) {
    $toolPath = Join-Path $toolsDir "$tool\route.ts"

    if (Test-Path $toolPath) {
        Write-Host "Processing: $tool" -ForegroundColor Yellow

        # Read current file
        $currentContent = Get-Content $toolPath -Raw

        # Check if already migrated
        if ($currentContent -match "tool-agent-helper") {
            Write-Host "  ✓ Already migrated" -ForegroundColor Green
            continue
        }

        # Create backup
        $backupPath = $toolPath + ".backup"
        Copy-Item $toolPath $backupPath
        Write-Host "  ✓ Backup created" -ForegroundColor Gray

        # Generate new content
        $toolName = ($tool -split '-' | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }) -join ' '
        $newContent = $newTemplate -replace '{TOOL_ID}', $tool -replace '{TOOL_NAME}', $toolName

        # Write new content
        Set-Content $toolPath $newContent
        Write-Host "  ✓ Migrated to unified agent system" -ForegroundColor Green

    } else {
        Write-Host "  ✗ File not found: $toolPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes with git diff" -ForegroundColor White
Write-Host "2. Test each tool endpoint" -ForegroundColor White
Write-Host "3. Update tool-specific configurations in tool-agent-helper.ts" -ForegroundColor White
Write-Host "4. Remove .backup files once confirmed working" -ForegroundColor White
Write-Host ""
Write-Host "To restore a backup:" -ForegroundColor Yellow
Write-Host "  Copy-Item app\api\tools\{TOOL}\route.ts.backup app\api\tools\{TOOL}\route.ts" -ForegroundColor Gray
Write-Host ""
