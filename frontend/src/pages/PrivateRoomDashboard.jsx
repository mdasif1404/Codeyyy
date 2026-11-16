import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import "../styles/privateRoomDashboard.css";
import socket from "../services/socket";

// Temporary sample data.
// Later, replace this with player data from your backend.


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
  return (
    <button
      type="button"
      className={`pixel-player-card ${
        selected ? "selected-player" : ""
      }`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="pixel-player-info">
        <div className="pixel-player-heading">
          <span className="pixel-player-rank">
            #{String(rank).padStart(2, "0")}
          </span>

          <span className="you-label">
            {player.role === "owner" ? "HOST" : "MEMBER"}
          </span>
        </div>

        <h3 className="pixel-player-name">
          {player.username}
        </h3>

        <div className="player-metrics">
          <div className="player-metric">
            <div className="metric-heading">
              <span>ROOM ROLE</span>
              <strong>
                {player.role.toUpperCase()}
              </strong>
            </div>
          </div>

          <div className="player-metric">
            <div className="metric-heading">
              <span>MEMBER SINCE</span>
              <strong>
                {player.joinedAt
                  ? new Date(player.joinedAt).toLocaleDateString()
                  : "N/A"}
              </strong>
            </div>
          </div>
        </div>

        <span className="pixel-player-id">
          ID: {String(player.userId)}
        </span>
      </div>

      <div className="pixel-player-avatar">
        <img
          src="/assets/avatars/default.png"
          alt={`${player.username} avatar`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
            const fallback = event.currentTarget.nextElementSibling;
            if (fallback) fallback.style.display = "flex";
          }}
        />

        <span className="avatar-fallback">
          {player.username.charAt(0).toUpperCase()}
        </span>
      </div>

      <span className="pixel-card-watermark">CODYyy</span>
    </button>
  );
}


export default function PrivateRoomDashboard() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [copied, setCopied] = useState(false);

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const roomCode = room?.roomCode || "LOADING...";


  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/rooms/${roomId}`);

        if (response.data.success) {
          const roomData = response.data.data;

          setRoom(roomData);
          setPlayers(roomData.members || []);
        }
      } catch (err) {
        console.error("Fetch room details error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load room details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }

  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const joinSocketRoom = () => {
      socket.emit("room:join", { roomId }, (response) => {
        if (response?.success) {
          setPlayers(response.members || []);
        } else {
          console.error(
            "Unable to join Socket.IO room:",
            response?.message
          );
        }
      });
    };

    const handleRoomMembers = (data) => {
      if (String(data.roomId) === String(roomId)) {
        setPlayers(data.members || []);
      }
    };

    socket.on("connect", joinSocketRoom);
    socket.on("room:members", handleRoomMembers);

    if (socket.connected) {
      joinSocketRoom();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", joinSocketRoom);
      socket.off("room:members", handleRoomMembers);
      socket.emit("room:leave", { roomId });
    };
    }, [roomId]);

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

  const [startingMatch, setStartingMatch] = useState(false);

  const handleStartGame = async () => {
    if (startingMatch) return;
  
    setStartingMatch(true);
    setError("");
  
    try {
      const response = await api.post(`/rooms/${roomId}/start`);
    
      if (response.data.success) {
        const matchId = response.data.data.matchId;
      
        navigate(`/arena?roomId=${roomId}&matchId=${matchId}`);
      }
    } catch (err) {
      console.error("Start match error:", err);
    
      setError(
        err.response?.data?.message ||
        "Unable to start the match."
      );
    } finally {
      setStartingMatch(false);
    }
  };

  if (loading) {
    return (
      <div className="private-dashboard-page">
        <h2>LOADING YOUR ARENA...</h2>
        <p>Please wait while we retrieve your room details.</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="private-dashboard-page">
        <h2>UNABLE TO LOAD ARENA</h2>
        <p>{error || "Room details could not be found."}</p>
        <Link to="/private-room">BACK TO PRIVATE ROOMS</Link>
      </div>
    );
  }

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
            <span>{players.length} / {room?.maxPlayers || 0} PLAYERS</span>
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
              <h1>{room?.roomName || "THE ARENA IS READY."}</h1>
              <p>
                Permanent private room · {room?.maxPlayers} player capacity
              </p>
            </div>

            <span className="dashboard-player-badge">
              {players.length} / {room?.maxPlayers || 0} PLAYERS
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
                  key={player.userId}
                  player={player}
                  rank={index + 1}
                  selected={selectedPlayer === String(player.userId)}
                  onClick={() => setSelectedPlayer(String(player.userId))}
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
              <h3>{room?.difficulty?.toUpperCase() || "LOADING..."}</h3>
              <p>Difficulty level</p>
            </div>

            <div className="match-detail-item">
              <h3>10</h3>
              <p>Test cases per challenge</p>
            </div>

            <div className="match-detail-item">
              <h3>{room?.maxPlayers || 0} PLAYERS</h3>
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
