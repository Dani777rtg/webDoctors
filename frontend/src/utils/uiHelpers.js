export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function mapApiError(error, fallback) {
  const raw = (error?.message || "").toLowerCase();
  if (raw.includes("failed to fetch")) {
    return "No se pudo conectar con el backend. Verifica que el servidor este encendido.";
  }
  if (raw.includes("unauthorized") || raw.includes("forbidden")) {
    return "Tu sesion no tiene permisos para esta accion.";
  }
  if (raw.includes("ya existe")) {
    return "El registro ya existe en el sistema.";
  }
  if (raw.includes("no se pudo")) {
    return error.message;
  }
  return error?.message || fallback;
}

export function canPatientCancel(status) {
  return status === "PENDING" || status === "CONFIRMED";
}

export function canPatientReschedule(status) {
  return status === "PENDING" || status === "CONFIRMED";
}
