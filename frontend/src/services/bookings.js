const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API_BASE_URL =
  `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "")}/api`;

// --------------------------------------------------
// Generic Booking / Payment Request
// --------------------------------------------------

async function request(
  endpoint,
  options = {}
) {
  const {
    method = "GET",
    body,
    token,
  } = options;

  const headers = {};

  if (body) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers,
      credentials: "include",
      body: body
        ? JSON.stringify(body)
        : undefined,
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        "Something went wrong."
    );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  return data;
}


// ==================================================
// BOOKINGS
// ==================================================


// --------------------------------------------------
// Get My Bookings
// --------------------------------------------------

export function getMyBookings(
  token
) {
  return request(
    "/bookings/my",
    {
      method: "GET",
      token,
    }
  );
}


// --------------------------------------------------
// Get Single Booking
// --------------------------------------------------

export function getBookingById(
  bookingId,
  token
) {
  if (!bookingId) {
    throw new Error(
      "Booking ID is required."
    );
  }

  return request(
    `/bookings/${encodeURIComponent(
      bookingId
    )}`,
    {
      method: "GET",
      token,
    }
  );
}


// --------------------------------------------------
// Create Booking
// --------------------------------------------------

export function createBooking({
  tourPackage,
  departure,
  travelers,
  token,
}) {
  if (!tourPackage) {
    throw new Error(
      "Tour package is required."
    );
  }

  if (!departure) {
    throw new Error(
      "Departure is required."
    );
  }

  if (
    !Number.isInteger(travelers) ||
    travelers < 1
  ) {
    throw new Error(
      "Number of travelers must be a positive integer."
    );
  }

  return request(
    "/bookings",
    {
      method: "POST",
      token,
      body: {
        tourPackage,
        departure,
        travelers,
      },
    }
  );
}


// --------------------------------------------------
// Cancel Booking
// --------------------------------------------------

export function cancelBooking(
  bookingId,
  token
) {
  if (!bookingId) {
    throw new Error(
      "Booking ID is required."
    );
  }

  return request(
    `/bookings/${encodeURIComponent(
      bookingId
    )}/cancel`,
    {
      method: "PATCH",
      token,
    }
  );
}


// ==================================================
// PAYMENTS
// ==================================================


// --------------------------------------------------
// Create Payment Order
// --------------------------------------------------
//
// POST /api/payments/:bookingId
//
// Creates a Razorpay payment order for the
// selected booking.
//
// The backend may reuse an existing pending
// payment order instead of creating a duplicate.
// --------------------------------------------------

export function createPaymentOrder(
  bookingId,
  token
) {
  if (!bookingId) {
    throw new Error(
      "Booking ID is required."
    );
  }

  return request(
    `/payments/${encodeURIComponent(
      bookingId
    )}`,
    {
      method: "POST",
      token,
    }
  );
}


// --------------------------------------------------
// Verify Razorpay Payment
// --------------------------------------------------
//
// POST /api/payments/verify
//
// Sends the Razorpay Checkout response to the
// backend.
//
// The backend verifies:
// - Internal payment
// - Razorpay order
// - Razorpay payment
// - Razorpay signature
// - Payment amount
// - Payment currency
//
// On success, the backend confirms the booking.
// --------------------------------------------------

export function verifyPayment({
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  token,
}) {
  if (!paymentId) {
    throw new Error(
      "Internal payment ID is required."
    );
  }

  if (!razorpayOrderId) {
    throw new Error(
      "Razorpay order ID is required."
    );
  }

  if (!razorpayPaymentId) {
    throw new Error(
      "Razorpay payment ID is required."
    );
  }

  if (!razorpaySignature) {
    throw new Error(
      "Razorpay payment signature is required."
    );
  }

  return request(
    "/payments/verify",
    {
      method: "POST",
      token,
      body: {
        paymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
    }
  );
}


// --------------------------------------------------
// Get Payment
// --------------------------------------------------
//
// GET /api/payments/:paymentId
//
// Retrieves one payment belonging to the
// authenticated user.
// --------------------------------------------------

export function getPaymentById(
  paymentId,
  token
) {
  if (!paymentId) {
    throw new Error(
      "Payment ID is required."
    );
  }

  return request(
    `/payments/${encodeURIComponent(
      paymentId
    )}`,
    {
      method: "GET",
      token,
    }
  );
}


// --------------------------------------------------
// Development Mock Payment
// --------------------------------------------------
//
// POST /api/payments/:paymentId/mock-success
//
// Development/testing only.
//
// This bypasses the real Razorpay checkout and
// marks the payment as paid.
// --------------------------------------------------

export function mockPaymentSuccess(
  paymentId,
  token
) {
  if (!paymentId) {
    throw new Error(
      "Payment ID is required."
    );
  }

  return request(
    `/payments/${encodeURIComponent(
      paymentId
    )}/mock-success`,
    {
      method: "POST",
      token,
    }
  );
}
