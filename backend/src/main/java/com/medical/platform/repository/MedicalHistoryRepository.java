package com.medical.platform.repository;

import com.medical.platform.model.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    List<MedicalHistory> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<MedicalHistory> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    Optional<MedicalHistory> findByAppointmentId(Long appointmentId);
    boolean existsByAppointmentId(Long appointmentId);
}
