const express = require("express");
const { nearby } = require("../controllers/alertController");

const router = express.Router();

// GET /api/alerts/nearby?lat=..&lng=..&maxMeters=600
router.get("/nearby", nearby);

module.exports = router;


