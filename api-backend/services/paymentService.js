const crypto = require("crypto");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const {
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
} = require("./razorpayService");

// --------------------------------------------------
// Create Razorpay Payment Order
// --------------------------------------------------

const createPaymentOrder = async ({
  bookingId,
  userId,
}) => {
  // --------------------------------------------------
  // Find Booking
  // --------------------------------------------------

  const booking =
    await Booking.findOne({
      _id: bookingId,
      user: userId,
    });

  if (!booking) {
    const error = new Error(
      "Booking not found."
    );

    error.statusCode = 404;

    throw error;
  }

  // --------------------------------------------------
  // Validate Booking Status
  // --------------------------------------------------

  if (
    booking.status ===
    "cancelled"
  ) {
    const error = new Error(
      "A cancelled booking cannot be paid for."
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    booking.status ===
    "completed"
  ) {
    const error = new Error(
      "A completed booking does not require payment."
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    booking.status ===
    "confirmed"
  ) {
    const error = new Error(
      "This booking has already been confirmed."
    );

    error.statusCode = 400;

    throw error;
  }

  // --------------------------------------------------
  // Validate Booking Amount
  // --------------------------------------------------

  const amount =
    booking.totalPrice;

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    const error = new Error(
      "Booking does not contain a valid payment amount."
    );

    error.statusCode = 400;

    throw error;
  }

  // --------------------------------------------------
  // Prevent Duplicate Paid Payment
  // --------------------------------------------------

  const existingPaidPayment =
    await Payment.findOne({
      booking: booking._id,
      status: "paid",
    });

  if (existingPaidPayment) {
    const error = new Error(
      "This booking has already been paid for."
    );

    error.statusCode = 409;

    throw error;
  }

  // --------------------------------------------------
  // Reuse Existing Pending Razorpay Payment
  // --------------------------------------------------

  const existingPendingPayment =
    await Payment.findOne({
      booking: booking._id,
      status: "pending",
      provider: "razorpay",
    });

  if (
    existingPendingPayment
  ) {
    let razorpayOrder =
      null;

    if (
      existingPendingPayment.providerOrderId
    ) {
      try {
        razorpayOrder =
          await fetchRazorpayOrder(
            existingPendingPayment.providerOrderId
          );
      } catch (error) {
        console.error(
          "Unable to fetch existing Razorpay order:",
          error.message
        );
      }
    }

    return {
      booking,
      payment:
        existingPendingPayment,
      razorpayOrder,
      reused: true,
    };
  }

  // --------------------------------------------------
  // Create Razorpay Order
  // --------------------------------------------------

  const receipt =
    booking.bookingReference
      ? `booking_${booking.bookingReference}`
      : `booking_${booking._id.toString()}`;

  const razorpayOrder =
    await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt,

      notes: {
        bookingId:
          booking._id.toString(),

        bookingReference:
          booking.bookingReference ||
          "",

        userId:
          userId.toString(),
      },
    });

  // --------------------------------------------------
  // Create Internal Payment Record
  // --------------------------------------------------

  const payment =
    await Payment.create({
      booking:
        booking._id,

      user: userId,

      amount,

      currency: "INR",

      status: "pending",

      provider:
        "razorpay",

      providerOrderId:
        razorpayOrder.id,
    });

  // --------------------------------------------------
  // Return Payment Information
  // --------------------------------------------------

  return {
    booking,
    payment,
    razorpayOrder,
    reused: false,
  };
};

// --------------------------------------------------
// Verify Razorpay Payment Signature
// --------------------------------------------------

const verifyRazorpayPayment = ({
  orderId,
  paymentId,
  signature,
}) => {
  // --------------------------------------------------
  // Validate Input
  // --------------------------------------------------

  if (
    !orderId ||
    !paymentId ||
    !signature
  ) {
    const error = new Error(
      "Razorpay payment verification data is incomplete."
    );

    error.statusCode = 400;

    throw error;
  }

  // --------------------------------------------------
  // Razorpay Secret
  // --------------------------------------------------

  const secret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    const error = new Error(
      "Razorpay secret is missing from environment variables."
    );

    error.statusCode = 500;

    throw error;
  }

  // --------------------------------------------------
  // Generate Expected Signature
  // --------------------------------------------------

  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(
        `${orderId}|${paymentId}`
      )
      .digest("hex");

  // --------------------------------------------------
  // Compare Signatures Safely
  // --------------------------------------------------

  const signaturesMatch =
    generatedSignature.length ===
      signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(
        generatedSignature,
        "utf8"
      ),
      Buffer.from(
        signature,
        "utf8"
      )
    );

  if (!signaturesMatch) {
    const error = new Error(
      "Invalid Razorpay payment signature."
    );

    error.statusCode = 400;

    throw error;
  }

  return true;
};

// --------------------------------------------------
// Confirm Razorpay Payment
// --------------------------------------------------

const confirmRazorpayPayment =
  async ({
    userId,
    paymentId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    // --------------------------------------------------
    // Validate Required Input
    // --------------------------------------------------

    if (!paymentId) {
      const error = new Error(
        "Payment ID is required."
      );

      error.statusCode = 400;

      throw error;
    }

    if (!razorpayOrderId) {
      const error = new Error(
        "Razorpay order ID is required."
      );

      error.statusCode = 400;

      throw error;
    }

    if (!razorpayPaymentId) {
      const error = new Error(
        "Razorpay payment ID is required."
      );

      error.statusCode = 400;

      throw error;
    }

    if (!razorpaySignature) {
      const error = new Error(
        "Razorpay payment signature is required."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Find Internal Payment
    // --------------------------------------------------

    const payment =
      await Payment.findOne({
        _id: paymentId,

        user: userId,

        provider:
          "razorpay",
      });

    if (!payment) {
      const error = new Error(
        "Payment not found."
      );

      error.statusCode = 404;

      throw error;
    }

    // --------------------------------------------------
    // Verify Internal Payment Status
    // --------------------------------------------------

    if (
      payment.status ===
      "paid"
    ) {
      const error = new Error(
        "This payment has already been completed."
      );

      error.statusCode = 409;

      throw error;
    }

    if (
      payment.status ===
      "refunded"
    ) {
      const error = new Error(
        "A refunded payment cannot be completed again."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Verify Razorpay Order ID
    // --------------------------------------------------

    if (
      payment.providerOrderId !==
      razorpayOrderId
    ) {
      const error = new Error(
        "Razorpay order does not match the payment."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Verify Razorpay Signature
    // --------------------------------------------------

    verifyRazorpayPayment({
      orderId:
        razorpayOrderId,

      paymentId:
        razorpayPaymentId,

      signature:
        razorpaySignature,
    });

    // --------------------------------------------------
    // Find Booking
    // --------------------------------------------------

    const booking =
      await Booking.findOne({
        _id:
          payment.booking,

        user: userId,
      });

    if (!booking) {
      const error = new Error(
        "Booking associated with this payment was not found."
      );

      error.statusCode = 404;

      throw error;
    }

    // --------------------------------------------------
    // Validate Booking Status
    // --------------------------------------------------

    if (
      booking.status ===
      "cancelled"
    ) {
      const error = new Error(
        "Payment cannot be completed for a cancelled booking."
      );

      error.statusCode = 400;

      throw error;
    }

    if (
      booking.status ===
      "completed"
    ) {
      const error = new Error(
        "Payment cannot be completed for a completed booking."
      );

      error.statusCode = 400;

      throw error;
    }

    if (
      booking.status ===
      "confirmed"
    ) {
      const error = new Error(
        "This booking has already been confirmed."
      );

      error.statusCode = 409;

      throw error;
    }

    // --------------------------------------------------
    // Final Amount Integrity Check
    // --------------------------------------------------

    if (
      payment.amount !==
      booking.totalPrice
    ) {
      const error = new Error(
        "Payment amount does not match the booking total."
      );

      error.statusCode = 409;

      throw error;
    }

    // --------------------------------------------------
    // Fetch Razorpay Order
    // --------------------------------------------------

    const razorpayOrder =
      await fetchRazorpayOrder(
        razorpayOrderId
      );

    // --------------------------------------------------
    // Verify Order Amount
    // --------------------------------------------------

    const expectedAmount =
      Math.round(
        payment.amount * 100
      );

    if (
      razorpayOrder.amount !==
      expectedAmount
    ) {
      const error = new Error(
        "Razorpay order amount does not match the payment amount."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Verify Order Currency
    // --------------------------------------------------

    if (
      razorpayOrder.currency !==
      payment.currency
    ) {
      const error = new Error(
        "Razorpay order currency does not match the payment currency."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Verify Razorpay Order Status
    // --------------------------------------------------

    if (
      razorpayOrder.status !==
        "created" &&
      razorpayOrder.status !==
        "attempted" &&
      razorpayOrder.status !==
        "paid"
    ) {
      const error = new Error(
        "Razorpay order is not in a valid payment state."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Fetch Actual Razorpay Payment
    // --------------------------------------------------

    const razorpayPayment =
      await fetchRazorpayPayment(
        razorpayPaymentId
      );

    // --------------------------------------------------
    // Verify Payment Belongs To Order
    // --------------------------------------------------

    if (
      razorpayPayment.order_id !==
      razorpayOrderId
    ) {
      const error = new Error(
        "Razorpay payment does not belong to the specified order."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Verify Payment Amount
    // --------------------------------------------------

    if (
      razorpayPayment.amount !==
      expectedAmount
    ) {
      const error = new Error(
        "Razorpay payment amount does not match the payment amount."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Verify Payment Currency
    // --------------------------------------------------

    if (
      razorpayPayment.currency !==
      payment.currency
    ) {
      const error = new Error(
        "Razorpay payment currency does not match the payment currency."
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Require Captured Payment
    // --------------------------------------------------

    if (
      razorpayPayment.status !==
      "captured"
    ) {
      const error = new Error(
        `Razorpay payment is not captured. Current status: ${razorpayPayment.status}.`
      );

      error.statusCode = 400;

      throw error;
    }

    // --------------------------------------------------
    // Mark Internal Payment As Paid
    // --------------------------------------------------

    payment.status =
      "paid";

    payment.providerPaymentId =
      razorpayPaymentId;

    payment.providerSignature =
      razorpaySignature;

    payment.paidAt =
      new Date();

    await payment.save();

    // --------------------------------------------------
    // Confirm Booking
    // --------------------------------------------------

    booking.status =
      "confirmed";

    await booking.save();

    // --------------------------------------------------
    // Return Populated Data
    // --------------------------------------------------

    const updatedPayment =
      await Payment.findById(
        payment._id
      )
        .populate(
          "booking",
          "bookingReference tourPackage departure travelers pricePerPersonAtBooking totalPrice status createdAt"
        )
        .populate(
          "user",
          "name email"
        );

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "tourPackage",
          "title description imageUrl duration pricePerPerson"
        )
        .populate(
          "departure",
          "departureDate capacity bookedSeats status"
        );

    return {
      payment:
        updatedPayment,

      booking:
        updatedBooking,
    };
  };

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  createPaymentOrder,
  verifyRazorpayPayment,
  confirmRazorpayPayment,
};