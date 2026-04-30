import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const initialState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: ""
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="auth-page">
      <article className="auth-card">
        <p className="eyebrow">Registro de paciente</p>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">
          Completa tus datos para gestionar citas medicas en linea.
        </p>

        <form onSubmit={handleSubmit} className="auth-form auth-form--grid">
          <label>
            Nombre
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Apellido
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Telefono
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="3001234567"
            />
          </label>
          <label>
            Correo electronico
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="input-full">
            Contrasena (minimo 8 caracteres)
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </label>

          {error && <p className="auth-error input-full">{error}</p>}

          <button type="submit" disabled={loading} className="input-full">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          Ya tienes usuario? <Link to="/auth/login">Inicia sesion</Link>
        </p>
      </article>
    </div>
  );
}

export default RegisterPage;
