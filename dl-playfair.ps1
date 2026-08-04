$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'

# Download Playfair Display (Regular 400, SemiBold 600, Bold 700, Italic 400)
$playfairUrl = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap'
$css = (Invoke-WebRequest -Uri $playfairUrl -Headers @{ 'User-Agent' = $ua } -UseBasicParsing).Content

$map = @{
  '400_normal' = 'PlayfairDisplay-Regular.woff2'
  '600_normal' = 'PlayfairDisplay-SemiBold.woff2'
  '700_normal' = 'PlayfairDisplay-Bold.woff2'
  '400_italic' = 'PlayfairDisplay-Italic.woff2'
}

$blocks = [regex]::Matches($css, '(?s)font-style:\s*(\w+).*?font-weight:\s*(\d+).*?url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)')
foreach ($b in $blocks) {
  $style    = $b.Groups[1].Value
  $weight   = $b.Groups[2].Value
  $fontUrl  = $b.Groups[3].Value
  $key      = "${weight}_${style}"
  $filename = $map[$key]
  if (-not $filename) { continue }
  $dest = "fonts\$filename"
  if (Test-Path $dest) { Write-Host "  Bereits vorhanden: $filename"; continue }
  Write-Host "  Lade $filename ..."
  try {
    Invoke-WebRequest -Uri $fontUrl -OutFile $dest -UseBasicParsing
    Write-Host "  OK: $filename ($([Math]::Round((Get-Item $dest).Length / 1024, 1)) KB)"
  } catch { Write-Host "  FEHLER: $_" }
}

Write-Host ''
Write-Host 'Alle Fonts in /fonts/:'
Get-ChildItem fonts | Select-Object Name, @{N='KB';E={[Math]::Round($_.Length/1024,1)}} | Format-Table -AutoSize
