import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { blackspots as initialBlackspots } from "../data/blackspots.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Blackspots data
  const [blackspots, setBlackspots] = useState(initialBlackspots);

  // Filters for map/list views
  const [filters, setFilters] = useState({ severity: "", startDate: "", endDate: "" });

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Report form state
  const [reportForm, setReportForm] = useState({ location: "", description: "", severity: "", image: null, lat: "", lng: "" });

  const updateReportForm = useCallback((updates) => {
    setReportForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetReportForm = useCallback(() => {
    setReportForm({ location: "", description: "", severity: "", image: null, lat: "", lng: "" });
  }, []);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const toAbsolute = useCallback((u) => (u && u.startsWith("/") ? `${baseUrl}${u}` : u), [baseUrl]);

  // Load blackspots from API on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/blackspots`);
        if (Array.isArray(data)) {
          const normalized = data.map((d) => ({ ...d, imageUrl: toAbsolute(d.imageUrl) }));
          setBlackspots(normalized.length ? normalized : initialBlackspots);
        }
      } catch {
        // keep initial data as fallback
      }
    })();
  }, [baseUrl, toAbsolute]);

  const submitReport = useCallback(async () => {
    const data = new FormData();
    data.append("location", reportForm.location);
    data.append("description", reportForm.description);
    data.append("severity", reportForm.severity);
    if (reportForm.image) data.append("image", reportForm.image);
    if (reportForm.lat) data.append("lat", reportForm.lat);
    if (reportForm.lng) data.append("lng", reportForm.lng);

    const res = await axios.post(`${baseUrl}/api/blackspots`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Refresh list from API or optimistically add
    if (res?.data) {
      const created = { ...res.data, imageUrl: toAbsolute(res.data.imageUrl) };
      setBlackspots((prev) => [created, ...prev]);
    }
    return res;
  }, [baseUrl, reportForm, toAbsolute]);

  const value = useMemo(() => ({
    blackspots,
    setBlackspots,
    filters,
    setFilter,
    reportForm,
    updateReportForm,
    resetReportForm,
    submitReport,
  }), [blackspots, filters, setFilter, reportForm, updateReportForm, resetReportForm, submitReport]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}


