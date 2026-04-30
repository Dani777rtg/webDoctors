import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="auth-page">
      <article className="auth-card">
        <p className="eyebrow">Acceso seguro</p>
        <h1>Iniciar sesion</h1>
        <p className="auth-subtitle">
          Usa tus credenciales para entrar al sistema medico.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Correo electronico
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@medical.com"
              required
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password123!"
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-footer">
          No tienes cuenta de paciente? <Link to="/auth/register">Registrate</Link>
        </p>
      </article>
    </div>
  );
}

export default LoginPage;
