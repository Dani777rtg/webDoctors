package com.medical.platform.service;

import com.medical.platform.dto.appointment.*;
import com.medical.platform.exception.*;
import com.medical.platform.model.*;
import com.medical.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                               PatientRepository patientRepository,
                               DoctorRepository doctorRepository,
                               DoctorAvailabilityRepository availabilityRepository,
                               UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AppointmentResponse book(AppointmentRequest req, String patientEmail) {
        Long userId = getUserIdByEmail(patientEmail);
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de paciente no encontrado"));

        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", req.getDoctorId()));

        validateSlot(doctor, req);

        LocalTime endTime = req.getStartTime().plusMinutes(getSlotDuration(doctor, req));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(req.getAppointmentDate());
        appointment.setStartTime(req.getStartTime());
        appointment.setEndTime(endTime);
        appointment.setAppointmentType(req.getAppointmentType() != null ? req.getAppointmentType() : "GENERAL");
        appointment.setPatientNotes(req.getPatientNotes());

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(String patientEmail) {
        Long userId = getUserIdByEmail(patientEmail);
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de paciente no encontrado"));
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patient.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(String doctorEmail) {
        Long userId = getUserIdByEmail(doctorEmail);
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de médico no encontrado"));
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateAscStartTimeAsc(doctor.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAllOrderByDateAndTime()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatus newStatus,
                                             String reason, String userEmail) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita", id));

        if (appt.getStatus() == AppointmentStatus.CANCELLED
                || appt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException("No se puede modificar una cita con estado " + appt.getStatus());
        }

        appt.setStatus(newStatus);
        if (reason != null) appt.setCancelReason(reason);
        return toResponse(appointmentRepository.save(appt));
    }

    @Transactional
    public AppointmentResponse reschedule(Long id, AppointmentRequest req, String patientEmail) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita", id));

        if (!appt.getPatient().getUser().getEmail().equals(patientEmail)) {
            throw new BusinessException("No tiene permisos para modificar esta cita");
        }
        if (appt.getStatus() == AppointmentStatus.CANCELLED
                || appt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException("No se puede reprogramar una cita con estado " + appt.getStatus());
        }

        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", req.getDoctorId()));
        validateSlot(doctor, req);
        LocalTime endTime = req.getStartTime().plusMinutes(getSlotDuration(doctor, req));

        appt.setAppointmentDate(req.getAppointmentDate());
        appt.setStartTime(req.getStartTime());
        appt.setEndTime(endTime);
        appt.setStatus(AppointmentStatus.PENDING);

        return toResponse(appointmentRepository.save(appt));
    }

    private void validateSlot(Doctor doctor, AppointmentRequest req) {
        if (req.getAppointmentDate().getDayOfWeek() == DayOfWeek.SATURDAY
                || req.getAppointmentDate().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new BusinessException("El médico no atiende los fines de semana");
        }

        int dayOfWeek = req.getAppointmentDate().getDayOfWeek().getValue();
        DoctorAvailability availability = availabilityRepository
                .findByDoctorAndDayOfWeek(doctor, dayOfWeek)
                .orElseThrow(() -> new BusinessException(
                    "El médico no tiene disponibilidad el día seleccionado"));

        if (req.getStartTime().isBefore(availability.getStartTime())
                || req.getStartTime().isAfter(
                    availability.getEndTime().minusMinutes(availability.getSlotDurationMinutes()))) {
            throw new BusinessException("La hora está fuera del horario del médico ("
                + availability.getStartTime() + " - " + availability.getEndTime() + ")");
        }

        if (appointmentRepository.existsConflict(doctor.getId(),
                req.getAppointmentDate(), req.getStartTime())) {
            throw new BusinessException("Ya existe una cita en ese horario. Elige otro.");
        }
    }

    private long getSlotDuration(Doctor doctor, AppointmentRequest req) {
        int day = req.getAppointmentDate().getDayOfWeek().getValue();
        return availabilityRepository.findByDoctorAndDayOfWeek(doctor, day)
                .map(a -> (long) a.getSlotDurationMinutes())
                .orElse(30L);
    }

    private Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + email));
    }

    public AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setPatientId(a.getPatient().getId());
        r.setPatientName(a.getPatient().getUser().getFirstName() + " " + a.getPatient().getUser().getLastName());
        r.setDoctorId(a.getDoctor().getId());
        r.setDoctorName(a.getDoctor().getUser().getFirstName() + " " + a.getDoctor().getUser().getLastName());
        r.setDoctorSpecialty(a.getDoctor().getSpecialty());
        r.setAppointmentDate(a.getAppointmentDate());
        r.setStartTime(a.getStartTime());
        r.setEndTime(a.getEndTime());
        r.setStatus(a.getStatus().name());
        r.setAppointmentType(a.getAppointmentType());
        r.setPatientNotes(a.getPatientNotes());
        r.setCancelReason(a.getCancelReason());
        return r;
    }
}
