$envContent = Get-Content .env.local
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=" | ForEach-Object { $_ -replace "NEXT_PUBLIC_SUPABASE_URL=", "" }).Trim()
$serviceKey = ($envContent | Select-String "SUPABASE_SERVICE_ROLE_KEY=" | ForEach-Object { $_ -replace "SUPABASE_SERVICE_ROLE_KEY=", "" }).Trim()

$headers = @{
    'apikey' = $serviceKey
    'Authorization' = "Bearer $serviceKey"
}

Write-Host "Fetching all demos..." -ForegroundColor Cyan
$all = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/demos?select=id,client_id,site_url,summary,contractor_mode,created_at" -Headers $headers -Method Get

Write-Host "Total entries: $($all.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($item in $all) {
    Write-Host "----------------------------------------"
    Write-Host "ID: $($item.id)"
    Write-Host "Client ID: $($item.client_id)"
    Write-Host "Site URL: $($item.site_url)"
    if ($item.summary.Length -gt 100) {
        Write-Host "Summary: $($item.summary.Substring(0, 100))..."
    } else {
        Write-Host "Summary: $($item.summary)"
    }
    Write-Host "Contractor: $($item.contractor_mode)"
    Write-Host "Created: $($item.created_at)"
    Write-Host ""
}
