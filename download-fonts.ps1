$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'
$apiUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'

Write-Host 'Rufe Google Fonts CSS ab...'
$css = (Invoke-WebRequest -Uri $apiUrl -Headers @{ 'User-Agent' = $ua } -UseBasicParsing).Content

$pattern = 'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)'
$found   = [regex]::Matches($css, $pattern)
Write-Host "Gefundene woff2-URLs: $($found.Count)"

$map = @{
  400 = 'Inter-Regular.woff2'
  500 = 'Inter-Medium.woff2'
  600 = 'Inter-SemiBold.woff2'
  700 = 'Inter-Bold.woff2'
}

# Extrahiere auch die font-weight-Blöcke
$blocks = [regex]::Matches($css, '(?s)font-weight:\s*(\d+).*?url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)')

foreach ($b in $blocks) {
  $weight   = [int]$b.Groups[1].Value
  $fontUrl  = $b.Groups[2].Value
  $filename = $map[$weight]
  if (-not $filename) { continue }

  $dest = "fonts\$filename"
  if (Test-Path $dest) {
    Write-Host "  Bereits vorhanden: $filename"
    continue
  }
  Write-Host "  Lade $filename ($weight) ..."
  try {
    Invoke-WebRequest -Uri $fontUrl -OutFile $dest -UseBasicParsing
    Write-Host "  OK: $filename ($([Math]::Round((Get-Item $dest).Length / 1024, 1)) KB)"
  } catch {
    Write-Host "  FEHLER: $_"
  }
}

Write-Host ''
Write-Host 'Fertig. Dateien in /fonts:'
Get-ChildItem fonts | Select-Object Name, @{N='KB';E={[Math]::Round($_.Length/1024,1)}} | Format-Table -AutoSize
