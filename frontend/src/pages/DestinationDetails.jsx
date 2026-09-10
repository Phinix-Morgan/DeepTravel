import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getDestinationById } from "../services/destinations";
import { getPackagesByDestination } from "../services/packages";

import "../styles/destination-details.css";

function DestinationDetails() {
  const { id } = useParams();

  const [destination, setDestination] =
    useState(null);

  const [packages, setPackages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDestination() {
      try {
        setLoading(true);
        setError("");

        const [
          destinationData,
          packageData,
        ] = await Promise.all([
          getDestinationById(id),
          getPackagesByDestination(id),
        ]);

        if (cancelled) {
          return;
        }

        setDestination(destinationData);
        setPackages(
          Array.isArray(packageData)
            ? packageData
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load destination:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "We couldn't find this destination."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadDestination();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <main className="destination-detail">
        <section className="section">
          <div className="container">
            <div className="destination-detail__state">
              <span className="eyebrow">
                Hubsafari
              </span>

              <h1 className="display-md">
                Discovering your destination.
              </h1>

              <p className="text-muted">
                Give us a moment.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (error || !destination) {
    return (
      <main className="destination-detail">
        <section className="section">
          <div className="container">
            <div className="destination-detail__state">
              <span className="eyebrow">
                404
              </span>

              <h1 className="display-md">
                Destination not found.
              </h1>

              <p className="text-muted">
                {error ||
                  "This destination doesn't exist."}
              </p>

              <Link
                to="/explore"
                className="btn btn-primary"
              >
                Back to destinations

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="destination-detail">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="destination-detail__hero">

        <div className="destination-detail__image">
          <img
            src={destination.imageUrl}
            alt={destination.name}
          />
        </div>

        <div className="destination-detail__overlay" />

        <div className="container destination-detail__hero-content">

          <div className="destination-detail__hero-copy">

            <Link
              to="/explore"
              className="destination-detail__back"
            >
              <span aria-hidden="true">
                ←
              </span>

              All destinations
            </Link>

            <span className="eyebrow">
              {destination.country}
            </span>

            <h1 className="display-xl">
              {destination.name}
            </h1>

            <p>
              {destination.description}
            </p>

          </div>

          <div className="destination-detail__meta">

            <span>
              Destination
            </span>

            <div />

            <span>
              Hubsafari
            </span>

          </div>

        </div>
      </section>

      {/* =================================================
          INTRO
      ================================================= */}

      <section className="destination-detail__intro section">

        <div className="container">

          <div className="destination-detail__intro-grid">

            <div>
              <p className="eyebrow">
                Go deeper
              </p>

              <h2 className="display-md">
                A place worth
                <br />
                experiencing.
              </h2>
            </div>

            <div className="destination-detail__intro-copy">

              <p>
                {destination.description}
              </p>

              <p className="text-muted">
                Discover the places, experiences,
                and journeys that make{" "}
                {destination.name} worth
                travelling deeper for.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          HIGHLIGHTS
      ================================================= */}

      {destination.highlights?.length > 0 && (
        <section className="destination-detail__highlights section">

          <div className="container">

            <div className="destination-detail__section-heading">

              <div>
                <p className="eyebrow">
                  Worth discovering
                </p>

                <h2 className="display-md">
                  Places to explore.
                </h2>
              </div>

              <span>
                {String(
                  destination.highlights.length
                ).padStart(2, "0")}{" "}
                highlights
              </span>

            </div>

            <div className="destination-detail__highlights-grid">

              {destination.highlights.map(
                (highlight, index) => (
                  <div
                    key={`${highlight}-${index}`}
                    className="destination-detail__highlight"
                  >

                    <span>
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <h3>
                      {highlight}
                    </h3>

                    <span aria-hidden="true">
                      ↗
                    </span>

                  </div>
                )
              )}

            </div>

          </div>

        </section>
      )}

      {/* =================================================
          JOURNEYS
      ================================================= */}

      <section className="destination-detail__packages section">

        <div className="container">

          <div className="destination-detail__section-heading">

            <div>
              <p className="eyebrow">
                Curated journeys
              </p>

              <h2 className="display-md">
                Choose your way
                <br />
                to go deeper.
              </h2>
            </div>

            <span>
              {String(packages.length).padStart(
                2,
                "0"
              )}{" "}
              journeys
            </span>

          </div>

          {packages.length === 0 ? (
            <div className="destination-detail__empty">

              <p className="eyebrow">
                Coming soon
              </p>

              <h3>
                Journeys are being prepared.
              </h3>

              <p className="text-muted">
                We're currently crafting
                journeys for{" "}
                {destination.name}.
              </p>

            </div>
          ) : (
            <div className="destination-detail__packages-grid">

              {packages.map((tourPackage) => (
                <Link
                  key={tourPackage._id}
                  to={`/packages/${tourPackage._id}`}
                  className="destination-package-card"
                >

                  <div className="destination-package-card__image">

                    <img
                      src={
                        tourPackage.imageUrl ||
                        destination.imageUrl
                      }
                      alt={tourPackage.title}
                    />

                  </div>

                  <div className="destination-package-card__content">

                    <div className="destination-package-card__top">

                      <span className="destination-package-card__duration">
                        {tourPackage.duration?.days}{" "}
                        days{" "}
                        {tourPackage.duration?.nights}{" "}
                        nights
                      </span>

                      <span aria-hidden="true">
                        ↗
                      </span>

                    </div>

                    <h3>
                      {tourPackage.title}
                    </h3>

                    <p>
                      {tourPackage.description}
                    </p>

                    <div className="destination-package-card__bottom">

                      <span>
                        From
                      </span>

                      <strong>
                        ₹
                        {Number(
                          tourPackage.pricePerPerson
                        ).toLocaleString("en-IN")}
                      </strong>

                      <span>
                        / person
                      </span>

                    </div>

                  </div>

                </Link>
              ))}

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="destination-detail__journeys section">

        <div className="container">

          <div className="destination-detail__journeys-inner">

            <div>

              <p className="eyebrow">
                Your journey
              </p>

              <h2 className="display-md">
                Ready to go
                <br />
                deeper?
              </h2>

            </div>

            <div>

              <p className="text-muted">
                Explore a curated journey through{" "}
                {destination.name}, or create
                something entirely your own.
              </p>

              <div className="destination-detail__actions">

                <Link
                  to="/explore"
                  className="btn btn-primary"
                >
                  Explore destinations

                  <span aria-hidden="true">
                    →
                  </span>
                </Link>

                <Link
                  to="/custom-trip"
                  className="btn btn-secondary"
                >
                  Build a custom trip
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default DestinationDetails;
