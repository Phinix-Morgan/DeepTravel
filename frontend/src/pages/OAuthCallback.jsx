import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/auth.css";

function OAuthCallback() {
  const navigate = useNavigate();

  const {
    completeOAuthLogin,
  } = useAuth();

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function completeLogin() {
      try {
        await completeOAuthLogin();

        if (!mounted) {
          return;
        }

        navigate("/trips", {
          replace: true,
        });
      } catch (callbackError) {
        if (!mounted) {
          return;
        }

        setError(
          callbackError?.message ||
            "Unable to complete Google sign-in."
        );
      }
    }

    completeLogin();

    return () => {
      mounted = false;
    };
  }, [
    completeOAuthLogin,
    navigate,
  ]);

  return (
    <main className="auth-page">

      <section className="auth-page__form-panel">

        <div className="auth-page__form-container">

          <div className="auth-page__brand">
            DEEP<span>TRAVEL</span>.
          </div>

          {!error ? (
            <>
              <div className="auth-page__heading">

                <p className="eyebrow">
                  Google sign-in
                </p>

                <h1>
                  Welcome to
                  <br />
                  Hubsafari.
                </h1>

                <p>
                  Completing your sign-in.
                  Just a moment.
                </p>

              </div>

              <div
                className="auth-form__success"
                role="status"
              >
                Signing you in...
              </div>
            </>
          ) : (
            <>
              <div className="auth-page__heading">

                <p className="eyebrow">
                  Sign-in failed
                </p>

                <h1>
                  We couldn't
                  <br />
                  sign you in.
                </h1>

                <p>
                  Something went wrong while
                  completing Google sign-in.
                </p>

              </div>

              <div
                className="auth-form__error"
                role="alert"
              >
                {error}
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
                Back to sign in →
              </button>
            </>
          )}

        </div>

      </section>

    </main>
  );
}

export default OAuthCallback;
