<#
=============================================================================
NovaMart Microservices - Master Shutdown Script (PowerShell)
=============================================================================
Stops all microservices by finding and killing processes bound to standard ports:
  - 8761 (Eureka Discovery)
  - 8080 (API Gateway)
  - 8081 (User Service)
  - 8082 (Product Service)
  - 8083 (Order Service)
  - 8084 (AI Microservice)
=============================================================================
#>

$Ports = @(8761, 8080, 8081, 8082, 8083, 8084)

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       🛑 Stopping NovaMart Microservices Platform       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

foreach ($Port in $Ports) {
    Write-Host "Checking port $Port..." -NoNewline
    $Connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($Connections) {
        $ProcessIds = $Connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($ProcId in $ProcessIds) {
            if ($ProcId -le 4) { continue }
            try {
                $Proc = Get-Process -Id $ProcId -ErrorAction SilentlyContinue
                if ($Proc) {
                    Stop-Process -Id $ProcId -Force -ErrorAction SilentlyContinue
                    Write-Host " [KILLED PID $ProcId ($($Proc.ProcessName))]" -ForegroundColor Red
                }
            } catch {
                Write-Host " [Error stopping PID $ProcId]" -ForegroundColor DarkRed
            }
        }
    } else {
        Write-Host " [INACTIVE]" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "All NovaMart services have been stopped." -ForegroundColor Green
Write-Host ""
