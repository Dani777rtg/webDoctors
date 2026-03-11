# Documento de Requerimientos
## Plataforma Web de Citas Médicas

---

## 1. Requerimientos Funcionales

### Descripción General
Desarrollar una plataforma web que permita a los pacientes agendar consultas médicas y a los médicos gestionar sus citas, historiales médicos y disponibilidad. El sistema incluirá roles diferenciados, manejo de sesiones, validaciones y persistencia de datos.

---

### RF-01 — Módulo Paciente

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01.1 | Registro de nuevo paciente con email, contraseña y datos personales | Alta |
| RF-01.2 | Inicio de sesión con email y contraseña | Alta |
| RF-01.3 | Solicitud de cita médica (tipo: medicina general, fecha, hora) | Alta |
| RF-01.4 | Cancelación de cita propia | Alta |
| RF-01.5 | Reprogramación de cita existente | Media |
| RF-01.6 | Visualización del historial de citas propias | Alta |

**Restricciones:**
- Un paciente solo puede ver y modificar sus propias citas
- No se puede agendar una cita en un horario ya ocupado
- No se puede agendar fuera del horario de disponibilidad del médico

---

### RF-02 — Módulo Médico

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-02.1 | Gestión de disponibilidad: definir días y horarios de atención | Alta |
| RF-02.2 | El sistema debe tener al menos un médico disponible Lun-Vie 6am-8pm | Alta |
| RF-02.3 | Confirmación de citas pendientes | Alta |
| RF-02.4 | Cancelación de citas asignadas | Alta |
| RF-02.5 | Registro de observaciones y diagnóstico del paciente (historial médico) | Alta |
| RF-02.6 | Visualización de su propia agenda de citas | Alta |

**Restricciones:**
- Un médico solo puede acceder a citas asignadas a él
- Solo puede registrar historial médico en citas con estado COMPLETED

---

### RF-03 — Módulo Administrador

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-03.1 | Crear nuevos médicos en el sistema | Alta |
| RF-03.2 | Crear nuevos pacientes en el sistema | Alta |
| RF-03.3 | Activar/desactivar cuentas de médicos y pacientes | Alta |
| RF-03.4 | Eliminar usuarios del sistema | Media |
| RF-03.5 | Visualización de la agenda global (todas las citas) | Alta |
| RF-03.6 | Listar todos los usuarios del sistema | Alta |

---

## 2. Requerimientos No Funcionales

| ID | Requerimiento | Categoría |
|---|---|---|
| RNF-01 | Frontend desarrollado en React 18 | Tecnología |
| RNF-02 | Backend desarrollado en Java 17 con Spring Boot 3 | Tecnología |
| RNF-03 | Base de datos PostgreSQL 16 | Tecnología |
| RNF-04 | Autenticación mediante JWT (JSON Web Tokens) | Seguridad |
| RNF-05 | Contraseñas almacenadas con hash BCrypt | Seguridad |
| RNF-06 | Acceso a endpoints protegido por rol | Seguridad |
| RNF-07 | El sistema debe responder en menos de 2s bajo carga normal | Rendimiento |
| RNF-08 | La API debe documentarse con Swagger/OpenAPI | Mantenibilidad |
| RNF-09 | El sistema debe soportar al menos 50 usuarios concurrentes | Escalabilidad |
| RNF-10 | Desplegable en Render (producción) y ejecutable con Docker (local) | Despliegue |

---

## 3. Objetivo de las Pruebas

Validar que la plataforma web médica funcione correctamente según los requisitos funcionales y no funcionales, garantizando su estabilidad, funcionalidad y usabilidad.

---

## 4. Tipos de Pruebas

### PT-01 — Pruebas Unitarias
**Herramienta:** JUnit 5 + Mockito (backend) | Jest + React Testing Library (frontend)

| ID | Caso de prueba |
|---|---|
| PU-01 | Validación de formato de email |
| PU-02 | Validación de formato de fecha y hora |
| PU-03 | Lógica de comprobación de disponibilidad del médico |
| PU-04 | Detección de conflictos de horario (cita duplicada) |
| PU-05 | Regla: no permitir cita si el médico no tiene disponibilidad ese día |
| PU-06 | Cálculo del slot de tiempo disponible más próximo |

### PT-02 — Pruebas de Integración
**Herramienta:** @SpringBootTest + Testcontainers (PostgreSQL real en tests)

| ID | Flujo de prueba |
|---|---|
| PI-01 | Registro → Login → Solicitud de cita → Confirmación por médico |
| PI-02 | Acceso concurrente a la DB para agendar citas (race condition) |
| PI-03 | Cancelación de cita → verificar que slot queda libre |
| PI-04 | Registro de historial médico vinculado a cita completada |

### PT-03 — Pruebas Funcionales
**Herramienta:** Pruebas manuales con Postman/Swagger + scripts automatizados

| ID | Rol | Flujo |
|---|---|---|
| PF-01 | Paciente | Login → Agendar cita → Cancelar cita → Ver historial |
| PF-02 | Médico | Login → Ver agenda → Confirmar cita → Registrar observaciones |
| PF-03 | Admin | Login → Listar usuarios → Desactivar médico → Ver agenda global |

### PT-04 — Pruebas E2E (End to End)
**Herramienta:** Selenium IDE

| ID | Escenario |
|---|---|
| PE-01 | Flujo completo del paciente desde el navegador |
| PE-02 | Flujo completo del médico desde el navegador |
| PE-03 | Flujo completo del administrador desde el navegador |

### PT-05 — Pruebas de Rendimiento
**Herramienta:** Apache JMeter

| Tipo | Métrica a medir |
|---|---|
| Carga (Load Testing) | Comportamiento con múltiples usuarios simultáneos |
| Estrés (Stress Testing) | Tiempo de respuesta bajo carga extrema |
| | Uso de CPU y RAM |
| | Cantidad máxima de usuarios simultáneos |
| | Tasa de errores (error rate) |
| | Throughput (transacciones por segundo) |
| | Disponibilidad del sistema |

### PT-06 — Pruebas de Aceptación
**Herramienta:** Casos de prueba formales basados en criterios de aceptación

Casos de aceptación generados a partir de los requerimientos funcionales RF-01 a RF-03.

---

## 5. Entregables Finales

| # | Entregable |
|---|---|
| 1 | Código fuente funcional del sistema (GitHub) |
| 2 | Evidencia de ejecución de pruebas (código, pantallazos, logs, videos) |
| 3 | **Bitácora de pruebas:** |
| 3a | Casos de prueba |
| 3b | Ejecución de casos de prueba |
| 3c | Registro de defectos |
| 3d | Resumen de resultados |
| 3e | Validación de corrección de errores |
| 3f | Conclusiones |
| 3g | Recomendaciones |
| 3h | Lecciones aprendidas |

---

## 6. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React | 18.x |
| Backend | Java + Spring Boot | 17 / 3.2.x |
| Base de Datos | PostgreSQL | 16.x |
| Autenticación | JWT (jjwt) | 0.12.x |
| Migraciones DB | Flyway | — |
| Documentación API | Swagger / SpringDoc OpenAPI | 2.x |
| Contenedores | Docker + Docker Compose | — |
| CI/CD | GitHub Actions | — |
| Hosting | Render | — |
| Pruebas Backend | JUnit 5 + Mockito + Testcontainers | — |
| Pruebas Frontend | Jest + React Testing Library | — |
| Pruebas E2E | Selenium IDE | — |
| Pruebas Rendimiento | Apache JMeter | — |

---

## 7. Credenciales de Prueba (entorno desarrollo)

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@medical.com | Password123! |
| Médico | dr.garcia@medical.com | Password123! |
| Médico | dr.martinez@medical.com | Password123! |
| Médico | dr.lopez@medical.com | Password123! |
| Paciente | paciente1@mail.com | Password123! |
| Paciente | paciente2@mail.com | Password123! |
