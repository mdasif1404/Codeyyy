
import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        setSuccess(
          response.data.message || "Account created successfully!"
        );

        setUsername("");
        setEmail("");
        setPassword("");

        console.log("Registered user:", response.data.user);
      } else {
        setError(
          response.data.message || "Registration failed."
        );
      }

    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      <section className="auth-card auth-card-register">

        <p className="auth-tagline">
          YOUR BATTLE STARTS HERE
        </p>

        <h1>CLAIM YOUR SPOT.</h1>

        <p className="auth-description">
          Create your CODYEYY account.
        </p>

        <form className="auth-form" onSubmit={handleRegister}>

          <div className="auth-form-group">

            <label htmlFor="register-username">
              USERNAME
            </label>

            <input
              type="text"
              id="register-username"
              name="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              autoComplete="username"
              required
            />

          </div>

          <div className="auth-form-group">

            <label htmlFor="register-email">
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              id="register-email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

          </div>

          <div className="auth-form-group">

            <label htmlFor="register-password">
              PASSWORD
            </label>

            <div className="auth-password">

              <input
                type={showPassword ? "text" : "password"}
                id="register-password"
                name="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
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
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
          </button>

        </form>

        <p className="auth-switch">
          Already registered?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to homepage
        </Link>

      </section>

    </AuthLayout>
  );
}

export default RegisterPage;
