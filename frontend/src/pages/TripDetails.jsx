import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  cancelBooking,
  createPaymentOrder,
  getBookingById,
  verifyPayment,
} from "../services/bookings";

import "../styles/trip-details.css";

// ==================================================
// Helpers
// ==================================================

function formatDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(date));
}

function formatCurrency(amount) {
  if (
    amount === undefined ||
    amount === null
  ) {
    return "₹0";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

function getStatus(status) {
  const normalized =
    String(status || "").toLowerCase();

  if (normalized === "confirmed") {
    return {
      label: "Confirmed",
      className:
        "trip-details__status--confirmed",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return {
      label: "Cancelled",
      className:
        "trip-details__status--cancelled",
    };
  }

  if (normalized === "completed") {
    return {
      label: "Completed",
      className:
        "trip-details__status--completed",
    };
  }

  return {
    label: "Pending",
    className:
      "trip-details__status--pending",
  };
}

// ==================================================
// Razorpay Loader
// ==================================================

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (
      typeof window === "undefined"
    ) {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(true),
        {
          once: true,
        }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        {
          once: true,
        }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

// ==================================================
// Page
// ==================================================

function TripDetails() {
  const { id } = useParams();

  const {
    token,
    loading: authLoading,
    refreshSession,
  } = useAuth();

  const [booking, setBooking] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancelling, setCancelling] =
    useState(false);

  const [paying, setPaying] =
    useState(false);

  // ==================================================
  // Load Booking
  // ==================================================

  const loadBooking =
    useCallback(async () => {
      if (!token || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getBookingById(
            id,
            token
          );

        setBooking(
          response?.booking || null
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load this booking."
        );
      } finally {
        setLoading(false);
      }
    }, [id, token]);

  // ==================================================
  // Initial Load
  // ==================================================

  useEffect(() => {
    if (!authLoading) {
      loadBooking();
    }
  }, [
    authLoading,
    loadBooking,
  ]);

  // ==================================================
  // Cancel Booking
  // ==================================================

  async function handleCancel() {
    if (!booking?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const response =
        await cancelBooking(
          booking._id,
          token
        );

      if (response?.booking) {
        setBooking(
          response.booking
        );
      } else {
        await loadBooking();
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to cancel this booking."
      );
    } finally {
      setCancelling(false);
    }
  }

  // ==================================================
  // Create Payment Order With Token Refresh
  // ==================================================

  async function createOrderWithRefresh(
    bookingId,
    currentToken
  ) {
    try {
      const result = await createPaymentOrder(
        bookingId,
        currentToken
      );
      return {
        ...result,
        activeToken: currentToken,
      };
    } catch (err) {
      // ----------------------------------------------
      // Access token expired
      // ----------------------------------------------

      if (err?.status !== 401) {
        throw err;
      }

      console.warn(
        "Payment request returned 401. Refreshing access token..."
      );

      // ----------------------------------------------
      // Refresh HttpOnly refresh-token cookie
      // ----------------------------------------------

      const refreshed =
        await refreshSession();

      if (!refreshed?.token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      // ----------------------------------------------
      // Retry payment request with fresh token
      // ----------------------------------------------

      const result = await createPaymentOrder(
        bookingId,
        refreshed.token
      );

      return {
        ...result,
        activeToken: refreshed.token,
      };
    }
  }

  // ==================================================
  // Verify Payment With Token Refresh
  // ==================================================

  async function verifyPaymentWithRefresh(
    paymentData,
    currentToken
  ) {
    try {
      return await verifyPayment({
        ...paymentData,
        token: currentToken,
      });
    } catch (err) {
      // ----------------------------------------------
      // Access token expired
      // ----------------------------------------------

      if (err?.status !== 401) {
        throw err;
      }

      console.warn(
        "Payment verification returned 401. Refreshing access token..."
      );

      // ----------------------------------------------
      // Refresh session
      // ----------------------------------------------

      const refreshed =
        await refreshSession();

      if (!refreshed?.token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      // ----------------------------------------------
      // Retry verification with fresh token
      // ----------------------------------------------

      return await verifyPayment({
        ...paymentData,
        token: refreshed.token,
      });
    }
  }

  // ==================================================
  // Pay For Booking
  // ==================================================

  async function handlePayment() {
    if (!booking?._id) {
      return;
    }

    if (
      booking.status !== "pending"
    ) {
      return;
    }

    if (!token) {
      setError(
        "Your session has expired. Please log in again."
      );

      return;
    }

    try {
      setPaying(true);
      setError("");

      // ------------------------------------------------
      // Load Razorpay Checkout
      // ------------------------------------------------

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load the payment gateway. Please check your internet connection and try again."
        );
      }

      // ------------------------------------------------
      // Create / Reuse Payment Order
      // ------------------------------------------------
      //
      // If the access token has expired, this helper
      // refreshes it and retries automatically.
      //

      let activeToken = token;

      const paymentResponse =
        await createOrderWithRefresh(
          booking._id,
          token
        );

      if (paymentResponse?.activeToken) {
        activeToken = paymentResponse.activeToken;
      }

      const payment =
        paymentResponse?.payment;

      const razorpayOrder =
        paymentResponse?.razorpayOrder;

      if (!payment?._id) {
        throw new Error(
          "Payment could not be initialized."
        );
      }

      if (!razorpayOrder?.id) {
        throw new Error(
          "Razorpay order could not be created."
        );
      }

      // ------------------------------------------------
      // Public Razorpay Key
      // ------------------------------------------------

      const razorpayKey =
        import.meta.env
          .VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error(
          "Razorpay public key is not configured."
        );
      }

      // ------------------------------------------------
      // Razorpay Checkout
      // ------------------------------------------------

      const options = {
        key: razorpayKey,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency ||
          "INR",

        name: "DeepTravel",

        description:
          booking.tourPackage
            ?.title ||
          "DeepTravel journey",

        order_id:
          razorpayOrder.id,

        prefill: {
          name: "",
          email: "",
        },

        theme: {
          color: "#d7ae5b",
        },

        handler:
          async function (
            response
          ) {
            try {
              setError("");

              // ------------------------------------------
              // Verify Payment On Backend
              // ------------------------------------------

              const verification =
                await verifyPaymentWithRefresh(
                  {
                    paymentId:
                      payment._id,

                    razorpayOrderId:
                      response
                        .razorpay_order_id,

                    razorpayPaymentId:
                      response
                        .razorpay_payment_id,

                    razorpaySignature:
                      response
                        .razorpay_signature,
                  },
                  activeToken
                );

              // ------------------------------------------
              // Booking Confirmed
              // ------------------------------------------

              if (
                verification?.booking
              ) {
                setBooking(
                  verification.booking
                );
              } else {
                await loadBooking();
              }
            } catch (err) {
              console.error(
                "Payment verification error:",
                err
              );

              setError(
                err?.message ||
                  "Payment was received, but we could not verify it. Please check your booking status before trying again."
              );
            } finally {
              setPaying(false);
            }
          },

        modal: {
          ondismiss:
            function () {
              setPaying(false);
            },
        },
      };

      // ------------------------------------------------
      // Open Razorpay
      // ------------------------------------------------

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (
          paymentError
        ) {
          console.error(
            "Razorpay payment failed:",
            paymentError
          );

          setError(
            paymentError?.error
              ?.description ||
              "Payment failed. Your booking is still pending."
          );

          setPaying(false);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(
        "Payment initialization error:",
        err
      );

      setError(
        err?.message ||
          "Unable to start the payment."
      );

      setPaying(false);
    }
  }

  // ==================================================
  // Loading
  // ==================================================

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="trip-details">
        <div className="content-width">
          <div className="trip-details__state">

            <span className="eyebrow">
              Your journey
            </span>

            <h1 className="display-md">
              Loading trip...
            </h1>

          </div>
        </div>
      </main>
    );
  }

  // ==================================================
  // Error / Not Found
  // ==================================================

  if (
    error &&
    !booking
  ) {
    return (
      <main className="trip-details">
        <div className="content-width">
          <div className="trip-details__state">

            <span className="eyebrow">
              Journey unavailable
            </span>

            <h1 className="display-md">
              We couldn't find
              <br />
              this trip.
            </h1>

            <p>
              {error ||
                "This booking may no longer exist or you may not have access to it."}
            </p>

            <div className="trip-details__state-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={loadBooking}
              >
                Try again
              </button>

              <Link
                to="/trips"
                className="btn btn-primary"
              >
                Back to my trips
              </Link>

            </div>

          </div>
        </div>
      </main>
    );
  }

  // ==================================================
  // Booking Data
  // ==================================================

  const packageData =
    booking?.tourPackage || {};

  const departure =
    booking?.departure || {};

  const status =
    getStatus(
      booking?.status
    );

  const duration =
    packageData.duration || {};

  const canCancel =
    booking?.status ===
      "pending" ||
    booking?.status ===
      "confirmed";

  const canPay =
    booking?.status ===
    "pending";

  // ==================================================
  // Render
  // ==================================================

  return (
    <main className="trip-details">

      {/* ==================================================
          HERO IMAGE
          ================================================== */}

      <section className="trip-details__hero">

        {packageData.imageUrl ? (
          <img
            src={
              packageData.imageUrl
            }
            alt={
              packageData.title ||
              "Trip destination"
            }
          />
        ) : (
          <div className="trip-details__hero-placeholder">
            DeepTravel
          </div>
        )}

        <div className="trip-details__hero-overlay" />

        <div className="content-width trip-details__hero-content">

          <Link
            to="/trips"
            className="trip-details__back"
          >
            ← My trips
          </Link>

          <div className="trip-details__hero-title">

            <span className="eyebrow">
              Your journey
            </span>

            <h1>
              {packageData.title ||
                "Your DeepTravel journey"}
            </h1>

            <p>
              {packageData.description ||
                "A journey worth remembering."}
            </p>

          </div>

        </div>

      </section>

      {/* ==================================================
          BOOKING SUMMARY
          ================================================== */}

      <section className="section">
        <div className="content-width">

          <div className="trip-details__summary">

            <div className="trip-details__summary-heading">

              <div>
                <span className="eyebrow">
                  Booking status
                </span>

                <h2 className="display-md">
                  Your journey.
                </h2>
              </div>

              <span
                className={`trip-details__status ${status.className}`}
              >
                {status.label}
              </span>

            </div>

            {/* ==================================================
                PAYMENT ERROR / INFORMATION
                ================================================== */}

            {error && (
              <div
                className="trip-details__payment-message"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* ==================================================
                INFORMATION GRID
                ================================================== */}

            <div className="trip-details__info-grid">

              <div className="trip-details__info">

                <span>
                  Departure
                </span>

                <strong>
                  {formatDate(
                    departure.departureDate
                  )}
                </strong>

              </div>

              <div className="trip-details__info">

                <span>
                  Duration
                </span>

                <strong>
                  {duration.days ||
                    "—"}{" "}
                  {duration.days === 1
                    ? "day"
                    : "days"}

                  {duration.nights !==
                    undefined && (
                    <>
                      {" "}
                      /{" "}
                      {duration.nights}{" "}
                      {duration.nights === 1
                        ? "night"
                        : "nights"}
                    </>
                  )}
                </strong>

              </div>

              <div className="trip-details__info">

                <span>
                  Travelers
                </span>

                <strong>
                  {booking.travelers ||
                    "—"}
                </strong>

              </div>

              <div className="trip-details__info">

                <span>
                  Price per person
                </span>

                <strong>
                  {formatCurrency(
                    booking.pricePerPersonAtBooking
                  )}
                </strong>

              </div>

            </div>

            {/* ==================================================
                TOTAL
                ================================================== */}

            <div className="trip-details__total">

              <span>
                Total journey cost
              </span>

              <strong>
                {formatCurrency(
                  booking.totalPrice
                )}
              </strong>

            </div>

            {/* ==================================================
                BOOKING REFERENCE
                ================================================== */}

            <div className="trip-details__booking-reference">

              <span>
                Booking reference
              </span>

              <strong>
                {booking.bookingReference ||
                  "—"}
              </strong>

            </div>

            {/* ==================================================
                ACTIONS
                ================================================== */}

            <div className="trip-details__actions">

              <Link
                to="/trips"
                className="btn btn-secondary"
              >
                ← All trips
              </Link>

              <div className="trip-details__primary-actions">

                {canPay && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={paying}
                    onClick={
                      handlePayment
                    }
                  >
                    {paying
                      ? "Opening payment..."
                      : `Pay ${formatCurrency(
                          booking.totalPrice
                        )}`}
                  </button>
                )}

                {canCancel && (
                  <button
                    type="button"
                    className="trip-details__cancel"
                    disabled={
                      cancelling ||
                      paying
                    }
                    onClick={
                      handleCancel
                    }
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "Cancel booking"}
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          ABOUT THE JOURNEY
          ================================================== */}

      <section className="section trip-details__about">
        <div className="content-width">

          <div className="trip-details__about-grid">

            <div>
              <span className="eyebrow">
                About your journey
              </span>

              <h2 className="display-md">
                Travel deeper.
              </h2>
            </div>

            <div>

              <p>
                {packageData.description ||
                  "Your DeepTravel journey is waiting for you."}
              </p>

              {packageData.duration && (
                <p>
                  This journey spans{" "}
                  {duration.days ||
                    "—"}{" "}
                  {duration.days === 1
                    ? "day"
                    : "days"}{" "}
                  and{" "}
                  {duration.nights ||
                    0}{" "}
                  {duration.nights === 1
                    ? "night"
                    : "nights"}.
                </p>
              )}

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}

export default TripDetails;
