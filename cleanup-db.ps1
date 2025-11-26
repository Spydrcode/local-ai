# Simple Supabase Cleanup Script
$envContent = Get-Content .env.local
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=" | ForEach-Object { $_ -replace "NEXT_PUBLIC_SUPABASE_URL=", "" }).Trim()
$serviceKey = ($envContent | Select-String "SUPABASE_SERVICE_ROLE_KEY=" | ForEach-Object { $_ -replace "SUPABASE_SERVICE_ROLE_KEY=", "" }).Trim()

Write-Host "Checking Supabase database..." -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl"
Write-Host ""

$headers = @{
    'apikey' = $serviceKey
    'Authorization' = "Bearer $serviceKey"
    'Content-Type' = 'application/json'
}

# Get all clients
$response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/demos?select=id,business_name,website_url,created_at" -Headers $headers -Method Get

Write-Host "Total clients: $($response.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "All clients:"
foreach ($client in $response) {
    $date = [DateTime]::Parse($client.created_at).ToString("yyyy-MM-dd")
    Write-Host "  - $($client.business_name) | $($client.website_url) | $date"
}
Write-Host ""

# Find unwanted
$unwanted = @()
foreach ($client in $response) {
    if ($client.business_name -eq 'Unnamed Business' -or 
        $client.business_name -eq 'Contractor Business' -or 
        $client.website_url -eq 'contractor-setup') {
        $unwanted += $client
    }
}

if ($unwanted.Count -eq 0) {
    Write-Host "No unwanted clients found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($unwanted.Count) unwanted clients:" -ForegroundColor Red
foreach ($client in $unwanted) {
    Write-Host "  - $($client.business_name) | $($client.website_url)" -ForegroundColor Red
}
Write-Host ""

$confirm = Read-Host "Delete these $($unwanted.Count) clients? (y/n)"

if ($confirm -ne 'y') {
    Write-Host "Cleanup cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deleting..." -ForegroundColor Yellow
$deleted = 0

foreach ($client in $unwanted) {
    $deleteUri = "$supabaseUrl/rest/v1/demos?id=eq.$($client.id)"
    Invoke-RestMethod -Uri $deleteUri -Headers $headers -Method Delete | Out-Null
    Write-Host "  Deleted: $($client.business_name)" -ForegroundColor Green
    $deleted++
}

Write-Host ""
Write-Host "Cleanup complete! Deleted $deleted clients." -ForegroundColor Green

# Show remaining
$remaining = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/demos?select=id,business_name,website_url" -Headers $headers -Method Get
Write-Host ""
Write-Host "Remaining clients: $($remaining.Count)" -ForegroundColor Cyan
foreach ($client in $remaining) {
    Write-Host "  - $($client.business_name) | $($client.website_url)"
}
