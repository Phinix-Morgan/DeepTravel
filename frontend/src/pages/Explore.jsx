import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getDestinations } from "../services/destinations";

function Explore() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const searchQuery =
    searchParams.get("q") || searchParams.get("destination") || "";

  const [destinations, setDestinations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDestinations() {
      try {
        setLoading(true);
        setError("");

        const data = await getDestinations({
          search: searchQuery,
        });

        if (!cancelled) {
          setDestinations(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load destinations:",
            err
          );

          setError(
            "We couldn't load the destinations. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleSearch = (event) => {
    const value = event.target.value;

    if (value.trim()) {
      setSearchParams({
        q: value,
      });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <main className="explore-page">

      {/* ─────────────────────────────
          HERO
      ───────────────────────────── */}

      <section className="explore-hero">
        <div className="container explore-hero__inner">

          <div className="explore-hero__copy">
            <p className="eyebrow">
              Discover deeper journeys
            </p>

            <h1 className="display-lg">
              Find somewhere
              <br />
              worth remembering.
            </h1>

            <p className="explore-hero__description">
              Explore destinations shaped around
              landscapes, culture, adventure, and
              the way you want to travel.
            </p>
          </div>

          <div className="explore-hero__number">
            <span>02</span>

            <div />

            <span>EXPLORE</span>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────
          SEARCH
      ───────────────────────────── */}

      <section className="explore-controls">
        <div className="container">

          <div className="explore-controls__inner">

            <label
              className="explore-search"
              htmlFor="destination-search"
            >
              <span className="explore-search__icon">
                /
              </span>

              <input
                id="destination-search"
                type="search"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </label>

            <div className="explore-controls__meta">

              <span>
                {loading
                  ? "Loading..."
                  : `${destinations.length} ${
                      destinations.length === 1
                        ? "destination"
                        : "destinations"
                    }`}
              </span>

              {searchQuery && (
                <button
                  type="button"
                  className="explore-clear"
                  onClick={clearFilters}
                >
                  Clear search ×
                </button>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────
          DESTINATIONS
      ───────────────────────────── */}

      <section className="explore-destinations section">

        <div className="container">

          <div className="explore-destinations__heading">

            <div>
              <p className="eyebrow">
                Destinations
              </p>

              <h2 className="display-md">
                Go deeper.
              </h2>
            </div>

            <p className="explore-destinations__intro">
              Places with something to say.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="explore-empty">

              <span className="explore-empty__number">
                !
              </span>

              <h3>
                Something went wrong.
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try again
              </button>

            </div>
          )}

          {/* LOADING */}

          {!error && loading && (
            <div className="explore-empty">

              <span className="explore-empty__number">
                00
              </span>

              <h3>
                Discovering places.
              </h3>

              <p>
                Finding journeys worth going deeper for.
              </p>

            </div>
          )}

          {/* RESULTS */}

          {!error &&
            !loading &&
            destinations.length > 0 && (
              <div className="explore-destinations__grid">

                {destinations.map(
                  (destination, index) => (
                    <Link
                      key={destination._id}
                      to={`/explore/${destination._id}`}
                      className={`explore-card ${
                        index === 0
                          ? "explore-card--featured"
                          : ""
                      }`}
                    >

                      <div className="explore-card__image">

                        <img
                          src={destination.imageUrl}
                          alt={destination.name}
                          loading={
                            index > 1
                              ? "lazy"
                              : "eager"
                          }
                        />

                      </div>

                      <div className="explore-card__overlay" />

                      <div className="explore-card__index">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="explore-card__content">

                        <div>

                          <span className="explore-card__region">
                            {destination.country}
                          </span>

                          <h3>
                            {destination.name}
                          </h3>

                          <p>
                            {destination.description}
                          </p>

                        </div>

                        <span
                          className="explore-card__action"
                          aria-hidden="true"
                        >
                          Explore

                          <span>
                            ↗
                          </span>
                        </span>

                      </div>

                    </Link>
                  )
                )}

              </div>
            )}

          {/* EMPTY */}

          {!error &&
            !loading &&
            destinations.length === 0 && (
              <div className="explore-empty">

                <span className="explore-empty__number">
                  00
                </span>

                <h3>
                  No destinations found.
                </h3>

                <p>
                  Try searching for another place.
                </p>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearFilters}
                >
                  View all destinations
                </button>

              </div>
            )}

        </div>

      </section>

      {/* ─────────────────────────────
          CUSTOM JOURNEY
      ───────────────────────────── */}

      <section className="explore-custom">

        <div className="container">

          <div className="explore-custom__inner">

            <div>

              <p className="eyebrow">
                Nothing quite right?
              </p>

              <h2 className="display-md">
                Create your own
                <br />
                journey.
              </h2>

            </div>

            <div className="explore-custom__content">

              <p>
                Tell us where you want to go, how
                you want to travel, and what matters
                to you.
              </p>

              <Link
                to="/custom-trip"
                className="btn btn-primary"
              >
                Plan a custom trip
                <span aria-hidden="true">
                  →
                </span>
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Explore;