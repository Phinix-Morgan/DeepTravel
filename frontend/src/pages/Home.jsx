import { Link } from "react-router-dom";
import FeaturedDestinations from "../components/FeaturedDestinations";

function Home() {
  return (
    <div className="home">
      {/* ─────────────────────────────────────
          HERO
      ───────────────────────────────────── */}

      <section className="hero">
        <div className="hero__background">
          <img
            src="https://images.unsplash.com/photo-1595815771614-ade9d652a65d"
            alt="Kashmir mountain landscape"
          />
        </div>

        <div className="hero__overlay" />

        <div className="hero__content container">
          <div className="hero__copy">
            <p className="eyebrow">
              Discover deeper journeys
            </p>

            <h1 className="display-xl">
              Go somewhere
              <br />
              that changes you.
            </h1>

            <p className="hero__description">
              Discover extraordinary places, carefully crafted
              journeys, and experiences worth remembering.
            </p>

            <div className="hero__actions">
              <Link
                to="/explore"
                className="btn btn-primary"
              >
                Explore journeys
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                to="/custom-trip"
                className="btn btn-secondary"
              >
                Plan a custom trip
              </Link>
            </div>
          </div>

          <div className="hero__meta">
            <span>01</span>

            <div className="hero__line">
              <span />
            </div>

            <span>KASHMIR</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────
          FEATURED DESTINATIONS
      ───────────────────────────────────── */}

      <FeaturedDestinations />

      {/* ─────────────────────────────────────
          TRAVEL PHILOSOPHY
      ───────────────────────────────────── */}

      <section className="section intro">
        <div className="content-width intro__inner">
          <div>
            <p className="eyebrow">
              Travel differently
            </p>

            <h2 className="display-md">
              Not just places.
              <br />
              Stories waiting to happen.
            </h2>
          </div>

          <p className="intro__text text-soft">
            From mountain escapes to quiet coastal retreats,
            DeepTravel helps you discover journeys designed
            around the way you actually want to travel.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────
          CUSTOM TRIP
      ───────────────────────────────────── */}

      <section className="custom-cta">
        <div className="custom-cta__content content-width">
          <p className="eyebrow">
            Your journey. Your way.
          </p>

          <h2 className="display-lg">
            Don't find your trip.
            <br />
            Create it.
          </h2>

          <p>
            Tell us where you want to go, how you want to
            travel, and what matters to you. We'll help shape
            the journey.
          </p>

          <Link
            to="/custom-trip"
            className="btn btn-primary"
          >
            Build my journey
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
