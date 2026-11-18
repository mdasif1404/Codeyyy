import React, { useState } from "react";
import "../styles/GlobalArena.css";

function GlobalArena({ onStartBattle }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");
  const [showPopup, setShowPopup] = useState(true);

  const handleStartBattle = () => {
    if (onStartBattle) {
      onStartBattle(selectedDifficulty);
    }
  };

  return (
    <div className="global-arena-page">

      {/* CINEMATIC BACKGROUND VIDEO */}
      <div className="global-arena-background">
        <video
          className="global-arena-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source
            src="/videos/codeyyy_crimson_glow_16x9.mp4"
            type="video/mp4"
          />
        </video>
        <div className="global-arena-video-overlay"></div>
      </div>

      {/* NAVBAR */}
      <header className="global-arena-header">

        <div className="arena-logo">
          <img
            src="/assets/codeyyy-logo.jpg"
            alt="Codyyy Logo"
          />
        </div>

        <div className="arena-profile">
          <video
            src="/videos/profile-eye.mp4"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
          />
        </div>

      </header>

      {/* MAIN ARENA */}
      <main className="global-arena-main">

        <section className="arena-content">

          {/* HEADING */}
          <div className="arena-heading">
            <h1>
              GLOBAL <span>ARENA</span>
            </h1>

            <p>
              Join the ultimate coding battle.
              Compete with players worldwide!
            </p>
          </div>

          {/* DIFFICULTY SELECTION */}
          {showPopup ? (
            <section className="arena-popup">

              <div className="popup-header">

                <div className="battle-icon">⚔</div>

                <div className="popup-title">
                  <h2>Join Global Arena</h2>
                  <p>
                    Select your difficulty level to start the battle
                  </p>
                </div>

                <button
                  className="popup-close"
                  onClick={() => setShowPopup(false)}
                  aria-label="Close popup"
                >
                  ×
                </button>

              </div>

              {/* DIFFICULTY OPTIONS */}
              <div className="difficulty-options">

                <button
                  type="button"
                  className={`difficulty-card easy ${
                    selectedDifficulty === "Easy" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDifficulty("Easy")}
                >
                  <span className="difficulty-level">LEVEL 01</span>
                  <span className="difficulty-name">EASY</span>
                  <span className="difficulty-description">
                    Beginner Challenges
                  </span>
                  <span className="difficulty-check">
                    {selectedDifficulty === "Easy" ? "✓" : ""}
                  </span>
                </button>

                <button
                  type="button"
                  className={`difficulty-card medium ${
                    selectedDifficulty === "Medium" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDifficulty("Medium")}
                >
                  <span className="difficulty-level">LEVEL 02</span>
                  <span className="difficulty-name">MEDIUM</span>
                  <span className="difficulty-description">
                    Intermediate Challenges
                  </span>
                  <span className="difficulty-check">
                    {selectedDifficulty === "Medium" ? "✓" : ""}
                  </span>
                </button>

                <button
                  type="button"
                  className={`difficulty-card hard ${
                    selectedDifficulty === "Hard" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDifficulty("Hard")}
                >
                  <span className="difficulty-level">LEVEL 03</span>
                  <span className="difficulty-name">HARD</span>
                  <span className="difficulty-description">
                    Advanced Challenges
                  </span>
                  <span className="difficulty-check">
                    {selectedDifficulty === "Hard" ? "✓" : ""}
                  </span>
                </button>

              </div>

              {/* START BATTLE */}
              <button
                type="button"
                className="start-battle-btn"
                onClick={handleStartBattle}
              >
                <span className="button-label">START BATTLE</span>
                <span className="button-arrow">→</span>
              </button>

            </section>
          ) : (
            <button
              className="reopen-arena-btn"
              onClick={() => setShowPopup(true)}
            >
              JOIN GLOBAL ARENA →
            </button>
          )}

        </section>
      </main>
    </div>
  );
}

export default GlobalArena;