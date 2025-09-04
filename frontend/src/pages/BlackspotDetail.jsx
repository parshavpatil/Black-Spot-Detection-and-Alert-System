import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { blackspots } from "../data/blackspots.js";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

function BlackspotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const spot = useMemo(() => blackspots.find((s) => s.id === id), [id]);

  if (!spot) {
    return (
      <div className="p-4">
        <p className="mb-2">Blackspot not found.</p>
        <button className="underline" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const position = [spot.lat, spot.lng];
  const isAdmin = false; // TODO: replace with real auth

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold">{spot.title}</h1>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                spot.severity === "high"
                  ? "bg-red-100 text-red-700"
                  : spot.severity === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {spot.severity}
            </span>
          </div>
          <div className="text-sm text-gray-600">{spot.locationText}</div>
        </div>

        <div className="card overflow-hidden">
          {spot.imageUrl ? (
            <img src={spot.imageUrl} alt={spot.title} className="w-full max-h-96 object-cover" />
          ) : (
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <div>
              <h2 className="font-semibold">Description</h2>
              <p className="text-gray-800">{spot.description}</p>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Severity:</span> {spot.severity} • <span className="font-semibold">Date:</span> {spot.date}
            </div>
            {isAdmin && (
              <div className="flex gap-2 pt-2">
                <button className="btn-secondary text-sm py-1">Edit</button>
                <button className="btn-danger text-sm py-1">Delete</button>
              </div>
            )}
          </div>
          <div className="md:col-span-1">
            <div className="w-full" style={{ height: "30vh" }}>
              <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>
                    <div className="card p-3 w-56">
                      <div className="font-semibold text-sm">{spot.title}</div>
                      <div className="text-xs text-stone-600">{spot.locationText}</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlackspotDetail;


