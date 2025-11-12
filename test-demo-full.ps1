# Step 1: Analyze site
Write-Output "Step 1: Analyzing diamondbackpropane.com..."
$analyzeBody = @{
    url = "https://diamondbackpropane.com"
    demoName = "Diamondback Propane"
} | ConvertTo-Json

$analyzeResponse = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/analyze-site" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $analyzeBody

Write-Output "Site analysis complete. Summary length: $($analyzeResponse.summary.Length) chars"
Write-Output ""

# Step 2: Generate demo with insights
Write-Output "Step 2: Generating Profit IQ insights..."
$generateBody = @{
    clientId = "test-diamondback"
    siteText = $analyzeResponse.summary
    metadata = @{
        url = "https://diamondbackpropane.com"
        keyItems = $analyzeResponse.keyItems
        embeddingsId = $analyzeResponse.embeddingsId
    }
    insightsOnly = $true
} | ConvertTo-Json -Depth 5

$generateResponse = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/generate-demo" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $generateBody

Write-Output ""
Write-Output "=== PROFIT IQ ANALYSIS ==="
Write-Output $generateResponse.insights.profitIq
Write-Output ""
Write-Output "=== VALIDATION RESULTS ==="
if ($generateResponse.validationResults) {
    Write-Output "Valid: $($generateResponse.validationResults.isValid)"
    if ($generateResponse.validationResults.issues) {
        Write-Output "Issues: $($generateResponse.validationResults.issues -join ', ')"
    }
    if ($generateResponse.validationResults.suggestions) {
        Write-Output "Suggestions: $($generateResponse.validationResults.suggestions -join ', ')"
    }
}

# Save full response
$generateResponse | ConvertTo-Json -Depth 10 | Out-File -FilePath "test-demo-full-output.json" -Encoding UTF8
Write-Output ""
Write-Output "Full response saved to test-demo-full-output.json"
