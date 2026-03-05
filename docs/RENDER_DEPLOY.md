# Guía de Despliegue en Render

Pasos para desplegar la plataforma completa en Render (producción).

---

## Paso 1 — Crear la Base de Datos PostgreSQL

1. Ir a [https://dashboard.render.com](https://dashboard.render.com)
2. **New → PostgreSQL**
3. Configurar:
   - **Name**: `medical-db`
   - **Database**: `medical_db`
   - **User**: `medical_user`
   - **Region**: Ohio (US East) u Oregon (US West)
   - **Plan**: Free (para desarrollo/staging)
4. Clic en **Create Database**
5. Guardar los datos de conexión que Render genera:
   - **Internal Database URL** → para el backend (más rápido, sin costo de red)
   - **External Database URL** → para conectarte desde tu máquina local

> En el plan gratuito la DB se suspende tras 90 días de inactividad.

---

## Paso 2 — Desplegar el Backend (Spring Boot)

1. **New → Web Service**
2. Conectar el repositorio GitHub y seleccionar `medical-appointments-platform`
3. Configurar:
   - **Name**: `medical-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Branch**: `main`
   - **Plan**: Free
4. En **Environment Variables** agregar:

| Variable | Valor |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://HOST_INTERNO/medical_db` (del paso 1) |
| `SPRING_DATASOURCE_USERNAME` | `medical_user` |
| `SPRING_DATASOURCE_PASSWORD` | `<contraseña de Render>` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JWT_SECRET` | Clave segura de mínimo 32 caracteres |

5. **Health Check Path**: `/api/health`
6. Clic en **Create Web Service**

> Render tarda ~5 minutos en el primer deploy. Los siguientes son automáticos con cada push a `main`.

---

## Paso 3 — Desplegar el Frontend (React)

1. **New → Static Site**
2. Conectar el mismo repositorio
3. Configurar:
   - **Name**: `medical-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Branch**: `main`
4. En **Environment Variables** agregar:

| Variable | Valor |
|---|---|
| `REACT_APP_API_URL` | `https://medical-backend.onrender.com/api` |

5. Clic en **Create Static Site**

---

## Paso 4 — Auto-Deploy con GitHub Actions

El archivo `.github/workflows/ci.yml` ejecuta los tests en cada push.
Render detecta automáticamente el merge a `main` y redespliega.

Flujo completo:
```
push a feature/* → PR a develop → merge a main → Render redespliega
```

---

## Notas importantes para el plan gratuito de Render

| Servicio | Limitación Free |
|---|---|
| Web Service | Se duerme tras 15 min de inactividad, tarda ~30s en despertar |
| Static Site | Sin limitaciones de inactividad |
| PostgreSQL | 1 GB storage, suspensión tras 90 días sin uso |

Para las pruebas de carga (JMeter), usar el plan **Starter** temporalmente.

---

## Variables de entorno en local vs producción

| Variable | Local (`.env`) | Render |
|---|---|---|
| DB URL | `localhost:5432` | Internal DB URL de Render |
| API URL | `http://localhost:8080/api` | `https://medical-backend.onrender.com/api` |
| Profile | `dev` | `prod` |
