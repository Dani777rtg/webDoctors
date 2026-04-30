import { render, screen, waitFor } from "@testing-library/react";
import AppointmentsPage from "../pages/AppointmentsPage";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { role: "patient" }
  })
}));

vi.mock("../api/appointmentsApi", () => ({
  cancelAppointment: vi.fn(),
  completeAppointment: vi.fn(),
  confirmAppointment: vi.fn(),
  createAppointment: vi.fn(),
  getDoctorAppointments: vi.fn(),
  getMyAppointments: vi.fn().mockResolvedValue([]),
  rescheduleAppointment: vi.fn()
}));

vi.mock("../api/adminApi", () => ({
  getGlobalAppointments: vi.fn()
}));

vi.mock("../api/doctorsApi", () => ({
  listDoctors: vi.fn().mockResolvedValue([{ id: 1, name: "Dr. Test", specialty: "General" }]),
  getDoctorSlots: vi.fn().mockResolvedValue([])
}));

describe("AppointmentsPage", () => {
  it("renders patient booking form", async () => {
    render(<AppointmentsPage />);
    await waitFor(() => {
      expect(screen.getByText("Nueva cita")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Solicitar cita" })).toBeInTheDocument();
  });
});
