
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="site-header">
      <Link to="/" className="logo-link">
        <img
          src="/assets/codeyyy-logo.jpg"
          alt="CODEYYY Logo"
        />
      </Link>

      <nav className="pixel-nav">
        <Link to="/how-it-works" className="nav-pixel">
          <span>HOW IT WORKS</span>
        </Link>

        <Link to="/login" className="nav-pixel">
          <span>LOG IN</span>
        </Link>

        <Link to="/register" className="nav-pixel nav-register">
          <span>SIGN UP</span>
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;
