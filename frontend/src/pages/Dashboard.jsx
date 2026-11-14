import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* BACKGROUND VIDEO */}
      <video
        className="dashboard-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="/videos/red-arcade-glow.mp4"
          type="video/mp4"
        />
        Your browser does not support the video element.
      </video>

      {/* DARK OVERLAY */}
      <div className="dashboard-overlay"></div>

      {/* NAVBAR */}
      <header className="dashboard-header">

        {/* LEFT: CODYEYY LOGO */}
        <Link to="/" className="dashboard-logo">
          <img
            src="/assets/codeyyy-logo.jpg"
            alt="Codyyy Logo"
            onError={(e) => {
              console.error("Logo failed to load:", e.currentTarget.src);
            }}
          />
        </Link>

        {/* CENTRE: HEY YA ANIMATION */}
        <div className="dashboard-hero-animation">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              src="/videos/hey-ya.mp4"
              type="video/mp4"
            />
            Your browser does not support video.
          </video>
        </div>

        {/* RIGHT: LEADERBOARD + PROFILE */}
        <nav className="dashboard-nav" aria-label="Dashboard navigation">

          {/* PIXEL LEADERBOARD */}
          <span className="leaderboard-link">
            <svg
              className="leaderboard-icon"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <path
                d="M7 3V29M25 3V29M7 7H25M7 14H25M7 21H25M7 28H25"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
              />
            </svg>

            <span>LEADERBOARD</span>
          </span>

          {/* ANIMATED PROFILE VIDEO */}
          <Link
            to="/login"
            className="profile-link"
            title="Profile / Log in"
            aria-label="Profile or log in"
          >
            <video
              className="profile-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source
                src="/videos/profile-eye.mp4"
                type="video/mp4"
              />
            </video>
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
              <span className="room-number">
                01 / PRIVATE
              </span>

              <h2>PRIVATE ROOM</h2>

              <p>
                Your friends. Your room. Your rules.
                Create a private coding battle and
                invite your squad.
              </p>

              <Link to="/private-room" className="room-action">
                CREATE / JOIN ROOM
                <span>→</span>
              </Link>
            </div>
          </article>

          {/* TEMPORARY ROOM */}
          <article className="room-card temporary-card">
            <div className="room-card-content">
              <span className="room-number">
                02 / QUICK MATCH
              </span>

              <h2>TEMPORARY ROOM</h2>

              <p>
                Jump into a quick battle.
                Play a match without maintaining
                a permanent room.
              </p>

              <Link to="/temporary-room" className="room-action">
                QUICK MATCH
                <span>→</span>
              </Link>
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
          <Link to="/how-it-works">
            HOW IT WORKS
          </Link>

          <span>CONTACT US</span>

          <span>© 2026 CODYEYY</span>
        </div>

      </footer>

    </div>
  );
}

export default Dashboard;