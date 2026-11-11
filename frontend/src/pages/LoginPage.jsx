
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        rememberMe
      });

      if (response.data.success) {
        console.log("Logged-in user:", response.data.user);
        navigate("/dashboard");
      } else {
        setError(
          response.data.message || "Login failed. Please try again."
        );
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );

      console.error("Login error:", err);

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      <section className="auth-card">

        <p className="auth-tagline">
          WELCOME BACK, CHALLENGER
        </p>

        <h1>BACK TO THE ARENA.</h1>

        <p className="auth-description">
          Log in and continue your coding battles.
        </p>

        <form className="auth-form" onSubmit={handleLogin}>

          <div className="auth-form-group">
            <label htmlFor="login-email">
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              id="login-email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-form-group">

            <label htmlFor="login-password">
              PASSWORD
            </label>

            <div className="auth-password">

              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <div className="auth-options">

            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            <Link to="/forgot-password">
              Forgot password?
            </Link>

          </div>

          {error && (
            <p role="alert" className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "ENTERING..." : "ENTER THE ARENA →"}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create account
          </Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to homepage
        </Link>

      </section>

    </AuthLayout>
  );
}

export default LoginPage;
