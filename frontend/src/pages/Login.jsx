import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getGoogleLoginUrl } from "../services/auth";

import heroImage from "../assets/auth-hero.png";

import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const destination =
    location.state?.from || "/trips";

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await login(
        form.email.trim(),
        form.password
      );

      navigate(destination, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = getGoogleLoginUrl();
  }

  return (
    <main className="auth-page">

      {/* ==================================================
          VISUAL
          ================================================== */}

      <section className="auth-page__visual">

        <div className="auth-page__visual-image">
          <img
            src={heroImage}
            alt="Mountain landscape at dusk"
          />
        </div>

        <div className="auth-page__visual-overlay" />

        <div className="auth-page__visual-content auth-page__visual-content--login">

          <p className="eyebrow">
            Hubsafari
          </p>

          <h2>
            The world feels
            <br />
            different when
            <br />
            you go deeper.
          </h2>

          <p>
            Return to the journeys,
            places, and experiences
            waiting to be discovered.
          </p>

        </div>

      </section>


      {/* ==================================================
          FORM
          ================================================== */}

      <section className="auth-page__form-panel">

        <div className="auth-page__form-container">

          <Link
            to="/"
            className="auth-page__brand"
          >
            HUBSAFARI
          </Link>


          <div className="auth-page__heading">

            <p className="eyebrow">
              Welcome back
            </p>

            <h1>
              Continue your
              <br />
              journey.
            </h1>

            <p>
              Sign in to access your
              saved journeys and
              discoveries.
            </p>

          </div>


          {/* ==================================================
              ERROR
              ================================================== */}

          {error && (
            <div
              className="auth-form__error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* ==================================================
              LOGIN FORM
              ================================================== */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* EMAIL */}

            <div className="auth-form__field">

              <label htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="auth-form__field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="auth-form__password">

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-form__password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* FORGOT PASSWORD */}

            <div className="auth-form__meta">

              <Link
                to="/forgot-password"
                className="auth-form__link"
              >
                Forgot password?
              </Link>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-form__submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in →"}
            </button>

          </form>


          {/* ==================================================
              GOOGLE
              ================================================== */}

          <div className="auth-divider">
            <span>Or</span>
          </div>

          <button
            type="button"
            className="auth-google"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>


          {/* ==================================================
              REGISTER
              ================================================== */}

          <p className="auth-page__footer">
            New to Hubsafari?{" "}

            <Link to="/register">
              Create an account →
            </Link>
          </p>

        </div>

      </section>

    </main>
  );
}

export default Login;
