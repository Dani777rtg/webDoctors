import { useState } from "react";
import { addMedicalHistory, getPatientHistory, saveAvailability } from "../api/doctorApi";
import { useAuth } from "../context/AuthContext";
import { mapApiError } from "../utils/uiHelpers";

const initialAvailability = {
  dayOfWeek: "1",
  startTime: "08:00",
  endTime: "17:00",
  slotDurationMinutes: "30"
};

const initialHistory = {
  appointmentId: "",
  observations: "",
  diagnosis: "",
  treatment: ""
};

function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const [availabilityForm, setAvailabilityForm] = useState(initialAvailability);
  const [historyForm, setHistoryForm] = useState(initialHistory);
  const [patientId, setPatientId] = useState("");
  const [patientHistory, setPatientHistory] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savingMedicalHistory, setSavingMedicalHistory] = useState(false);

  const isDoctor = user.role === "doctor";

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailability = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingAvailability(true);
    try {
      if (availabilityForm.endTime <= availabilityForm.startTime) {
        throw new Error("La hora de fin debe ser mayor que la hora de inicio.");
      }
      await saveAvailability({
        dayOfWeek: Number(availabilityForm.dayOfWeek),
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
        slotDurationMinutes: Number(availabilityForm.slotDurationMinutes)
      });
      setNotice("Disponibilidad actualizada correctamente.");
    } catch (submitError) {
      setError(mapApiError(submitError, "No se pudo guardar la disponibilidad."));
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleMedicalHistory = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingMedicalHistory(true);
    try {
      await addMedicalHistory({
        appointmentId: Number(historyForm.appointmentId),
        observations: historyForm.observations,
        diagnosis: historyForm.diagnosis,
        treatment: historyForm.treatment
      });
      setHistoryForm(initialHistory);
      setNotice("Historial medico registrado.");
    } catch (submitError) {
      setError(mapApiError(submitError, "No se pudo registrar el historial medico."));
    } finally {
      setSavingMedicalHistory(false);
    }
  };

  const handlePatientHistorySearch = async (event) => {
    event.preventDefault();
    setLoadingHistory(true);
    setError("");
    setNotice("");
    try {
      const data = await getPatientHistory(Number(patientId));
      setPatientHistory(Array.isArray(data) ? data : []);
      if (!data?.length) {
        setNotice("No hay historial registrado para ese paciente.");
      }
    } catch (searchError) {
      setError(mapApiError(searchError, "No se pudo consultar el historial del paciente."));
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isDoctor) {
    return (
      <article className="simple-view">
        <h2>Disponibilidad</h2>
        <p>Este modulo esta disponible solo para cuentas de medico.</p>
      </article>
    );
  }

  return (
    <section className="appointments-view">
      <article className="simple-view">
        <h2>Modulo medico</h2>
        <p>Configura disponibilidad, registra historial y consulta antecedentes.</p>
      </article>

      {error && <p className="auth-error">{error}</p>}
      {notice && <p className="notice-success">{notice}</p>}

      <article className="simple-view">
        <h3>Actualizar disponibilidad</h3>
        <form className="book-form" onSubmit={handleAvailability}>
          <label>
            Dia de semana
            <select
              name="dayOfWeek"
              value={availabilityForm.dayOfWeek}
              onChange={updateForm(setAvailabilityForm)}
            >
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miercoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
            </select>
          </label>
          <label>
            Hora inicio
            <input
              type="time"
              name="startTime"
              value={availabilityForm.startTime}
              onChange={updateForm(setAvailabilityForm)}
              required
            />
          </label>
          <label>
            Hora fin
            <input
              type="time"
              name="endTime"
              value={availabilityForm.endTime}
              onChange={updateForm(setAvailabilityForm)}
              required
            />
          </label>
          <label>
            Duracion slot (min)
            <select
              name="slotDurationMinutes"
              value={availabilityForm.slotDurationMinutes}
              onChange={updateForm(setAvailabilityForm)}
            >
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </label>
          <button type="submit" className="input-full" disabled={savingAvailability}>
            {savingAvailability ? "Guardando..." : "Guardar disponibilidad"}
          </button>
        </form>
      </article>

      <article className="simple-view">
        <h3>Registrar historial medico</h3>
        <form className="book-form" onSubmit={handleMedicalHistory}>
          <label>
            ID de cita
            <input
              type="number"
              name="appointmentId"
              value={historyForm.appointmentId}
              onChange={updateForm(setHistoryForm)}
              required
            />
          </label>
          <label className="input-full">
            Observaciones
            <input
              name="observations"
              value={historyForm.observations}
              onChange={updateForm(setHistoryForm)}
            />
          </label>
          <label>
            Diagnostico
            <input
              name="diagnosis"
              value={historyForm.diagnosis}
              onChange={updateForm(setHistoryForm)}
            />
          </label>
          <label>
            Tratamiento
            <input
              name="treatment"
              value={historyForm.treatment}
              onChange={updateForm(setHistoryForm)}
            />
          </label>
          <button type="submit" className="input-full" disabled={savingMedicalHistory}>
            {savingMedicalHistory ? "Guardando..." : "Guardar historial"}
          </button>
        </form>
      </article>

      <article className="simple-view">
        <h3>Consultar historial de paciente</h3>
        <form className="toolbar-inline" onSubmit={handlePatientHistorySearch}>
          <input
            type="number"
            placeholder="ID de paciente"
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            required
          />
          <button type="submit">{loadingHistory ? "Buscando..." : "Buscar"}</button>
        </form>
        {patientHistory.length > 0 && (
          <div className="appointments-list">
            {patientHistory.map((item) => (
              <div className="appointment-item" key={item.id}>
                <div>
                  <strong>{item.date}</strong>
                  <p>Doctor: {item.doctor}</p>
                  <p>Diagnostico: {item.diagnosis || "Sin dato"}</p>
                  <p>Tratamiento: {item.treatment || "Sin dato"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default DoctorAvailabilityPage;
