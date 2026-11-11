
import React from "react";
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
      >
        <source
          src="/videos/red-arcade-glow.mp4"
          type="video/mp4"
        />
      </video>

      <div className="dashboard-overlay"></div>

      {/* NAVBAR */}
      <header className="dashboard-header">

        {/* LOGO */}
        <div className="dashboard-logo">
          <Link to="/">
            <img
              src="/assets/codyyy-logo.jpg"
              alt="Codyyy Logo"
            />
          </Link>
        </div>

        {/* CENTER GREETING */}
        <div className="dashboard-greeting">
          <span className="greeting-symbol">{"<"}</span>
          HEY YA!
          <span className="greeting-symbol">{">"}</span>
        </div>

        {/* RIGHT NAVIGATION */}
        <div className="dashboard-nav">

          <Link
            to="/leaderboard"
            className="leaderboard-link"
          >
            <span>🏆</span>
            LEADERBOARD
          </Link>

          <Link
            to="/profile"
            className="profile-icon"
            title="My Profile"
          >
            👾
          </Link>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <div className="dashboard-heading">
          <p>WELCOME TO THE ARENA</p>
          <h1>CHOOSE YOUR BATTLE.</h1>
          <span>
            Pick your game mode. Challenge yourself. Climb the ranks.
          </span>
        </div>

        {/* FIRST TWO GAME MODES */}
        <section className="game-modes">

          {/* PRIVATE ROOM */}
          <Link
            to="/private-room"
            className="mode-card private-card"
          >
            <div className="mode-content">
              <span className="mode-label">
                PLAY WITH FRIENDS
              </span>

              <h2>PRIVATE ROOM</h2>

              <p>
                Create your own room, invite your friends
                and battle together.
              </p>

              <span className="mode-button">
                CREATE / JOIN →
              </span>
            </div>
          </Link>

          {/* TEMPORARY ROOM */}
          <Link
            to="/temporary-room"
            className="mode-card temporary-card"
          >
            <div className="mode-content">
              <span className="mode-label">
                QUICK MATCH
              </span>

              <h2>TEMPORARY ROOM</h2>

              <p>
                Create or join a quick match.
                Compete and test your coding skills.
              </p>

              <span className="mode-button">
                ENTER ROOM →
              </span>
            </div>
          </Link>

        </section>

        {/* GLOBAL ARENA */}
        <section className="global-arena-section">

          <Link
            to="/global-arena"
            className="mode-card global-card"
          >
            <div className="global-content">

              <span className="mode-label">
                PLAY WITH THE WORLD
              </span>

              <h2>GLOBAL ARENA</h2>

              <p>
                Find random players online.
                Get matched and compete in real-time
                against developers worldwide.
              </p>

              <span className="mode-button">
                FIND A MATCH →
              </span>

            </div>
          </Link>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="dashboard-footer">

        <div className="footer-brand">
          CODEYYY <span>•</span> THE CODING BATTLE
        </div>

        <div className="footer-links">
          <Link to="/">HOME</Link>
          <Link to="/how-it-works">HOW IT WORKS</Link>
          <Link to="/leaderboard">LEADERBOARD</Link>
        </div>

        <p>© 2026 CODY​​YY. ALL RIGHTS RESERVED.</p>

      </footer>

    </div>
  );
}

export default Dashboard;
