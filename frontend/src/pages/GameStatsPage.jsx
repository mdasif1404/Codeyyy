
import React from "react";
import { Link } from "react-router-dom";
import SettingsSidebar from "../components/SettingsSidebar";
import "../styles/settingsLayout.css";
import "./GameStatsPage.css";

const GameStatsPage = () => {
  const stats = [
    {
      label: "TOTAL MATCHES",
      value: "24",
      description: "Matches played",
      icon: "⚔",
      color: "yellow",
    },
    {
      label: "TOTAL WINS",
      value: "16",
      description: "Matches won",
      icon: "✓",
      color: "green",
    },
    {
      label: "TOTAL LOSSES",
      value: "08",
      description: "Matches lost",
      icon: "✕",
      color: "red",
    },
    {
      label: "TOTAL POINTS",
      value: "1,240",
      description: "Points earned",
      icon: "★",
      color: "yellow",
    },
    {
      label: "PLAYER RATING",
      value: "1,480",
      description: "Current arena rating",
      icon: "◆",
      color: "blue",
    },
  ];

  return (
    <div className="settings-page">
      <video
        className="settings-background-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/profile.mp4" type="video/mp4" />
      </video>

      <div className="settings-background-overlay"></div>

      <SettingsSidebar />

      <main className="settings-main">
        <header className="settings-topbar">
          <span>PLAYER CONTROL CENTER</span>

          <Link to="/dashboard" className="settings-back-button">
            ← BACK TO DASHBOARD
          </Link>
        </header>

        <div className="stats-content">
          <div className="stats-heading">
            <div>
              <span className="stats-eyebrow">
                PLAYER PERFORMANCE / 03
              </span>

              <h1>
                GAME STATS<span>.</span>
              </h1>

              <p>Your battles. Your progress. Your reputation.</p>
            </div>

            <div className="stats-player-status">
              <span></span> PLAYER ACTIVE
            </div>
          </div>

          <section className="stats-overview">
            <div className="stats-section-heading">
              <div>
                <span>YOUR PERFORMANCE</span>
                <h2>ARENA OVERVIEW</h2>
              </div>

              <span className="stats-period">ALL TIME</span>
            </div>

            <div className="stats-grid">
              {stats.map((stat) => (
                <article
                  className={`stats-card ${stat.color}`}
                  key={stat.label}
                >
                  <div className="stats-card-top">
                    <span className="stats-card-icon">
                      {stat.icon}
                    </span>

                    <span className="stats-card-label">
                      {stat.label}
                    </span>
                  </div>

                  <h3>{stat.value}</h3>
                  <p>{stat.description}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="stats-footer-note">
            ◆ YOUR GAME. YOUR IDENTITY. YOUR PROGRESS.
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameStatsPage;
