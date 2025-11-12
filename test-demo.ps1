$body = @{
    website = "https://diamondbackpropane.com"
    businessName = "Diamondback Propane"
    workflow = "quick-analysis"
} | ConvertTo-Json

Write-Output "Testing marketing-strategy endpoint..."
$response = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/marketing-strategy" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body

Write-Output "`n=== PROFIT IQ / INSIGHTS ==="
$response.intelligence.profitIq
Write-Output "`n"
$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "test-marketing-output.json" -Encoding UTF8
Write-Output "Full response saved to test-marketing-output.json"
