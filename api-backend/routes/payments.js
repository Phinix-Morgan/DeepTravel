const express = require("express");

const {
  createPayment,
  verifyPayment,
  mockPaymentSuccess,
  getPaymentById,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// --------------------------------------------------
// Authentication
// --------------------------------------------------

router.use(authMiddleware);

// --------------------------------------------------
// Create Razorpay Payment Order
// --------------------------------------------------

router.post(
  "/:bookingId",
  createPayment
);

// --------------------------------------------------
// Verify Razorpay Payment
// --------------------------------------------------

router.post(
  "/verify",
  verifyPayment
);

// --------------------------------------------------
// Mock Payment Success
// --------------------------------------------------
//
// Development/testing only.
// --------------------------------------------------

router.post(
  "/:paymentId/mock-success",
  mockPaymentSuccess
);

// --------------------------------------------------
// Get Payment
// --------------------------------------------------

router.get(
  "/:paymentId",
  getPaymentById
);

module.exports = router;
