
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login submitted");
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
          WELCOME BACK, CHALLENGER
        </p>

        <h1>BACK TO THE ARENA.</h1>

        <p className="auth-description">
          Log in and continue your coding battles.
        </p>

        <form onSubmit={handleLogin}>

          <div className="auth-form-group">
            <label htmlFor="login-email">EMAIL ADDRESS</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="login-password">PASSWORD</label>

            <div className="auth-password">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-submit">
            ENTER THE ARENA →
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/register"> Create account</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to homepage
        </Link>

      </main>
    </div>
  );
}

export default LoginPage;
