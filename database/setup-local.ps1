# =============================================================
# setup-local.ps1
# Crea la base de datos y carga el schema + datos de prueba
# Uso: .\setup-local.ps1
#      .\setup-local.ps1 -DbUser "postgres" -DbPassword "mipass" -DbName "QA"
# =============================================================

param(
    [string]$DbHost     = "localhost",
    [int]   $DbPort     = 5432,
    [string]$DbUser     = "postgres",
    [string]$DbPassword = "742742",
    [string]$DbName     = "QA"
)

# ── Leer .env si existe (sobreescribe los defaults del param) ──────────────────
$envFile = "$PSScriptRoot\..\backend\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
            $key = $Matches[1].Trim()
            $val = $Matches[2].Trim()
            switch ($key) {
                "DB_HOST"     { if (!$PSBoundParameters.ContainsKey('DbHost'))     { $DbHost     = $val } }
                "DB_PORT"     { if (!$PSBoundParameters.ContainsKey('DbPort'))     { $DbPort     = [int]$val } }
                "DB_USER"     { if (!$PSBoundParameters.ContainsKey('DbUser'))     { $DbUser     = $val } }
                "DB_PASSWORD" { if (!$PSBoundParameters.ContainsKey('DbPassword')) { $DbPassword = $val } }
                "DB_NAME"     { if (!$PSBoundParameters.ContainsKey('DbName'))     { $DbName     = $val } }
            }
        }
    }
    Write-Host "[INFO] Credenciales leidas desde backend\.env" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Setup de Base de Datos - Plataforma Medica"          -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Host     : $DbHost`:$DbPort"
Write-Host "  Usuario  : $DbUser"
Write-Host "  Base     : $DbName"
Write-Host ""

# ── Buscar psql.exe ────────────────────────────────────────────────────────────
$psqlCmd = $null

# 1. psql en el PATH
if (Get-Command "psql" -ErrorAction SilentlyContinue) {
    $psqlCmd = "psql"
}

# 2. Rutas de instalación estándar de PostgreSQL en Windows
if (-not $psqlCmd) {
    $candidates = @(
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $psqlCmd = $c; break }
    }
}

if (-not $psqlCmd) {
    Write-Host "[ERROR] No se encontro psql.exe." -ForegroundColor Red
    Write-Host "        Instala PostgreSQL o agrega su carpeta bin al PATH." -ForegroundColor Red
    Write-Host "        Ruta tipica: C:\Program Files\PostgreSQL\17\bin" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] psql encontrado: $psqlCmd" -ForegroundColor Green

# ── Variable de entorno para que psql no pida contraseña ──────────────────────
$env:PGPASSWORD = $DbPassword

# ── Verificar conexion ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[1/4] Verificando conexion a PostgreSQL..." -ForegroundColor Yellow
$testResult = & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d "postgres" -c "SELECT 1" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] No se pudo conectar a PostgreSQL:" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL esta corriendo (services.msc -> postgresql)" -ForegroundColor Yellow
    Write-Host "  - Las credenciales son correctas (usuario: $DbUser)" -ForegroundColor Yellow
    $env:PGPASSWORD = ""
    exit 1
}
Write-Host "[OK] Conexion exitosa" -ForegroundColor Green

# ── Crear la base de datos ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Creando base de datos '$DbName'..." -ForegroundColor Yellow

# Verificar si ya existe
$exists = & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d "postgres" `
    -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'" 2>&1

if ($exists -match "1") {
    Write-Host "[INFO] La base de datos '$DbName' ya existe." -ForegroundColor Cyan
    $confirm = Read-Host "       Deseas borrar y recrear? Esto ELIMINA todos los datos actuales [s/N]"
    if ($confirm -eq "s" -or $confirm -eq "S") {
        Write-Host "       Eliminando '$DbName'..." -ForegroundColor Yellow

        # Cerrar conexiones activas
        & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d "postgres" -c `
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DbName' AND pid <> pg_backend_pid()" | Out-Null

        & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d "postgres" -c "DROP DATABASE `"$DbName`"" | Out-Null
        Write-Host "       Base de datos eliminada." -ForegroundColor Gray
    } else {
        Write-Host "[INFO] Manteniendo base de datos existente." -ForegroundColor Cyan
        Write-Host "       Saltando creacion de schema y seed data." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "[INFO] Si quieres solo cargar el seed, ejecuta manualmente:" -ForegroundColor Yellow
        Write-Host "       psql -U $DbUser -d $DbName -f database\migrations\V2__seed_data.sql" -ForegroundColor Gray
        $env:PGPASSWORD = ""
        exit 0
    }
}

& $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d "postgres" -c "CREATE DATABASE `"$DbName`"" | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] No se pudo crear la base de datos." -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}
Write-Host "[OK] Base de datos '$DbName' creada" -ForegroundColor Green

# ── Ejecutar V1: Schema ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/4] Creando tablas (V1__init_schema.sql)..." -ForegroundColor Yellow
$v1 = "$PSScriptRoot\migrations\V1__init_schema.sql"
$output = & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $v1 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Fallo al ejecutar V1__init_schema.sql:" -ForegroundColor Red
    Write-Host $output -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}
Write-Host "[OK] Schema creado (tablas, indices, constraints)" -ForegroundColor Green

# ── Ejecutar V2: Seed data ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/4] Insertando datos de prueba (V2__seed_data.sql)..." -ForegroundColor Yellow
$v2 = "$PSScriptRoot\migrations\V2__seed_data.sql"
$output = & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $v2 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Fallo al ejecutar V2__seed_data.sql:" -ForegroundColor Red
    Write-Host $output -ForegroundColor Red
    $env:PGPASSWORD = ""
    exit 1
}
Write-Host "[OK] Datos de prueba insertados" -ForegroundColor Green

# ── Resumen ────────────────────────────────────────────────────────────────────
$env:PGPASSWORD = ""
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "  Base de datos lista!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Credenciales de prueba (contrasena: Password123!):" -ForegroundColor White
Write-Host "  Admin    : admin@medical.com" -ForegroundColor Gray
Write-Host "  Medico   : dr.garcia@medical.com" -ForegroundColor Gray
Write-Host "  Paciente : paciente1@mail.com" -ForegroundColor Gray
Write-Host ""
Write-Host "  Proximo paso: cd backend && .\run.bat" -ForegroundColor Cyan
Write-Host ""
