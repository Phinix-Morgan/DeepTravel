const express = require("express");

const {
  acceptCustomTripQuote,
} = require("../controllers/customTripBookingController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// Authentication
// --------------------------------------------------

router.use(authMiddleware);

// --------------------------------------------------
// Accept Custom Trip Quote
// --------------------------------------------------

router.patch(
  "/:id/accept",
  acceptCustomTripQuote
);

module.exports = router;