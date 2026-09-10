import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import "../styles/auth.css";

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const API_BASE_URL =
  `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "")}/api`;

function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] =
    useState("verifying");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage(
          "This verification link is invalid."
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email/${encodeURIComponent(
            token
          )}`
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setStatus("error");
          setMessage(
            data.message ||
              "Unable to verify your email address. The link may have expired."
          );
          return;
        }

        setStatus("success");
        setMessage(
          data.message ||
            "Your email address has been verified successfully."
        );
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            "Unable to connect to Hubsafari. Please try again."
          );
        }
      }
    }

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [token]);

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
            Hubsafari
          </p>

          <h2>
            Before every
            <br />
            journey,
            <br />
            comes a beginning.
          </h2>

          <p>
            One small step before
            you set out into the world.
          </p>

        </div>

      </section>


      {/* ==================================================
          VERIFICATION
          ================================================== */}

      <section className="auth-page__form-panel">

        <div className="auth-page__form-container">

          <Link
            to="/"
            className="auth-page__brand"
          >
            DEEP<span>TRAVEL</span>.
          </Link>


          {/* ==================================================
              VERIFYING
              ================================================== */}

          {status === "verifying" && (
            <>
              <div className="auth-page__heading">

                <p className="eyebrow">
                  Email verification
                </p>

                <h1>
                  Verifying your
                  <br />
                  email.
                </h1>

                <p>
                  Just a moment while we
                  confirm your email address.
                </p>

              </div>

              <div className="auth-form__success">
                Verifying your account...
              </div>
            </>
          )}


          {/* ==================================================
              SUCCESS
              ================================================== */}

          {status === "success" && (
            <>
              <div className="auth-page__heading">

                <p className="eyebrow">
                  Verification complete
                </p>

                <h1>
                  You're ready
                  <br />
                  to explore.
                </h1>

                <p>
                  Your email address has been
                  successfully verified.
                </p>

              </div>

              <div
                className="auth-form__success"
                role="status"
              >
                {message}
              </div>

              <button
                type="button"
                className="auth-form__submit"
                onClick={() =>
                  navigate("/login", {
                    replace: true,
                  })
                }
              >
                Continue to sign in →
              </button>
            </>
          )}


          {/* ==================================================
              ERROR
              ================================================== */}

          {status === "error" && (
            <>
              <div className="auth-page__heading">

                <p className="eyebrow">
                  Verification failed
                </p>

                <h1>
                  We couldn't
                  <br />
                  verify you.
                </h1>

                <p>
                  This verification link may be
                  invalid or expired.
                </p>

              </div>

              <div
                className="auth-form__error"
                role="alert"
              >
                {message}
              </div>

              <div className="auth-page__footer">
                <Link to="/login">
                  Back to sign in →
                </Link>
              </div>

              <div className="auth-page__footer">
                Need another verification email?{" "}

                <Link to="/resend-verification">
                  Resend verification →
                </Link>
              </div>
            </>
          )}

        </div>

      </section>

    </main>
  );
}

export default EmailVerification;
