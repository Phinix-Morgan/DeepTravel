const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Booking
    // --------------------------------------------------

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    // --------------------------------------------------
    // User
    // --------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --------------------------------------------------
    // Amount
    // --------------------------------------------------

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    // --------------------------------------------------
    // Payment Status
    // --------------------------------------------------

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    // --------------------------------------------------
    // Payment Provider
    // --------------------------------------------------

    provider: {
      type: String,
      enum: [
        "razorpay",
        "stripe",
        "mock",
      ],
      default: "mock",
    },

    // --------------------------------------------------
    // Provider References
    // --------------------------------------------------

    providerOrderId: {
      type: String,
      trim: true,
      default: null,
    },

    providerPaymentId: {
      type: String,
      trim: true,
      default: null,
    },

    providerSignature: {
      type: String,
      trim: true,
      default: null,
    },

    // --------------------------------------------------
    // Failure Information
    // --------------------------------------------------

    failureReason: {
      type: String,
      trim: true,
      default: null,
    },

    // --------------------------------------------------
    // Payment Timestamps
    // --------------------------------------------------

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------------
// Prevent Multiple Active Payments for Same Booking
// --------------------------------------------------

paymentSchema.index(
  {
    booking: 1,
    status: 1,
  }
);

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);