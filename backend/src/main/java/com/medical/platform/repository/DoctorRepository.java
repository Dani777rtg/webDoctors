package com.medical.platform.repository;

import com.medical.platform.model.Doctor;
import com.medical.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByLicenseNumber(String licenseNumber);

    // JOIN FETCH carga el User en la misma query → evita LazyLoading al mapear
    @Query("SELECT d FROM Doctor d JOIN FETCH d.user u WHERE u.active = true")
    List<Doctor> findAllActive();
}
