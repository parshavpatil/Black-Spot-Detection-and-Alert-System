const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

async function auth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const [, token] = header.split(" ");
        if (!token) return res.status(401).json({ message: "Missing Authorization token" });

        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ message: "Invalid token" });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

module.exports = auth;


