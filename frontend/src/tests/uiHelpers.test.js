import {
  canPatientCancel,
  canPatientReschedule,
  mapApiError,
  todayISO
} from "../utils/uiHelpers";

describe("uiHelpers", () => {
  it("returns today's date in YYYY-MM-DD format", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("maps connection errors to friendly message", () => {
    const message = mapApiError(new Error("Failed to fetch"), "fallback");
    expect(message).toContain("No se pudo conectar con el backend");
  });

  it("allows cancel and reschedule only for pending or confirmed", () => {
    expect(canPatientCancel("PENDING")).toBe(true);
    expect(canPatientCancel("COMPLETED")).toBe(false);
    expect(canPatientReschedule("CONFIRMED")).toBe(true);
    expect(canPatientReschedule("CANCELLED")).toBe(false);
  });
});
