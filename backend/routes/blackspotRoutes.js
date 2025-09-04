const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { list, create, getById, update, remove } = require("../controllers/blackspotController");
const auth = require("../middlewares/auth");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadsDir); },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        cb(null, name);
    },
});

const upload = multer({ storage });

const router = express.Router();

router.get("/", list);
router.post("/", auth, upload.single("image"), create);
router.get("/:id", getById);
router.put("/:id", auth, upload.single("image"), update);
router.delete("/:id", auth, remove);

module.exports = router;
