
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  CalendarDays,
  Globe2,
  Clock3,
  ChevronDown,
  ArrowRight
} from "lucide-react";

import api from "../services/api.js";
import "../styles/Leaderboard.css";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [period, setPeriod] = useState("This Week");

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FETCH LEADERBOARD
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (activeTab === "global") {
          response = await api.get("/leaderboard/global");
        } else {
          const periodMap = {
            "This Week": "this-week",
            "Last Week": "last-week",
            "This Month": "this-month"
          };

          const selectedPeriod = periodMap[period];

          response = await api.get(
            `/leaderboard/weekly?period=${selectedPeriod}`
          );
        }

        setPlayers(
          response.data.data?.leaderboard || []
        );

      } catch (err) {
        console.error("Leaderboard fetch error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load leaderboard."
        );

        setPlayers([]);

      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, period]);

  // PLAYER ROWS
  const renderPlayers = () => (
    <>
      {loading ? (
        <div className="leaderboard-empty">
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="leaderboard-empty">
          <p>{error}</p>
          <button
            onClick={() => {
              setActiveTab(current => current);
            }}
          >
            Please try again
          </button>
        </div>
      ) : players.length === 0 ? (
        <div className="leaderboard-empty">
          <p>No completed matches found for this period.</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-row table-heading">
            <span>#</span>
            <span>Player</span>
            <span>Wins</span>
            <span>Score</span>
          </div>

          {players.map((player) => (
            <div
              className="leaderboard-row"
              key={player.userId}
            >
              <div className={`rank rank-${player.rank}`}>
                {player.rank <= 3 ? (
                  <Trophy size={29} />
                ) : (
                  player.rank
                )}
              </div>

              <div className="player-info">
                <div className="player-avatar">
                  <img
                    src={
                      player.avatar ||
                      "/assets/avatar-hacker.jpg"
                    }
                    alt={`${player.username} avatar`}
                  />
                </div>

                <span>{player.username}</span>
              </div>

              <div className="wins">
                <Trophy size={19} />
                <span>{player.wins}</span>
              </div>

              <div className="score">
                {player.totalPoints}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="view-top-button" type="button">
        View {activeTab === "weekly" ? "Weekly" : "Global"} Top 100
        <ArrowRight size={18} />
      </button>
    </>
  );

  return (
    <div className="leaderboard-page">

      {/* LEADERBOARD BACKGROUND VIDEO */}
      <video
        className="leaderboard-background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="/videos/leaderboard.mp4"
          type="video/mp4"
        />
      </video>

      {/* DARK OVERLAY */}
      <div className="leaderboard-background-overlay"></div>

      {/* TOP NAVBAR */}
      <header className="leaderboard-header">
        <div className="leaderboard-header-content">

          <Link to="/dashboard" className="leaderboard-logo">
            <img
              src="/assets/codeyyy-logo.jpg"
              alt="CODEYYY - The Coding Battle"
            />
          </Link>

          <nav className="leaderboard-nav">
            <Link
              to="/profile"
              className="leaderboard-profile-link"
              title="My Profile"
              aria-label="My Profile"
            >
              <video
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

        </div>
      </header>

      {/* PAGE CONTENT */}
      <div className="leaderboard-content-wrapper">

        {/* HERO SECTION */}
        <div className="leaderboard-hero">
          <div className="hero-crown">
            <img
              src="/assets/leaderboard-crown.jpg"
              alt="Leaderboard Champion Crown"
            />
          </div>

          <h1>
            LEADER<span>BOARD</span>
          </h1>

          <p>
            See how you rank among players — this week and across the world!
          </p>
        </div>

        {/* LEADERBOARD TABS */}
        <div className="leaderboard-tabs">

          <button
            className={activeTab === "weekly" ? "active" : ""}
            onClick={() => setActiveTab("weekly")}
          >
            <CalendarDays size={22} />
            Weekly Leaderboard
          </button>

          <button
            className={activeTab === "global" ? "active" : ""}
            onClick={() => setActiveTab("global")}
          >
            <Globe2 size={22} />
            Global Leaderboard
          </button>

        </div>

        {/* LEADERBOARD CARD */}
        <div className="leaderboard-card">

          <div className="leaderboard-card-header">

            <div className="leaderboard-title">
              {activeTab === "weekly" ? (
                <CalendarDays size={43} />
              ) : (
                <Globe2 size={43} />
              )}

              <div>
                <h2>
                  {activeTab === "weekly" ? (
                    <>WEEKLY <span>LEADERBOARD</span></>
                  ) : (
                    <>GLOBAL <span>LEADERBOARD</span></>
                  )}
                </h2>

                <p>
                  {activeTab === "weekly"
                    ? "Top players this week"
                    : "Top players worldwide"}
                </p>
              </div>
            </div>

            {activeTab === "weekly" && (
              <div className="period-select">
                <Clock3 size={19} />

                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>

                <ChevronDown size={16} />
              </div>
            )}

          </div>

          {renderPlayers()}

        </div>

        {/* FOOTER */}
        <div className="leaderboard-footer">
          <span></span>
          Code <b>•</b> Compete <b>•</b> Climb Higher
          <span></span>
        </div>

      </div>
    </div>
  );
}

export default Leaderboard;
