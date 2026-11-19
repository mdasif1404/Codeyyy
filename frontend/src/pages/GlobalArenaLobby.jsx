
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket.js";
import "../styles/GlobalArenaLobby.css";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  } catch {
    return {};
  }
}

function GlobalArenaLobby({ difficulty = "Easy", onBack }) {
  const navigate = useNavigate();

  const [currentUser] = useState(getStoredUser);

  const [status, setStatus] = useState("connecting");
  const [players, setPlayers] = useState([]);
  const [matchId, setMatchId] = useState(null);
  const [playersWaiting, setPlayersWaiting] = useState(0);
  const [error, setError] = useState("");

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    currentUser?.userId;

  const currentUsername =
    currentUser?.username ||
    currentUser?.name ||
    "My Profile";

  // Identify the logged-in player.
  const normalizePlayer = (player) => {
    const playerId =
      player.userId ||
      player.user?._id ||
      player.user ||
      player._id;

    const isYou =
      currentUserId &&
      playerId &&
      String(currentUserId) === String(playerId);

    return {
      ...player,
      userId: playerId,
      username:
        player.username ||
        player.name ||
        "Player",
      isYou: Boolean(isYou)
    };
  };

  useEffect(() => {
    const handleConnect = () => {
      setStatus("connecting");
      setError("");
      socket.emit("arena:queue-status");
    };

    const handleQueueStatus = (data) => {
      if (data.status === "waiting") {
        setStatus("waiting");

        setPlayers(
          (data.players || []).map(normalizePlayer)
        );

        setPlayersWaiting(data.playersWaiting || 0);
      }

      else if (data.status === "matched" && data.matchId) {
        setMatchId(data.matchId);
        setStatus("matched");
      }

      else if (data.status === "not-queued") {
        socket.emit("arena:join-queue", { difficulty });
      }
    };

    const handleQueueJoined = () => {
      setStatus("waiting");
      setError("");
    };

    const handleLobbyUpdated = (data) => {
      if (data.difficulty !== difficulty) return;

      setPlayers(
        (data.players || []).map(normalizePlayer)
      );

      setPlayersWaiting(data.playersWaiting || 0);
      setStatus("waiting");
    };

    const handleMatchFound = (data) => {
      setMatchId(data.matchId);

      setPlayers(
        (data.participants || []).map(normalizePlayer)
      );

      setPlayersWaiting(4);
      setStatus("matched");
      setError("");
    };

    const handleQueueLeft = () => {
      setStatus("cancelled");
      setPlayers([]);
      setPlayersWaiting(0);
    };

    const handleError = (data) => {
      setError(data.message || "Something went wrong.");
      setStatus("error");
    };

    // Register listeners first.
    socket.on("connect", handleConnect);
    socket.on("arena:queue-status", handleQueueStatus);
    socket.on("arena:queue-joined", handleQueueJoined);
    socket.on("arena:lobby-updated", handleLobbyUpdated);
    socket.on("arena:match-found", handleMatchFound);
    socket.on("arena:queue-left", handleQueueLeft);
    socket.on("arena:error", handleError);

    // IMPORTANT: Actually establish the socket connection.
    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("arena:queue-status", handleQueueStatus);
      socket.off("arena:queue-joined", handleQueueJoined);
      socket.off("arena:lobby-updated", handleLobbyUpdated);
      socket.off("arena:match-found", handleMatchFound);
      socket.off("arena:queue-left", handleQueueLeft);
      socket.off("arena:error", handleError);
    };
  }, [difficulty]);

  const handleCancel = () => {
    socket.emit("arena:leave-queue");
  };

  const handleRetry = () => {
    setError("");
    setStatus("connecting");

    if (socket.connected) {
      socket.emit("arena:join-queue", { difficulty });
    } else {
      socket.connect();
    }
  };

  const handleEnterBattle = () => {
    if (!matchId) return;

    navigate(`/coding-arena/${matchId}`, {
      state: {
        matchId,
        matchType: "global-arena",
        difficulty
      }
    });
  };

  const playerSlots = Array.from(
    { length: 4 },
    (_, index) => players[index] || null
  );

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

          <span className="lobby-profile-name">
            {currentUsername}
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

              <span className="player-count">
                {playersWaiting} / 4
              </span>
            </div>

            <div className="players-list">

              {playerSlots.map((player, index) => (

                <div
                  className="player-row"
                  key={player?.userId || index}
                >

                  <div className="player-avatar">
                    {["👑", "⚡", "🔥", "🎯"][index]}
                  </div>

                  <div className="player-details">

                    <h3>
                      {player
                        ? player.username
                        : "Waiting for player..."}
                    </h3>

                    <p>
                      {!player
                        ? "OPEN SLOT"
                        : player.isYou
                        ? "YOU"
                        : "OPPONENT"}
                    </p>

                  </div>

                  <span className="ready-status">
                    {player ? "CONNECTED" : "WAITING"}
                  </span>

                </div>

              ))}

            </div>

            <div className="players-footer">
              <span className="active-dot" />

              {playersWaiting === 4
                ? "ALL PLAYERS CONNECTED"
                : `${playersWaiting} / 4 PLAYERS CONNECTED`}
            </div>

          </div>

          {/* BATTLEFIELD PANEL */}
          <div className="lobby-panel battlefield-panel">

            <div className="battle-icon">
              ⚔
            </div>

            <p className="battle-label">
              {status === "matched"
                ? "THE BATTLEFIELD IS SET"
                : "LIVE MATCHMAKING"}
            </p>

            <h2>
              {status === "matched"
                ? <>READY TO <span>FIGHT?</span></>
                : <>FINDING <span>PLAYERS...</span></>}
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

            {status === "matched" ? (

              <button
                type="button"
                className="start-battle-btn"
                onClick={handleEnterBattle}
              >
                ENTER BATTLE →
              </button>

            ) : status === "error" ? (

              <button
                type="button"
                className="start-battle-btn"
                onClick={handleRetry}
              >
                RETRY MATCHMAKING
              </button>

            ) : status === "cancelled" ? (

              <button
                type="button"
                className="start-battle-btn"
                onClick={onBack}
              >
                BACK TO ARENA
              </button>

            ) : (

              <>
                <div className="battle-waiting">
                  {status === "connecting"
                    ? "CONNECTING TO GLOBAL ARENA..."
                    : `WAITING FOR ${4 - playersWaiting} MORE PLAYER(S)...`}
                </div>

                <button
                  type="button"
                  className="start-battle-btn"
                  onClick={handleCancel}
                >
                  CANCEL SEARCH
                </button>
              </>

            )}

            {error && (
              <p role="alert">
                {error}
              </p>
            )}

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
              {status === "matched"
                ? "MATCH CONFIGURED"
                : "LIVE MATCHMAKING ACTIVE"}
            </div>

          </div>

        </section>
      </main>

    </div>
  );
}

export default GlobalArenaLobby;
