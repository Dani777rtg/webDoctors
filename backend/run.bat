@echo off
title Medical Platform - Backend
color 0A

echo.
echo  ==========================================
echo   Medical Platform - Backend (Spring Boot)
echo  ==========================================
echo   API:     http://localhost:8080/api/health
echo   Swagger: http://localhost:8080/swagger-ui.html
echo  ==========================================
echo.

:: --- Posicionarse en la carpeta del bat (backend/) ---
cd /d "%~dp0"

:: --- Verificar pom.xml ---
if not exist "pom.xml" (
    echo  [ERROR] No se encontro pom.xml en: %CD%
    pause
    exit /b 1
)

:: --- Agregar Maven al PATH ---
set "PATH=%PATH%;C:\maven\apache-maven-3.9.6\bin"

:: --- Cargar variables del archivo .env ---
echo  [1/4] Cargando variables de entorno desde .env...
if exist ".env" (
    for /f "usebackq tokens=1* delims==" %%A in (`type .env ^| findstr /v "^#" ^| findstr /v "^$"`) do (
        set "%%A=%%B"
    )
    echo  [OK] Variables cargadas desde .env
) else (
    echo  [!] No se encontro .env - usando valores por defecto del application-dev.yml
    echo  [!] Copia .env.example a .env y completa tus credenciales
)

:: --- Matar proceso en puerto 8080 ---
echo  [2/4] Liberando puerto 8080...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kill-port.ps1" -Port 8080

:: --- Verificar conexion a la DB (opcional, informativo) ---
echo  [3/4] Verificando directorio: %CD%

:: --- Arrancar Spring Boot ---
echo  [4/4] Iniciando Spring Boot con perfil: dev
echo.
mvn spring-boot:run -Dspring-boot.run.profiles=dev

echo.
echo  El servidor se detuvo.
pause
