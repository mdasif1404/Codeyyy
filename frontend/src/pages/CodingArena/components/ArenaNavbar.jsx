
import React from "react";

const ArenaNavbar = ({ roomCode = "XY82KQ", players = 4 }) => {
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      alert("Room code copied!");
    } catch {
      alert("Unable to copy room code.");
    }
  };

  return (
    <nav className="arena-navbar">
      <div className="arena-brand">
        <span className="brand-text">CODYyy</span>
      </div>

      <div className="arena-room">
        <span>ROOM:</span>
        <strong>{roomCode}</strong>

        <button
          className="copy-room-btn"
          onClick={copyRoomCode}
          title="Copy room code"
        >
          Copy
        </button>
      </div>

      <div className="arena-navbar-right">
        <span className="connection-indicator"></span>
        <span className="connection-text">LIVE MATCH</span>
        <span className="navbar-players">
          {players} PLAYERS
        </span>
      </div>
    </nav>
  );
};

export default ArenaNavbar;
