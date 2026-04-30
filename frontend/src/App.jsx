import { useMemo } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  Clock3,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Users
} from "lucide-react";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminUsersPage from "./pages/AdminUsersPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorAvailabilityPage from "./pages/DoctorAvailabilityPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

const roleRoutes = {
  patient: {
    title: "Panel del Paciente",
    subtitle: "Gestiona tus citas de forma rapida y segura.",
    stats: [
      { label: "Citas activas", value: "2", icon: CalendarDays },
      { label: "Proxima cita", value: "Hoy 4:30 PM", icon: Clock3 },
      { label: "Medicos favoritos", value: "3", icon: Stethoscope }
    ],
    cards: [
      {
        title: "Agendar nueva cita",
        text: "Busca especialidad, revisa disponibilidad y reserva en pocos pasos.",
        cta: "Agendar ahora"
      },
      {
        title: "Reprogramar cita",
        text: "Actualiza fecha y hora sin perder tu historial.",
        cta: "Reprogramar"
      },
      {
        title: "Historial de citas",
        text: "Consulta atenciones previas y recomendaciones medicas.",
        cta: "Ver historial"
      }
    ]
  },
  doctor: {
    title: "Panel del Medico",
    subtitle: "Controla agenda, disponibilidad e historial clinico.",
    stats: [
      { label: "Citas hoy", value: "8", icon: CalendarDays },
      { label: "Pendientes por confirmar", value: "2", icon: Activity },
      { label: "Slots disponibles", value: "6", icon: Clock3 }
    ],
    cards: [
      {
        title: "Mi agenda",
        text: "Visualiza el cronograma del dia con estados de cita en tiempo real.",
        cta: "Abrir agenda"
      },
      {
        title: "Confirmar o cancelar",
        text: "Gestiona solicitudes pendientes y mantén la agenda actualizada.",
        cta: "Gestionar citas"
      },
      {
        title: "Historial medico",
        text: "Registra observaciones y diagnostico de citas completadas.",
        cta: "Registrar historial"
      }
    ]
  },
  admin: {
    title: "Panel de Administracion",
    subtitle: "Supervisa usuarios, medicos y la agenda global.",
    stats: [
      { label: "Usuarios activos", value: "126", icon: Users },
      { label: "Medicos registrados", value: "14", icon: Stethoscope },
      { label: "Citas esta semana", value: "64", icon: CalendarDays }
    ],
    cards: [
      {
        title: "Gestion de usuarios",
        text: "Activa, desactiva y administra cuentas de forma centralizada.",
        cta: "Administrar usuarios"
      },
      {
        title: "Crear medico",
        text: "Registra nuevos profesionales en menos de 2 minutos.",
        cta: "Crear medico"
      },
      {
        title: "Agenda global",
        text: "Monitorea todas las citas del sistema por estado y rol.",
        cta: "Ver agenda global"
      }
    ]
  }
};

function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const role = user?.role || "patient";
  const currentRole = useMemo(() => roleRoutes[role], [role]);
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Medical Platform</p>
          <h1>Plataforma de Citas Medicas</h1>
        </div>
        <div className="badge">
          <ShieldCheck size={16} />
          Acceso seguro con JWT
        </div>
      </header>

      <main className="main-grid">
        <aside className="sidebar">
          <div className="user-card">
            <p className="eyebrow">{role}</p>
            <h3>{fullName}</h3>
            <p>{user.email}</p>
          </div>
          <h2>Navegacion principal</h2>
          <nav className="menu">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/appointments">Citas</NavLink>
            {(role === "doctor" || role === "admin") && (
              <NavLink to="/availability">Disponibilidad</NavLink>
            )}
            {role === "admin" && <NavLink to="/users">Usuarios</NavLink>}
          </nav>
          <button type="button" className="logout-btn" onClick={logout}>
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </aside>

        <section className="content">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardView roleData={currentRole} role={role} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/availability"
              element={
                <ProtectedRoute roles={["doctor", "admin"]}>
                  <DoctorAvailabilityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

function DashboardView({ roleData, role }) {
  return (
    <div className="dashboard">
      <section className="hero-card">
        <p className="eyebrow">Vista actual: {role}</p>
        <h2>{roleData.title}</h2>
        <p>{roleData.subtitle}</p>
      </section>

      <section className="stats-grid">
        {roleData.stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="stat-card">
              <div className="stat-icon">
                <Icon size={18} />
              </div>
              <div>
                <p>{item.label}</p>
                <h3>{item.value}</h3>
              </div>
            </article>
          );
        })}
      </section>

      <section className="cards-grid">
        {roleData.cards.map((card) => (
          <article key={card.title} className="feature-card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            <button type="button">{card.cta}</button>
          </article>
        ))}
      </section>
    </div>
  );
}

function SimpleView({ title, description }) {
  return (
    <article className="simple-view">
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}

export default App;
