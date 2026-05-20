import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminBlackspots() {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${baseUrl}/api/blackspots`, { signal: controller.signal });
        if (!cancelled && Array.isArray(data)) setRows(data);
      } catch (e) {
        if (!cancelled) setError("Failed to load blackspots");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; controller.abort(); };
  }, [baseUrl]);

  const downloadCsv = () => {
    const header = ["id","title","description","severity","location","lat","lng","date","imageUrl"]; 
    const lines = rows.map(r => [
      r.id,
      escapeCsv(r.title),
      escapeCsv(r.description),
      r.severity,
      escapeCsv(r.location || r.locationText || ""),
      r.lat,
      r.lng,
      r.date,
      r.imageUrl || "",
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    triggerDownload(csv, "blackspots.csv", "text/csv;charset=utf-8;");
  };

  const downloadXlsx = async () => {
    // Lightweight XLSX via CSV: many spreadsheet apps open CSV directly
    downloadCsv();
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All Blackspots</h1>
        <div className="flex gap-2">
          <button onClick={downloadCsv} className="btn-secondary">Export CSV</button>
          <button onClick={downloadXlsx} className="btn-secondary">Export Excel</button>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Severity</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Lat</th>
              <th className="px-3 py-2 text-left">Lng</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Image</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">{r.title}</td>
                <td className="px-3 py-2 capitalize">{r.severity}</td>
                <td className="px-3 py-2">{r.location || r.locationText}</td>
                <td className="px-3 py-2">{r.lat}</td>
                <td className="px-3 py-2">{r.lng}</td>
                <td className="px-3 py-2">{r.date}</td>
                <td className="px-3 py-2">{r.imageUrl ? <a href={r.imageUrl} className="underline" target="_blank">View</a> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function escapeCsv(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function triggerDownload(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


