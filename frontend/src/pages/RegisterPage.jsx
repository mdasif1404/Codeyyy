
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Request states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data.success) {
        setSuccess(response.data.message);

        // Clear form after successful registration
        setUsername("");
        setEmail("");
        setPassword("");

        console.log("Registered user:", response.data.user);
      }

    } catch (err) {
  console.error("Registration error:", err);
  console.log("Error response:", err.response);
  console.log("Error status:", err.response?.status);
  console.log("Error data:", err.response?.data);

  setError(
    err.response?.data?.message ||
    err.message ||
    "Registration failed. Please try again."
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <Link to="/" className="auth-logo-link">
        <img
          src="/assets/codeyyy-logo.jpg"
          alt="CODEYYY Logo"
          className="auth-logo"
        />
      </Link>

      <main className="auth-card">

        <p className="auth-tagline">
          JOIN THE BATTLE
        </p>

        <h1>CLAIM YOUR SPOT.</h1>

        <p className="auth-description">
          Create your CODEYYY account.
        </p>

        <form onSubmit={handleRegister}>

          <div className="auth-form-group">
            <label htmlFor="register-username">USERNAME</label>

            <input
              id="register-username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="register-email">EMAIL ADDRESS</label>

            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="register-password">PASSWORD</label>

            <div className="auth-password">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
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

          {/* Error message */}
          {error && (
            <p role="alert" style={{ color: "#ff5555" }}>
              {error}
            </p>
          )}

          {/* Success message */}
          {success && (
            <p role="status" style={{ color: "#22c55e" }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
          </button>

        </form>

        <p className="auth-switch">
          Already registered?
          <Link to="/login"> Log in</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to homepage
        </Link>

      </main>
    </div>
  );
}

export default RegisterPage;
