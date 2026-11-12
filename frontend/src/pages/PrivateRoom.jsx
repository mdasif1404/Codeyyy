import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/privateRoom.css";

function PrivateRoom() {
  const [activeTab, setActiveTab] = useState("create");

  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState("4");
  const [difficulty, setDifficulty] = useState("Medium");
  const [password, setPassword] = useState("");

  const [roomCode, setRoomCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const handleCreateRoom = (e) => {
    e.preventDefault();

    // Backend integration will generate and save the real room code.
    alert("Create Room UI is ready. Backend integration is the next step.");
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();

    // Backend integration will validate the room code and password.
    alert("Join Room UI is ready. Backend integration is the next step.");
  };

  return (
    <div className="private-room-page">
      {/* Full-page background video */}
      <video
        className="private-background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/private-arena.mp4" type="video/mp4" />
        Your browser does not support the video element.
      </video>

      <div className="private-background-overlay"></div>

      {/* MINIMAL NAVBAR */}
      <header className="private-header">
        <Link to="/" className="private-logo">
          <img src="/assets/codeyyy-logo.jpg" alt="Codyyy Logo" />
        </Link>

        <Link to="/login" className="private-profile" title="Profile / Log in">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/videos/profile-eye.mp4" type="video/mp4" />
          </video>
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <main className="private-main">

        <section className="private-heading">
          <p>YOUR SQUAD. YOUR RULES.</p>
          <h1>
            PRIVATE <span>ARENA.</span>
          </h1>
          <p className="private-subtitle">
            Create your own permanent room or join your team's existing arena.
          </p>
        </section>

        {/* CREATE / JOIN TABS */}
        <div className="private-tabs">
          <button
            type="button"
            className={activeTab === "create" ? "private-tab active" : "private-tab"}
            onClick={() => setActiveTab("create")}
          >
            <span>＋</span> CREATE ROOM
          </button>

          <button
            type="button"
            className={activeTab === "join" ? "private-tab active" : "private-tab"}
            onClick={() => setActiveTab("join")}
          >
            <span>↗</span> JOIN ROOM
          </button>
        </div>

        {/* CREATE ROOM */}
        {activeTab === "create" && (
          <section className="private-workspace">

            <form className="private-form-card" onSubmit={handleCreateRoom}>
              <div className="form-heading">
                <span>01 / ROOM CONFIGURATION</span>
                <h2>BUILD YOUR ARENA</h2>
                <p>Set up your permanent coding room.</p>
              </div>

              <div className="private-field">
                <label htmlFor="roomName">ROOM NAME</label>
                <input
                  id="roomName"
                  type="text"
                  placeholder="Enter your room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  maxLength={40}
                  required
                />
              </div>

              <div className="private-field">
                <label>NUMBER OF PARTICIPANTS</label>
                <div className="participant-options">
                  {["2", "3", "4", "5", "6"].map((number) => (
                    <button
                      key={number}
                      type="button"
                      className={
                        participants === number
                          ? "participant-option selected"
                          : "participant-option"
                      }
                      onClick={() => setParticipants(number)}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <small>Choose a room capacity between 2 and 6 players.</small>
              </div>

              <div className="private-field">
                <label>DIFFICULTY LEVEL</label>
                <div className="difficulty-options">
                  {["Easy", "Medium", "Hard"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={
                        difficulty === level
                          ? `difficulty-option ${level.toLowerCase()} selected`
                          : `difficulty-option ${level.toLowerCase()}`
                      }
                      onClick={() => setDifficulty(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="private-field">
                <label htmlFor="roomPassword">CREATE ROOM PASSWORD</label>
                <input
                  id="roomPassword"
                  type="password"
                  placeholder="Create a room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <small>At least 6 characters. Share it only with your team.</small>
              </div>

              <button type="submit" className="create-room-button">
                CREATE ROOM <span>→</span>
              </button>
            </form>

            {/* ROOM TV PANEL */}
            <aside className="room-tv-panel">
              <video
                className="room-tv-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onEnded={(e) => {
                  e.currentTarget.currentTime = 0;
                  e.currentTarget.play();
                }}
              >
                <source
                  src="/videos/private_code_tv_red.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="room-tv-screen">
                <p className="tv-eyebrow">02 / ROOM ACCESS</p>

                <h2>
                  YOUR ROOM.
                  <br />
                  YOUR SQUAD.
                </h2>

                <p className="tv-description">
                  Once your room is created, a unique permanent room code
                  will be generated for your team.
                </p>

                <div className="tv-code-display">
                  <span className="tv-code-label">YOUR ROOM CODE</span>

                  <strong className="tv-room-code">
                    {roomCode || "XXXXXX"}
                  </strong>

                  <span className="tv-code-caption">
                    {roomCode ? "SHARE THIS CODE WITH YOUR TEAM" : "CODE WILL APPEAR HERE"}
                  </span>
                </div>
              </div>

              {/* Instructions positioned on the speaker section */}
              <div className="tv-instructions">
                <p>
                  <span>01</span>
                  Share your room code with your friends.
                </p>

                <p>
                  <span>02</span>
                  They enter the code and password to join.
                </p>

                <p>
                  <span>03</span>
                  Your permanent room stays saved for next time.
                </p>
              </div>
            </aside>

          </section>
        )}

        {/* JOIN ROOM */}
        {activeTab === "join" && (
          <section className="join-workspace">

            <form className="join-form-card" onSubmit={handleJoinRoom}>
              <div className="form-heading">
                <span>01 / JOIN YOUR TEAM</span>
                <h2>REJOIN YOUR SQUAD</h2>
                <p>Enter the permanent room credentials shared by your host.</p>
              </div>

              <div className="private-field">
                <label htmlFor="roomCode">PERMANENT ROOM CODE</label>
                <input
                  id="roomCode"
                  type="text"
                  placeholder="Enter your room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={12}
                  required
                />
              </div>

              <div className="private-field">
                <label htmlFor="joinPassword">ROOM PASSWORD</label>
                <input
                  id="joinPassword"
                  type="password"
                  placeholder="Enter room password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="create-room-button">
                JOIN ROOM <span>→</span>
              </button>
            </form>

            <aside className="team-waiting-panel">

              {/* Background animation */}
              <video
                className="team-waiting-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source
                  src="/videos/team-waiting.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Dark overlay */}
              <div className="team-waiting-overlay"></div>

              {/* Existing card content */}
              <div className="team-waiting-content">

                <div className="join-info-icon">
                  ↝
                </div>

                <p className="join-info-label">ROOM ACCESS</p>

                <h2>
                  YOUR TEAM
                  <br />
                  IS WAITING.
                </h2>

                <p className="join-info-description">
                  Have your room code and password ready. Both are
                  required to enter a private room.
                </p>

                <div className="join-info-status">
                  <span></span>
                  PERMANENT ROOM ACCESS
                </div>

              </div>
            </aside>

          </section>
        )}

      </main>

      {/* SAME FOOTER AS DASHBOARD */}
      <footer className="dashboard-footer">
        <div className="footer-brand">
          CODYEYY<span>.</span>
          <small>THE CODING BATTLE</small>
        </div>

        <div className="dashboard-footer-links">
          <Link to="/how-it-works">HOW IT WORKS</Link>
          <a href="mailto:support@codyyy.com">CONTACT US</a>
          <span>© 2026 CODYEYY</span>
        </div>
      </footer>

    </div>
  );
}

export default PrivateRoom;