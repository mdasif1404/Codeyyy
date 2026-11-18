
import React from "react";
import "../styles/GlobalArenaLobby.css";

function GlobalArenaLobby({ difficulty = "Easy" }) {
  const players = [
    { name: "You", role: "HOST", avatar: "👑" },
    { name: "Player 02", role: "OPPONENT", avatar: "⚡" },
    { name: "Player 03", role: "OPPONENT", avatar: "🔥" },
    { name: "Player 04", role: "OPPONENT", avatar: "🎯" },
  ];

  return (
    <div className="global-lobby-page">

      {/* BACKGROUND VIDEO */}
      <video
        className="lobby-background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source
          src="/videos/codyyy_crimson_glow_16x9.mp4"
          type="video/mp4"
        />
      </video>

      {/* CINEMATIC VIDEO OVERLAY */}
      <div
        className="lobby-video-overlay"
        aria-hidden="true"
      />

      {/* NAVBAR */}
      <header className="lobby-header">

        <img
          src="/assets/codeyyy-logo.jpg"
          alt="Codyyy Logo"
          className="lobby-logo"
        />

        <div className="lobby-header-right">

          <span className="lobby-user-status">
            <span className="active-dot" />
            ONLINE
          </span>

          <video
            className="lobby-profile-video"
            src="/videos/profile-eye.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="lobby-main">

        {/* PAGE HEADING */}
        <section className="lobby-title-section">

          <p className="lobby-subtitle">
            THE ULTIMATE CODING COMPETITION
          </p>

          <h1 className="lobby-heading">
            GLOBAL <span>ARENA</span>
          </h1>

          <p className="lobby-description">
            You've entered the battlefield. Get ready to compete
            with players around the world.
          </p>

          <div className="lobby-active">
            <span className="active-dot" />
            GLOBAL ARENA ACTIVE
          </div>

        </section>

        {/* LOBBY GRID */}
        <section className="lobby-grid">

          {/* PLAYERS PANEL */}
          <div className="lobby-panel players-panel">

            <div className="panel-heading">
              <h2>PLAYERS</h2>
              <span className="player-count">4 / 4</span>
            </div>

            <div className="players-list">

              {players.map((player, index) => (
                <div className="player-row" key={index}>

                  <div className="player-avatar">
                    {player.avatar}
                  </div>

                  <div className="player-details">
                    <h3>{player.name}</h3>
                    <p>{player.role}</p>
                  </div>

                  <span className="ready-status">
                    READY
                  </span>

                </div>
              ))}

            </div>

            <div className="players-footer">
              <span className="active-dot" />
              ALL PLAYERS CONNECTED
            </div>

          </div>

          {/* BATTLEFIELD PANEL */}
          <div className="lobby-panel battlefield-panel">

            <div className="battle-icon">
              ⚔
            </div>

            <p className="battle-label">
              THE BATTLEFIELD IS SET
            </p>

            <h2>
              READY TO <span>FIGHT?</span>
            </h2>

            <p className="battle-description">
              Four coders. One battlefield.
              Only the strongest will win.
            </p>

            <div className="battle-stats">

              <div className="battle-stat">
                <strong>04</strong>
                <span>PLAYERS</span>
              </div>

              <div className="stat-divider" />

              <div className="battle-stat">
                <strong>15</strong>
                <span>MINUTES</span>
              </div>

              <div className="stat-divider" />

              <div className="battle-stat">
                <strong>{difficulty.toUpperCase()}</strong>
                <span>LEVEL</span>
              </div>

            </div>

            <div className="battle-waiting">
              WAITING FOR BATTLE TO BEGIN...
            </div>

          </div>

          {/* MATCH INFO PANEL */}
          <div className="lobby-panel match-info-panel">

            <div className="panel-heading">
              <h2>MATCH INFO</h2>
              <span className="info-icon">✦</span>
            </div>

            <div className="match-info-item">
              <span className="info-label">GAME MODE</span>
              <strong>GLOBAL ARENA</strong>
            </div>

            <div className="match-info-item">
              <span className="info-label">DIFFICULTY</span>
              <strong>{difficulty.toUpperCase()}</strong>
            </div>

            <div className="match-info-item">
              <span className="info-label">DURATION</span>
              <strong>15 MINUTES</strong>
            </div>

            <div className="match-info-item">
              <span className="info-label">LANGUAGE</span>
              <strong>JAVA</strong>
            </div>

            <div className="match-info-footer">
              <span className="active-dot" />
              MATCH CONFIGURED
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default GlobalArenaLobby;
