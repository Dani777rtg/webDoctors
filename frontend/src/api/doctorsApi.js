import { request } from "./httpClient";

export function listDoctors() {
  return request("/doctors");
}

export function getDoctorSlots(doctorId, date) {
  const query = new URLSearchParams({ date }).toString();
  return request(`/doctors/${doctorId}/slots?${query}`);
}
