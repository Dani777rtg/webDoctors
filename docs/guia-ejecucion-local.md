# Guía: ejecutar Backend y Frontend en local

Guía para levantar el **backend** (Spring Boot) y el **frontend** (React + Vite) en tu máquina. Orientada a **Windows** (PowerShell).

---

## Requisitos

- **Java 17** y **Maven** (backend).
- **Node.js** con **npm** (frontend).
- **PostgreSQL** en marcha, o la base de datos usando **Docker** (`docker-compose.yml` en la raíz del repo).

---

## 1. Base de datos (una vez)

El backend **no crea la base de datos sola**. Debes tener la BD creada y el esquema + datos de prueba aplicados.

1. Copia el ejemplo de variables del backend:

   ```powershell
   cd C:\Users\Admin\Documents\QA
   copy backend\.env.example backend\.env
   ```

   Ajusta la ruta si tu clon está en otra carpeta.

2. Edita `backend\.env` y configura usuario y contraseña de PostgreSQL (y el nombre de la BD si no usas `QA`).

3. Ejecuta el script de setup (recomendado):

   ```powershell
   database\setup-local.bat
   ```

   También puedes usar las opciones manuales descritas en el `README.md` del proyecto (migraciones `V1__init_schema.sql` y `V2__seed_data.sql`).

---

## 2. Backend (Spring Boot)

Desde la carpeta del backend:

```powershell
cd backend
run.bat
```

Alternativa con Maven:

```powershell
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Comprobar que responde:**

- Health: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- Swagger / OpenAPI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) (o la ruta que indique tu `application.yml` / SpringDoc).

Mantén esta terminal abierta mientras trabajas con la aplicación.

---

## 3. Frontend (React + Vite)

Abre **otra** terminal:

```powershell
cd frontend
npm install
copy .env.example .env
```

El archivo `frontend\.env` debe incluir la URL base de la API, por ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Arranque en modo desarrollo:

```powershell
npm run dev
```

Vite mostrará la URL (habitualmente **http://localhost:5173**). Ábrela en el navegador.

---

## 4. Orden recomendado

1. PostgreSQL (o contenedor de BD) en ejecución.
2. **Backend** (`run.bat` o `mvn spring-boot:run`).
3. **Frontend** (`npm run dev`).

---

## 5. Usuarios de prueba (datos seed)

Según el `README.md` del repositorio:

| Rol      | Email                 | Contraseña   |
|----------|------------------------|--------------|
| Admin    | admin@medical.com      | Password123! |
| Médico   | dr.garcia@medical.com  | Password123! |
| Paciente | paciente1@mail.com     | Password123! |

---

## Problemas frecuentes

- **“Failed to fetch” en el navegador**: el backend no está corriendo o `VITE_API_BASE_URL` en `frontend\.env` no apunta a `http://localhost:8080/api`.
- **Error al conectar con la base de datos**: revisa `backend\.env` y que PostgreSQL acepte conexiones en `localhost` con ese usuario y contraseña.
- **Puerto 8080 ocupado**: `run.bat` intenta liberar el puerto; si sigue fallando, cierra el proceso que use el puerto 8080.

### No puedo iniciar sesión con los usuarios seed

El backend responde **401** con mensaje tipo *“Email o contraseña incorrectos”* cuando la autenticación falla. Revisa en este orden:

1. **Contraseña exacta**  
   Debe ser `Password123!` (mayúscula **P**, número **123**, signo **!**). Sin espacios al inicio o al final.

2. **Email en minúsculas**  
   Usa exactamente, por ejemplo: `paciente1@mail.com` (el backend también normaliza mayúsculas/espacios alrededor del correo).

3. **Datos seed cargados**  
   Si no ejecutaste `database\setup-local.bat` (o las migraciones `V1` + `V2`), la tabla `users` puede estar vacía o con otras contraseñas. Vuelve a cargar el seed.

4. **Cuenta desactivada**  
   En PostgreSQL, comprueba `is_active` para tu usuario:

   ```sql
   SELECT email, is_active FROM users WHERE email = 'paciente1@mail.com';
   ```

   Si `is_active` es `false`, el login fallará hasta que un administrador reactive la cuenta.

5. **Probar el login sin el frontend** (aislar si el fallo es API o la web):

   ```powershell
   $body = '{"email":"paciente1@mail.com","password":"Password123!"}'
   Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json; charset=utf-8" -Body $body
   ```

   Si aquí obtienes un JSON con `token`, el backend está bien y el problema suele ser la URL del frontend (`frontend\.env`) o el navegador (caché, otra pestaña).

---

## Comandos útiles adicionales (frontend)

| Comando        | Descripción                    |
|----------------|--------------------------------|
| `npm run build` | Compilación de producción     |
| `npm run preview` | Vista previa del build       |
| `npm run test:run` | Tests unitarios (Vitest)   |
