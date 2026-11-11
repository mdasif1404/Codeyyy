
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Connect your existing login API logic here.
    console.log("Login submitted");
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

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="auth-form-group">
            <label htmlFor="login-email">
              EMAIL ADDRESS
            </label>

            <input
              type="email"
              id="login-email"
              name="email"
              placeholder="Enter your email"
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

            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />
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
