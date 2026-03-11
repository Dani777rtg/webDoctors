-- =============================================================
-- V2__seed_data.sql
-- Datos iniciales de prueba para desarrollo y staging
-- NOTA: Las contraseñas son bcrypt de "Password123!"
-- =============================================================

-- ---------------------------------------------------------------
-- USUARIOS BASE
-- ---------------------------------------------------------------
INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES
-- Administrador
('admin@medical.com',
 '$2a$10$VHWL0cySgVvBEc59r8/WYe12/KOwPMWEXSz2FH.mgYtoh3lJ3hHKi',
 'ADMIN', 'Admin', 'Sistema', '3001000000'),

-- Médicos
('dr.garcia@medical.com',
 '$2a$10$VHWL0cySgVvBEc59r8/WYe12/KOwPMWEXSz2FH.mgYtoh3lJ3hHKi',
 'DOCTOR', 'Carlos', 'García', '3001000001'),

('dr.martinez@medical.com',
 '$2a$10$VHWL0cySgVvBEc59r8/WYe12/KOwPMWEXSz2FH.mgYtoh3lJ3hHKi',
 'DOCTOR', 'Ana', 'Martínez', '3001000002'),

('dr.lopez@medical.com',
 '$2a$10$VHWL0cySgVvBEc59r8/WYe12/KOwPMWEXSz2FH.mgYtoh3lJ3hHKi',
 'DOCTOR', 'Juan', 'López', '3001000003'),

-- Pacientes
('paciente1@mail.com',
 '$2a$10$VHWL0cySgVvBEc59r8/WYe12/KOwPMWEXSz2FH.mgYtoh3lJ3hHKi',
 'PATIENT', 'María', 'Torres', '3102000001'),

('paciente2@mail.com',
 '$2a$10$VHWL0cySgVvBEc59r8/WYe12/KOwPMWEXSz2FH.mgYtoh3lJ3hHKi',
 'PATIENT', 'Luis', 'Herrera', '3102000002');

-- ---------------------------------------------------------------
-- PERFILES MÉDICOS
-- ---------------------------------------------------------------
INSERT INTO doctors (user_id, specialty, license_number) VALUES
((SELECT id FROM users WHERE email = 'dr.garcia@medical.com'),
 'Medicina General', 'MED-001-COL'),

((SELECT id FROM users WHERE email = 'dr.martinez@medical.com'),
 'Medicina General', 'MED-002-COL'),

((SELECT id FROM users WHERE email = 'dr.lopez@medical.com'),
 'Medicina General', 'MED-003-COL');

-- ---------------------------------------------------------------
-- PERFILES PACIENTES
-- ---------------------------------------------------------------
INSERT INTO patients (user_id, birth_date, blood_type, allergies) VALUES
((SELECT id FROM users WHERE email = 'paciente1@mail.com'),
 '1990-05-15', 'O+', 'Penicilina'),

((SELECT id FROM users WHERE email = 'paciente2@mail.com'),
 '1985-11-22', 'A-', NULL);

-- ---------------------------------------------------------------
-- DISPONIBILIDAD MÉDICOS
-- Lunes a Viernes (1-5), 06:00 - 20:00, turnos de 30 min
-- ---------------------------------------------------------------

-- Dr. García: Lun-Vie completo
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
SELECT
    (SELECT id FROM doctors WHERE license_number = 'MED-001-COL'),
    day,
    '06:00',
    '20:00',
    30
FROM generate_series(1, 5) AS day;

-- Dra. Martínez: Lun-Vie completo
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
SELECT
    (SELECT id FROM doctors WHERE license_number = 'MED-002-COL'),
    day,
    '06:00',
    '20:00',
    30
FROM generate_series(1, 5) AS day;

-- Dr. López: Lun-Vie completo
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
SELECT
    (SELECT id FROM doctors WHERE license_number = 'MED-003-COL'),
    day,
    '06:00',
    '20:00',
    30
FROM generate_series(1, 5) AS day;

-- ---------------------------------------------------------------
-- CITAS DE EJEMPLO
-- ---------------------------------------------------------------
INSERT INTO appointments
    (patient_id, doctor_id, appointment_date, start_time, end_time, status, appointment_type, patient_notes)
VALUES
(
    (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'paciente1@mail.com')),
    (SELECT id FROM doctors WHERE license_number = 'MED-001-COL'),
    CURRENT_DATE + INTERVAL '3 days',
    '09:00', '09:30',
    'CONFIRMED', 'GENERAL', 'Dolor de cabeza frecuente'
),
(
    (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'paciente2@mail.com')),
    (SELECT id FROM doctors WHERE license_number = 'MED-002-COL'),
    CURRENT_DATE + INTERVAL '5 days',
    '14:00', '14:30',
    'PENDING', 'GENERAL', 'Control general anual'
),
(
    (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'paciente1@mail.com')),
    (SELECT id FROM doctors WHERE license_number = 'MED-001-COL'),
    CURRENT_DATE - INTERVAL '10 days',
    '10:00', '10:30',
    'COMPLETED', 'GENERAL', NULL
);

-- ---------------------------------------------------------------
-- HISTORIAL MÉDICO DE EJEMPLO (cita completada)
-- ---------------------------------------------------------------
INSERT INTO medical_history (appointment_id, patient_id, doctor_id, observations, diagnosis, treatment)
VALUES (
    (SELECT id FROM appointments
     WHERE status = 'COMPLETED'
     AND patient_id = (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'paciente1@mail.com'))
     LIMIT 1),
    (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'paciente1@mail.com')),
    (SELECT id FROM doctors WHERE license_number = 'MED-001-COL'),
    'Paciente refiere cefalea tensional leve. Sin fiebre. Presión arterial normal.',
    'Cefalea tensional',
    'Ibuprofeno 400mg cada 8 horas por 3 días. Reposo relativo. Control en 15 días.'
);
