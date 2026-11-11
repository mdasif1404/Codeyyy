
import { Link } from "react-router-dom";
import "../styles/auth.css";

function AuthLayout({ children }) {
  return (
    <main className="auth-page">

      {/* Animated background layers */}
      <div className="auth-background" aria-hidden="true">
        <div className="auth-glow auth-glow-one"></div>
        <div className="auth-glow auth-glow-two"></div>
        <div className="auth-grid"></div>
      </div>

      {/* Codyyy logo */}
      <Link to="/" className="auth-logo-link">
        <img
          src="/assets/codeyyy-logo.jpg"
          alt="Codyyy Logo"
          className="auth-logo"
        />
      </Link>

      {/* Login or signup content */}
      <div className="auth-content">
        {children}
      </div>

    </main>
  );
}

export default AuthLayout;
