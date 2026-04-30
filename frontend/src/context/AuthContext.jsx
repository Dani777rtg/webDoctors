import { createContext, useContext, useMemo, useState } from "react";
import { login as loginApi, register as registerApi } from "../api/authApi";

const AuthContext = createContext(null);

function normalizeRole(role) {
  return role?.toLowerCase?.() || "patient";
}

function getStoredSession() {
  const token = localStorage.getItem("mp_token");
  const userRaw = localStorage.getItem("mp_user");
  if (!token || !userRaw) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(userRaw)
    };
  } catch (error) {
    localStorage.removeItem("mp_token");
    localStorage.removeItem("mp_user");
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setSession] = useState(getStoredSession);
  const [loading, setLoading] = useState(false);

  const setAuthSession = (authResponse) => {
    const nextUser = {
      userId: authResponse.userId,
      email: authResponse.email,
      firstName: authResponse.firstName,
      lastName: authResponse.lastName,
      role: normalizeRole(authResponse.role)
    };

    localStorage.setItem("mp_token", authResponse.token);
    localStorage.setItem("mp_user", JSON.stringify(nextUser));
    setSession({ token: authResponse.token, user: nextUser });
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const data = await loginApi(payload);
      setAuthSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await registerApi(payload);
      setAuthSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("mp_token");
    localStorage.removeItem("mp_user");
    setSession({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
