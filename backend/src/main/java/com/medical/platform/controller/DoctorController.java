package com.medical.platform.controller;

import com.medical.platform.dto.doctor.*;
import com.medical.platform.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Médicos", description = "Disponibilidad y gestión médica")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    @Operation(summary = "PÚBLICO: Listar médicos activos")
    public ResponseEntity<List<Map<String, Object>>> listDoctors() {
        return ResponseEntity.ok(doctorService.listAllDoctors());
    }

    @GetMapping("/{doctorId}/availability")
    @Operation(summary = "PÚBLICO: Ver disponibilidad de un médico")
    public ResponseEntity<List<Map<String, Object>>> getAvailability(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorService.getAvailability(doctorId));
    }

    @GetMapping("/{doctorId}/slots")
    @Operation(summary = "PÚBLICO: Ver slots disponibles para una fecha")
    public ResponseEntity<List<Map<String, Object>>> getSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorService.getAvailableSlots(doctorId, date));
    }

    @PutMapping("/availability")
    @Operation(summary = "MÉDICO: Actualizar su disponibilidad")
    public ResponseEntity<Map<String, Object>> saveAvailability(
            @Valid @RequestBody AvailabilityRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(doctorService.saveAvailability(req, user.getUsername()));
    }

    @PostMapping("/medical-history")
    @Operation(summary = "MÉDICO: Registrar historial médico")
    public ResponseEntity<Map<String, Object>> addHistory(
            @Valid @RequestBody MedicalHistoryRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(doctorService.addMedicalHistory(req, user.getUsername()));
    }

    @GetMapping("/patients/{patientId}/history")
    @Operation(summary = "MÉDICO: Ver historial de un paciente")
    public ResponseEntity<List<Map<String, Object>>> patientHistory(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(doctorService.getPatientHistory(patientId, user.getUsername()));
    }
}
