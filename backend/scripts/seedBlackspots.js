const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../utils/db");
const Blackspot = require("../models/Blackspot");

async function run() {
  try {
    await connectDB();

    const items = [
      { title: "Unmarked Potholes", description: "Series of deep potholes causing vehicles to swerve.", location: "Ikeja, Lagos", lat: 6.5244, lng: 3.3792, severity: "high", date: new Date("2025-02-01") },
      { title: "Blind Intersection", description: "Visibility blocked by parked vehicles and overgrown shrubs.", location: "Yaba, Lagos", lat: 6.45, lng: 3.4, severity: "high", date: new Date("2025-01-15") },
      { title: "Faded Zebra Crossing", description: "Pedestrian crossing markings almost invisible at night.", location: "Lekki Phase 1, Lagos", lat: 6.47, lng: 3.35, severity: "medium", date: new Date("2024-12-20") },
      { title: "Rankala Lake — Pothole cluster", description: "Major stretch around Rankala Lake with recurring potholes.", location: "Rankala Lake Road, Kolhapur", lat: 16.6905, lng: 74.2106, severity: "high", date: new Date("2025-06-01") },
      { title: "Mirajkar Tikti congestion", description: "Narrow stretch becomes heavily congested during festivals.", location: "Mirajkar Tikti, Kolhapur", lat: 16.6925, lng: 74.2247, severity: "high", date: new Date("2025-09-02") },
      { title: "NH-48 Kagal stretch", description: "High-speed section with collision history.", location: "Kagal, Kolhapur", lat: 16.5993, lng: 74.3163, severity: "high", date: new Date("2025-05-27") },
      { title: "Kaneriwadi Phata hotspot", description: "Phata on highway with mixed traffic and crashes.", location: "Kaneriwadi, Kolhapur", lat: 16.68, lng: 74.25, severity: "high", date: new Date("2023-05-27") },
      { title: "Rajarampuri market roads", description: "Busy lanes with pedestrian conflicts and worn markings.", location: "Rajarampuri, Kolhapur", lat: 16.693, lng: 74.232, severity: "medium", date: new Date("2025-06-15") },
      { title: "Temblai Hill approach A", description: "Festival congestion and temporary closures.", location: "Temblai approach, Kolhapur", lat: 16.705, lng: 74.245, severity: "medium", date: new Date("2025-09-02") },
      { title: "Temblai Hill approach B", description: "Festival congestion and temporary closures.", location: "Temblai approach, Kolhapur", lat: 16.7313, lng: 74.2467, severity: "medium", date: new Date("2025-09-02") },
    ];

    // Remove duplicates based on title+lat+lng
    const ops = items.map((it) => ({
      updateOne: {
        filter: { title: it.title, lat: it.lat, lng: it.lng },
        update: { $setOnInsert: it },
        upsert: true,
      },
    }));

    const res = await Blackspot.bulkWrite(ops);
    console.log("Seed completed:", res.result || res);
  } catch (e) {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();


