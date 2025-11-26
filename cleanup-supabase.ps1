# Load environment variables
$envContent = Get-Content .env.local
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=" | ForEach-Object { $_ -replace "NEXT_PUBLIC_SUPABASE_URL=", "" }).Trim()
$serviceKey = ($envContent | Select-String "SUPABASE_SERVICE_ROLE_KEY=" | ForEach-Object { $_ -replace "SUPABASE_SERVICE_ROLE_KEY=", "" }).Trim()

Write-Host "🔍 Checking Supabase database..." -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl" -ForegroundColor Gray
Write-Host ""

# Fetch current clients
$headers = @{
    'apikey' = $serviceKey
    'Authorization' = "Bearer $serviceKey"
    'Content-Type' = 'application/json'
}

try {
    # Get all clients
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/demos?select=id,business_name,website_url,created_at,contractor_mode" -Headers $headers -Method Get
    
    Write-Host "📊 Total clients in database: $($response.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    # Show all clients
    Write-Host "Current clients:" -ForegroundColor White
    $response | ForEach-Object {
        $date = [DateTime]::Parse($_.created_at).ToString("yyyy-MM-dd")
        $contractor = if ($_.contractor_mode) { " [CONTRACTOR]" } else { "" }
        Write-Host "  - $($_.business_name)$contractor | $($_.website_url) | $date" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Identify unwanted clients
    $unwanted = $response | Where-Object { 
        $_.business_name -eq 'Unnamed Business' -or 
        $_.business_name -eq 'Contractor Business' -or 
        $_.website_url -eq 'contractor-setup' -or
        $_.contractor_mode -eq $true
    }
    
    if ($unwanted.Count -eq 0) {
        Write-Host "✅ No unwanted clients found! Database is clean." -ForegroundColor Green
        exit 0
    }
    
    Write-Host "🗑️  Found $($unwanted.Count) unwanted clients to delete:" -ForegroundColor Red
    $unwanted | ForEach-Object {
        Write-Host "  - $($_.business_name) | $($_.website_url)" -ForegroundColor Red
    }
    Write-Host ""
    
    # Ask for confirmation
    $confirm = Read-Host "Delete these $($unwanted.Count) clients? (y/n)"
    
    if ($confirm -ne 'y') {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    # Delete each unwanted client
    Write-Host ""
    Write-Host "🔥 Deleting unwanted clients..." -ForegroundColor Yellow
    $deleted = 0
    
    foreach ($client in $unwanted) {
        try {
            $deleteUri = "$supabaseUrl/rest/v1/demos?id=eq.$($client.id)"
            Invoke-RestMethod -Uri $deleteUri -Headers $headers -Method Delete | Out-Null
            Write-Host "  ✓ Deleted: $($client.business_name)" -ForegroundColor Green
            $deleted++
        }
        catch {
            Write-Host "  ✗ Failed to delete: $($client.business_name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "✅ Cleanup complete! Deleted $deleted clients." -ForegroundColor Green
    
    # Show remaining clients
    $remaining = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/demos?select=id,business_name,website_url" -Headers $headers -Method Get
    Write-Host ""
    Write-Host "Remaining clients: $($remaining.Count)" -ForegroundColor Cyan
    $remaining | ForEach-Object {
        $name = $_.business_name
        $url = $_.website_url
        Write-Host "  - $name | $url" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
