import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { resetPassword } from "../services/auth";

import "../styles/auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "This password reset link is invalid."
      );
      return;
    }

    if (!form.password) {
      setError(
        "Please enter a new password."
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
      await resetPassword(
        token,
        form.password
      );

      setSuccess(
        "Your password has been reset successfully. Redirecting to sign in..."
      );

      setForm({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1800);
    } catch (resetError) {
      setError(
        resetError?.message ||
          "Unable to reset your password. The link may have expired."
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
            Hubsafari
          </p>

          <h2>
            Every journey
            <br />
            deserves
            <br />
            another beginning.
          </h2>

          <p>
            Set a new password and
            continue discovering the
            world on your terms.
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
              Reset password
            </p>

            <h1>
              Create a
              <br />
              new password.
            </h1>

            <p>
              Choose a new password for
              your Hubsafari account.
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

            {/* PASSWORD */}

            <div className="auth-form__field">

              <label htmlFor="reset-password">
                New password
              </label>

              <div className="auth-form__password">

                <input
                  id="reset-password"
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
                  autoFocus
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
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="auth-form__field">

              <label htmlFor="reset-confirm-password">
                Confirm password
              </label>

              <input
                id="reset-confirm-password"
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
                placeholder="Repeat your new password"
                autoComplete="new-password"
                required
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-form__submit"
              disabled={
                loading || Boolean(success)
              }
            >
              {loading
                ? "Resetting..."
                : "Reset password →"}
            </button>

          </form>


          {/* ==================================================
              FOOTER
              ================================================== */}

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

export default ResetPassword;
