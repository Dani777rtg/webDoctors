package com.medical.platform.repository;

import com.medical.platform.model.Appointment;
import com.medical.platform.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // JOIN FETCH carga paciente, médico y sus usuarios en una sola query → evita LazyLoading
    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH p.user
        JOIN FETCH a.doctor d
        JOIN FETCH d.user
        WHERE p.id = :patientId
        ORDER BY a.appointmentDate DESC, a.startTime DESC
    """)
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(@Param("patientId") Long patientId);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH p.user
        JOIN FETCH a.doctor d
        JOIN FETCH d.user
        WHERE d.id = :doctorId
        ORDER BY a.appointmentDate ASC, a.startTime ASC
    """)
    List<Appointment> findByDoctorIdOrderByAppointmentDateAscStartTimeAsc(@Param("doctorId") Long doctorId);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH p.user
        JOIN FETCH a.doctor d
        JOIN FETCH d.user
        ORDER BY a.appointmentDate ASC, a.startTime ASC
    """)
    List<Appointment> findAllOrderByDateAndTime();

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient p
        JOIN FETCH p.user
        JOIN FETCH a.doctor d
        JOIN FETCH d.user
        WHERE d.id = :doctorId AND a.appointmentDate = :date
    """)
    List<Appointment> findByDoctorIdAndAppointmentDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    @Query("""
        SELECT a FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.appointmentDate = :date
          AND a.status <> :status
    """)
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("status") AppointmentStatus status);

    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.appointmentDate = :date
          AND a.startTime = :startTime
          AND a.status <> 'CANCELLED'
    """)
    boolean existsConflict(@Param("doctorId") Long doctorId,
                           @Param("date") LocalDate date,
                           @Param("startTime") LocalTime startTime);
}
