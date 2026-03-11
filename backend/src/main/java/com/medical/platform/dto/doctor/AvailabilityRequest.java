package com.medical.platform.dto.doctor;

import jakarta.validation.constraints.*;
import java.time.LocalTime;

public class AvailabilityRequest {

    @NotNull(message = "El día es requerido (1=Lunes, 5=Viernes)")
    @Min(value = 1) @Max(value = 5)
    private Integer dayOfWeek;

    @NotNull(message = "La hora de inicio es requerida")
    private LocalTime startTime;

    @NotNull(message = "La hora de fin es requerida")
    private LocalTime endTime;

    private Integer slotDurationMinutes = 30;

    public AvailabilityRequest() {}

    public Integer getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(Integer dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Integer getSlotDurationMinutes() { return slotDurationMinutes; }
    public void setSlotDurationMinutes(Integer slotDurationMinutes) { this.slotDurationMinutes = slotDurationMinutes; }
}
