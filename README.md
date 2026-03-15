# Plataforma Web de Citas Médicas

Sistema web para la gestión de citas médicas con roles diferenciados (Paciente, Médico, Administrador).

## Stack Tecnológico

| Capa        | Tecnología              |
|-------------|-------------------------|
| Frontend    | React 18                |
| Backend     | Java 17 + Spring Boot 3 |
| Base de datos | PostgreSQL 16         |
| Hosting     | Render                  |
| Contenedores | Docker + Docker Compose |

## Estructura del Proyecto

```
medical-platform/
├── backend/
│   ├── src/                  ← Código fuente Java (Spring Boot)
│   ├── .env.example          ← Template de variables de entorno
│   ├── .env                  ← Variables locales (NO se sube a Git)
│   ├── run.bat               ← Script para arrancar el backend en Windows
│   └── pom.xml
├── frontend/                 ← SPA (React) — en desarrollo
├── database/
│   ├── migrations/
│   │   ├── V1__init_schema.sql  ← Crea todas las tablas e índices
│   │   └── V2__seed_data.sql    ← Datos de prueba (usuarios, médicos, citas)
│   ├── setup-local.ps1       ← Script automático de setup (PowerShell)
│   └── setup-local.bat       ← Wrapper para doble clic en Windows
├── docs/
│   ├── postman/              ← Colección Postman para probar endpoints
│   ├── architecture/         ← Diagramas de arquitectura
│   └── testing/              ← Casos de prueba y bitácora
├── tests/
│   ├── e2e/                  ← Selenium
│   └── performance/          ← JMeter
├── .github/
│   └── workflows/            ← CI/CD (GitHub Actions)
└── docker-compose.yml
```

## Inicio Rápido (Local)

### Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Java JDK | 17 | [adoptium.net](https://adoptium.net/) |
| Apache Maven | 3.8 | [maven.apache.org](https://maven.apache.org/) |
| PostgreSQL | 14+ | [postgresql.org](https://www.postgresql.org/download/) |
| Git | cualquiera | [git-scm.com](https://git-scm.com/) |

> **¿No quiero instalar PostgreSQL?** Usa Docker: `docker-compose up -d db`

---

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/medical-appointments-platform.git
cd medical-appointments-platform
```

---

### Paso 2 — Configurar variables de entorno del backend

```bash
# Windows (cmd o PowerShell)
copy backend\.env.example backend\.env

# Linux / Mac
cp backend/.env.example backend/.env
```

Abre `backend/.env` y ajusta los valores a tu instalación local de PostgreSQL:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=QA
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_POSTGRES
```

> `backend/.env` está en `.gitignore` — nunca se sube al repositorio.

---

### Paso 3 — Crear la base de datos

> **La base de datos NO se crea sola al arrancar el backend.**
> PostgreSQL tiene que tener la base de datos creada antes de que Spring Boot inicie.

**Opción A — Script automático (recomendado):**

```bash
# Windows (doble clic o desde terminal)
database\setup-local.bat

# O con PowerShell directamente
cd database
.\setup-local.ps1
```

El script hace todo solo:
1. Detecta `psql.exe` en tu sistema
2. Lee las credenciales de `backend/.env`
3. Crea la base de datos `QA` (te pregunta si ya existe)
4. Crea todas las tablas (`V1__init_schema.sql`)
5. Inserta datos de prueba (`V2__seed_data.sql`)

**Opción B — Manual con pgAdmin:**
1. Abre pgAdmin → clic derecho en "Databases" → Create Database → nombre: `QA`
2. Query Tool → abre y ejecuta `database/migrations/V1__init_schema.sql`
3. Query Tool → abre y ejecuta `database/migrations/V2__seed_data.sql`

**Opción C — Manual con psql:**
```bash
psql -U postgres -c "CREATE DATABASE \"QA\""
psql -U postgres -d QA -f database/migrations/V1__init_schema.sql
psql -U postgres -d QA -f database/migrations/V2__seed_data.sql
```

---

### Paso 4 — Iniciar el backend

```bash
cd backend
run.bat        # Windows
# o: mvn spring-boot:run
```

El servidor arranca en **http://localhost:8080**

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Health check: http://localhost:8080/api/health

---

### ¿Qué pasa si tengo otro nombre de base de datos?

Edita `backend/.env`:
```
DB_NAME=mi_otra_db
```

O pasa el parámetro al script de setup:
```bash
.\setup-local.ps1 -DbName "mi_otra_db" -DbPassword "mi_pass"
```

## Credenciales de Prueba (seed)

| Rol         | Email                      | Contraseña    |
|-------------|----------------------------|---------------|
| Admin       | admin@medical.com          | Password123!  |
| Médico      | dr.garcia@medical.com      | Password123!  |
| Médico      | dr.martinez@medical.com    | Password123!  |
| Médico      | dr.lopez@medical.com       | Password123!  |
| Paciente    | paciente1@mail.com         | Password123!  |
| Paciente    | paciente2@mail.com         | Password123!  |

## Ramas de Git

```
main      → producción (protegida, solo merge con PR aprobado)
develop   → integración
feature/* → nuevas funcionalidades
hotfix/*  → correcciones urgentes
```

## Convención de Commits

```
feat:     nueva funcionalidad
fix:      corrección de bug
test:     agregar o modificar pruebas
docs:     documentación
refactor: refactorización sin cambio de funcionalidad
chore:    tareas de configuración/build
```

Ejemplo: `feat: agregar endpoint de solicitud de cita`

## Despliegue en Render

Ver guía completa en [`docs/RENDER_DEPLOY.md`](docs/RENDER_DEPLOY.md)

## Módulos del Sistema

- **Paciente**: Registro, login, solicitar/cancelar/reprogramar citas, historial
- **Médico**: Gestión de disponibilidad, confirmar/cancelar citas, historial médico
- **Administrador**: Gestión de usuarios, agenda global

## Equipo

| Nombre | Rol | GitHub |
|--------|-----|--------|
| [Tu nombre] | Dev Full Stack | @tu_usuario |
| [Compañero] | Dev Full Stack | @compañero_usuario |
