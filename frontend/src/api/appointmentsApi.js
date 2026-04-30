import { request } from "./httpClient";

export function getMyAppointments() {
  return request("/appointments/my");
}

export function getDoctorAppointments() {
  return request("/appointments/doctor");
}

export function createAppointment(payload) {
  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function cancelAppointment(id, reason) {
  return request(`/appointments/${id}/cancel`, {
    method: "PUT",
    body: JSON.stringify({ reason })
  });
}

export function confirmAppointment(id) {
  return request(`/appointments/${id}/confirm`, {
    method: "PUT"
  });
}

export function completeAppointment(id) {
  return request(`/appointments/${id}/complete`, {
    method: "PUT"
  });
}

export function rescheduleAppointment(id, payload) {
  return request(`/appointments/${id}/reschedule`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
