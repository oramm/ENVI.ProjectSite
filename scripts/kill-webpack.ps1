# Terminates any process listening on dev server port 9000.
$connections = Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
        } catch {
            Write-Host "Unable to stop PID $($conn.OwningProcess): $_" -ForegroundColor Yellow
        }
    }
}
