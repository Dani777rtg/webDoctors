@echo off
:: ============================================================
:: setup-local.bat  -  Wrapper para setup-local.ps1
:: Doble clic para ejecutar, o desde la terminal:
::   database\setup-local.bat
::   database\setup-local.bat postgres miPassword MiDB
:: ============================================================

:: Parametros opcionales: usuario contraseña nombre_db
SET DB_USER=%1
SET DB_PASS=%2
SET DB_NAME=%3

IF "%DB_USER%"=="" SET DB_USER=postgres
IF "%DB_PASS%"=="" SET DB_PASS=742742
IF "%DB_NAME%"=="" SET DB_NAME=QA

echo.
echo  Iniciando setup de base de datos...
echo  (Si no pide contrasena es porque la leyó del archivo .env)
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0setup-local.ps1" ^
    -DbUser "%DB_USER%" ^
    -DbPassword "%DB_PASS%" ^
    -DbName "%DB_NAME%"

pause
