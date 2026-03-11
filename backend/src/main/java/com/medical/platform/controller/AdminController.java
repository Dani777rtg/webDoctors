package com.medical.platform.controller;

import com.medical.platform.dto.admin.CreateDoctorRequest;
import com.medical.platform.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administrador", description = "Gestión de usuarios y agenda global")
public class AdminController {

    private final AdminService adminService;
    private final AppointmentService appointmentService;

    public AdminController(AdminService adminService, AppointmentService appointmentService) {
        this.adminService = adminService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/users")
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String role) {
        if (role != null) return ResponseEntity.ok(adminService.getUsersByRole(role));
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/doctors")
    @Operation(summary = "Crear nuevo médico")
    public ResponseEntity<Map<String, Object>> createDoctor(
            @Valid @RequestBody CreateDoctorRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createDoctor(req));
    }

    @PutMapping("/users/{id}/activate")
    @Operation(summary = "Activar usuario")
    public ResponseEntity<Map<String, Object>> activate(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.setUserStatus(id, true));
    }

    @PutMapping("/users/{id}/deactivate")
    @Operation(summary = "Desactivar usuario")
    public ResponseEntity<Map<String, Object>> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.setUserStatus(id, false));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Eliminar usuario")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/appointments")
    @Operation(summary = "Agenda global de citas")
    public ResponseEntity<List<?>> globalAgenda() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
}
