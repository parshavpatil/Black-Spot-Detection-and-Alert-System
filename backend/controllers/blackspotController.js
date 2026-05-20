const Blackspot = require("../models/Blackspot");

async function list(req, res, next) {
    try {
        const spots = await Blackspot.find().sort({ createdAt: -1 });
        return res.json(spots.map(toPublic));
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        // Accept both current and legacy field names
        const {
            location,
            locationName,
            description,
            severity,
            title,
            lat,
            lng,
            latitude,
            longitude,
            dateReported,
        } = req.body;

        const resolvedLocation = location || locationName;
        const resolvedLat = lat !== undefined ? lat : latitude;
        const resolvedLng = lng !== undefined ? lng : longitude;

        if (!resolvedLocation || !description || !severity) {
            return res.status(400).json({ message: "location, description and severity are required" });
        }
        // Validate coordinates if provided
        if ((resolvedLat !== undefined && resolvedLng === undefined) || (resolvedLng !== undefined && resolvedLat === undefined)) {
            return res.status(400).json({ message: "Both latitude and longitude must be provided" });
        }
        if (resolvedLat !== undefined && resolvedLng !== undefined) {
            const latNum = Number(resolvedLat);
            const lngNum = Number(resolvedLng);
            if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
                return res.status(400).json({ message: "Latitude/Longitude must be numbers" });
            }
            if (latNum < -90 || latNum > 90) {
                return res.status(400).json({ message: "Latitude must be between -90 and 90" });
            }
            if (lngNum < -180 || lngNum > 180) {
                return res.status(400).json({ message: "Longitude must be between -180 and 180" });
            }
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const doc = await Blackspot.create({
            title: title || resolvedLocation,
            description,
            location: resolvedLocation,
            severity,
            lat: resolvedLat !== undefined ? Number(resolvedLat) : undefined,
            lng: resolvedLng !== undefined ? Number(resolvedLng) : undefined,
            imageUrl,
            createdBy: req.user ? req.user.id : undefined,
            date: dateReported ? new Date(dateReported) : undefined,
        });
        return res.status(201).json(toPublic(doc));
    } catch (err) { next(err); }
}

async function getById(req, res, next) {
    try {
        const doc = await Blackspot.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Not found" });
        return res.json(toPublic(doc));
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const updates = { ...req.body };
        if (updates.lat !== undefined) updates.lat = Number(updates.lat);
        if (updates.lng !== undefined) updates.lng = Number(updates.lng);
        if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;
        const doc = await Blackspot.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!doc) return res.status(404).json({ message: "Not found" });
        return res.json(toPublic(doc));
    } catch (err) { next(err); }
}

async function remove(req, res, next) {
    try {
        const doc = await Blackspot.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ message: "Not found" });
        return res.json({ success: true });
    } catch (err) { next(err); }
}

function toPublic(doc) {
    return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        location: doc.location || doc.locationName,
        locationText: doc.location || doc.locationName,
        lat: doc.lat ?? doc.latitude,
        lng: doc.lng ?? doc.longitude,
        severity: doc.severity,
        date: (doc.dateReported
            ? new Date(doc.dateReported).toISOString().slice(0, 10)
            : (doc.createdAt?.toISOString?.().slice(0, 10) || undefined)),
        imageUrl: doc.imageUrl || "",
    };
}

module.exports = { list, create, getById, update, remove };
