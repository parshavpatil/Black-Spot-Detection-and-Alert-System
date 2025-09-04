const Blackspot = require("../models/Blackspot");

function haversineDistanceMeters(a, b) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
}

async function nearby(req, res, next) {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const maxMeters = Math.min(Number(req.query.maxMeters) || 600, 5000);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({ message: "lat and lng query params are required" });
        }

        const docs = await Blackspot.find({ lat: { $ne: null }, lng: { $ne: null } }).lean();
        const withDistance = docs
            .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng))
            .map((d) => {
                const distanceMeters = haversineDistanceMeters({ lat, lng }, { lat: d.lat, lng: d.lng });
                return { id: String(d._id), lat: d.lat, lng: d.lng, severity: d.severity, title: d.title, description: d.description, imageUrl: d.imageUrl || "", date: d.createdAt?.toISOString?.().slice(0,10), distanceMeters };
            })
            .filter((r) => r.distanceMeters <= maxMeters)
            .sort((a, b) => a.distanceMeters - b.distanceMeters);

        res.json({ origin: { lat, lng }, nearby: withDistance });
    } catch (err) {
        next(err);
    }
}

module.exports = { nearby };


