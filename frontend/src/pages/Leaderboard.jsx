import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  CalendarDays,
  Globe2,
  Clock3,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import "../styles/Leaderboard.css";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [period, setPeriod] = useState("This Week");

  const weeklyPlayers = [
    {
      name: "CodeMaster77",
      wins: 12,
      score: 1250,
      avatar: "/assets/avatar-hacker.jpg"
    },
    {
      name: "DevLegend",
      wins: 10,
      score: 1120,
      avatar: "/assets/avatar-doge.jpg"
    },
    {
      name: "HackPro",
      wins: 9,
      score: 1080,
      avatar: "/assets/avatar-spiderman.jpg"
    },
    {
      name: "CoderRiya",
      wins: 8,
      score: 980,
      avatar: "/assets/avatar-cat.jpg"
    },
    {
      name: "ByteWarrior",
      wins: 7,
      score: 920,
      avatar: "/assets/avatar-frog.jpg"
    }
  ];

  const globalPlayers = [
    {
      name: "LegendCoder",
      wins: 245,
      score: 9820,
      avatar: "/assets/avatar-hacker.jpg"
    },
    {
      name: "ProDev",
      wins: 232,
      score: 9450,
      avatar: "/assets/avatar-doge.jpg"
    },
    {
      name: "TechNinja",
      wins: 221,
      score: 9100,
      avatar: "/assets/avatar-spiderman.jpg"
    },
    {
      name: "ArenaChampion",
      wins: 210,
      score: 8700,
      avatar: "/assets/avatar-duck.jpg"
    },
    {
      name: "CodeBeast",
      wins: 198,
      score: 8400,
      avatar: "/assets/avatar-dog.jpg"
    }
  ];

  const players = activeTab === "weekly" ? weeklyPlayers : globalPlayers;

  const renderPlayers = () => (
    <>
      <div className="leaderboard-table">
        <div className="leaderboard-row table-heading">
          <span>#</span>
          <span>Player</span>
          <span>Wins</span>
          <span>Score</span>
        </div>

        {players.map((player, index) => (
          <div className="leaderboard-row" key={player.name}>
            <div className={`rank rank-${index + 1}`}>
              {index < 3 ? <Trophy size={29} /> : index + 1}
            </div>

            <div className="player-info">
              <div className="player-avatar">
                <img src={player.avatar} alt={`${player.name} avatar`} />
              </div>
              <span>{player.name}</span>
            </div>

            <div className="wins">
              <Trophy size={19} />
              <span>{player.wins}</span>
            </div>

            <div className="score">{player.score}</div>
          </div>
        ))}
      </div>

      <button className="view-top-button">
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
        <source src="/videos/leaderboard.mp4" type="video/mp4" />
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
              to="/login"
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
                <source src="/videos/profile-eye.mp4" type="video/mp4" />
              </video>
            </Link>
          </nav>
        </div>
      </header>

      {/* PAGE CONTENT CONTAINER */}
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
          <p>See how you rank among players — this week and across the world!</p>
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