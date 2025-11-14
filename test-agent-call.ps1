# Test if agents are actually calling GPT
Write-Host "Testing blog-writer endpoint..." -ForegroundColor Cyan

$body = @{
    business_name = "Joe's Pizza"
    business_type = "Italian Restaurant"  
    blog_topic = "Why Fresh Ingredients Matter"
} | ConvertTo-Json

Write-Host "Request body:" -ForegroundColor Yellow
Write-Host $body

Write-Host "`nCalling API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3000/api/tools/blog-writer" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -TimeoutSec 60
    
    Write-Host "`nResponse Status:" $response.StatusCode -ForegroundColor Green
    Write-Host "`nResponse Body:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`nError:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host $reader.ReadToEnd()
    }
}
