
import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase()
      });

      if (response.data.success) {
        setSuccess(response.data.message);
      } else {
        setError(response.data.message || "Unable to process request.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <section className="auth-card">
        <p className="auth-tagline">ACCOUNT RECOVERY</p>

        <h1>FORGOT PASSWORD?</h1>

        <p className="auth-description">
          Enter your registered email address and we'll send you
          a password reset link.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="forgot-email">EMAIL ADDRESS</label>

            <input
              type="email"
              id="forgot-email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {error && (
            <p role="alert" className="auth-error">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="auth-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "SENDING..." : "SEND RESET LINK →"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/login">Back to login</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to homepage
        </Link>
      </section>
    </AuthLayout>
  );
}

export default ForgotPassword;
