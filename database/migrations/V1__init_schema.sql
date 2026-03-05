-- =============================================================
-- V1__init_schema.sql
-- Esquema inicial de la plataforma médica
-- Ejecutado automáticamente por Flyway al iniciar el backend
-- =============================================================

-- ---------------------------------------------------------------
-- TABLA: users
-- Usuarios del sistema (todos los roles comparten esta tabla base)
-- ---------------------------------------------------------------
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hash
    role        VARCHAR(20)  NOT NULL
                    CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- TABLA: doctors
-- Perfil extendido del rol DOCTOR
-- ---------------------------------------------------------------
CREATE TABLE doctors (
    id             SERIAL PRIMARY KEY,
    user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty      VARCHAR(100) NOT NULL DEFAULT 'Medicina General',
    license_number VARCHAR(50)  NOT NULL UNIQUE
);

-- ---------------------------------------------------------------
-- TABLA: patients
-- Perfil extendido del rol PATIENT
-- ---------------------------------------------------------------
CREATE TABLE patients (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    blood_type VARCHAR(5),
    allergies  TEXT
);

-- ---------------------------------------------------------------
-- TABLA: doctor_availability
-- Franjas horarias disponibles por médico (Lun-Vie, 6am-8pm)
-- day_of_week: 1=Lunes ... 5=Viernes
-- ---------------------------------------------------------------
CREATE TABLE doctor_availability (
    id                    SERIAL PRIMARY KEY,
    doctor_id             INT  NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week           INT  NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
    start_time            TIME NOT NULL,
    end_time              TIME NOT NULL,
    slot_duration_minutes INT  NOT NULL DEFAULT 30,
    CONSTRAINT chk_time_range CHECK (start_time < end_time),
    CONSTRAINT chk_office_hours CHECK (
        start_time >= '06:00' AND end_time <= '20:00'
    ),
    UNIQUE (doctor_id, day_of_week, start_time)
);

-- ---------------------------------------------------------------
-- TABLA: appointments
-- Citas médicas solicitadas por pacientes
-- ---------------------------------------------------------------
CREATE TABLE appointments (
    id               SERIAL PRIMARY KEY,
    patient_id       INT         NOT NULL REFERENCES patients(id),
    doctor_id        INT         NOT NULL REFERENCES doctors(id),
    appointment_date DATE        NOT NULL,
    start_time       TIME        NOT NULL,
    end_time         TIME        NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
    appointment_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    patient_notes    TEXT,
    cancel_reason    TEXT,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_appointment_time CHECK (start_time < end_time),
    -- Evita duplicados: mismo médico, misma fecha y hora de inicio
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, appointment_date, start_time)
);

-- ---------------------------------------------------------------
-- TABLA: medical_history
-- Observaciones registradas por el médico después de una consulta
-- ---------------------------------------------------------------
CREATE TABLE medical_history (
    id             SERIAL PRIMARY KEY,
    appointment_id INT       NOT NULL REFERENCES appointments(id),
    patient_id     INT       NOT NULL REFERENCES patients(id),
    doctor_id      INT       NOT NULL REFERENCES doctors(id),
    observations   TEXT,
    diagnosis      TEXT,
    treatment      TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- ÍNDICES
-- Optimizan las consultas más frecuentes (pruebas de carga)
-- ---------------------------------------------------------------
CREATE INDEX idx_appointments_doctor_date  ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient      ON appointments(patient_id);
CREATE INDEX idx_appointments_status       ON appointments(status);
CREATE INDEX idx_availability_doctor_day   ON doctor_availability(doctor_id, day_of_week);
CREATE INDEX idx_medical_history_patient   ON medical_history(patient_id);
CREATE INDEX idx_users_email               ON users(email);
CREATE INDEX idx_users_role                ON users(role);
