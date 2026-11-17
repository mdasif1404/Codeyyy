
import React from "react";
import "./PlayerActivity.css";

const defaultPlayers = [
  { id: 1, name: "You", status: "In Progress", isYou: true },
  { id: 2, name: "Player 02", status: "Submitted" },
  { id: 3, name: "Player 03", status: "Coding" },
  { id: 4, name: "Player 04", status: "Waiting" },
  { id: 5, name: "Player 05", status: "Waiting" },
  { id: 6, name: "Player 06", status: "Waiting" },
];

const PlayerActivity = ({ players = defaultPlayers }) => {
  const visiblePlayers = players.slice(0, 6);

  const getStatusClass = (status) => {
    switch (status) {
      case "Submitted":
        return "submitted";
      case "In Progress":
        return "in-progress";
      case "Coding":
        return "coding";
      default:
        return "waiting";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Submitted":
        return "✓";
      case "In Progress":
        return "▶";
      case "Coding":
        return "⌨";
      default:
        return "…";
    }
  };

  return (
    <section className="player-activity">

      <video
        className="player-activity-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source
          src="/videos/codyyy_animated_eyes.mp4"
          type="video/mp4"
        />
      </video>

      <div className="player-activity-overlay" />

      <div className="player-activity-slots">
        {visiblePlayers.map((player) => (
          <div
            key={player.id}
            className={`activity-player-card ${getStatusClass(
              player.status
            )} ${player.isYou ? "current-player" : ""}`}
          >
            <div className="activity-player-top">
              <span className="activity-player-icon">
                {getStatusIcon(player.status)}
              </span>

              <span className="activity-player-name">
                {player.isYou ? "YOU" : player.name}
              </span>
            </div>

            <span className="activity-player-status">
              {player.status}
            </span>
          </div>
        ))}
      </div>

      <div className="player-activity-title">
        PLAYER ACTIVITY
      </div>

    </section>
  );
};

export default PlayerActivity;
