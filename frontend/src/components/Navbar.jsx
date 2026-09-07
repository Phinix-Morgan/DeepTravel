import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    label: "Explore",
    to: "/explore",
    public: true,
  },
  {
    label: "My Trips",
    to: "/trips",
    protected: true,
  },
  {
    label: "Custom Trip",
    to: "/custom-trip",
    protected: true,
  },
];

function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const visibleItems = navItems.filter(
    (item) =>
      item.public ||
      (item.protected && isAuthenticated)
  );

  async function handleLogout() {
    try {
      await logout();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

  const userName =
    user?.name?.trim() || "Traveler";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <header className="navbar">
      <div className="navbar__inner">

        {/* ==================================================
            BRAND
            ================================================== */}

        <Link
          to="/"
          className="navbar__brand"
          aria-label="DeepTravel home"
        >
          <span
            className="navbar__brand-mark"
            aria-hidden="true"
          >
            D
          </span>

          <span>
            DEEPTRAVEL
          </span>
        </Link>


        {/* ==================================================
            NAVIGATION
            ================================================== */}

        <nav
          className="navbar__nav"
          aria-label="Main navigation"
        >
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `navbar__link ${
                  isActive
                    ? "navbar__link--active"
                    : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated && user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `navbar__link ${
                  isActive ? "navbar__link--active" : ""
                }`
              }
            >
              Admin Panel
            </NavLink>
          )}
        </nav>


        {/* ==================================================
            ACTIONS
            ================================================== */}

        <div className="navbar__actions">

          {/* ------------------------------------------------
              AUTH LOADING
              ------------------------------------------------ */}

          {loading ? (
            <span
              className="navbar__auth-loading"
              aria-live="polite"
            >
              ...
            </span>
          ) : isAuthenticated ? (

            /* ------------------------------------------------
               AUTHENTICATED USER
               ------------------------------------------------ */

            <>
              <Link
                to="/trips"
                className="navbar__user"
                title="My Trips"
                aria-label={`My Trips — ${userName}`}
              >
                <span
                  className="navbar__user-avatar"
                  aria-hidden="true"
                >
                  {userInitial}
                </span>

                <span
                  className="navbar__user-name"
                >
                  {userName}
                </span>
              </Link>

              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost navbar__logout"
              >
                Logout
              </button>
            </>

          ) : (

            /* ------------------------------------------------
               GUEST USER
               ------------------------------------------------ */

            <>
              <Link
                to="/login"
                className="btn btn-ghost navbar__login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-primary"
              >
                Get started
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;
