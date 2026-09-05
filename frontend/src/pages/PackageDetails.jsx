import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getDeparturesByPackage,
  getTourPackageById,
} from "../services/packages";

import { createBooking } from "../services/bookings";

import { useAuth } from "../context/AuthContext";

import "../styles/package-details.css";


// --------------------------------------------------
// Helpers
// --------------------------------------------------

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


function formatDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(date));
}


// --------------------------------------------------
// Loading State
// --------------------------------------------------

function LoadingState() {
  return (
    <main className="package-details">
      <div className="content-width">
        <div className="package-details__state">
          <span className="eyebrow">
            DeepTravel
          </span>

          <h1 className="display-md">
            Preparing your journey...
          </h1>
        </div>
      </div>
    </main>
  );
}


// --------------------------------------------------
// Error State
// --------------------------------------------------

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <main className="package-details">
      <div className="content-width">
        <div className="package-details__state">

          <span className="eyebrow">
            Journey unavailable
          </span>

          <h1 className="display-md">
            We couldn't find
            <br />
            this journey.
          </h1>

          <p>
            {message ||
              "Something went wrong while loading this tour package."}
          </p>

          <div className="package-details__state-actions">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onRetry}
            >
              Try again
            </button>

            <Link
              to="/explore"
              className="btn btn-primary"
            >
              Explore destinations
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}


// --------------------------------------------------
// Package Details
// --------------------------------------------------

function PackageDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();


  const [tourPackage, setTourPackage] =
    useState(null);

  const [departures, setDepartures] =
    useState([]);

  const [selectedDeparture, setSelectedDeparture] =
    useState(null);

  const [travelers, setTravelers] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [departureLoading, setDepartureLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [bookingError, setBookingError] =
    useState("");

  const [bookingLoading, setBookingLoading] =
    useState(false);


  // --------------------------------------------------
  // Load Package
  // --------------------------------------------------

  const loadPackage =
    useCallback(async () => {
      if (!id) {
        setError(
          "Tour package ID is missing."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getTourPackageById(id);

        setTourPackage(response);
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load this tour package."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);


  // --------------------------------------------------
  // Load Departures
  // --------------------------------------------------

  const loadDepartures =
    useCallback(async () => {
      if (!id) {
        setDepartureLoading(false);
        return;
      }

      try {
        setDepartureLoading(true);
        setBookingError("");

        const response =
          await getDeparturesByPackage(
            id
          );

        const available =
          Array.isArray(
            response?.departures
          )
            ? response.departures
            : [];

        setDepartures(
          available
        );

        setSelectedDeparture(
          available[0]?._id ||
            null
        );
      } catch (err) {
        setBookingError(
          err?.message ||
            "Failed to load available departures."
        );
      } finally {
        setDepartureLoading(false);
      }
    }, [id]);


  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------

  useEffect(() => {
    loadPackage();
    loadDepartures();
  }, [
    loadPackage,
    loadDepartures,
  ]);


  // --------------------------------------------------
  // Maximum Travelers
  // --------------------------------------------------

  const maxTravelers =
    useMemo(() => {
      const packageLimit =
        tourPackage?.groupLimit;

      const departure =
        departures.find(
          (item) =>
            item._id ===
            selectedDeparture
        );

      const departureSeats =
        departure?.remainingSeats ||
        1;

      if (
        packageLimit?.hasLimit &&
        packageLimit.maxGroupSize
      ) {
        return Math.min(
          packageLimit.maxGroupSize,
          departureSeats
        );
      }

      return departureSeats;
    }, [
      tourPackage,
      departures,
      selectedDeparture,
    ]);


  // --------------------------------------------------
  // Keep Travelers In Range
  // --------------------------------------------------

  useEffect(() => {
    setTravelers((current) =>
      Math.min(
        Math.max(current, 1),
        Math.max(maxTravelers, 1)
      )
    );
  }, [maxTravelers]);


  // --------------------------------------------------
  // Selected Departure
  // --------------------------------------------------

  const departure =
    departures.find(
      (item) =>
        item._id ===
        selectedDeparture
    );


  // --------------------------------------------------
  // Total Price
  // --------------------------------------------------

  const totalPrice =
    (tourPackage?.pricePerPerson || 0) *
    travelers;


  // --------------------------------------------------
  // Traveler Controls
  // --------------------------------------------------

  function decreaseTravelers() {
    setTravelers((current) =>
      Math.max(
        current - 1,
        1
      )
    );
  }


  function increaseTravelers() {
    setTravelers((current) =>
      Math.min(
        current + 1,
        Math.max(
          maxTravelers,
          1
        )
      )
    );
  }


  // --------------------------------------------------
  // Select Departure
  // --------------------------------------------------

  function handleDepartureSelect(
    departureId
  ) {
    setSelectedDeparture(
      departureId
    );

    setBookingError("");
  }


  // --------------------------------------------------
  // Book Journey
  // --------------------------------------------------

  async function handleBooking() {
    setBookingError("");

    if (!isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(
          `/packages/${id}`
        )}`
      );

      return;
    }

    if (!selectedDeparture) {
      setBookingError(
        "Please select a departure date."
      );

      return;
    }

    if (!departure) {
      setBookingError(
        "Selected departure is no longer available."
      );

      return;
    }

    if (
      travelers < 1 ||
      travelers >
        departure.remainingSeats
    ) {
      setBookingError(
        "The selected number of travelers is no longer available."
      );

      return;
    }

    try {
      setBookingLoading(true);

      const response =
        await createBooking({
          tourPackage: id,
          departure:
            selectedDeparture,
          travelers,
          token,
        });

      if (
        response?.booking?._id
      ) {
        navigate(
          `/trips/${response.booking._id}`
        );

        return;
      }

      /*
       * Fallback in case the backend
       * creates the booking but does not
       * return the booking object.
       */

      navigate("/trips");
    } catch (err) {
      setBookingError(
        err?.message ||
          "Unable to create your booking."
      );
    } finally {
      setBookingLoading(false);
    }
  }


  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return <LoadingState />;
  }


  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (!tourPackage) {
    return (
      <ErrorState
        message={error}
        onRetry={loadPackage}
      />
    );
  }


  // --------------------------------------------------
  // Package Data
  // --------------------------------------------------

  const destination =
    tourPackage.destination ||
    {};

  const duration =
    tourPackage.duration ||
    {};

  const accommodation =
    tourPackage.accommodation ||
    {};

  const meals =
    tourPackage.meals ||
    {};

  const transportation =
    tourPackage.transportation ||
    {};

  const activities =
    tourPackage.activities ||
    {};

  const itinerary =
    Array.isArray(
      tourPackage.itinerary
    )
      ? tourPackage.itinerary
      : [];

  const inclusions =
    Array.isArray(
      tourPackage.inclusions
    )
      ? tourPackage.inclusions
      : [];

  const exclusions =
    Array.isArray(
      tourPackage.exclusions
    )
      ? tourPackage.exclusions
      : [];


  return (
    <main className="package-details">

      {/* ==================================================
          HERO
          ================================================== */}

      <section className="package-details__hero">

        {tourPackage.imageUrl ? (
          <img
            src={
              tourPackage.imageUrl
            }
            alt={
              tourPackage.title
            }
          />
        ) : (
          <div className="package-details__hero-placeholder">
            DeepTravel
          </div>
        )}

        <div className="package-details__hero-overlay" />

        <div className="content-width package-details__hero-content">

          <Link
            to={
              destination?._id
                ? `/explore/${destination._id}`
                : "/explore"
            }
            className="package-details__back"
          >
            ← Back to destination
          </Link>

          <div className="package-details__hero-copy">

            <span className="eyebrow">
              {destination.name ||
                "DeepTravel"}
              {destination.country
                ? ` · ${destination.country}`
                : ""}
            </span>

            <h1>
              {tourPackage.title}
            </h1>

            <p>
              {tourPackage.description}
            </p>

          </div>

        </div>
      </section>


      {/* ==================================================
          PACKAGE OVERVIEW
          ================================================== */}

      <section className="section">
        <div className="content-width">

          <div className="package-details__overview">

            <div className="package-details__overview-intro">

              <span className="eyebrow">
                The journey
              </span>

              <h2 className="display-md">
                Go deeper.
              </h2>

              <p>
                {tourPackage.description}
              </p>

            </div>


            <div className="package-details__facts">

              <div>
                <span>
                  Duration
                </span>

                <strong>
                  {duration.days}
                  {" "}
                  {duration.days === 1
                    ? "day"
                    : "days"}
                </strong>

                <small>
                  {duration.nights}{" "}
                  {duration.nights === 1
                    ? "night"
                    : "nights"}
                </small>
              </div>


              <div>
                <span>
                  From
                </span>

                <strong>
                  {formatCurrency(
                    tourPackage.pricePerPerson
                  )}
                </strong>

                <small>
                  per person
                </small>
              </div>


              <div>
                <span>
                  Group
                </span>

                <strong>
                  {tourPackage
                    .groupLimit
                    ?.hasLimit
                    ? `Up to ${tourPackage.groupLimit.maxGroupSize}`
                    : "Flexible"}
                </strong>

                <small>
                  travelers
                </small>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          INCLUSIONS
          ================================================== */}

      <section className="package-details__features">
        <div className="content-width">

          <div className="package-details__features-grid">

            <div>
              <span className="eyebrow">
                Included
              </span>

              <h2 className="display-md">
                Everything
                <br />
                considered.
              </h2>
            </div>


            <div className="package-details__feature-list">

              <div className="package-details__feature">

                <span className="package-details__feature-icon">
                  {accommodation.included
                    ? "✓"
                    : "×"}
                </span>

                <div>
                  <strong>
                    Accommodation
                  </strong>

                  <p>
                    {accommodation.included
                      ? accommodation.name ||
                        "Accommodation included"
                      : "Not included"}
                  </p>
                </div>

              </div>


              <div className="package-details__feature">

                <span className="package-details__feature-icon">
                  {transportation.included
                    ? "✓"
                    : "×"}
                </span>

                <div>
                  <strong>
                    Transportation
                  </strong>

                  <p>
                    {transportation.included
                      ? transportation.description ||
                        "Transportation included"
                      : "Not included"}
                  </p>
                </div>

              </div>


              <div className="package-details__feature">

                <span className="package-details__feature-icon">
                  {activities.included
                    ? "✓"
                    : "×"}
                </span>

                <div>
                  <strong>
                    Activities
                  </strong>

                  <p>
                    {activities.included
                      ? activities.description ||
                        "Activities included"
                      : "Not included"}
                  </p>
                </div>

              </div>


              <div className="package-details__feature">

                <span className="package-details__feature-icon">
                  {meals.breakfast
                    ? "✓"
                    : "×"}
                </span>

                <div>
                  <strong>
                    Breakfast
                  </strong>

                  <p>
                    {meals.breakfast
                      ? "Breakfast included"
                      : "Not included"}
                  </p>
                </div>

              </div>


              <div className="package-details__feature">

                <span className="package-details__feature-icon">
                  {meals.lunch
                    ? "✓"
                    : "×"}
                </span>

                <div>
                  <strong>
                    Lunch
                  </strong>

                  <p>
                    {meals.lunch
                      ? "Lunch included"
                      : "Not included"}
                  </p>
                </div>

              </div>


              <div className="package-details__feature">

                <span className="package-details__feature-icon">
                  {meals.dinner
                    ? "✓"
                    : "×"}
                </span>

                <div>
                  <strong>
                    Dinner
                  </strong>

                  <p>
                    {meals.dinner
                      ? "Dinner included"
                      : "Not included"}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          ITINERARY
          ================================================== */}

      {itinerary.length > 0 && (
        <section className="section package-details__itinerary">
          <div className="content-width">

            <div className="section-heading">

              <div>
                <span className="eyebrow">
                  The route
                </span>

                <h2 className="display-md">
                  Itinerary
                </h2>
              </div>

              <span className="package-details__count">
                {itinerary.length
                  .toString()
                  .padStart(2, "0")}{" "}
                days
              </span>

            </div>


            <div className="package-details__itinerary-list">

              {itinerary.map(
                (day) => (
                  <article
                    key={day.day}
                    className="package-details__day"
                  >

                    <div className="package-details__day-number">
                      {String(
                        day.day
                      ).padStart(2, "0")}
                    </div>

                    <div className="package-details__day-content">

                      <span>
                        Day {day.day}
                      </span>

                      <h3>
                        {day.title}
                      </h3>

                      <p>
                        {day.description}
                      </p>

                      {day.places?.length >
                        0 && (
                        <div>
                          <small>
                            Places
                          </small>

                          <p>
                            {day.places.join(
                              " · "
                            )}
                          </p>
                        </div>
                      )}

                      {day.activities?.length >
                        0 && (
                        <div>
                          <small>
                            Activities
                          </small>

                          <p>
                            {day.activities.join(
                              " · "
                            )}
                          </p>
                        </div>
                      )}

                    </div>

                  </article>
                )
              )}

            </div>

          </div>
        </section>
      )}


      {/* ==================================================
          INCLUSIONS / EXCLUSIONS
          ================================================== */}

      {(inclusions.length > 0 ||
        exclusions.length > 0) && (
        <section className="package-details__included">
          <div className="content-width">

            <div className="package-details__included-grid">

              {inclusions.length > 0 && (
                <div>

                  <span className="eyebrow">
                    Included
                  </span>

                  <h2>
                    What's included
                  </h2>

                  <ul>
                    {inclusions.map(
                      (item, index) => (
                        <li
                          key={`${item}-${index}`}
                        >
                          <span>
                            ✓
                          </span>

                          {item}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}


              {exclusions.length > 0 && (
                <div>

                  <span className="eyebrow">
                    Not included
                  </span>

                  <h2>
                    What's excluded
                  </h2>

                  <ul>
                    {exclusions.map(
                      (item, index) => (
                        <li
                          key={`${item}-${index}`}
                        >
                          <span>
                            ×
                          </span>

                          {item}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}

            </div>

          </div>
        </section>
      )}


      {/* ==================================================
          BOOKING
          ================================================== */}

      <section className="section package-details__booking">
        <div className="content-width">

          <div className="package-details__booking-card">

            <div className="package-details__booking-heading">

              <span className="eyebrow">
                Reserve your journey
              </span>

              <h2 className="display-md">
                Choose your
                <br />
                departure.
              </h2>

              <p>
                Select a date and tell us
                who's coming.
              </p>

            </div>


            {/* ==================================================
                DEPARTURES
                ================================================== */}

            <div className="package-details__departures">

              <div className="package-details__booking-label">
                Available dates
              </div>

              {departureLoading ? (
                <div className="package-details__booking-loading">
                  Loading departures...
                </div>
              ) : departures.length === 0 ? (
                <div className="package-details__no-departures">
                  <strong>
                    No departures available.
                  </strong>

                  <p>
                    There are currently no
                    upcoming departures for
                    this journey.
                  </p>
                </div>
              ) : (
                <div className="package-details__departure-list">

                  {departures.map(
                    (item) => {
                      const selected =
                        item._id ===
                        selectedDeparture;

                      const seats =
                        item.remainingSeats ??
                        Math.max(
                          item.capacity -
                            item.bookedSeats,
                          0
                        );

                      return (
                        <button
                          type="button"
                          key={item._id}
                          className={`package-details__departure ${
                            selected
                              ? "package-details__departure--selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleDepartureSelect(
                              item._id
                            )
                          }
                        >

                          <span className="package-details__departure-date">
                            {formatDate(
                              item.departureDate
                            )}
                          </span>

                          <span className="package-details__departure-seats">
                            {seats}{" "}
                            {seats === 1
                              ? "seat"
                              : "seats"}{" "}
                            left
                          </span>

                          <span className="package-details__departure-check">
                            {selected
                              ? "✓"
                              : "○"}
                          </span>

                        </button>
                      );
                    }
                  )}

                </div>
              )}

            </div>


            {/* ==================================================
                TRAVELERS
                ================================================== */}

            <div className="package-details__travelers">

              <div>
                <span className="package-details__booking-label">
                  Travelers
                </span>

                <p>
                  {user?.name
                    ? `Traveling as ${user.name}`
                    : "How many people are traveling?"}
                </p>
              </div>

              <div className="package-details__stepper">

                <button
                  type="button"
                  aria-label="Remove traveler"
                  disabled={
                    travelers <= 1
                  }
                  onClick={
                    decreaseTravelers
                  }
                >
                  −
                </button>

                <strong>
                  {travelers}
                </strong>

                <button
                  type="button"
                  aria-label="Add traveler"
                  disabled={
                    travelers >=
                    maxTravelers
                  }
                  onClick={
                    increaseTravelers
                  }
                >
                  +
                </button>

              </div>

            </div>


            {/* ==================================================
                TOTAL
                ================================================== */}

            <div className="package-details__booking-total">

              <div>
                <span>
                  Total
                </span>

                <small>
                  {travelers}{" "}
                  {travelers === 1
                    ? "traveler"
                    : "travelers"}{" "}
                  ×{" "}
                  {formatCurrency(
                    tourPackage.pricePerPerson
                  )}
                </small>
              </div>

              <strong>
                {formatCurrency(
                  totalPrice
                )}
              </strong>

            </div>


            {/* ==================================================
                ERROR
                ================================================== */}

            {bookingError && (
              <div
                className="package-details__booking-error"
                role="alert"
              >
                {bookingError}
              </div>
            )}


            {/* ==================================================
                BOOK BUTTON
                ================================================== */}

            <button
              type="button"
              className="btn btn-primary package-details__book-button"
              disabled={
                bookingLoading ||
                departureLoading ||
                departures.length === 0 ||
                !selectedDeparture
              }
              onClick={
                handleBooking
              }
            >
              {bookingLoading
                ? "Creating booking..."
                : isAuthenticated
                ? "Book this journey →"
                : "Sign in to book →"}
            </button>

            {!isAuthenticated && (
              <p className="package-details__login-note">
                You'll need to sign in before
                completing your booking.
              </p>
            )}

          </div>

        </div>
      </section>

    </main>
  );
}

export default PackageDetails;