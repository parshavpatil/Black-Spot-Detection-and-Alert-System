import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setToken(parsed.token || null);
        setUser(parsed.user || null);
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist whenever token/user changes
  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify({ token, user }));
  }, [token, user]);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Attach token to axios by default
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Axios interceptor: auto-logout on 401/403 and redirect to login
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setToken(null);
          setUser(null);
          try {
            localStorage.removeItem("auth");
          } catch {}
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${baseUrl}/api/auth/login`, { email, password });
    setToken(data.token);
    setUser(data.user || null);
    return data;
  }, [baseUrl]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await axios.post(`${baseUrl}/api/auth/register`, { name, email, password });
    // Some APIs auto-login on register; handle both cases
    if (data.token) setToken(data.token);
    if (data.user) setUser(data.user);
    return data;
  }, [baseUrl]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), login, register, logout }), [token, user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


