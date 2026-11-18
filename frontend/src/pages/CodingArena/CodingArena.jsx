import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api.js";
import "./CodingArena.css";
import socket from "../../services/socket";
import CodeEditor from "./components/CodeEditor";
import TestResults from "./components/TestResults";
import PlayerActivity from "./components/PlayerActivity";
import { runCode, submitCode } from "../../services/executionService.js";
import { useAuth } from "../../context/authContext";

const CodingArena = ({
  roomName = "YOUR ROOM",
  roundNumber = "01",
  roomCode = "XY82KQ",
  players = 4,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const matchId = searchParams.get("matchId");
  const roomId = searchParams.get("roomId");
  const roomType = searchParams.get("roomType") || "temporary";

  const [matchData, setMatchData] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [matchError, setMatchError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [matchResults, setMatchResults] = useState(null);
  const [matchCompleted, setMatchCompleted] = useState(false);

  // Execution & Test Results State
  const [testResults, setTestResults] = useState([]);
  const [compileStatus, setCompileStatus] = useState("NOT RUN");
  const [executionStatus, setExecutionStatus] = useState("NOT STARTED");
  const [executionMessage, setExecutionMessage] = useState(
    "Run your code to see test results."
  );

  const handleRunCode = async ({ code, language, stdin = "" }) => {
    if (!matchId) {
      throw new Error("Match ID is missing.");
    }
  
    return await runCode({
      matchId,
      code,
      language,
      stdin,
    });
  };

  const handleSubmitCode = async ({ code, language }) => {
    if (!matchId) {
      throw new Error("Match ID is missing.");
    }

    return await submitCode({
      matchId,
      code,
      language,
    });
  };

  // Fetch actual match, room and challenge information
  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!matchId || !roomId) {
        setMatchError("Match information is missing from the URL.");
        setLoadingMatch(false);
        return;
      }

      try {
        setLoadingMatch(true);
        setMatchError("");

        const endpoint =
          roomType === "permanent"
            ? `/rooms/${roomId}/matches/${matchId}`
            : `/rooms/temporary/${roomId}/matches/${matchId}`;

        const response = await api.get(endpoint);

        setMatchData(response.data.data);

      } catch (error) {
        console.error("Match details fetch failed:", error);

        setMatchError(
          error.response?.data?.message ||
          "Unable to load match details."
        );

      } finally {
        setLoadingMatch(false);
      }
    };

    fetchMatchDetails();
  }, [matchId, roomId, roomType]);

  // Listen for match completion
  // Join Socket.IO room and listen for match completion
  useEffect(() => {
    if (!roomId || roomType !== "permanent") return;
  
    const joinSocketRoom = () => {
      socket.emit("room:join", { roomId });
    };
  
    const handleMatchCompleted = (results) => {
      if (String(results.matchId) !== String(matchId)) return;
    
      setMatchResults(results);
      setMatchCompleted(true);
    };
  
    socket.on("connect", joinSocketRoom);
    socket.on("match:completed", handleMatchCompleted);
  
    // Connect if the socket is not already connected.
    if (!socket.connected) {
      socket.connect();
    } else {
      joinSocketRoom();
    }
  
    return () => {
      socket.off("connect", joinSocketRoom);
      socket.off("match:completed", handleMatchCompleted);
      socket.emit("room:leave", { roomId });
    };
  }, [roomId, roomType, matchId]);

  // Backend-synchronized match countdown
  useEffect(() => {
    if (!matchData?.match?.endsAt) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(
        matchData.match.endsAt
      ).getTime();

      const remaining = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
      );

      setTimeLeft(remaining);
    };

    calculateTimeLeft();

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [matchData]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Match results
  const currentUserId = String(user?._id || user?.id || "");

  const rankedParticipants = [
    ...(matchResults?.participants || [])
  ].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    return (b.score || 0) - (a.score || 0);
  });

  const currentPlayer = rankedParticipants.find(
    (player) => String(player.user?._id || player.user) === currentUserId
  );

  const isWinner = currentPlayer?.isWinner === true;

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
    setTestResults(
      Array.isArray(data.results) ? data.results : []
    );
    setExecutionMessage(
      data.errorMessage !== undefined
        ? data.errorMessage
        : "Execution completed."
    );
  };

  return (
    <>
    {matchCompleted ? (
      <div className="match-results-screen">
        <div className="match-results-container">
          <h1>MATCH COMPLETED</h1>

          <h2>
            {isWinner ? "🏆 VICTORY!" : "MATCH FINISHED"}
          </h2>

          <p className="results-subtitle">
            THE BATTLE HAS ENDED
          </p>

          <div className="results-summary">
            <div className="results-stat">
              <span>YOUR SCORE</span>
              <strong>{currentPlayer?.score ?? 0}</strong>
            </div>

            <div className="results-stat">
              <span>YOUR RANK</span>
              <strong>
                {currentPlayer?.rank
                  ? `#${currentPlayer.rank}`
                  : "N/A"}
              </strong>
            </div>
          </div>

          <div className="results-leaderboard">
            <h3>PLAYER RANKINGS</h3>

            <table>
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>PLAYER</th>
                  <th>SCORE</th>
                </tr>
              </thead>

              <tbody>
                {rankedParticipants.map((player, index) => (
                  <tr key={player.user?._id || player.user || index}>
                    <td>#{player.rank || index + 1}</td>
                    <td>
                      {player.username || "Player"}
                      {String(player.user?._id || player.user) === currentUserId
                        ? " (YOU)"
                        : ""}
                    </td>
                    <td>{player.score ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="results-dashboard-button"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            RETURN TO DASHBOARD →
          </button>
        </div>
      </div>
    ) : (
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
              <strong>{matchData?.room?.roomCode || "--------"}</strong>

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
            <span>{matchData?.match?.participants?.length || 0} PLAYERS</span>
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
                <span>{matchData?.room?.roomName || "YOUR ROOM"}</span>
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
                  <span>01 / 01</span>
                </div>

                <div className="problem-screen-content">

                  <h3>{matchData?.challenge?.title || "Loading challenge..."}</h3>

                  <p>
                    {matchData?.challenge?.description}
                  </p>
                                      
                  <h4>Input Format</h4>
                                      
                  <p>{matchData?.challenge?.inputFormat}</p>
                                      
                  <h4>Output Format</h4>
                                      
                  <p>{matchData?.challenge?.outputFormat}</p>
                                      
                  <h4>Examples</h4>
                                      
                  {matchData?.challenge?.examples?.map((example, index) => (
                    <div key={index}>
                      <pre>
                  {`Input: ${example.input}
                  Output: ${example.expectedOutput}`}
                      </pre>
                      {example.explanation && (
                        <p>{example.explanation}</p>
                      )}
                    </div>
                  ))}
                  
                  <h4>Constraints</h4>
                  
                  {matchData?.challenge?.constraints?.map((constraint, index) => (
                    <p key={index}>{constraint}</p>
                  ))}

                </div>
              </div>
            </section>

            {/* RIGHT: CODE EDITOR */}
            <section className="editor-panel">
              <CodeEditor
                challengeId={matchData?.challenge?._id || "two-sum"}
                starterCodes={matchData?.challenge?.starterCode}
                onRun={handleRunCode}
                onSubmit={handleSubmitCode}
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
                players={(matchData?.match?.participants || []).map(
                  (participant, index) => ({
                    id: participant._id || participant.user,
                    name: participant.username || `Player ${index + 1}`,
                    status: participant.solved ? "Submitted" : "Waiting",
                    isYou: false,
                  })
                )}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
    )}
    </>
  );
};

export default CodingArena;