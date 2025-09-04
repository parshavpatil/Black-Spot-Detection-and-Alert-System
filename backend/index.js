const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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
const MONGODB_URI = process.env.MONGODB_URI || "";

async function start() {
    try {
        if (MONGODB_URI) {
            await mongoose.connect(MONGODB_URI);
            console.log("Connected to MongoDB");
        } else {
            console.warn("MONGODB_URI not set. Starting server without database connection.");
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

start();