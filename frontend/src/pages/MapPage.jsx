import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import appLogo from "../assets/sentinel-eye.png";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// Ensure default marker icons are resolved correctly by Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

import { useApp } from "../context/AppContext.jsx";
import AlertNotification from "../components/AlertNotification.jsx";
import axios from "axios";
import { haversineDistanceMeters } from "../utils/distance.js";
import { io } from "socket.io-client";

function MapPage() {
  const { blackspots: sampleBlackspots, filters, setFilter } = useApp();
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { severity, startDate, endDate } = filters;
  console.log("[MapPage] Context blackspots length:", sampleBlackspots?.length, { filters });
  const [userPosition, setUserPosition] = useState(null);
  const [userAccuracy, setUserAccuracy] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTarget, setAlertTarget] = useState(null);
  const [lastAlertAt, setLastAlertAt] = useState(0);
  const [lastAlertSpotId, setLastAlertSpotId] = useState(null);
  const [ackUntil, setAckUntil] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserPosition([latitude, longitude]);
        setUserAccuracy(accuracy || 0);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Socket.io live alerts
  useEffect(() => {
    const socket = io(baseUrl, { transports: ["websocket", "polling"], path: "/socket.io" });
    socket.on("connect_error", () => {});
    socket.on("alert:early", (payload) => {
      if (!payload) return;
      setAlertTarget({ spot: payload.spot, distanceMeters: payload.distanceMeters });
      setAlertVisible(true);
      setLastAlertSpotId(payload.spot?.id);
      setLastAlertAt(Date.now());
    });
    const interval = setInterval(() => {
      if (userPosition) {
        socket.emit("location:update", { lat: userPosition[0], lng: userPosition[1] });
      }
    }, 1500);
    return () => { clearInterval(interval); socket.close(); };
  }, [baseUrl, userPosition]);

  const filtered = useMemo(() => {
    const out = sampleBlackspots.filter((s) => {
      if (severity && s.severity !== severity) return false;
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      return true;
    });
    console.log("[MapPage] after filters count:", out.length);
    return out;
  }, [severity, startDate, endDate, sampleBlackspots]);

  const withCoords = useMemo(() => {
    const withLatLng = filtered.filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
    console.log("[MapPage] withCoords count:", withLatLng.length);
    return withLatLng;
  }, [filtered]);
  const center = withCoords.length > 0 ? [withCoords[0].lat, withCoords[0].lng] : [6.5244, 3.3792];
  const bounds = withCoords.length > 0 ? L.latLngBounds(withCoords.map((s) => [s.lat, s.lng])) : null;
  const mapRef = useRef(null);

  // Fix blank map when using animations: invalidate size after mount and on data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setTimeout(() => {
      map.invalidateSize?.();
      if (bounds) map.fitBounds(bounds);
    }, 50);
  }, [bounds]);

  const severityToColor = (s) => (s === "high" ? "#ef4444" : s === "medium" ? "#f59e0b" : "#10b981");
  const makeIcon = (s, { isNearby = false, isClosest = false } = {}) =>
    new L.DivIcon({
      className: "",
      html: `<div style="transform:translate(-50%,-100%);display:grid;place-items:center">
        <div style="background:${isClosest ? '#1d4ed8' : isNearby ? '#111827' : severityToColor(s)};color:white;border-radius:12px;padding:6px 8px;box-shadow:0 6px 14px rgba(0,0,0,.25);transition:transform .15s ease-out;${isClosest ? 'outline:3px solid #60a5fa' : isNearby ? 'outline:2px solid #9ca3af' : ''}">
          ⚠️
        </div>
        <div style="width:2px;height:8px;background:${isClosest ? '#1d4ed8' : isNearby ? '#111827' : severityToColor(s)};opacity:.6"></div>
      </div>`
    });

  const userIcon = useMemo(() => L.icon({
    iconUrl: appLogo,
    iconRetinaUrl: appLogo,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: "user-location-icon",
  }), []);

  // Proximity and alert handling
  const [apiNearby, setApiNearby] = useState([]);
  const [closest, setClosest] = useState(null);

  // Fetch nearby from API whenever user position changes (debounced)
  useEffect(() => {
    if (!userPosition) return;
    let cancelled = false;
    const controller = new AbortController();
    const fetchNearby = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/alerts/nearby`, {
          params: { lat: userPosition[0], lng: userPosition[1], maxMeters: 600 },
          signal: controller.signal,
        });
        console.log("[MapPage] nearby response:", data);
        if (cancelled) return;
        const nearby = Array.isArray(data?.nearby) ? data.nearby : [];
        setApiNearby(nearby);
        setClosest(nearby[0] || null);
      } catch (e) {
        if (!cancelled) console.error("[MapPage] nearby fetch error:", e?.message || e);
      }
    };
    const t = setTimeout(fetchNearby, 300);
    return () => { cancelled = true; controller.abort(); clearTimeout(t); };
  }, [userPosition, baseUrl]);

  useEffect(() => {
    // Cooldown: 60s per spot to prevent spamming
    const COOLDOWN_MS = 60 * 1000;
    const now = Date.now();
    const c = closest;
    if (!c) {
      setAlertVisible(false);
      setAlertTarget(null);
      return;
    }

    // Early alert threshold: 500m (alert when approaching, not after entering area)
    const withinEarly = c.distanceMeters <= 500;
    if (!withinEarly) {
      setAlertVisible(false);
      setAlertTarget(null);
      return;
    }

    const isNewSpot = c.id !== lastAlertSpotId;
    const cooldownPassed = now - lastAlertAt > COOLDOWN_MS;
    if (now < ackUntil) return; // acknowledged recently
    if (isNewSpot || cooldownPassed) {
      setAlertTarget({ spot: c, distanceMeters: c.distanceMeters });
      setAlertVisible(true);
      setLastAlertAt(now);
      setLastAlertSpotId(c.id);
    }
  }, [closest, lastAlertAt, lastAlertSpotId, ackUntil]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-3">Map</h1>
      <div className="mb-4 grid gap-3 grid-cols-1 sm:grid-cols-3 map-filters">
        <div className="relative">
          <select
            id="severity"
            value={severity}
            onChange={(e) => setFilter("severity", e.target.value)}
            className="input appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <label htmlFor="severity" className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-stone-600">Severity</label>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
        </div>
        <div className="relative">
          <input id="start" type="date" value={startDate} onChange={(e) => setFilter("startDate", e.target.value)} className="input focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <label htmlFor="start" className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-stone-600">From date</label>
        </div>
        <div className="relative">
          <input id="end" type="date" value={endDate} onChange={(e) => setFilter("endDate", e.target.value)} className="input focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <label htmlFor="end" className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-stone-600">To date</label>
        </div>
      </div>

      <div className="w-full map-height">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => { mapRef.current = map; if (bounds) map.fitBounds(bounds); setTimeout(() => map.invalidateSize?.(), 50); }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {withCoords.map((s) => {
            const distance = userPosition ? haversineDistanceMeters(
              { lat: userPosition[0], lng: userPosition[1] },
              { lat: s.lat, lng: s.lng }
            ) : Infinity;
            const isNearby = Number.isFinite(distance) && distance <= 600;
            const isClosest = closest?.id === s.id;
            return (
              <React.Fragment key={s.id}>
                <Circle
                  center={[s.lat, s.lng]}
                  radius={500}
                  pathOptions={{ color: isClosest ? '#1d4ed8' : severityToColor(s.severity), fillOpacity: isNearby ? 0.15 : 0.1 }}
                />
                <Marker position={[s.lat, s.lng]} icon={makeIcon(s.severity, { isNearby, isClosest })} eventHandlers={{
                mouseover: (e) => e.target._icon && (e.target._icon.firstChild.style.transform = "translate(-50%,-100%) scale(1.05)"),
                mouseout: (e) => e.target._icon && (e.target._icon.firstChild.style.transform = "translate(-50%,-100%) scale(1)")
                }}>
                  <Popup>
                    <div className="card p-3 w-60">
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-sm line-clamp-2 mr-2">{s.title || "Blackspot"}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${s.severity === 'high' ? 'bg-red-100 text-red-700' : s.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.severity}</span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1">{s.description}</div>
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt="Blackspot" className="mt-2 max-h-32 w-full object-cover rounded" />
                      ) : null}
                      <div className="text-[11px] text-stone-500 mt-1">Date: {s.date}</div>
                      {Number.isFinite(distance) ? (
                        <div className="text-[11px] text-stone-500">Distance: {Math.round(distance)} m</div>
                      ) : null}
                      <div className="pt-2">
                        <Link className="text-xs underline" to={`/blackspots/${s.id}`}>View details</Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {userPosition ? (
            <>
              <Marker position={userPosition} icon={userIcon} />
              <Circle
                center={userPosition}
                radius={Math.max(userAccuracy || 0, 20)}
                pathOptions={{ color: '#3b82f6', fillOpacity: 0.08 }}
              />
            </>
          ) : null}
        </MapContainer>
      </div>

      <AlertNotification
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        onAcknowledge={() => {
          // Extend suppression for 2 minutes
          setAckUntil(Date.now() + 2 * 60 * 1000);
          setAlertVisible(false);
        }}
        spot={alertTarget?.spot}
        distanceMeters={alertTarget?.distanceMeters}
        urgent={(alertTarget?.distanceMeters ?? Infinity) <= 550}
        enableSound
        enableVibration
      />
    </div>
  );
}

export default MapPage;


