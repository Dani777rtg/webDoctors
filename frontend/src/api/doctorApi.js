import { request } from "./httpClient";

export function saveAvailability(payload) {
  return request("/doctors/availability", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function addMedicalHistory(payload) {
  return request("/doctors/medical-history", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getPatientHistory(patientId) {
  return request(`/doctors/patients/${patientId}/history`);
}
