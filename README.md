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
├── backend/          ← API REST (Spring Boot)
├── frontend/         ← SPA (React)
├── database/
│   └── migrations/   ← Scripts Flyway (V1, V2...)
├── docs/
│   ├── architecture/ ← Diagramas Isoflow
│   └── testing/      ← Casos de prueba y bitácora
├── tests/
│   ├── e2e/          ← Selenium
│   └── performance/  ← JMeter
├── .github/
│   └── workflows/    ← CI/CD
└── docker-compose.yml
```

## Inicio Rápido (Local)

### Requisitos previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/medical-appointments-platform.git
cd medical-appointments-platform
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env si necesitas cambiar algún valor
```

### 3. Levantar la base de datos

```bash
docker-compose up -d db adminer
```

Esto levanta:
- **PostgreSQL** en `localhost:5432`
- **Adminer** (UI de DB) en [http://localhost:8888](http://localhost:8888)

### 4. Verificar la base de datos

Abre [http://localhost:8888](http://localhost:8888) e ingresa:
- Sistema: `PostgreSQL`
- Servidor: `db`
- Usuario: `medical_user`
- Contraseña: `medical_pass`
- Base de datos: `medical_db`

> Los scripts `V1__init_schema.sql` y `V2__seed_data.sql` son ejecutados automáticamente
> por Flyway cuando el backend inicia por primera vez.

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
