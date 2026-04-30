import { render, screen, waitFor } from "@testing-library/react";
import AdminUsersPage from "../pages/AdminUsersPage";

vi.mock("../api/adminApi", () => ({
  activateUser: vi.fn(),
  createDoctor: vi.fn(),
  deactivateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUsers: vi.fn().mockResolvedValue([
    {
      id: 10,
      firstName: "Ana",
      lastName: "Lopez",
      email: "ana@test.com",
      role: "PATIENT",
      active: true
    }
  ])
}));

describe("AdminUsersPage", () => {
  it("renders users list fetched from API", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText("ana@test.com")).toBeInTheDocument();
    });
    expect(screen.getByText("ACTIVO")).toBeInTheDocument();
  });
});
