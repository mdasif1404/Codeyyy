
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      password.length < 8 ||
      new TextEncoder().encode(password).length > 72
    ) {
      setError("Password must be at least 8 characters and no more than 72 bytes.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password
      });

      if (response.data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Password reset failed.");
      }
    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        err.response?.data?.message ||
        "Reset link is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <section className="auth-card">
        <p className="auth-tagline">ACCOUNT RECOVERY</p>

        <h1>RESET PASSWORD.</h1>

        <p className="auth-description">
          Choose a new password for your Codyyy account.
        </p>

        {!token ? (
          <>
            <p role="alert" className="auth-error">
              Invalid or missing password reset link.
            </p>

            <Link to="/forgot-password" className="auth-submit">
              REQUEST NEW RESET LINK
            </Link>
          </>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="new-password">NEW PASSWORD</label>

              <div className="auth-password">
                <input
                  type={showPassword ? "text" : "password"}
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="confirm-password">CONFIRM PASSWORD</label>

              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
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
              disabled={loading || !!success}
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD →"}
            </button>
          </form>
        )}

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

export default ResetPassword;
