# Checklist Demo Frontend

## Preparacion
- Levantar backend en `http://localhost:8080`.
- Levantar frontend con `npm run dev` dentro de `frontend`.
- Verificar archivo `.env` en `frontend` con `VITE_API_BASE_URL=http://localhost:8080/api`.

## Flujo Paciente
- Iniciar sesion con `paciente1@mail.com`.
- Crear cita seleccionando medico, fecha futura y slot disponible.
- Cancelar una cita en estado `PENDING` o `CONFIRMED`.
- Reprogramar una cita usando nueva fecha + nuevo horario.
- Verificar que no permita fechas pasadas en formularios.

## Flujo Medico
- Iniciar sesion con `dr.garcia@medical.com`.
- Ver agenda y confirmar cita en estado `PENDING`.
- Completar cita en estado `CONFIRMED`.
- Registrar historial medico con `appointmentId`.
- Actualizar disponibilidad dentro del rango 06:00-20:00.

## Flujo Admin
- Iniciar sesion con `admin@medical.com`.
- Listar usuarios con y sin filtro de rol.
- Crear nuevo medico.
- Activar y desactivar un usuario.
- Eliminar un usuario (confirmacion requerida).
- Revisar agenda global desde modulo de citas.

## Validaciones UX
- Confirmar mensajes de error amigables cuando backend no responde.
- Confirmar botones bloqueados durante acciones para evitar doble envio.
- Confirmar mensajes de exito al terminar acciones principales.
