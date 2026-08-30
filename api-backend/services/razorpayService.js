const Razorpay = require("razorpay");

// --------------------------------------------------
// Razorpay Client
// --------------------------------------------------

if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  throw new Error(
    "Razorpay credentials are missing from environment variables."
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --------------------------------------------------
// Create Razorpay Order
// --------------------------------------------------

const createRazorpayOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}) => {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Invalid payment amount."
    );
  }

  const amountInPaise =
    Math.round(amount * 100);

  const order =
    await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    });

  return order;
};

// --------------------------------------------------
// Fetch Razorpay Order
// --------------------------------------------------

const fetchRazorpayOrder = async (
  orderId
) => {
  return razorpay.orders.fetch(
    orderId
  );
};

// --------------------------------------------------
// Fetch Razorpay Payment
// --------------------------------------------------

const fetchRazorpayPayment = async (
  paymentId
) => {
  return razorpay.payments.fetch(
    paymentId
  );
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  razorpay,
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
};
