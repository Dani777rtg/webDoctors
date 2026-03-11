package com.medical.platform.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.*;
import io.swagger.v3.oas.annotations.security.*;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Plataforma Médica API",
        version = "1.0",
        description = "API REST para gestión de citas médicas. Roles: PATIENT, DOCTOR, ADMIN.",
        contact = @Contact(name = "Equipo QA", email = "admin@medical.com")
    ),
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Ingresa el token JWT obtenido en POST /api/auth/login"
)
public class OpenApiConfig {}
