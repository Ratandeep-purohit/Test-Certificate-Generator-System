$lines = Get-Content 'challan.css' -Encoding UTF8
$out = [System.Collections.Generic.List[string]]::new()
$inCapSheet = $false

foreach ($line in $lines) {
    if ($line -match '^\s*\.cap-sheet\s*\{') {
        $inCapSheet = $true
        continue
    }
    if ($inCapSheet) {
        if ($line -match '^\s*\}') {
            $inCapSheet = $false
        }
        continue
    }
    $out.Add($line)
}

# Now insert new cap-sheet block just before .cap-header
$final = [System.Collections.Generic.List[string]]::new()
$inserted = $false
foreach ($line in $out) {
    if (-not $inserted -and $line -match '^\s*\.cap-header\s*\{') {
        $final.Add('.cap-sheet {')
        $final.Add('    width: 200mm;')
        $final.Add('    display: flex;')
        $final.Add('    flex-direction: column;')
        $final.Add('    background: #fff;')
        $final.Add("    font-family: 'Inter', sans-serif;")
        $final.Add('    color: #0f172a;')
        $final.Add('    box-sizing: border-box;')
        $final.Add('    page-break-before: always;')
        $final.Add('    margin-top: 20px;')
        $final.Add('}')
        $final.Add('')
        $inserted = $true
    }
    $final.Add($line)
}

$final | Set-Content 'challan.css' -Encoding UTF8
Write-Host "Done. Total lines: $($final.Count)"
