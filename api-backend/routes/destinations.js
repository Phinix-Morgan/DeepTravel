const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public routes
router.get("/", destinationController.getAllDestinations);
router.get("/:id", destinationController.getDestinationById);
router.post("/seed", destinationController.seedDestinations);

// Admin protected routes
router.post("/", authMiddleware, adminMiddleware, destinationController.createDestination);
router.delete("/:id", authMiddleware, adminMiddleware, destinationController.deleteDestination);

module.exports = router;