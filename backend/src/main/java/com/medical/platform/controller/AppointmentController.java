package com.medical.platform.controller;

import com.medical.platform.dto.appointment.*;
import com.medical.platform.model.AppointmentStatus;
import com.medical.platform.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Citas", description = "Gestión de citas médicas")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @Operation(summary = "PACIENTE: Solicitar nueva cita")
    public ResponseEntity<AppointmentResponse> book(
            @Valid @RequestBody AppointmentRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.book(req, user.getUsername()));
    }

    @GetMapping("/my")
    @Operation(summary = "PACIENTE: Ver mis citas")
    public ResponseEntity<List<AppointmentResponse>> myAppointments(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(user.getUsername()));
    }

    @GetMapping("/doctor")
    @Operation(summary = "MÉDICO: Ver su agenda")
    public ResponseEntity<List<AppointmentResponse>> doctorAppointments(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(user.getUsername()));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancelar cita")
    public ResponseEntity<AppointmentResponse> cancel(
            @PathVariable Long id,
            @RequestBody(required = false) CancelRequest req,
            @AuthenticationPrincipal UserDetails user) {
        String reason = req != null ? req.getReason() : null;
        return ResponseEntity.ok(appointmentService.updateStatus(
                id, AppointmentStatus.CANCELLED, reason, user.getUsername()));
    }

    @PutMapping("/{id}/confirm")
    @Operation(summary = "MÉDICO: Confirmar cita")
    public ResponseEntity<AppointmentResponse> confirm(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(appointmentService.updateStatus(
                id, AppointmentStatus.CONFIRMED, null, user.getUsername()));
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "MÉDICO: Marcar cita como completada")
    public ResponseEntity<AppointmentResponse> complete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(appointmentService.updateStatus(
                id, AppointmentStatus.COMPLETED, null, user.getUsername()));
    }

    @PutMapping("/{id}/reschedule")
    @Operation(summary = "PACIENTE: Reprogramar cita")
    public ResponseEntity<AppointmentResponse> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(appointmentService.reschedule(id, req, user.getUsername()));
    }
}
