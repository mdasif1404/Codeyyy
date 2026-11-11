import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* Background video */}
      <video className="dashboard-video" autoPlay muted loop playsInline>
        <source src="/assets/videos/red-arcade-glow.mp4" type="video/mp4" />
      </video>

      <div className="dashboard-overlay"></div>

      {/* NAVBAR */}
      <header className="dashboard-header">
        <Link to="/" className="dashboard-logo">
          <img src="/assets/codyyy-logo.jpg" alt="Codyyy Logo" />
        </Link>

        <div className="dashboard-greeting">
          HEY YA!
        </div>

        <nav className="dashboard-nav">
          <span className="leaderboard-link">
            LEADERBOARD
          </span>

          <Link to="/login" className="profile-link" title="Log in">
            <span className="profile-icon">H</span>
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <section className="dashboard-intro">
          <p className="dashboard-eyebrow">
            WELCOME TO THE ARENA
          </p>
          <h1>
            CHOOSE YOUR <span>BATTLE.</span>
          </h1>
          <p>
            Challenge your friends, create your own arena
            or compete against players around the world.
          </p>
        </section>

        {/* PRIVATE AND TEMPORARY ROOMS */}
        <section className="room-grid">
          {/* PRIVATE ROOM */}
          <article className="room-card private-card">
            <div className="room-card-content">
              <span className="room-number">01 / PRIVATE</span>
              <h2>PRIVATE ROOM</h2>
              <p>
                Your friends. Your room. Your rules.
                Create a private coding battle and
                invite your squad.
              </p>
              <button className="room-action" disabled>
                CREATE / JOIN ROOM
                <span>→</span>
              </button>
            </div>
          </article>

          {/* TEMPORARY ROOM */}
          <article className="room-card temporary-card">
            <div className="room-card-content">
              <span className="room-number">02 / QUICK MATCH</span>
              <h2>TEMPORARY ROOM</h2>
              <p>
                Jump into a quick battle.
                Play a match without maintaining
                a permanent room.
              </p>
              <button className="room-action" disabled>
                QUICK MATCH
                <span>→</span>
              </button>
            </div>
          </article>
        </section>

        {/* GLOBAL ARENA */}
        <section className="global-arena-card">
          <div className="global-arena-content">
            <span className="room-number">
              03 / WORLDWIDE BATTLE
            </span>
            <h2>GLOBAL ARENA</h2>
            <p>
              No squad? No problem. Find players online
              and prove your coding skills against the world.
            </p>
            <button className="global-arena-button" disabled>
              ENTER GLOBAL ARENA →
            </button>
          </div>

          <div className="arena-status">
            <span className="status-dot"></span>
            GLOBAL MATCHMAKING
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <div className="footer-brand">
          CODYEYY<span>.</span>
          <small>THE CODING BATTLE</small>
        </div>

        <div className="dashboard-footer-links">
          <Link to="/how-it-works">HOW IT WORKS</Link>
          <a href="mailto:support@codyyy.com">CONTACT US</a>
          <span>© 2026 CODYEYY</span>
        </div>
      </footer>

    </div>
  );
}

export default Dashboard;