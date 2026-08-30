const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
} = require("../controllers/bookingController");

const {
  cancelBooking,
} = require("../controllers/bookingCancellationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// Authentication
// --------------------------------------------------

router.use(authMiddleware);

// --------------------------------------------------
// Create Normal Tour Package Booking
// --------------------------------------------------

router.post(
  "/",
  createBooking
);

// --------------------------------------------------
// Get Current User's Bookings
// --------------------------------------------------

router.get(
  "/my",
  getMyBookings
);

// --------------------------------------------------
// Cancel Booking
// --------------------------------------------------

router.patch(
  "/:id/cancel",
  cancelBooking
);

// --------------------------------------------------
// Get Single Booking
// --------------------------------------------------

router.get(
  "/:id",
  getBookingById
);

module.exports = router;
