const Blackspot = require("../models/Blackspot");

async function list(req, res, next) {
    try {
        const spots = await Blackspot.find().sort({ createdAt: -1 });
        return res.json(spots.map(toPublic));
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        const { location, description, severity, title, lat, lng } = req.body;
        if (!location || !description || !severity) {
            return res.status(400).json({ message: "location, description and severity are required" });
        }
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const doc = await Blackspot.create({
            title: title || location,
            description,
            location,
            severity,
            lat: lat ? Number(lat) : undefined,
            lng: lng ? Number(lng) : undefined,
            imageUrl,
            createdBy: req.user ? req.user.id : undefined,
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
        location: doc.location,
        locationText: doc.location,
        lat: doc.lat,
        lng: doc.lng,
        severity: doc.severity,
        date: doc.createdAt?.toISOString?.().slice(0, 10) || undefined,
        imageUrl: doc.imageUrl || "",
    };
}

module.exports = { list, create, getById, update, remove };
