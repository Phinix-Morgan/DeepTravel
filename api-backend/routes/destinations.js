const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");
const authMiddleware = require("../middleware/authMiddleware"); // Door 1
const adminMiddleware = require("../middleware/adminMiddleware"); // Door 2

// Public route: Anyone can VIEW destinations
router.get("/", destinationController.getAllDestinations);

// Temporary seed route
router.post("/seed", destinationController.seedDestinations);

// <--- NEW: Protected Admin Route --->
// Notice the double security: authMiddleware THEN adminMiddleware
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  destinationController.createDestination,
);

module.exports = router;
