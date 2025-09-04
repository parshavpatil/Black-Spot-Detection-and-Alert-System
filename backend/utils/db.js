const mongoose = require("mongoose");
require("dotenv").config();

const DEFAULT_DB_OPTIONS = {
    autoIndex: true,
};

function getMongoUri() {
    const uri = process.env.MONGODB_URI || "";
    if (!uri) {
        console.warn("MONGODB_URI not set. Skipping MongoDB connection.");
    }
    return uri;
}

async function connectDB() {
    const uri = getMongoUri();
    if (!uri) return;

    const env = process.env.NODE_ENV || "development";
    const options = { ...DEFAULT_DB_OPTIONS };

    try {
        await mongoose.connect(uri, options);
        console.log(`[DB] Connected to MongoDB (${env})`);

        mongoose.connection.on("disconnected", () => {
            console.warn("[DB] MongoDB disconnected");
        });

        mongoose.connection.on("error", (err) => {
            console.error("[DB] MongoDB connection error:", err);
        });
    } catch (error) {
        console.error("[DB] Failed to connect to MongoDB:", error);
        throw error;
    }
}

async function disconnectDB() {
    try {
        await mongoose.disconnect();
        console.log("[DB] Disconnected from MongoDB");
    } catch (error) {
        console.error("[DB] Error during MongoDB disconnect:", error);
    }
}

module.exports = { connectDB, disconnectDB };


