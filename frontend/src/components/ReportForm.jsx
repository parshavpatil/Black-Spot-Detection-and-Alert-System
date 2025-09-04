import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import Spinner from "./Spinner.jsx";
import Alert from "./Alert.jsx";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// Ensure default marker icons are resolved correctly by Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

function ReportForm() {
  const { reportForm: form, updateReportForm, resetReportForm, submitReport } = useApp();
  const [localImage, setLocalImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [userPosition, setUserPosition] = useState(null);
  const [userAccuracy, setUserAccuracy] = useState(null);
  const watchIdRef = useRef(null);

  function validate(values) {
    const nextErrors = {};
    if (!values.lat || !values.lng) nextErrors.location = "Please select a location on the map";
    if (!values.description.trim()) nextErrors.description = "Description is required";
    if (!values.severity) nextErrors.severity = "Severity is required";
    return nextErrors;
  }

  function onChange(e) {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files && files[0] ? files[0] : null;
      setLocalImage(file);
      updateReportForm({ image: file });
    } else {
      updateReportForm({ [name]: value });
    }
  }

  // Capture user geolocation; keep watching for better accuracy
  useEffect(() => {
    if (!navigator.geolocation) return;
    const onSuccess = (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setUserPosition([latitude, longitude]);
      setUserAccuracy(accuracy || 0);
      if (!form.lat && !form.lng) {
        updateReportForm({ lat: String(latitude), lng: String(longitude) });
      }
    };
    const onError = () => {
      // fallback: no-op; user can still pick on map
    };
    // Initial quick grab
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });
    // Continuous updates for better precision
    const id = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });
    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [form.lat, form.lng, updateReportForm]);

  const center = useMemo(() => {
    if (form.lat && form.lng) return [Number(form.lat), Number(form.lng)];
    return [6.5244, 3.3792];
  }, [form.lat, form.lng]);

  const mapRef = useRef(null);

  function InvalidateSizeOnMount() {
    const map = useMap();
    useEffect(() => {
      setTimeout(() => map.invalidateSize?.(), 80);
    }, [map]);
    return null;
  }

  function LocationSelector() {
    const map = useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        await setLocationFromCoords(lat, lng);
      },
    });
    useEffect(() => {
      // Center map on chosen location
      if (form.lat && form.lng) {
        map.setView([Number(form.lat), Number(form.lng)], Math.max(map.getZoom(), 14));
      }
    }, [form.lat, form.lng, map]);
    return null;
  }

  const setLocationFromCoords = useCallback(async (lat, lng) => {
    updateReportForm({ lat: String(lat), lng: String(lng) });
    try {
      // Lightweight reverse geocoding via OpenStreetMap Nominatim
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        const display = data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        updateReportForm({ location: display });
      } else {
        updateReportForm({ location: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      }
    } catch {
      updateReportForm({ location: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
    }
  }, [updateReportForm]);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setSubmitting(true);
      await submitReport();
      setMessage("Report submitted successfully");
      toast.success("Report submitted successfully");
      resetReportForm();
      setLocalImage(null);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit report";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto p-6 space-y-6 card">
      {message && <Alert type="success">{message}</Alert>}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label">Select Location</label>
          <button
            type="button"
            className="text-xs underline"
            onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition(
                (pos) => setLocationFromCoords(pos.coords.latitude, pos.coords.longitude),
                () => toast.error("Unable to get your location"),
                { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 }
              );
            }}
          >Use my location</button>
        </div>
        <div className={`w-full rounded overflow-hidden border ${errors.location ? "border-red-500" : "border-stone-200"}`} style={{ height: "300px" }}>
          <MapContainer
            center={center}
            zoom={form.lat && form.lng ? 14 : 12}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => { mapRef.current = map; setTimeout(() => map.invalidateSize?.(), 60); }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <InvalidateSizeOnMount />
            <LocationSelector />
            {form.lat && form.lng ? (
              <Marker
                position={[Number(form.lat), Number(form.lng)]}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const m = e.target;
                    const { lat, lng } = m.getLatLng();
                    setLocationFromCoords(lat, lng);
                  },
                }}
              />
            ) : null}
            {userPosition ? (
              <>
                <CircleMarker
                  center={userPosition}
                  radius={5}
                  pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.9 }}
                />
                <Circle
                  center={userPosition}
                  radius={Math.max(userAccuracy || 0, 20)}
                  pathOptions={{ color: '#3b82f6', fillOpacity: 0.08 }}
                />
              </>
            ) : null}
          </MapContainer>
        </div>
        <div className="text-xs text-stone-600 mt-1">
          {form.location ? (
            <span>Selected: {form.location}</span>
          ) : (
            <span>Click on the map to choose the blackspot location.</span>
          )}
        </div>
        {errors.location && <p id="location-error" className="text-red-600 text-xs mt-1">{errors.location}</p>}
        {userPosition ? (
          <div className="text-[11px] text-stone-500 mt-1">Your location accuracy: ~{Math.round(Math.max(userAccuracy || 0, 0))} m</div>
        ) : null}
      </div>

      <div className="relative">
        <textarea
          id="description"
          name="description"
          rows="4"
          value={form.description}
          onChange={onChange}
          className={`input peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.description ? "border-red-500" : ""}`}
          placeholder="Description"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        <label htmlFor="description" className={`absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-focus:-top-2.5 peer-focus:text-xs ${errors.description ? "text-red-600" : "text-stone-600"}`}>Description</label>
        {errors.description && <p id="description-error" className="text-red-600 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="relative">
        <select
          id="severity"
          name="severity"
          value={form.severity}
          onChange={onChange}
          className={`input appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.severity ? "border-red-500" : ""}`}
          aria-invalid={Boolean(errors.severity)}
          aria-describedby={errors.severity ? "severity-error" : undefined}
        >
          <option value="" disabled>Select severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label htmlFor="severity" className={`absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-focus:-top-2.5 peer-focus:text-xs ${errors.severity ? "text-red-600" : "text-stone-600"}`}>Severity</label>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
        {errors.severity && <p id="severity-error" className="text-red-600 text-xs mt-1">{errors.severity}</p>}
      </div>

      <div className="relative">
        <label className="label" htmlFor="image">Upload Image</label>
        <div className="flex items-center gap-3">
          <label htmlFor="image" className="btn-secondary cursor-pointer select-none">Choose file</label>
          <input id="image" name="image" type="file" accept="image/*" onChange={onChange} className="sr-only" />
          <span className="text-sm text-stone-600 dark:text-stone-300 truncate max-w-[60%]">{localImage ? localImage.name : "No file selected"}</span>
        </div>
      </div>

      {/* Hidden fields storing coordinates */}
      <input type="hidden" name="lat" value={form.lat || ""} readOnly />
      <input type="hidden" name="lng" value={form.lng || ""} readOnly />

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary gap-2 active:scale-[0.98] transition-transform"
        >
          {submitting ? (<><Spinner /><span>Submitting...</span></>) : "Submit Report"}
        </button>
      </div>
    </form>
  );
}

export default ReportForm;


