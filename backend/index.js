const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./utils/db");
const authRoutes = require("./routes/authRoutes");
const blackspotRoutes = require("./routes/blackspotRoutes");
const alertRoutes = require("./routes/alertRoutes");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blackspots", blackspotRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/", (req, res) => {
    res.status(200).json({ message: "BSDRS API" });
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

start();

// Socket.io: location updates -> early alerts
const { nearby } = require("./controllers/alertController");
const Blackspot = require("./models/Blackspot");

function haversineDistanceMeters(a, b) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

io.on("connection", (socket) => {
    socket.on("location:update", async ({ lat, lng }) => {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        try {
            const docs = await Blackspot.find({ lat: { $ne: null }, lng: { $ne: null } }).lean();
            const sorted = docs
                .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng))
                .map((d) => ({
                    id: String(d._id),
                    lat: d.lat,
                    lng: d.lng,
                    severity: d.severity,
                    title: d.title,
                    description: d.description,
                    imageUrl: d.imageUrl || "",
                    date: d.createdAt?.toISOString?.().slice(0, 10),
                    distanceMeters: haversineDistanceMeters({ lat, lng }, { lat: d.lat, lng: d.lng }),
                }))
                .filter((r) => Number.isFinite(r.distanceMeters) && r.distanceMeters <= 600)
                .sort((a, b) => a.distanceMeters - b.distanceMeters);

            const closest = sorted[0];
            if (closest && closest.distanceMeters <= 500) {
                socket.emit("alert:early", { spot: closest, distanceMeters: closest.distanceMeters });
            }
        } catch (e) {
            // ignore errors per update
        }
    });
});