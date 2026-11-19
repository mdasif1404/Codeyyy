import api from "../services/api.js";
import socket from "../services/socket.js";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/TemporaryRoom.css";

function TemporaryRoom() {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
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
  const [roomCode, setRoomCode] = useState("");
  const [roomId, setRoomId] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [roomDetails, setRoomDetails] = useState(null);

  // Popup state
  const [showRoomDialog, setShowRoomDialog] = useState(true);
  const [dialogMode, setDialogMode] = useState("choice");

  // Create room form state
  const [roomName, setRoomName] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [maxPlayers, setMaxPlayers] = useState("4");

  // Join room form state
  const [joinCode, setJoinCode] = useState("");

  // Listen for real-time room member updates
  useEffect(() => {
    const handleRoomMembers = (data) => {
      const members = Array.isArray(data) ? data : data?.members || [];

      setPlayers(
        members.map((member) => ({
          id: member.userId,
          name: member.username,
          role: member.role === "owner" ? "Host" : "Opponent",
          status: "READY",
          host: member.role === "owner",
        }))
      );
    };

    socket.on("room:members", handleRoomMembers);

    const handleMatchStarted = (data) => {
      if (!data?.matchId) {
        console.error("Invalid match-start event:", data);
        return;
      }
    
      navigate(
        `/arena?matchId=${data.matchId}&roomId=${data.roomId || roomId}&roomType=temporary`
      );
    };

    socket.on("room:matchStarted", handleMatchStarted);

    const handleRoomClosed = (data) => {
      alert(data?.message || "The room has been closed by the owner.");

      setRoomId("");
      setRoomCode("");
      setRoomDetails(null);
      setPlayers([]);

      setShowRoomDialog(true);
      setDialogMode("choice");

      socket.disconnect();
    };

    socket.on("room:closed", handleRoomClosed);

    return () => {
      socket.off("room:members", handleRoomMembers);
      socket.off("room:matchStarted", handleMatchStarted);
      socket.off("room:closed", handleRoomClosed);
    };
  }, [navigate]);

  // Restore a selected temporary room or the user's existing room
  useEffect(() => {
    const restoreTemporaryRoom = async () => {
      try {
        let response;
      
        // If opened from Profile, load that particular room
        if (location.state?.roomId) {
          response = await api.get(
            `/rooms/temporary/${location.state.roomId}`
          );
        } else {
          // Otherwise restore the user's existing temporary room
          response = await api.get("/rooms/temporary/my-room");
        }
      
        const roomData = response.data.data;
      
        setRoomId(roomData.roomId);
        setRoomCode(roomData.roomCode);
        setRoomDetails(roomData);
      
        setPlayers(
          (roomData.members || []).map((member) => ({
            id: member.userId,
            name: member.username,
            role: member.role === "owner" ? "Host" : "Opponent",
            status: "READY",
            host: member.role === "owner",
          }))
        );
      
        setShowRoomDialog(false);
      
        // Join the room's Socket.IO channel
        const joinSocketRoom = () => {
          socket.emit(
            "room:join",
            { roomId: roomData.roomId },
            (socketResponse) => {
              if (socketResponse?.success && socketResponse.members) {
                setPlayers(
                  socketResponse.members.map((member) => ({
                    id: member.userId,
                    name: member.username,
                    role: member.role === "owner" ? "Host" : "Opponent",
                    status: "READY",
                    host: member.role === "owner",
                  }))
                );
              } else {
                console.error(
                  "Socket room join failed:",
                  socketResponse?.message
                );
              }
            }
          );
        };
      
        if (socket.connected) {
          joinSocketRoom();
        } else {
          socket.connect();
          socket.once("connect", joinSocketRoom);
        }
      
      } catch (error) {
        console.error("Temporary room restoration failed:", error);
      
        if (error.response?.status === 404) {
          setShowRoomDialog(true);
        } else if (error.response?.status === 403) {
          setRoomError("You are not a member of this room.");
          setShowRoomDialog(true);
        } else {
          setRoomError(
            error.response?.data?.message ||
            "Unable to restore your room. Please try again."
          );
          setShowRoomDialog(true);
        }
      }
    };
  
    restoreTemporaryRoom();
  }, [location.state?.roomId]);

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

  const handleStartBattle = async () => {
    if (!roomId || !roomDetails) {
      alert("Please create or join a temporary room first.");
      return;
    }

    try {
      const response = await api.post(
        `/rooms/temporary/${roomId}/start`
      );

      const matchId = response.data.data.matchId;

      navigate(`/arena?matchId=${matchId}&roomId=${roomId}&roomType=temporary`);

    } catch (error) {
      console.error("Start battle failed:", error);

      alert(
        error.response?.data?.message ||
        "Unable to start the battle."
      );
    }
  };

  
  const handleCreateRoom = async (event) => {
    event.preventDefault();

    try {
      setCreatingRoom(true);
      setRoomError("");

      const response = await api.post("/rooms/temporary", {
        roomName: roomName.trim(),
        difficulty,
        maxPlayers: Number(maxPlayers),
      });

      const roomData = response.data.data;
      
      setRoomDetails(roomData);
      setPlayers([
        {
          id: roomData.owner?.userId || "owner",
          name: "You",
          role: "Host",
          status: "READY",
          host: true,
        },
      ]);
      setRoomCode(roomData.roomCode);
      setRoomId(roomData.roomId);

      setShowRoomDialog(false);
      const joinSocketRoom = () => {
        socket.emit("room:join", { roomId: roomData.roomId }, (response) => {
          if (response?.success && response.members) {
            setPlayers(
              response.members.map((member) => ({
                id: member.userId,
                name: member.username,
                role: member.role === "owner" ? "Host" : "Opponent",
                status: "READY",
                host: member.role === "owner",
              }))
            );
          } else {
            console.error("Socket room join failed:", response?.message);
          }
        });
      };

      if (socket.connected) {
        joinSocketRoom();
      } else {
        socket.connect();
        socket.once("connect", joinSocketRoom);
      }

    } catch (error) {
      console.error("Temporary room creation failed:", error);

      setRoomError(
        error.response?.data?.message ||
        "Unable to create room. Please try again."
      );
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (event) => {
    event.preventDefault();

    try {
      setCreatingRoom(true);
      setRoomError("");

      const response = await api.post("/rooms/temporary/join", {
        roomCode: joinCode.trim().toUpperCase(),
      });

      const roomData = response.data.data;

      setRoomId(roomData.roomId);
      setRoomCode(roomData.roomCode);
      setRoomDetails(roomData);

      setPlayers(
        (roomData.members || []).map((member) => ({
          id: member.userId,
          name: member.username,
          role: member.role === "owner" ? "Host" : "Opponent",
          status: "READY",
          host: member.role === "owner",
        }))
      );

      setShowRoomDialog(false);

      const joinSocketRoom = () => {
        socket.emit("room:join", { roomId: roomData.roomId }, (response) => {
          if (response?.success && response.members) {
            setPlayers(
              response.members.map((member) => ({
                id: member.userId,
                name: member.username,
                role: member.role === "owner" ? "Host" : "Opponent",
                status: "READY",
                host: member.role === "owner",
              }))
            );
          } else {
            console.error("Socket room join failed:", response?.message);
          }
        });
      };

      if (socket.connected) {
        joinSocketRoom();
      } else {
        socket.connect();
        socket.once("connect", joinSocketRoom);
      }

    } catch (error) {
      console.error("Temporary room joining failed:", error);

      console.log("STATUS:", error.response?.status);
      console.log("MESSAGE:", error.response?.data?.message);

      setRoomError(
        error.response?.data?.message ||
        "Unable to join room. Please check the room code."
      );
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleLeaveRoom = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this temporary room?"
    );

    if (!confirmed) return;

    try {
      const response = await api.post(
        `/rooms/temporary/${roomId}/leave`
      );

      socket.disconnect();

      setRoomId("");
      setRoomCode("");
      setRoomDetails(null);
      setPlayers([]);
      setShowRoomDialog(true);
      setDialogMode("choice");

      console.log(response.data.message);

    } catch (error) {
      console.error("Leave temporary room failed:", error);

      alert(
        error.response?.data?.message ||
        "Unable to leave the temporary room."
      );
    }
  };

  return (
    <div className="temporary-room">

      {/* ROOM SELECTION POPUP */}
      {showRoomDialog && (
        <div className="temporary-dialog-overlay">
          <div className="temporary-dialog">

            {dialogMode === "choice" && (
              <>
                <h2>ENTER THE ARENA</h2>
                <p>Would you like to create a room or join an existing one?</p>

                <button
                  type="button"
                  onClick={() => setDialogMode("create")}
                >
                  CREATE TEMPORARY ROOM
                </button>

                <button
                  type="button"
                  onClick={() => setDialogMode("join")}
                >
                  JOIN TEMPORARY ROOM
                </button>
              </>
            )}

            {dialogMode === "create" && (
              <>

                <p>Set up your temporary coding battle.</p>

                {roomError && (
                  <p className="room-form-error">{roomError}</p>
                )}
                <form onSubmit={handleCreateRoom}>
                  <input
                    type="text"
                    placeholder="Room name"
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value)}
                    maxLength={50}
                    required
                  />

                  <select
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  <select
                    value={maxPlayers}
                    onChange={(event) => setMaxPlayers(event.target.value)}
                  >
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4 Players</option>
                    <option value="5">5 Players</option>
                    <option value="6">6 Players</option>
                  </select>

                  <button type="submit" disabled={creatingRoom}>
                    {creatingRoom ? "CREATING ROOM..." : "CREATE ROOM"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setDialogMode("choice")}
                >
                  BACK
                </button>
              </>
            )}

            {dialogMode === "join" && (
              <>
                <h2>JOIN ROOM</h2>
                <p>Enter the room code shared by your friend.</p>

                <form onSubmit={handleJoinRoom}>
                  <input
                    type="text"
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={(event) =>
                      setJoinCode(event.target.value.toUpperCase())
                    }
                    maxLength={8}
                    required
                  />

                  <button type="submit">JOIN ROOM</button>
                </form>

                <button
                  type="button"
                  onClick={() => setDialogMode("choice")}
                >
                  BACK
                </button>
              </>
            )}

          </div>
        </div>
      )}

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

        <h2>{roomCode || "--------"}</h2>

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
            {players.length} / {roomDetails?.maxPlayers || 4} CHALLENGERS
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

        <button
          type="button"
          className="leave-room-button"
          onClick={handleLeaveRoom}
        >
          LEAVE ROOM
        </button>

        <p>
          TEMPORARY ROOM - AUTOMATICALLY DISBANDED AFTER MATCH
        </p>
      </section>

    </div>
  );
}

export default TemporaryRoom;
