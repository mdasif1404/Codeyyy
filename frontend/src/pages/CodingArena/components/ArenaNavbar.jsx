
import React, { useState } from "react";

const ArenaNavbar = ({ roomCode = "XY82KQ" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Unable to copy room code:", error);
    }
  };

  return (
    <nav className="arena-navbar">

      {/* LEFT: CODYyy LOGO */}
      <div className="arena-brand">
        <span className="brand-text">
          CODYyy
        </span>
      </div>

      {/* RIGHT: ROOM CODE + PROFILE */}
      <div className="arena-navbar-right">

        <div className="arena-room">
          <span className="room-label">ROOM:</span>

          <strong>{roomCode}</strong>

          <button
            className="copy-room-btn"
            onClick={handleCopy}
            title="Copy room code"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* PROFILE ICON - DESIGN LATER */}
        <button
          className="arena-profile-btn"
          aria-label="User profile"
          title="Profile"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          </svg>
        </button>

      </div>

    </nav>
  );
};

export default ArenaNavbar;
