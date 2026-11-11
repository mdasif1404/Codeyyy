
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Connect your existing registration API logic here.
    console.log("Registration submitted");
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

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="auth-form-group">
            <label htmlFor="register-username">
              USERNAME
            </label>

            <input
              type="text"
              id="register-username"
              name="username"
              placeholder="Choose a username"
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
                autoComplete="new-password"
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
