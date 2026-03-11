package com.medical.platform.dto.doctor;

import jakarta.validation.constraints.NotNull;

public class MedicalHistoryRequest {

    @NotNull(message = "El ID de la cita es requerido")
    private Long appointmentId;
    private String observations;
    private String diagnosis;
    private String treatment;

    public MedicalHistoryRequest() {}

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }
}
