package com.medical.platform.service;

import com.medical.platform.dto.admin.CreateDoctorRequest;
import com.medical.platform.exception.*;
import com.medical.platform.model.*;
import com.medical.platform.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, DoctorRepository doctorRepository,
                        PatientRepository patientRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserMap).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUsersByRole(String role) {
        return userRepository.findByRole(Role.valueOf(role.toUpperCase()))
                .stream().map(this::toUserMap).toList();
    }

    @Transactional
    public Map<String, Object> setUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));
        user.setActive(active);
        return toUserMap(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId));
        userRepository.delete(user);
    }

    @Transactional
    public Map<String, Object> createDoctor(CreateDoctorRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("El email ya está registrado");
        if (doctorRepository.existsByLicenseNumber(req.getLicenseNumber()))
            throw new BusinessException("El número de licencia ya existe");

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.DOCTOR);
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setPhone(req.getPhone());
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialty(req.getSpecialty());
        doctor.setLicenseNumber(req.getLicenseNumber());
        doctorRepository.save(doctor);

        return toUserMap(user);
    }

    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("firstName", u.getFirstName());
        m.put("lastName", u.getLastName());
        m.put("role", u.getRole().name());
        m.put("phone", u.getPhone());
        m.put("active", u.isActive());
        m.put("createdAt", u.getCreatedAt());
        return m;
    }
}
