import {
  useEffect,
  useState,
} from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

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

  const navigationItems = [
    ...visibleItems,
    ...(isAuthenticated && user?.role === "admin"
      ? [{ label: "Admin Panel", to: "/admin" }]
      : []),
  ];

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  async function handleLogout() {
    closeMobileMenu();

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
          onClick={closeMobileMenu}
        >
          <span
            className="navbar__brand-mark"
            aria-hidden="true"
          >
            D
          </span>

          <span className="navbar__wordmark">
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
          {navigationItems.map((item) => (
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

        <button
          type="button"
          className="navbar__menu-toggle"
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="navbar__backdrop"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
          />

          <section
            id="mobile-navigation"
            className="navbar__mobile-panel"
            aria-label="Mobile navigation"
          >
            <nav className="navbar__mobile-nav" aria-label="Main navigation">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `navbar__mobile-link ${
                      isActive ? "navbar__mobile-link--active" : ""
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="navbar__mobile-actions">
              {loading ? (
                <span className="navbar__auth-loading" aria-live="polite">
                  ...
                </span>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="navbar__mobile-logout"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    Get started
                  </Link>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </header>
  );
}

export default Navbar;
