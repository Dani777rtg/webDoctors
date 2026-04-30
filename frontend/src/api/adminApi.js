import { request } from "./httpClient";

export function getUsers(role) {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  return request(`/admin/users${query}`);
}

export function activateUser(id) {
  return request(`/admin/users/${id}/activate`, { method: "PUT" });
}

export function deactivateUser(id) {
  return request(`/admin/users/${id}/deactivate`, { method: "PUT" });
}

export function deleteUser(id) {
  return request(`/admin/users/${id}`, { method: "DELETE" });
}

export function createDoctor(payload) {
  return request("/admin/doctors", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getGlobalAppointments() {
  return request("/admin/appointments");
}
