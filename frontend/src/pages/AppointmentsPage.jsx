import { useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  getDoctorAppointments,
  getMyAppointments,
  rescheduleAppointment
} from "../api/appointmentsApi";
import { getGlobalAppointments } from "../api/adminApi";
import { getDoctorSlots, listDoctors } from "../api/doctorsApi";
import { useAuth } from "../context/AuthContext";
import {
  canPatientCancel,
  canPatientReschedule,
  mapApiError,
  todayISO
} from "../utils/uiHelpers";

const initialForm = {
  doctorId: "",
  appointmentDate: "",
  startTime: "",
  appointmentType: "GENERAL",
  patientNotes: ""
};

function AppointmentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduleDrafts, setRescheduleDrafts] = useState({});

  const isPatient = user.role === "patient";
  const isDoctor = user.role === "doctor";

  const refreshAppointments = async () => {
    const data = isDoctor
      ? await getDoctorAppointments()
      : isPatient
      ? await getMyAppointments()
      : await getGlobalAppointments();
    setAppointments(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        if (isPatient) {
          const doctorsData = await listDoctors();
          setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        }
        await refreshAppointments();
      } catch (initError) {
        setError(mapApiError(initError, "No se pudo cargar la informacion de citas."));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isDoctor, isPatient]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }
    try {
      const slotsData = await getDoctorSlots(doctorId, date);
      const onlyAvailable = (Array.isArray(slotsData) ? slotsData : []).filter(
        (slot) => slot.available
      );
      setAvailableSlots(onlyAvailable);
      if (!onlyAvailable.length) {
        setNotice("No hay slots disponibles para la fecha seleccionada.");
      }
    } catch (slotError) {
      setError(mapApiError(slotError, "No se pudieron consultar los horarios disponibles."));
    }
  };

  const handleCreateAppointment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (!form.startTime) {
        throw new Error("Selecciona una hora disponible antes de crear la cita.");
      }
      await createAppointment({
        doctorId: Number(form.doctorId),
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        appointmentType: form.appointmentType,
        patientNotes: form.patientNotes
      });
      setForm(initialForm);
      setNotice("Cita creada correctamente.");
      await refreshAppointments();
    } catch (createError) {
      setError(mapApiError(createError, "No se pudo crear la cita."));
    } finally {
      setSaving(false);
    }
  };

  const handleFormDateOrDoctorChange = async (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    if (name === "doctorId" || name === "appointmentDate") {
      await loadSlots(nextForm.doctorId, nextForm.appointmentDate);
    }
  };

  const updateRescheduleDraft = (appointmentId, field, value) => {
    setRescheduleDrafts((prev) => ({
      ...prev,
      [appointmentId]: {
        ...(prev[appointmentId] || {}),
        [field]: value
      }
    }));
  };

  const handleLoadRescheduleSlots = async (appointment) => {
    const draft = rescheduleDrafts[appointment.id] || {};
    if (!draft.appointmentDate) {
      setError("Selecciona una fecha para consultar slots.");
      return;
    }
    setActionLoadingKey(`slots-${appointment.id}`);
    try {
      const slotsData = await getDoctorSlots(appointment.doctorId, draft.appointmentDate);
      const onlyAvailable = (Array.isArray(slotsData) ? slotsData : []).filter(
        (slot) => slot.available
      );
      setRescheduleDrafts((prev) => ({
        ...prev,
        [appointment.id]: {
          ...draft,
          slots: onlyAvailable
        }
      }));
      if (!onlyAvailable.length) {
        setNotice("No hay horarios disponibles para la reprogramacion.");
      }
    } catch (slotError) {
      setError(mapApiError(slotError, "No se pudieron consultar horarios para reprogramar."));
    } finally {
      setActionLoadingKey("");
    }
  };

  const handleReschedule = async (appointment) => {
    const draft = rescheduleDrafts[appointment.id];
    if (!draft?.appointmentDate || !draft?.startTime) {
      setError("Selecciona fecha y hora para reprogramar.");
      return;
    }
    await runAction(
      () =>
        rescheduleAppointment(appointment.id, {
          doctorId: appointment.doctorId,
          appointmentDate: draft.appointmentDate,
          startTime: draft.startTime,
          appointmentType: appointment.appointmentType || "GENERAL",
          patientNotes: appointment.patientNotes || ""
        }),
      "Cita reprogramada correctamente.",
      `reschedule-${appointment.id}`
    );
  };

  const runAction = async (action, successMessage, loadingKey = "action") => {
    setError("");
    setNotice("");
    setActionLoadingKey(loadingKey);
    try {
      await action();
      setNotice(successMessage);
      await refreshAppointments();
    } catch (actionError) {
      setError(mapApiError(actionError, "No se pudo completar la accion."));
    } finally {
      setActionLoadingKey("");
    }
  };

  const title = useMemo(() => {
    if (isDoctor) return "Agenda del medico";
    if (isPatient) return "Mis citas";
    return "Agenda del sistema";
  }, [isDoctor, isPatient]);

  return (
    <section className="appointments-view">
      <article className="simple-view">
        <h2>{title}</h2>
        <p>
          {isPatient && "Solicita, revisa y cancela tus citas medicas."}
          {isDoctor && "Revisa y actualiza el estado de tus citas asignadas."}
          {!isPatient && !isDoctor && "Visualiza la agenda global de todo el sistema."}
        </p>
      </article>

      {isPatient && (
        <article className="simple-view">
          <h3>Nueva cita</h3>
          <form className="book-form" onSubmit={handleCreateAppointment}>
            <label>
              Medico
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleFormDateOrDoctorChange}
                required
              >
                <option value="">Selecciona un medico</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha
              <input
                type="date"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleFormDateOrDoctorChange}
                min={todayISO()}
                required
              />
            </label>
            <label>
              Hora
              <select
                name="startTime"
                value={form.startTime}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecciona una hora</option>
                {availableSlots.map((slot) => (
                  <option key={slot.startTime} value={slot.startTime}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo de consulta
              <select
                name="appointmentType"
                value={form.appointmentType}
                onChange={handleFormChange}
              >
                <option value="GENERAL">General</option>
              </select>
            </label>
            <label className="input-full">
              Nota del paciente
              <input
                type="text"
                name="patientNotes"
                value={form.patientNotes}
                onChange={handleFormChange}
                placeholder="Sintomas o motivo principal"
              />
            </label>
            <button type="submit" disabled={saving || Boolean(actionLoadingKey)} className="input-full">
              {saving ? "Guardando..." : "Solicitar cita"}
            </button>
          </form>
        </article>
      )}

      {error && <p className="auth-error">{error}</p>}
      {notice && <p className="notice-success">{notice}</p>}

      <article className="simple-view">
        <h3>Listado</h3>
        {loading ? (
          <p>Cargando citas...</p>
        ) : appointments.length === 0 ? (
          <p>No hay citas para mostrar.</p>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div className="appointment-item" key={appointment.id}>
                <div>
                  <strong>
                    {appointment.appointmentDate} - {appointment.startTime}
                  </strong>
                  <p>{`Paciente: ${appointment.patientName || "-"}`}</p>
                  <p>{`Medico: ${appointment.doctorName || "-"}`}</p>
                  <span className="status-pill">{appointment.status}</span>
                </div>
                <div className="actions-inline">
                  {isPatient && canPatientCancel(appointment.status) && (
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingKey)}
                      onClick={() =>
                        runAction(
                          () => cancelAppointment(appointment.id, "Cancelada por paciente"),
                          "Cita cancelada.",
                          `cancel-${appointment.id}`
                        )
                      }
                    >
                      {actionLoadingKey === `cancel-${appointment.id}` ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                  {isPatient && canPatientReschedule(appointment.status) && (
                      <button
                        type="button"
                        disabled={Boolean(actionLoadingKey)}
                        onClick={() =>
                          updateRescheduleDraft(appointment.id, "open", !rescheduleDrafts[appointment.id]?.open)
                        }
                      >
                        Reprogramar
                      </button>
                    )}
                  {isDoctor && appointment.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingKey)}
                      onClick={() =>
                        runAction(
                          () => confirmAppointment(appointment.id),
                          "Cita confirmada.",
                          `confirm-${appointment.id}`
                        )
                      }
                    >
                      {actionLoadingKey === `confirm-${appointment.id}` ? "Confirmando..." : "Confirmar"}
                    </button>
                  )}
                  {isDoctor && appointment.status === "CONFIRMED" && (
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingKey)}
                      onClick={() =>
                        runAction(
                          () => completeAppointment(appointment.id),
                          "Cita completada.",
                          `complete-${appointment.id}`
                        )
                      }
                    >
                      {actionLoadingKey === `complete-${appointment.id}` ? "Completando..." : "Completar"}
                    </button>
                  )}
                </div>
                {isPatient && rescheduleDrafts[appointment.id]?.open && (
                  <div className="reschedule-box">
                    <label>
                      Nueva fecha
                      <input
                        type="date"
                        value={rescheduleDrafts[appointment.id]?.appointmentDate || ""}
                        min={todayISO()}
                        onChange={(event) =>
                          updateRescheduleDraft(
                            appointment.id,
                            "appointmentDate",
                            event.target.value
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingKey)}
                      onClick={() => handleLoadRescheduleSlots(appointment)}
                    >
                      {actionLoadingKey === `slots-${appointment.id}` ? "Consultando..." : "Ver horarios"}
                    </button>
                    <label>
                      Nuevo horario
                      <select
                        value={rescheduleDrafts[appointment.id]?.startTime || ""}
                        onChange={(event) =>
                          updateRescheduleDraft(appointment.id, "startTime", event.target.value)
                        }
                      >
                        <option value="">Selecciona horario</option>
                        {(rescheduleDrafts[appointment.id]?.slots || []).map((slot) => (
                          <option key={slot.startTime} value={slot.startTime}>
                            {slot.startTime} - {slot.endTime}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingKey)}
                      onClick={() => handleReschedule(appointment)}
                    >
                      {actionLoadingKey === `reschedule-${appointment.id}`
                        ? "Reprogramando..."
                        : "Confirmar reprogramacion"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default AppointmentsPage;
