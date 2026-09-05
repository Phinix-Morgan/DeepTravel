const Razorpay = require("razorpay");

// --------------------------------------------------
// Razorpay Client Helper
// --------------------------------------------------

function getRazorpayClient() {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    const error = new Error(
      "Razorpay credentials are missing from environment variables."
    );
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

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

  const client = getRazorpayClient();

  const order =
    await client.orders.create({
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
  const client = getRazorpayClient();
  return client.orders.fetch(
    orderId
  );
};

// --------------------------------------------------
// Fetch Razorpay Payment
// --------------------------------------------------

const fetchRazorpayPayment = async (
  paymentId
) => {
  const client = getRazorpayClient();
  return client.payments.fetch(
    paymentId
  );
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  get razorpay() {
    return getRazorpayClient();
  },
  getRazorpayClient,
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
};
