const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const {
  createPaymentOrder,
  confirmRazorpayPayment,
} = require("../services/paymentService");

// --------------------------------------------------
// Create Razorpay Payment Order
// --------------------------------------------------

const createPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookingId } = req.params;

    const result = await createPaymentOrder({
      bookingId,
      userId,
    });

    return res.status(
      result.reused ? 200 : 201
    ).json({
      message: result.reused
        ? "A pending Razorpay payment already exists for this booking."
        : "Razorpay payment order created successfully.",
      payment: result.payment,
      razorpayOrder: result.razorpayOrder || null,
      reused: result.reused,
    });
  } catch (error) {
    console.error(
      "Create Razorpay payment error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.statusCode
          ? error.message
          : "Something went wrong while creating the payment.",
    });
  }
};

// --------------------------------------------------
// Verify Razorpay Payment
// --------------------------------------------------

const verifyPayment = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const {
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message:
          "Payment ID is required.",
      });
    }

    if (!razorpayOrderId) {
      return res.status(400).json({
        message:
          "Razorpay order ID is required.",
      });
    }

    if (!razorpayPaymentId) {
      return res.status(400).json({
        message:
          "Razorpay payment ID is required.",
      });
    }

    if (!razorpaySignature) {
      return res.status(400).json({
        message:
          "Razorpay payment signature is required.",
      });
    }

    const result =
      await confirmRazorpayPayment({
        userId,
        paymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

    return res.status(200).json({
      message:
        "Payment verified and booking confirmed successfully.",
      payment: result.payment,
      booking: result.booking,
    });
  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.statusCode
          ? error.message
          : "Something went wrong while verifying the payment.",
    });
  }
};

// --------------------------------------------------
// Mock Payment Success
// --------------------------------------------------
//
// Development/testing only.
// This remains available so automated backend tests
// do not depend on the real Razorpay gateway.
// --------------------------------------------------

const mockPaymentSuccess = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;
    const { paymentId } = req.params;

    const payment =
      await Payment.findOne({
        _id: paymentId,
        user: userId,
      });

    if (!payment) {
      return res.status(404).json({
        message:
          "Payment not found.",
      });
    }

    if (payment.status === "paid") {
      return res.status(409).json({
        message:
          "This payment has already been completed.",
      });
    }

    if (payment.status === "refunded") {
      return res.status(400).json({
        message:
          "A refunded payment cannot be completed again.",
      });
    }

    const booking =
      await Booking.findOne({
        _id: payment.booking,
        user: userId,
      });

    if (!booking) {
      return res.status(404).json({
        message:
          "Booking associated with this payment was not found.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message:
          "Payment cannot be completed for a cancelled booking.",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message:
          "Payment cannot be completed for a completed booking.",
      });
    }

    if (
      payment.amount !==
      booking.totalPrice
    ) {
      return res.status(409).json({
        message:
          "Payment amount does not match the booking total.",
      });
    }

    payment.status = "paid";
    payment.paidAt = new Date();
    payment.providerPaymentId =
      `mock_payment_${payment._id}`;

    await payment.save();

    booking.status = "confirmed";

    await booking.save();

    const updatedPayment =
      await Payment.findById(
        payment._id
      )
        .populate(
          "booking",
          "tourPackage departure travelers pricePerPersonAtBooking totalPrice status"
        )
        .populate(
          "user",
          "name email"
        );

    return res.status(200).json({
      message:
        "Payment completed and booking confirmed successfully.",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error(
      "Mock payment success error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while processing the payment.",
    });
  }
};

// --------------------------------------------------
// Get Payment
// --------------------------------------------------

const getPaymentById = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;
    const { paymentId } = req.params;

    const payment =
      await Payment.findOne({
        _id: paymentId,
        user: userId,
      })
        .populate(
          "booking",
          "tourPackage departure travelers pricePerPersonAtBooking totalPrice status"
        )
        .populate(
          "user",
          "name email"
        );

    if (!payment) {
      return res.status(404).json({
        message:
          "Payment not found.",
      });
    }

    return res.status(200).json({
      payment,
    });
  } catch (error) {
    console.error(
      "Get payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while retrieving the payment.",
    });
  }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  createPayment,
  verifyPayment,
  mockPaymentSuccess,
  getPaymentById,
};
