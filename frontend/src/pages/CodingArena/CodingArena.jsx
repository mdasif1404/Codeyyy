import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CodingArena.css";
import CodeEditor from "./components/CodeEditor";
import TestResults from "./components/TestResults";
import PlayerActivity from "./components/PlayerActivity";

const CodingArena = ({
  roomName = "YOUR ROOM",
  roundNumber = "01",
  roomCode = "XY82KQ",
  players = 4,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  // Execution & Test Results State
  const [testResults, setTestResults] = useState([]);
  const [compileStatus, setCompileStatus] = useState("NOT RUN");
  const [executionStatus, setExecutionStatus] = useState("NOT STARTED");
  const [executionMessage, setExecutionMessage] = useState(
    "Run your code to see test results."
  );

  // 25-minute countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((previousTime) =>
        previousTime > 0 ? previousTime - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      window.prompt("Copy your room code:", roomCode);
    }
  };

  // Callback passed to CodeEditor when code is compiled/executed
  const handleExecutionComplete = (data) => {
    setCompileStatus(data.compileStatus || "SUCCESS");
    setExecutionStatus(data.executionStatus || "COMPLETED");
    setTestResults(data.results || []);
    setExecutionMessage(
      data.errorMessage !== undefined
        ? data.errorMessage
        : "Execution completed."
    );
  };

  return (
    <div className="coding-arena">

      {/* ARENA NAVBAR */}
      <header className="arena-navbar">
        <div className="arena-brand">
          <img
            src="/assets/codeyyy-logo.jpg"
            alt="CODYyy Logo"
            className="arena-logo-image"
          />
        </div>

        <div className="arena-navbar-right">

          {/* ROOM CODE */}
          <div className="arena-room-code-card">
            <span className="arena-room-code-label">
              ROOM CODE
            </span>

            <div className="arena-room-code-content">
              <strong>{roomCode}</strong>

              <button
                type="button"
                className="arena-copy-icon"
                onClick={handleCopyRoomCode}
                title="Copy room code"
                aria-label="Copy room code"
              >
                {copied ? "✓" : "▢"}
              </button>
            </div>

            {copied && (
              <span className="arena-copied-message">
                COPIED!
              </span>
            )}
          </div>

          {/* PLAYER COUNT */}
          <div className="arena-player-count">
            <span>{players} PLAYERS</span>
          </div>

          {/* PROFILE EYE */}
          <Link
            to="/profile"
            className="arena-profile-btn"
            aria-label="Player profile"
          >
            <video autoPlay muted loop playsInline preload="auto">
              <source
                src="/videos/profile-eye.mp4"
                type="video/mp4"
              />
            </video>
          </Link>
        </div>
      </header>

      {/* MAIN ARENA */}
      <div className="arena-main">

        {/* BACKGROUND VIDEO */}
        <video
          className="arena-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source
            src="/videos/loop_60s.mp4"
            type="video/mp4"
          />
        </video>

        <div className="arena-video-overlay"></div>

        <div className="arena-content">

          {/* ROOM NAME + VIDEO TIMER */}
          <div className="arena-heading">
            <div className="room-title-row">

              <h2 className="arena-room-name">
                <span>{roomName}</span>
              </h2>

              {/* VIDEO TIMER */}
              <div className="arena-focus-timer">

                <video
                  className="arena-timer-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                >
                  <source
                    src="/videos/vw-dashboard-glow-loop-6s.mp4"
                    type="video/mp4"
                  />
                </video>

                <div className="arena-timer-overlay">
                  <span className="arena-timer-label">
                    FOCUS SESSION
                  </span>

                  <div className="arena-timer-time">
                    {formatTime(timeLeft)}
                  </div>

                  <span className="arena-timer-status">
                    {timeLeft === 0
                      ? "SESSION COMPLETE"
                      : "STAY FOCUSED"}
                  </span>
                </div>

              </div>

            </div>
          </div>

          {/* MAIN WORKSPACE */}
          <main className="arena-workspace">

            {/* LEFT: POKEDEX PROBLEM STATEMENT */}
            <section className="problem-panel">

              <video
                className="problem-bg-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source
                  src="/videos/pokedex-card-animation.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="problem-screen">

                <div className="problem-screen-header">
                  <span>PROBLEM STATEMENT</span>
                  <span>{roundNumber} / 05</span>
                </div>

                <div className="problem-screen-content">

                  <h3>Two Sum</h3>

                  <p>
                    Given an array of integers and a target value,
                    return the indices of the two numbers that add
                    up to the target.
                  </p>

                  <h4>Example</h4>

                  <pre>
{`Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]`}
                  </pre>

                  <h4>Constraints</h4>

                  <p>2 ≤ nums.length ≤ 10⁴</p>

                </div>
              </div>
            </section>

            {/* RIGHT: CODE EDITOR */}
            <section className="editor-panel">
              <CodeEditor
                challengeId="two-sum"
                onExecute={handleExecutionComplete}
              />
            </section>

          </main>

          {/* BOTTOM WIDGETS */}
          <div className="arena-bottom-widgets">

            <div className="arena-usb-area">
              <TestResults
                results={testResults}
                compileStatus={compileStatus}
                executionStatus={executionStatus}
                errorMessage={executionMessage}
              />
            </div>

            <div className="arena-player-area">
              <PlayerActivity
                players={[
                  { id: 1, name: "Harsha", status: "In Progress", isYou: true },
                  { id: 2, name: "Asif", status: "Submitted" },
                  { id: 3, name: "Uma", status: "Coding" },
                  { id: 4, name: "Player 04", status: "Waiting" },
                  { id: 5, name: "Player 05", status: "Coding" },
                  { id: 6, name: "Player 06", status: "Submitted" },
                ]}
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CodingArena;