const express = require("express");

const {
  getAllCustomTripRequests,
  getCustomTripRequestById,
  updateCustomTripRequestStatus,
  updateCustomTripQuote,
} = require("../controllers/adminCustomTripController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// --------------------------------------------------
// Admin Authentication & Authorization
// --------------------------------------------------

router.use(
  authMiddleware,
  adminMiddleware
);

// --------------------------------------------------
// Admin Custom Trip Routes
// --------------------------------------------------

// Get all custom trip requests
router.get(
  "/",
  getAllCustomTripRequests
);

// Get a specific custom trip request
router.get(
  "/:id",
  getCustomTripRequestById
);

// Update request status
router.patch(
  "/:id/status",
  updateCustomTripRequestStatus
);

// Create / update custom trip quote
router.patch(
  "/:id/quote",
  updateCustomTripQuote
);

module.exports = router;