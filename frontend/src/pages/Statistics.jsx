import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import { useApp } from "../context/AppContext.jsx";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // green, amber, red

function buildSeverityData(spots) {
  const counts = spots.reduce((acc, s) => {
    acc[s.severity] = (acc[s.severity] || 0) + 1;
    return acc;
  }, {});
  return [
    { name: "Low", value: counts.low || 0 },
    { name: "Medium", value: counts.medium || 0 },
    { name: "High", value: counts.high || 0 },
  ];
}

function buildTimeSeries(spots) {
  const byMonth = spots.reduce((acc, s) => {
    const d = s.date || s.dateReported || s.createdAt || "";
    const month = typeof d === "string" ? d.slice(0, 7) : new Date(d).toISOString().slice(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(byMonth)
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}

function Statistics() {
  const { blackspots: contextSpots } = useApp();
  const [spots, setSpots] = useState(contextSpots);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Live refresh: pull latest stats periodically
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const fetchSpots = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/blackspots`, { signal: controller.signal });
        if (!cancelled && Array.isArray(data)) setSpots(data);
      } catch {}
    };
    fetchSpots();
    const interval = setInterval(fetchSpots, 10000); // every 10s
    return () => { cancelled = true; controller.abort(); clearInterval(interval); };
  }, [baseUrl]);

  // Compute charts from latest data (fallback to context on empty)
  const effective = spots?.length ? spots : contextSpots;
  const severityData = useMemo(() => buildSeverityData(effective), [effective]);
  const timeSeries = useMemo(() => buildTimeSeries(effective), [effective]);

  const totals = useMemo(() => ({
    all: effective.length,
    low: effective.filter((s) => s.severity === "low").length,
    medium: effective.filter((s) => s.severity === "medium").length,
    high: effective.filter((s) => s.severity === "high").length,
  }), [effective]);

  const [counter, setCounter] = useState({ all: 0, low: 0, medium: 0, high: 0 });
  useEffect(() => {
    const duration = 600; // ms
    const start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setCounter({
        all: Math.round(totals.all * p),
        low: Math.round(totals.low * p),
        medium: Math.round(totals.medium * p),
        high: Math.round(totals.high * p),
      });
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [totals]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <Link to="/admin/blackspots" className="btn-secondary">View All (Admin)</Link>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-xs text-stone-500">Total Reports</div>
          <div className="text-3xl font-bold mt-1">{counter.all}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xs text-stone-500">Low</div>
          <div className="text-3xl font-bold mt-1 text-emerald-600">{counter.low}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xs text-stone-500">Medium</div>
          <div className="text-3xl font-bold mt-1 text-amber-600">{counter.medium}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xs text-stone-500">High</div>
          <div className="text-3xl font-bold mt-1 text-red-600">{counter.high}</div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Reports by Severity</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReTooltip formatter={(v) => [v, "Reports"]} contentStyle={{ borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-3">Reports Over Time</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={timeSeries} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <ReTooltip contentStyle={{ borderRadius: 8 }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;


