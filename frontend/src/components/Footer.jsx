
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="pixel-footer">

      <div className="footer-brand">
        <span>■</span>
        CODEYYY - THE CODING BATTLE ARENA
        <span>■</span>
      </div>

      <div className="footer-links">

        <a href="mailto:hello@codeyyy.com">
          CONTACT US
        </a>

        <div className="footer-divider"></div>

        <Link to="/how-it-works">
          LEARN MORE
        </Link>

      </div>

    </footer>
  );
}

export default Footer;
