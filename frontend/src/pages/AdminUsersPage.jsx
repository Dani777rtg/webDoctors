import { useEffect, useState } from "react";
import {
  activateUser,
  createDoctor,
  deactivateUser,
  deleteUser,
  getUsers
} from "../api/adminApi";
import { mapApiError } from "../utils/uiHelpers";

const initialDoctorForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  specialty: "",
  licenseNumber: ""
};

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [actionUserId, setActionUserId] = useState(null);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);

  const refreshUsers = async (roleValue = roleFilter) => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers(roleValue);
      setUsers(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(mapApiError(loadError, "No se pudo cargar el listado de usuarios."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers("");
  }, []);

  const runAction = async (action, successMessage, userId) => {
    setError("");
    setNotice("");
    setActionUserId(userId);
    try {
      await action();
      setNotice(successMessage);
      await refreshUsers();
    } catch (actionError) {
      setError(mapApiError(actionError, "No se pudo completar la accion de usuario."));
    } finally {
      setActionUserId(null);
    }
  };

  const handleFilter = async (event) => {
    const value = event.target.value;
    setRoleFilter(value);
    await refreshUsers(value);
  };

  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateDoctor = async (event) => {
    event.preventDefault();
    setSavingDoctor(true);
    setError("");
    setNotice("");
    try {
      await createDoctor(doctorForm);
      setDoctorForm(initialDoctorForm);
      setNotice("Medico creado correctamente.");
      await refreshUsers();
    } catch (createError) {
      setError(mapApiError(createError, "No se pudo crear el medico."));
    } finally {
      setSavingDoctor(false);
    }
  };

  return (
    <section className="appointments-view">
      <article className="simple-view">
        <h2>Administracion de usuarios</h2>
        <p>Gestiona cuentas de pacientes, medicos y administradores.</p>
      </article>

      <article className="simple-view">
        <h3>Crear nuevo medico</h3>
        <form className="book-form" onSubmit={handleCreateDoctor}>
          <label>
            Nombre
            <input name="firstName" value={doctorForm.firstName} onChange={handleDoctorChange} required />
          </label>
          <label>
            Apellido
            <input name="lastName" value={doctorForm.lastName} onChange={handleDoctorChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={doctorForm.email} onChange={handleDoctorChange} required />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              name="password"
              minLength={8}
              value={doctorForm.password}
              onChange={handleDoctorChange}
              required
            />
          </label>
          <label>
            Telefono
            <input name="phone" value={doctorForm.phone} onChange={handleDoctorChange} />
          </label>
          <label>
            Especialidad
            <input name="specialty" value={doctorForm.specialty} onChange={handleDoctorChange} required />
          </label>
          <label>
            Licencia
            <input
              name="licenseNumber"
              value={doctorForm.licenseNumber}
              onChange={handleDoctorChange}
              required
            />
          </label>
          <button type="submit" className="input-full" disabled={savingDoctor}>
            {savingDoctor ? "Creando..." : "Crear medico"}
          </button>
        </form>
      </article>

      {error && <p className="auth-error">{error}</p>}
      {notice && <p className="notice-success">{notice}</p>}

      <article className="simple-view">
        <div className="toolbar-inline">
          <h3>Listado de usuarios</h3>
          <select value={roleFilter} onChange={handleFilter}>
            <option value="">Todos</option>
            <option value="ADMIN">Administradores</option>
            <option value="DOCTOR">Medicos</option>
            <option value="PATIENT">Pacientes</option>
          </select>
        </div>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p>No hay usuarios para mostrar.</p>
        ) : (
          <div className="appointments-list">
            {users.map((user) => (
              <div className="appointment-item" key={user.id}>
                <div>
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                  <p>{user.email}</p>
                  <span className="status-pill">{user.role}</span>
                  <span className={user.active ? "status-pill active-pill" : "status-pill inactive-pill"}>
                    {user.active ? "ACTIVO" : "INACTIVO"}
                  </span>
                </div>
                <div className="actions-inline">
                  {user.active ? (
                    <button
                      type="button"
                      disabled={Boolean(actionUserId)}
                      onClick={() =>
                        runAction(() => deactivateUser(user.id), "Usuario desactivado correctamente.", user.id)
                      }
                    >
                      {actionUserId === user.id ? "Procesando..." : "Desactivar"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={Boolean(actionUserId)}
                      onClick={() =>
                        runAction(() => activateUser(user.id), "Usuario activado correctamente.", user.id)
                      }
                    >
                      {actionUserId === user.id ? "Procesando..." : "Activar"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={Boolean(actionUserId)}
                    onClick={() => {
                      if (!window.confirm("Seguro que deseas eliminar este usuario?")) return;
                      runAction(() => deleteUser(user.id), "Usuario eliminado correctamente.", user.id);
                    }}
                  >
                    {actionUserId === user.id ? "Procesando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default AdminUsersPage;
