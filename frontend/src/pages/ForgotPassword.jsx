import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../services/auth";

import "../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(normalizedEmail);

      setSuccess(
        "If an account exists for this email, a password reset link has been sent."
      );

      setEmail("");
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
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
            Hubsafari
          </p>

          <h2>
            Some journeys
            <br />
            begin with
            <br />
            finding your way back.
          </h2>

          <p>
            Don't worry. Your journeys are
            still waiting for you.
          </p>
        </div>
      </section>

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
              Account recovery
            </p>

            <h1>
              Find your
              <br />
              way back.
            </h1>

            <p>
              Enter the email associated with
              your account and we'll send you
              instructions to reset your password.
            </p>
          </div>

          {error && (
            <div
              className="auth-form__error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="auth-form__success"
              role="status"
            >
              {success}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="auth-form__field">
              <label htmlFor="forgot-email">
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (error) {
                    setError("");
                  }

                  if (success) {
                    setSuccess("");
                  }
                }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send reset link →"}
            </button>
          </form>

          <p className="auth-page__footer">
            Remember your password?{" "}

            <Link to="/login">
              Back to sign in →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
