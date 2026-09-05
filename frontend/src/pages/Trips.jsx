import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  cancelBooking,
  getMyBookings,
} from "../services/bookings";
import { getMyCustomTripRequests } from "../services/customTrips";
import { Skeleton, StatusBadge } from "../components/ui";

import "../styles/trips.css";

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBookingStatus(status) {
  const normalized = String(status || "").toLowerCase();

  switch (normalized) {
    case "confirmed":
      return {
        label: "Confirmed",
        className: "trip-status--confirmed",
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        className: "trip-status--cancelled",
      };

    case "completed":
      return {
        label: "Completed",
        className: "trip-status--completed",
      };

    case "pending":
    default:
      return {
        label: "Pending",
        className: "trip-status--pending",
      };
  }
}

function isUpcoming(booking) {
  const departureDate =
    booking?.departure?.departureDate;

  if (!departureDate) return false;

  return (
    new Date(departureDate).getTime() >
    Date.now()
  );
}

function TripCard({
  booking,
  onCancel,
  cancelling,
}) {
  const packageData =
    booking?.tourPackage;

  const departure =
    booking?.departure;

  const status =
    getBookingStatus(booking?.status);

  const canCancel =
    booking?.status === "pending" ||
    booking?.status === "confirmed";

  return (
    <article className="trip-card">
      <div className="trip-card__image">
        {packageData?.imageUrl ? (
          <img
            src={packageData.imageUrl}
            alt={packageData.title || "Trip"}
          />
        ) : (
          <div className="trip-card__image-placeholder">
            DT
          </div>
        )}
      </div>

      <div className="trip-card__body">
        <div className="trip-card__top">
          <div>
            <span className="eyebrow">
              {departure?.departureDate
                ? formatDate(
                    departure.departureDate
                  )
                : "Departure"}
            </span>

            <h3>
              {packageData?.title ||
                "Unnamed journey"}
            </h3>
          </div>

          <span
            className={`trip-status ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <p className="trip-card__description">
          {packageData?.description ||
            "Your DeepTravel journey."}
        </p>

        <div className="trip-card__meta">
          <div>
            <span>Duration</span>

            <strong>
              {packageData?.duration?.days || "—"}
              {" "}
              {packageData?.duration?.days === 1
                ? "day"
                : "days"}
              {packageData?.duration?.nights !==
                undefined && (
                <>
                  {" "}
                  /{" "}
                  {packageData.duration.nights}{" "}
                  {packageData.duration.nights === 1
                    ? "night"
                    : "nights"}
                </>
              )}
            </strong>
          </div>

          <div>
            <span>Travelers</span>

            <strong>
              {booking?.travelers || "—"}
            </strong>
          </div>

          <div>
            <span>Total</span>

            <strong>
              {formatCurrency(
                booking?.totalPrice
              )}
            </strong>
          </div>
        </div>

        <div className="trip-card__footer">
          <span className="trip-card__booking-id">
            Booking #
            {booking?._id
              ? booking._id.slice(-8).toUpperCase()
              : "—"}
          </span>

          <div className="trip-card__actions">
            <Link
              to={`/trips/${booking?._id}`}
              className="btn btn-secondary"
            >
              View trip
            </Link>

            {canCancel && (
              <button
                type="button"
                className="trip-card__cancel"
                disabled={cancelling}
                onClick={() =>
                  onCancel(booking._id)
                }
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyTrips() {
  return (
    <div className="trips-empty">
      <span className="trips-empty__number">
        01
      </span>

      <h2>
        Your next journey
        <br />
        starts here.
      </h2>

      <p>
        You haven't booked a trip yet.
        Explore our destinations and find
        somewhere worth going.
      </p>

      <Link
        to="/explore"
        className="btn btn-primary"
      >
        Explore destinations
      </Link>
    </div>
  );
}

function CustomTripCard({ request }) {
  const packageData = request?.tourPackage;
  const quoteReady = request?.status === "quoted";
  const expired = request?.status === "expired" || (request?.quoteExpiresAt && new Date(request.quoteExpiresAt) <= new Date());

  return (
    <article className="trip-card custom-trip-card">
      <div className="trip-card__image">
        {packageData?.imageUrl ? <img src={packageData.imageUrl} alt={packageData.title || "Custom trip"} /> : <div className="trip-card__image-placeholder">DT</div>}
      </div>
      <div className="trip-card__body">
        <div className="trip-card__top"><div><span className="eyebrow">Custom proposal · {formatDate(request?.preferredStartDate)}</span><h3>{packageData?.title || "Tailored journey"}</h3></div><StatusBadge status={expired ? "expired" : request?.status} /></div>
        <p className="trip-card__description">{quoteReady ? "Your tailored proposal is ready to review." : request?.customerMessage || "A journey shaped around your preferences."}</p>
        <div className="trip-card__meta"><div><span>Travelers</span><strong>{request?.travelers || "—"}</strong></div><div><span>Duration</span><strong>{request?.requestedDuration?.days ? `${request.requestedDuration.days} days` : "Flexible"}</strong></div><div><span>{quoteReady ? "Quoted total" : "Requested"}</span><strong>{quoteReady ? formatCurrency(request?.quotedTotalPrice) : formatDate(request?.createdAt)}</strong></div></div>
        <div className="trip-card__footer"><span className="trip-card__booking-id">Request #{request?._id?.slice(-8).toUpperCase()}</span><Link to={`/custom-trips/${request?._id}`} className="btn btn-secondary">{quoteReady ? "Review quote" : "View request"}</Link></div>
      </div>
    </article>
  );
}

function Trips() {
  const { user, token, loading: authLoading } =
    useAuth();

  const [bookings, setBookings] =
    useState([]);
  const [customRequests, setCustomRequests] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancellingId, setCancellingId] =
    useState(null);

  const loadBookings =
    useCallback(async () => {
      if (!token) {
        setBookings([]);
        setCustomRequests([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [bookingResult, customResult] = await Promise.allSettled([
          getMyBookings(token),
          getMyCustomTripRequests(token),
        ]);

        if (bookingResult.status === "rejected") {
          throw bookingResult.reason;
        }

        setBookings(
          Array.isArray(bookingResult.value?.bookings)
            ? bookingResult.value.bookings
            : []
        );

        if (customResult.status === "fulfilled") {
          setCustomRequests(
            Array.isArray(customResult.value?.requests)
              ? customResult.value.requests
              : []
          );
        } else {
          setCustomRequests([]);
          setError(
            customResult.reason?.message ||
              "Your bookings loaded, but custom trip requests are temporarily unavailable."
          );
        }
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load your trips."
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

  useEffect(() => {
    if (!authLoading) {
      loadBookings();
    }
  }, [
    authLoading,
    loadBookings,
  ]);

  async function handleCancel(
    bookingId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setError("");

      await cancelBooking(
        bookingId,
        token
      );

      await loadBookings();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to cancel this booking."
      );
    } finally {
      setCancellingId(null);
    }
  }

  const upcomingTrips =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            isUpcoming(booking) &&
            booking?.status !==
              "cancelled" &&
            booking?.status !==
              "canceled"
        ),
      [bookings]
    );

  const pastTrips =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            !isUpcoming(booking) ||
            booking?.status ===
              "cancelled" ||
            booking?.status ===
              "canceled"
        ),
      [bookings]
    );

  if (authLoading) {
    return (
      <section className="trips-page">
        <div className="content-width">
          <div className="trips-loading">
            <span className="eyebrow">
              DeepTravel
            </span>

            <h1 className="display-md">
              Loading your journeys...
            </h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="trips-page">
      {/* ==================================================
          HERO
          ================================================== */}

      <section className="trips-hero">
        <div className="content-width trips-hero__inner">
          <div className="trips-hero__copy">
            <span className="eyebrow">
              My journeys
            </span>

            <h1 className="display-lg">
              Welcome back
              {user?.name
                ? `, ${user.name.split(" ")[0]}`
                : ""}
              .
            </h1>

            <p>
              Every journey you've booked,
              gathered in one place.
            </p>
          </div>

          <div className="trips-hero__count">
            <strong>
              {(bookings.length + customRequests.length)
                .toString()
                .padStart(2, "0")}
            </strong>

            <span>
              Journeys & requests
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================
          CONTENT
          ================================================== */}

      <section className="section trips-content">
        <div className="content-width">
          {error && (
            <div className="trips-error">
              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={loadBookings}
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="trips-loading">
              <Skeleton height="18px" width="150px" /><Skeleton height="60px" width="340px" /><Skeleton height="280px" />
            </div>
          ) : bookings.length === 0 && customRequests.length === 0 ? (
            <EmptyTrips />
          ) : (
            <>
              {customRequests.length > 0 && (
                <section className="trips-section">
                  <div className="section-heading"><div><span className="eyebrow">Designed for you</span><h2 className="display-md">Custom trip requests</h2></div><span className="trips-section__count">{customRequests.length.toString().padStart(2, "0")} requests</span></div>
                  <div className="trips-list">{customRequests.map((request) => <CustomTripCard key={request._id} request={request} />)}</div>
                </section>
              )}
              {/* ==================================================
                  UPCOMING
                  ================================================== */}

              {upcomingTrips.length > 0 && (
                <section className="trips-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        Next destination
                      </span>

                      <h2 className="display-md">
                        Upcoming trips
                      </h2>
                    </div>

                    <span className="trips-section__count">
                      {upcomingTrips.length
                        .toString()
                        .padStart(2, "0")}
                      {" "}
                      journeys
                    </span>
                  </div>

                  <div className="trips-list">
                    {upcomingTrips.map(
                      (booking) => (
                        <TripCard
                          key={booking._id}
                          booking={booking}
                          onCancel={
                            handleCancel
                          }
                          cancelling={
                            cancellingId ===
                            booking._id
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              )}

              {/* ==================================================
                  PAST
                  ================================================== */}

              {pastTrips.length > 0 && (
                <section className="trips-section trips-section--past">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        Your history
                      </span>

                      <h2 className="display-md">
                        Past trips
                      </h2>
                    </div>

                    <span className="trips-section__count">
                      {pastTrips.length
                        .toString()
                        .padStart(2, "0")}
                      {" "}
                      journeys
                    </span>
                  </div>

                  <div className="trips-list">
                    {pastTrips.map(
                      (booking) => (
                        <TripCard
                          key={booking._id}
                          booking={booking}
                          onCancel={
                            handleCancel
                          }
                          cancelling={
                            cancellingId ===
                            booking._id
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default Trips;
