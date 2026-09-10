import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              HUBSAFARI
            </Link>

            <p>
              Journeys worth remembering.
            </p>
          </div>

          <div className="footer__links">
            <div className="footer__group">
              <span className="footer__heading">
                Explore
              </span>

              <Link to="/explore">Destinations</Link>
              <Link to="/explore">Journeys</Link>
              <Link to="/custom-trip">Custom Trips</Link>
            </div>

            <div className="footer__group">
              <span className="footer__heading">
                Account
              </span>

              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/trips">My Trips</Link>
            </div>

            <div className="footer__group">
              <span className="footer__heading">
                Hubsafari
              </span>

              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/support">Support</Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} Hubsafari
          </span>

          <span>
            Travel deeper. Experience more.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
