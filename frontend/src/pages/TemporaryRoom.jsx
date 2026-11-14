
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/TemporaryRoom.css";

const initialPlayers = [
  { id: 1, name: "You", role: "Host", status: "READY", host: true },
  { id: 2, name: "Player 02", role: "Opponent", status: "READY" },
  { id: 3, name: "Player 03", role: "Opponent", status: "READY" },
  { id: 4, name: "Player 04", role: "Opponent", status: "WAITING" },
];

function TemporaryRoom() {
  const [players] = useState(initialPlayers);

  const [messages, setMessages] = useState([
    {
      id: 1,
      name: "Player 02",
      text: "Ready for the battle!",
    },
  ]);

  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Temporary room code for UI testing.
  // Replace this with the backend-generated room code later.
  const roomCode = "XY82KQ";

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(roomCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = roomCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      window.prompt("Copy room code:", roomCode);
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: "You",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
  };

  const handleStartBattle = () => {
    alert("Battle starting! Game integration will be added next.");
  };

  return (
    <div className="temporary-room">

      {/* HEADER */}
      <header className="room-header">
        <Link to="/dashboard" className="room-logo-link">
          <img
            src="/assets/codeyyy-logo.jpg"
            alt="Codyyy Logo"
            className="room-logo"
          />
        </Link>

        <div className="room-status">
          <span className="status-dot"></span>
          ROOM ACTIVE
        </div>
      </header>

      {/* PAGE HEADING */}
      <section className="room-heading">
        <p className="room-subtitle">WELCOME TO THE ARENA</p>

        <h1>
          TEMPORARY <span>ROOM</span>
        </h1>

        <p>
          Invite your friends and get ready for the coding battle.
        </p>
      </section>

      {/* ROOM CODE */}
      <section className="room-code-section">
        <p>YOUR ROOM CODE</p>

        <h2>{roomCode}</h2>

        <button
          type="button"
          className="copy-button"
          onClick={handleCopy}
        >
          {copied ? "✓ COPIED!" : "▢ COPY ROOM CODE"}
        </button>

        <small>
          Share this code with your friends to join the room.
        </small>
      </section>

      {/* MAIN GRID */}
      <main className="room-main">

        {/* PLAYERS */}
        <section className="room-panel players-panel">
          <h2>
            <span className="panel-icon">♙</span>
            PLAYERS
          </h2>

          <p className="panel-count">
            {players.length} / 4 CHALLENGERS
          </p>

          {players.map((player) => (
            <div className="player-card" key={player.id}>
              <div className="player-avatar">
                ♙
              </div>

              <div className="player-details">
                <h3>{player.name}</h3>
                <small>{player.role}</small>
              </div>

              <span
                className={
                  player.status === "READY" ? "ready" : "waiting"
                }
              >
                {player.status}
              </span>
            </div>
          ))}
        </section>

        {/* BATTLE ARENA */}
        <section className="battle-arena">
          <div className="arena-glow"></div>

          <p className="arena-label">THE BATTLEFIELD</p>

          <div className="arena-symbol">
            <span>⚔</span>
          </div>

          <h2>
            READY <span>TO FIGHT?</span>
          </h2>

          <p className="arena-description">
            Your coding challenge awaits.
          </p>

          <div className="arena-stats">
            <div>
              <span>♙</span>
              <strong>{players.length}</strong>
              <small>PLAYERS</small>
            </div>

            <div>
              <span>♜</span>
              <strong>15</strong>
              <small>MINUTES</small>
            </div>

            <div>
              <span>♢</span>
              <strong>MEDIUM</strong>
              <small>LEVEL</small>
            </div>
          </div>
        </section>

        {/* MATCH INFO */}
        <aside className="room-panel match-panel">
          <h2>
            <span className="panel-icon">♜</span>
            MATCH INFO
          </h2>

          <div className="match-info">
            <small>DIFFICULTY</small>
            <h3>MEDIUM</h3>
          </div>

          <div className="match-info">
            <small>DURATION</small>
            <h3>15 MINUTES</h3>
          </div>

          <div className="match-info">
            <small>LANGUAGE</small>
            <h3>JAVA</h3>
          </div>

          <div className="match-info">
            <small>ROOM TYPE</small>
            <h3>TEMPORARY</h3>
          </div>
        </aside>

      </main>

      {/* ROOM CHAT */}
      <section className="room-chat">
        <h2>
          <span className="panel-icon">◉</span>
          ROOM CHAT
        </h2>

        <div className="chat-messages">
          {messages.map((item) => (
            <p key={item.id}>
              <strong>{item.name}:</strong> {item.text}
            </p>
          ))}
        </div>

        <form
          className="chat-form"
          onSubmit={handleSendMessage}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={250}
          />

          <button type="submit" aria-label="Send message">
            ➤
          </button>
        </form>
      </section>

      {/* START BATTLE */}
      <section className="start-battle-section">
        <button
          type="button"
          className="start-battle-button"
          onClick={handleStartBattle}
        >
          START BATTLE →
        </button>

        <p>
          TEMPORARY ROOM - AUTOMATICALLY DISBANDED AFTER MATCH
        </p>
      </section>

    </div>
  );
}

export default TemporaryRoom;
