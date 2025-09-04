import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
  const [reportForm, setReportForm] = useState({ location: "", description: "", severity: "", image: null });

  const updateReportForm = useCallback((updates) => {
    setReportForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetReportForm = useCallback(() => {
    setReportForm({ location: "", description: "", severity: "", image: null });
  }, []);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const submitReport = useCallback(async () => {
    const data = new FormData();
    data.append("location", reportForm.location);
    data.append("description", reportForm.description);
    data.append("severity", reportForm.severity);
    if (reportForm.image) data.append("image", reportForm.image);

    const res = await axios.post(`${baseUrl}/api/blackspots`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Optionally add to local list if API returns created item
    if (res?.data) {
      setBlackspots((prev) => [{
        id: res.data.id || `tmp-${Date.now()}`,
        title: res.data.title || reportForm.location,
        description: res.data.description || reportForm.description,
        locationText: res.data.location || reportForm.location,
        lat: res.data.lat || 6.5244,
        lng: res.data.lng || 3.3792,
        severity: res.data.severity || reportForm.severity || "low",
        date: res.data.date || new Date().toISOString().slice(0,10),
        imageUrl: res.data.imageUrl || "",
      }, ...prev]);
    }
    return res;
  }, [baseUrl, reportForm]);

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


