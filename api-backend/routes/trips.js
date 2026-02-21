const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

// Both of these routes are PROTECTED by the authMiddleware bouncer
router.post("/", authMiddleware, tripController.saveTrip);
router.get("/", authMiddleware, tripController.getMyTrips);

module.exports = router;