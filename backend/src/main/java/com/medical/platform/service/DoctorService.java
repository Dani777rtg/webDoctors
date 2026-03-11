package com.medical.platform.service;

import com.medical.platform.dto.doctor.*;
import com.medical.platform.exception.*;
import com.medical.platform.model.*;
import com.medical.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;

    public DoctorService(DoctorRepository doctorRepository,
                         DoctorAvailabilityRepository availabilityRepository,
                         AppointmentRepository appointmentRepository,
                         MedicalHistoryRepository medicalHistoryRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
    }

    // Lista de médicos activos con sus datos de usuario (para el controller)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAllDoctors() {
        return doctorRepository.findAllActive().stream()
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", d.getId());
                    m.put("name", d.getUser().getFirstName() + " " + d.getUser().getLastName());
                    m.put("specialty", d.getSpecialty());
                    m.put("licenseNumber", d.getLicenseNumber());
                    return m;
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailability(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));
        return availabilityRepository.findByDoctor(doctor).stream()
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("dayOfWeek", a.getDayOfWeek());
                    m.put("startTime", a.getStartTime());
                    m.put("endTime", a.getEndTime());
                    m.put("slotDurationMinutes", a.getSlotDurationMinutes());
                    return m;
                }).toList();
    }

    @Transactional
    public Map<String, Object> saveAvailability(AvailabilityRequest req, String doctorEmail) {
        Doctor doctor = getDoctorByEmail(doctorEmail);

        if (req.getStartTime().isBefore(LocalTime.of(6, 0))
                || req.getEndTime().isAfter(LocalTime.of(20, 0))) {
            throw new BusinessException("El horario debe estar entre 06:00 y 20:00");
        }

        Optional<DoctorAvailability> existing =
                availabilityRepository.findByDoctorAndDayOfWeek(doctor, req.getDayOfWeek());

        DoctorAvailability availability = existing.orElseGet(DoctorAvailability::new);
        if (availability.getId() == null) availability.setDoctor(doctor);
        availability.setDayOfWeek(req.getDayOfWeek());
        availability.setStartTime(req.getStartTime());
        availability.setEndTime(req.getEndTime());
        availability.setSlotDurationMinutes(
            req.getSlotDurationMinutes() != null ? req.getSlotDurationMinutes() : 30);

        availability = availabilityRepository.save(availability);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", availability.getId());
        res.put("dayOfWeek", availability.getDayOfWeek());
        res.put("startTime", availability.getStartTime());
        res.put("endTime", availability.getEndTime());
        res.put("slotDurationMinutes", availability.getSlotDurationMinutes());
        return res;
    }

    @Transactional
    public Map<String, Object> addMedicalHistory(MedicalHistoryRequest req, String doctorEmail) {
        Doctor doctor = getDoctorByEmail(doctorEmail);

        Appointment appointment = appointmentRepository.findById(req.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Cita", req.getAppointmentId()));

        if (!appointment.getDoctor().getId().equals(doctor.getId()))
            throw new BusinessException("Esta cita no le pertenece");

        if (appointment.getStatus() != AppointmentStatus.COMPLETED
                && appointment.getStatus() != AppointmentStatus.CONFIRMED)
            throw new BusinessException("Solo se puede registrar historial en citas confirmadas o completadas");

        if (medicalHistoryRepository.existsByAppointmentId(req.getAppointmentId()))
            throw new BusinessException("Ya existe un historial para esta cita");

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        MedicalHistory history = new MedicalHistory();
        history.setAppointment(appointment);
        history.setPatient(appointment.getPatient());
        history.setDoctor(doctor);
        history.setObservations(req.getObservations());
        history.setDiagnosis(req.getDiagnosis());
        history.setTreatment(req.getTreatment());
        history = medicalHistoryRepository.save(history);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", history.getId());
        res.put("appointmentId", appointment.getId());
        res.put("patientName", appointment.getPatient().getUser().getFirstName()
            + " " + appointment.getPatient().getUser().getLastName());
        res.put("observations", history.getObservations());
        res.put("diagnosis", history.getDiagnosis());
        res.put("treatment", history.getTreatment());
        res.put("createdAt", history.getCreatedAt());
        return res;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPatientHistory(Long patientId, String doctorEmail) {
        return medicalHistoryRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(h -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", h.getId());
                    m.put("date", h.getCreatedAt());
                    m.put("doctor", h.getDoctor().getUser().getFirstName()
                        + " " + h.getDoctor().getUser().getLastName());
                    m.put("observations", h.getObservations());
                    m.put("diagnosis", h.getDiagnosis());
                    m.put("treatment", h.getTreatment());
                    return m;
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));

        int dayOfWeek = date.getDayOfWeek().getValue();
        Optional<DoctorAvailability> avOpt =
                availabilityRepository.findByDoctorAndDayOfWeek(doctor, dayOfWeek);

        if (avOpt.isEmpty()) return List.of();

        DoctorAvailability av = avOpt.get();
        List<LocalTime> bookedTimes = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusNot(doctorId, date, AppointmentStatus.CANCELLED)
                .stream().map(Appointment::getStartTime).toList();

        List<Map<String, Object>> slots = new ArrayList<>();
        LocalTime current = av.getStartTime();
        while (!current.isAfter(av.getEndTime().minusMinutes(av.getSlotDurationMinutes()))) {
            Map<String, Object> slot = new LinkedHashMap<>();
            slot.put("startTime", current);
            slot.put("endTime", current.plusMinutes(av.getSlotDurationMinutes()));
            slot.put("available", !bookedTimes.contains(current));
            slots.add(slot);
            current = current.plusMinutes(av.getSlotDurationMinutes());
        }
        return slots;
    }

    private Doctor getDoctorByEmail(String email) {
        return doctorRepository.findAll().stream()
                .filter(d -> d.getUser().getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de médico no encontrado"));
    }
}
