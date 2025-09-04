import React, { useEffect, useState } from "react";
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
import { blackspots } from "../data/blackspots.js";

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
    const month = s.date.slice(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(byMonth)
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}

function Statistics() {
  const severityData = buildSeverityData(blackspots);
  const timeSeries = buildTimeSeries(blackspots);

  const totals = {
    all: blackspots.length,
    low: blackspots.filter((s) => s.severity === "low").length,
    medium: blackspots.filter((s) => s.severity === "medium").length,
    high: blackspots.filter((s) => s.severity === "high").length,
  };

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
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Statistics</h1>

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


