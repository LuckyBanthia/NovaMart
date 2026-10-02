<#
=============================================================================
NovaMart Microservices - Master Startup Script (PowerShell)
=============================================================================
This script spins up all NovaMart microservices in the required dependency order:
  1. Eureka Discovery Server (Port 8761)
  2. Spring Boot Core Services:
     - User Service   (Port 8081)
     - Product Service(Port 8082)
     - Order Service  (Port 8083)
  3. Python Scikit-Learn AI Service (Port 8084)
  4. Spring Cloud API Gateway (Port 8080)
=============================================================================
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       🚀 Starting NovaMart Microservices Platform       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

function Launch-Service($name, $jarRelPath, $module, $port) {
    $jarPath = Join-Path $ScriptDir $jarRelPath
    if (Test-Path $jarPath) {
        Write-Host "Starting $name on port $port (JAR mode)..." -ForegroundColor Green
        Start-Process "java" -ArgumentList "-jar", "`"$jarPath`"" -WorkingDirectory $ScriptDir -WindowStyle Hidden
    } else {
        Write-Host "Starting $name on port $port (Maven mode)..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir'; .\mvnw.cmd spring-boot:run -pl $module" -WorkingDirectory $ScriptDir -WindowStyle Minimized
    }
}

# Step 1: Start Discovery Service (Eureka Server)
Write-Host "[1/6] Launching Eureka Discovery Server on port 8761..." -ForegroundColor Green
Launch-Service "Discovery Service" "discovery-service\target\discovery-service-1.0.0.jar" "discovery-service" 8761

Write-Host "      Waiting 8 seconds for Eureka Server to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 8

# Step 2: Start User Service
Write-Host "[2/6] Launching User Service (Auth & Security) on port 8081..." -ForegroundColor Green
Launch-Service "User Service" "user-service\target\user-service-1.0.0.jar" "user-service" 8081

# Step 3: Start Product Service
Write-Host "[3/6] Launching Product Catalog Service on port 8082..." -ForegroundColor Green
Launch-Service "Product Service" "product-service\target\product-service-1.0.0.jar" "product-service" 8082

# Step 4: Start Order Service
Write-Host "[4/6] Launching Order Processing Service on port 8083..." -ForegroundColor Green
Launch-Service "Order Service" "order-service\target\order-service-1.0.0.jar" "order-service" 8083

# Step 5: Start Python Scikit-Learn AI Service
Write-Host "[5/6] Launching Python Scikit-Learn AI Microservice on port 8084..." -ForegroundColor Green
Start-Process "python" -ArgumentList "main.py" -WorkingDirectory "$ScriptDir\ai-service" -WindowStyle Hidden

Write-Host "      Waiting 6 seconds before launching Gateway..." -ForegroundColor DarkGray
Start-Sleep -Seconds 6

# Step 6: Start API Gateway
Write-Host "[6/6] Launching Spring Cloud API Gateway on port 8080..." -ForegroundColor Green
Launch-Service "API Gateway" "gateway-service\target\gateway-service-1.0.0.jar" "gateway-service" 8080

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🎉 All Microservices successfully launched!          " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  • Eureka Dashboard: http://localhost:8761" -ForegroundColor Yellow
Write-Host "  • API Gateway:      http://localhost:8080" -ForegroundColor Yellow
Write-Host "  • AI Microservice:  http://localhost:8084/docs" -ForegroundColor Yellow
Write-Host "  • Frontend (Vite):  http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop all services, run: ./stop-all.ps1" -ForegroundColor DarkCyan
Write-Host ""
