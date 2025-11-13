# Test the marketing strategy API on production
$url = "https://local-ai-three.vercel.app/api/marketing-strategy"
$body = @{
    website = "https://www.diamondbackpropane.com/"
    businessName = "Diamondback Propane"
    industry = "Propane Services"
    workflow = "quick-analysis"
} | ConvertTo-Json

Write-Host "Testing marketing strategy API..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host "Body: $body" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "Error!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Yellow
    }
}
