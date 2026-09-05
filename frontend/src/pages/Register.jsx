import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getGoogleLoginUrl } from "../services/auth";

import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const {
    register,
    login,
  } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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

    if (success) {
      setSuccess("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (name.length < 2) {
      setError(
        "Your name must contain at least 2 characters."
      );
      return;
    }

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!form.password) {
      setError(
        "Please create a password."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      await register(
        name,
        email,
        form.password
      );

      /*
       * The backend may require email
       * verification before normal access.
       *
       * We attempt login here because some
       * backend configurations allow the
       * newly registered account to log in
       * immediately.
       */

      try {
        await login(
          email,
          form.password
        );

        navigate("/trips", {
          replace: true,
        });
      } catch (loginError) {
        /*
         * Registration itself succeeded.
         * If login is blocked because email
         * verification is required, show a
         * useful message instead of treating
         * registration as a failure.
         */

        setSuccess(
          loginError?.message ||
            "Your account was created. Please verify your email before signing in."
        );
      }
    } catch (registerError) {
      setError(
        registerError?.message ||
          "Unable to create your account. Please try again."
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
            src="/src/assets/hero.png"
            alt="A journey waiting to be discovered"
          />
        </div>

        <div className="auth-page__visual-overlay" />

        <div className="auth-page__visual-content">

          <p className="eyebrow">
            DeepTravel
          </p>

          <h2>
            Don't just visit
            <br />
            somewhere.
            <br />
            Experience it.
          </h2>

          <p>
            Create your account and
            start building journeys
            worth remembering.
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
            DEEP<span>TRAVEL</span>.
          </Link>


          <div className="auth-page__heading">

            <p className="eyebrow">
              Begin your journey
            </p>

            <h1>
              Create your
              <br />
              account.
            </h1>

            <p>
              Your journeys,
              destinations, and
              discoveries — all in
              one place.
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
              SUCCESS
              ================================================== */}

          {success && (
            <div
              className="auth-form__success"
              role="status"
            >
              {success}
            </div>
          )}


          {/* ==================================================
              REGISTER FORM
              ================================================== */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* NAME */}

            <div className="auth-form__field">

              <label htmlFor="register-name">
                Name
              </label>

              <input
                id="register-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                autoFocus
                required
              />

            </div>


            {/* EMAIL */}

            <div className="auth-form__field">

              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="auth-form__field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="auth-form__password">

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
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


            {/* CONFIRM PASSWORD */}

            <div className="auth-form__field">

              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <input
                id="register-confirm-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-form__submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account →"}
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
              LOGIN
              ================================================== */}

          <p className="auth-page__footer">
            Already have an account?{" "}

            <Link to="/login">
              Sign in →
            </Link>
          </p>

        </div>

      </section>

    </main>
  );
}

export default Register;
