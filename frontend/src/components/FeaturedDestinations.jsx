import { Link } from "react-router-dom";
import destinations from "../data/destinations";

function FeaturedDestinations() {
  const featuredDestinations = destinations.slice(0, 3);

  return (
    <section className="featured-destinations section">
      <div className="container">
        <div className="featured-destinations__heading">
          <div>
            <p className="eyebrow">Start exploring</p>

            <h2 className="display-md">
              Places worth going
              <br />
              deeper for.
            </h2>
          </div>

          <Link
            to="/explore"
            className="featured-destinations__view-all"
          >
            View all destinations
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="featured-destinations__grid">
          {featuredDestinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/explore?destination=${encodeURIComponent(destination.name)}`}
              className={`destination-card ${
                destination.featured
                  ? "destination-card--featured"
                  : ""
              }`}
            >
              <div className="destination-card__image">
                <img
                  src={destination.image}
                  alt={`${destination.name}, ${destination.region}`}
                  loading="lazy"
                />
              </div>

              <div className="destination-card__overlay" />

              <div className="destination-card__content">
                <div>
                  <span className="destination-card__region">
                    {destination.region}
                  </span>

                  <h3>{destination.name}</h3>

                  <p>{destination.description}</p>
                </div>

                <span
                  className="destination-card__arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedDestinations;