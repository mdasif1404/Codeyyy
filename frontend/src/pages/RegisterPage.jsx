
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Registration submitted");
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
              minLength={3}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="register-email">EMAIL ADDRESS</label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
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
                minLength={8}
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

          <button type="submit" className="auth-submit">
            CREATE ACCOUNT →
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
