param([int]$Port = 8080)

$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($id in $pids) {
        $proc = Get-Process -Id $id -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Terminando proceso '$($proc.Name)' (PID $id) en puerto $Port..."
            Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 1
    Write-Host "  [OK] Puerto $Port liberado."
} else {
    Write-Host "  [OK] Puerto $Port ya estaba libre."
}
