
import ArenaQueue from "../models/arenaQueue.js";

import {
  joinArenaQueue,
  leaveArenaQueue,
  getArenaQueueStatus,
  broadcastArenaLobby,
  removeDisconnectedArenaPlayer
} from "../services/arena.service.js";

const lobbyRoom = (difficulty) => `arena-lobby-${difficulty}`;

export default function registerArenaSocket(io, socket) {
  const userId = socket.user?._id || socket.user?.id;

  if (!userId) {
    socket.emit("arena:error", {
      message: "Authentication required"
    });
    return;
  }

  socket.on("arena:join-queue", async (data = {}) => {
    try {
      const difficulty = data.difficulty;

      if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
        throw new Error("Please select a valid difficulty");
      }

      const previousEntry = await ArenaQueue.findOne({
        user: userId,
        status: "waiting"
      });

      if (
        previousEntry &&
        previousEntry.difficulty !== difficulty
      ) {
        socket.leave(lobbyRoom(previousEntry.difficulty));
        await leaveArenaQueue(userId, io);
      }

      socket.join(lobbyRoom(difficulty));

      await joinArenaQueue(
        userId,
        socket.id,
        difficulty,
        io
      );

      socket.emit("arena:queue-joined", {
        difficulty
      });
    } catch (error) {
      socket.emit("arena:error", {
        message: error.message || "Unable to join Arena"
      });
    }
  });

  socket.on("arena:leave-queue", async () => {
    try {
      const entry = await ArenaQueue.findOne({
        user: userId,
        status: "waiting"
      });

      const left = await leaveArenaQueue(userId, io);

      if (entry) {
        socket.leave(lobbyRoom(entry.difficulty));
      }

      socket.emit("arena:queue-left", {
        success: left
      });
    } catch (error) {
      socket.emit("arena:error", {
        message: error.message
      });
    }
  });

  socket.on("arena:queue-status", async () => {
    try {
      const status = await getArenaQueueStatus(userId);

      if (status.status === "waiting") {
        socket.join(lobbyRoom(status.difficulty));

        // Send the current live list to this player.
        socket.emit("arena:lobby-updated", {
          difficulty: status.difficulty,
          players: status.players,
          playersWaiting: status.playersWaiting,
          playersNeeded: status.playersNeeded
        });
      }

      socket.emit("arena:queue-status", status);
    } catch (error) {
      socket.emit("arena:error", {
        message: error.message
      });
    }
  });

  socket.on("disconnect", async () => {
    try {
      await removeDisconnectedArenaPlayer(socket.id, io);
    } catch (error) {
      console.error("Arena disconnect cleanup error:", error);
    }
  });
}
