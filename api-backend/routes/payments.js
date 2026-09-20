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
// Verify Razorpay Payment
// --------------------------------------------------

router.post(
  "/verify",
  verifyPayment
);

// --------------------------------------------------
// Create Razorpay Payment Order
// --------------------------------------------------

router.post(
  "/:bookingId",
  createPayment
);

// --------------------------------------------------
// Mock Payment Success
// --------------------------------------------------
//
// Development/testing only.
// --------------------------------------------------

if (process.env.NODE_ENV !== "production") {
  router.post(
    "/:paymentId/mock-success",
    mockPaymentSuccess
  );
}

// --------------------------------------------------
// Get Payment
// --------------------------------------------------

router.get(
  "/:paymentId",
  getPaymentById
);

module.exports = router;
