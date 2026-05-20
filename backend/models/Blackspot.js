const mongoose = require("mongoose");

const blackspotSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true },
        description: { type: String, required: true },
        location: { type: String, required: true },
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
        severity: { type: String, enum: ["low", "medium", "high"], required: true },
        imageUrl: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Blackspot = mongoose.model("Blackspot", blackspotSchema);
module.exports = Blackspot;

