import { useState } from "react";
import { Link } from "react-router-dom";

import { resendVerificationEmail } from "../services/auth";

import "../styles/auth.css";

function ResendVerification() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await resendVerificationEmail(
          normalizedEmail
        );

      setSuccess(
        response.message ||
          "If your account requires verification, a new verification email has been sent."
      );

      setEmail("");
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to resend the verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            Your journey
            <br />
            is waiting
            <br />
            for you.
          </h2>

          <p>
            One more step and you'll
            be ready to explore.
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
              Email verification
            </p>

            <h1>
              Verify your
              <br />
              account.
            </h1>

            <p>
              Enter your email and we'll
              send you a fresh verification
              link.
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
              FORM
              ================================================== */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            <div className="auth-form__field">

              <label htmlFor="verification-email">
                Email
              </label>

              <input
                id="verification-email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );

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
                : "Resend verification →"}
            </button>

          </form>


          {/* ==================================================
              FOOTER
              ================================================== */}

          <p className="auth-page__footer">
            Already verified?{" "}

            <Link to="/login">
              Sign in →
            </Link>
          </p>

          <p className="auth-page__footer">
            Need an account?{" "}

            <Link to="/register">
              Create one →
            </Link>
          </p>

        </div>

      </section>

    </main>
  );
}

export default ResendVerification;