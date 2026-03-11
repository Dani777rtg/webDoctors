package com.medical.platform.repository;

import com.medical.platform.model.Doctor;
import com.medical.platform.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    List<DoctorAvailability> findByDoctor(Doctor doctor);
    List<DoctorAvailability> findByDoctorId(Long doctorId);
    Optional<DoctorAvailability> findByDoctorAndDayOfWeek(Doctor doctor, Integer dayOfWeek);
    void deleteByDoctor(Doctor doctor);
}
