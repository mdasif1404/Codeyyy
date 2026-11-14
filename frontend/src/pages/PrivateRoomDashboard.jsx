
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/privateRoomDashboard.css";

// Temporary sample data.
// Later, replace this with player data from your backend.
const initialPlayers = [
  {
    id: "HRS102",
    username: "HARSHA",
    totalPoints: 1250,
    wins: 18,
    matchesPlayed: 25,
    rating: 4.8,
    isCurrentUser: true,
    avatar: "/assets/avatars/harsha.png",
  },
  {
    id: "ASF204",
    username: "ASIF",
    totalPoints: 980,
    wins: 14,
    matchesPlayed: 22,
    rating: 4.5,
    avatar: "/assets/avatars/asif.png",
  },
  {
    id: "UMA301",
    username: "UMA",
    totalPoints: 750,
    wins: 10,
    matchesPlayed: 18,
    rating: 4.2,
    avatar: "/assets/avatars/uma.png",
  },
  {
    id: "PLY404",
    username: "PLAYER 04",
    totalPoints: 420,
    wins: 5,
    matchesPlayed: 15,
    rating: 3.9,
    avatar: "/assets/avatars/default.png",
  },
];

// Continuous pixel-style progress bar
function PixelProgressBar({ percentage }) {
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div
      className="pixel-progress-track"
      role="progressbar"
      aria-valuenow={Math.round(safePercentage)}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        className="pixel-progress-fill"
        style={{ width: `${safePercentage}%` }}
      />
    </div>
  );
}

// Individual player card
function PlayerCard({ player, rank, selected, onClick }) {
  const winRate =
    player.matchesPlayed > 0
      ? (player.wins / player.matchesPlayed) * 100
      : 0;

  const ratingPercentage = (player.rating / 5) * 100;

  return (
    <button
      type="button"
      className={`pixel-player-card ${
        player.isCurrentUser ? "current-player" : ""
      } ${selected ? "selected-player" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="pixel-player-info">
        <div className="pixel-player-heading">
          <span className="pixel-player-rank">
            #{String(rank).padStart(2, "0")}
          </span>

          {player.isCurrentUser && (
            <span className="you-label">YOU</span>
          )}
        </div>

        <h3 className="pixel-player-name">{player.username}</h3>

        <div className="player-metrics">
          {/* TOTAL POINTS */}
          <div className="player-metric points-metric">
            <div className="metric-heading">
              <span>TOTAL POINTS</span>
              <strong>
                {player.totalPoints.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* WINS */}
          <div className="player-metric">
            <div className="metric-heading">
              <span>WINS</span>
              <strong>{player.wins}</strong>
            </div>

            <PixelProgressBar percentage={winRate} />
          </div>

          {/* MATCHES PLAYED */}
          <div className="player-metric matches-metric">
            <div className="metric-heading">
              <span>MATCHES PLAYED</span>
              <strong>{player.matchesPlayed}</strong>
            </div>
          </div>

          {/* RATING */}
          <div className="player-metric">
            <div className="metric-heading">
              <span>RATING</span>
              <strong>{player.rating.toFixed(1)} / 5</strong>
            </div>

            <PixelProgressBar percentage={ratingPercentage} />
          </div>
        </div>

        <span className="pixel-player-id">ID: {player.id}</span>
      </div>

      <div className="pixel-player-avatar">
        <img
          src={player.avatar}
          alt={`${player.username} avatar`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            const fallback = event.currentTarget.nextElementSibling;
            if (fallback) fallback.style.display = "flex";
          }}
        />

        <span className="avatar-fallback">
          {player.username.charAt(0)}
        </span>
      </div>

      <span className="pixel-card-watermark">CODYyy</span>
    </button>
  );
}

export default function PrivateRoomDashboard() {
  const { roomCode: routeRoomCode } = useParams();

  const [selectedPlayer, setSelectedPlayer] = useState("HRS102");
  const [copied, setCopied] = useState(false);

  // Temporary room code for frontend preview.
  const roomCode = routeRoomCode || "HX7K29";

  // Sort players by total points, highest first.
  const players = [...initialPlayers].sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      window.prompt("Copy your room code:", roomCode);
    }
  };

  const handleStartGame = () => {
    // Replace this with your actual game-start API later.
    alert("Game starting soon! Backend integration is pending.");
  };

  return (
    <div className="private-dashboard-page">
      {/* HEADER */}
      <header className="private-dashboard-header">
        <Link to="/dashboard" className="private-dashboard-logo">
          <img src="/assets/codyyy-logo.jpg" alt="Codyyy Logo" />
        </Link>

        <span className="private-room-badge">PRIVATE ROOM</span>

        <div className="private-header-actions">
          <button
            type="button"
            className="room-code-copy"
            onClick={handleCopyRoomCode}
            title="Copy room code"
          >
            <span>ROOM: {roomCode}</span>
            <span className="copy-symbol">
              {copied ? "✓" : "▢"}
            </span>
          </button>

          <div className="private-player-count">
            <span>{players.length} / 4 PLAYERS</span>
          </div>

          <Link to="/login" className="private-profile-link">
            <video autoPlay muted loop playsInline>
              <source
                src="/videos/profile-eye.mp4"
                type="video/mp4"
              />
            </video>
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="private-dashboard-main">
        <section className="private-dashboard-intro">
          <p className="dashboard-eyebrow">
            YOUR SQUAD. YOUR BATTLE.
          </p>

          <div className="dashboard-title-row">
            <div>
              <h1>THE ARENA IS READY.</h1>
              <p>
                Permanent private room · 4 player capacity
              </p>
            </div>

            <span className="dashboard-player-badge">
              {players.length} / 4 PLAYERS
            </span>
          </div>

          {copied && (
            <p className="copy-feedback">
              ROOM CODE COPIED!
            </p>
          )}
        </section>

        {/* LEADERBOARD + MATCH DETAILS */}
        <section className="dashboard-top-grid">
          {/* LEADERBOARD */}
          <div className="dashboard-panel leaderboard-panel">
            <div className="panel-heading">
              <div>
                <h2>SQUAD LEADERBOARD</h2>
                <p>LIVE RANKINGS</p>
              </div>

              <span className="live-indicator">
                <span />
                LIVE
              </span>
            </div>

            <div className="pixel-player-grid">
              {players.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={index + 1}
                  selected={selectedPlayer === player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                />
              ))}
            </div>

            <p className="leaderboard-hint">
              SELECT A PLAYER CARD TO VIEW THEIR PROFILE
            </p>
          </div>

          {/* MATCH DETAILS */}
          <aside className="dashboard-panel dashboard-match-details">
            <p className="match-details-label">
              MATCH SETTINGS
            </p>

            <div className="match-detail-item">
              <h3>MEDIUM</h3>
              <p>Difficulty level</p>
            </div>

            <div className="match-detail-item">
              <h3>10</h3>
              <p>Test cases per challenge</p>
            </div>

            <div className="match-detail-item">
              <h3>4 PLAYERS</h3>
              <p>Maximum room capacity</p>
            </div>

            <div className="match-detail-item">
              <h3>10 MINUTES</h3>
              <p>Match duration</p>
            </div>

            <div className="match-detail-item">
              <p className="languages-label">SUPPORTED LANGUAGES</p>

              <div className="language-list">
                <span>Python</span>
                <span>Java</span>
                <span>C</span>
                <span>JavaScript</span>
              </div>
            </div>

            <div className="match-room-status">
              <span className="status-dot" />
              PERMANENT ROOM
            </div>
          </aside>
        </section>

        {/* START GAME */}
        <section className="dashboard-start-game">
          <div className="start-animation-container">
            <video
              className="start-game-animation"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source
                src="/videos/start-logo.mp4"
                type="video/mp4"
              />
              Your browser does not support video.
            </video>
          </div>

          <h2>READY TO BATTLE?</h2>
          <p>
            Gather your squad and begin the coding challenge.
          </p>

          <button
            type="button"
            className="start-game-button"
            onClick={handleStartGame}
          >
            START GAME <span>→</span>
          </button>

          <span className="host-notice">
            HOST ONLY
          </span>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="private-dashboard-footer">
        <span>CODYyy.</span>
        <span>ROOM {roomCode} · PERMANENT</span>
        <span>YOUR SQUAD. YOUR RULES.</span>
      </footer>
    </div>
  );
}
