
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(60);

  // If someone opens this page directly without an email,
  // send them back to registration.
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Resend OTP countdown.
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email", {
        email,
        otp
      });

      if (response.data.success) {
        // Backend has already set the HttpOnly JWT cookie.
        navigate("/dashboard", { replace: true });
      } else {
        setError(
          response.data.message || "OTP verification failed."
        );
      }
    } catch (err) {
      console.error("OTP verification error:", err);

      setError(
        err.response?.data?.message ||
        "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await api.post("/auth/resend-otp", {
        email
      });

      if (response.data.success) {
        setMessage(
          response.data.message || "A new OTP has been sent."
        );

        setOtp("");
        setCountdown(60);
      } else {
        setError(
          response.data.message || "Could not resend OTP."
        );
      }
    } catch (err) {
      console.error("Resend OTP error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <section className="auth-card">
        <p className="auth-tagline">
          ONE LAST STEP, CHALLENGER
        </p>

        <h1>VERIFY YOUR EMAIL.</h1>

        <p className="auth-description">
          We've sent a 6-digit verification code to:
        </p>

        <p className="verify-email-address">
          {email}
        </p>

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="auth-form-group">
            <label htmlFor="verification-otp">
              ENTER YOUR OTP
            </label>

            <input
              type="text"
              id="verification-otp"
              name="otp"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setOtp(value);
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <p role="alert" className="auth-error">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="auth-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "VERIFYING..." : "VERIFY EMAIL →"}
          </button>
        </form>

        <div className="verify-resend">
          <p>Didn't receive the code?</p>

          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
          >
            {resending
              ? "SENDING..."
              : countdown > 0
                ? `RESEND OTP IN ${countdown}s`
                : "RESEND OTP"}
          </button>
        </div>

        <Link to="/register" className="auth-back">
          ← Back to registration
        </Link>
      </section>
    </AuthLayout>
  );
}

export default VerifyEmailPage;
