const express = require("express");

const {
  createCustomTripRequest,
  getMyCustomTripRequests,
  getCustomTripRequestById,
} = require("../controllers/customTripController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// Customer Custom Trip Routes
// --------------------------------------------------

// Create a custom trip request
router.post(
  "/",
  authMiddleware,
  createCustomTripRequest
);

// Get current user's custom trip requests
router.get(
  "/my",
  authMiddleware,
  getMyCustomTripRequests
);

// Get a specific custom trip request
router.get(
  "/:id",
  authMiddleware,
  getCustomTripRequestById
);

module.exports = router;