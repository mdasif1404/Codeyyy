import 'dotenv/config.js'
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

import connectDB from './Config/db.js';
import corsMiddleware from './Config/cors.js';
import authRoutes from './routes/authRoutes.js'
import roomRoutes from "./routes/roomRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import registerArenaSocket from "./Socket/arena.socket.js";
import socketAuth from "./Socket/socketAuth.js";
import { cleanupExpiredTemporaryRooms } from "./services/temporaryRoomCleanup.service.js";
import { completeExpiredMatches } from "./services/matchTimer.service.js";

import Room from "./models/Room.js";
import RoomMember from "./models/RoomMember.js";

const app = express()

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST"]
    }
});
// This allows controllers to access the existing Socket.IO instance.
app.set("io", io);

// Authenticate every Socket.IO connection
io.use(socketAuth);

app.use(corsMiddleware)
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get('/', (req, res)=>{
    res.status(200).json({
        message: "Welcome"
    })
})

const url = process.env.MONGO_URL;
const port = process.env.PORT || 5000;

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(
    "Authenticated socket connected:",
    socket.user.username,
    socket.id
  );

  // Join a permanent room's Socket.IO channel
  socket.on("room:join", async ({ roomId }, callback) => {
    try {
      if (!roomId) {
        return callback?.({
          success: false,
          message: "Room ID is required"
        });
      }

      const room = await Room.findById(roomId);

      if (!room || room.roomStatus !== "active") {
        return callback?.({
          success: false,
          message: "Room not found or unavailable"
        });
      }

      const membership = await RoomMember.findOne({
        room: roomId,
        user: socket.user.id,
        status: "active"
      });

      if (!membership) {
        return callback?.({
          success: false,
          message: "You are not an active member of this room"
        });
      }

      const socketRoom = `room:${roomId}`;

      await socket.join(socketRoom);

      const members = await RoomMember.find({
        room: roomId,
        status: "active"
      })
        .populate("user", "username")
        .lean();

      const memberList = members
        .filter((member) => member.user)
        .map((member) => ({
          userId: member.user._id,
          username: member.user.username,
          role: member.role,
          joinedAt: member.joinedAt
        }));

      io.to(socketRoom).emit("room:members", {
        roomId,
        members: memberList
      });

      io.on("connection", (socket) => {
        registerArenaSocket(io, socket);
      });

      return callback?.({
        success: true,
        message: "Joined room channel successfully",
        members: memberList
      });

    } catch (error) {
      console.error("Room socket join error:", error);

      return callback?.({
        success: false,
        message: "Unable to join room channel"
      });
    }
  });

  // Leave a room's Socket.IO channel
  socket.on("room:leave", async ({ roomId }, callback) => {
    if (!roomId) {
      return callback?.({
        success: false,
        message: "Room ID is required"
      });
    }

    const socketRoom = `room:${roomId}`;

    await socket.leave(socketRoom);

    return callback?.({
      success: true,
      message: "Left room channel successfully"
    });
  });

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.user.username,
      socket.id
    );
  });
});

// Temporary room cleanup scheduler
let cleanupInProgress = false;

const runTemporaryRoomCleanup = async () => {
  if (cleanupInProgress) return;

  cleanupInProgress = true;

  try {
    await cleanupExpiredTemporaryRooms();
  } catch (error) {
    console.error("Temporary room cleanup scheduler error:", error);
  } finally {
    cleanupInProgress = false;
  }
};

let matchTimerInProgress = false;

const runMatchTimerCheck = async () => {
  if (matchTimerInProgress) return;

  matchTimerInProgress = true;

  try {
    await completeExpiredMatches(io);
  } catch (error) {
    console.error("Match timer scheduler error:", error);
  } finally {
    matchTimerInProgress = false;
  }
};

const startServer = async() => {
    try {
        await connectDB(url)

        // Recover expired temporary rooms from previous server sessions
        await runTemporaryRoomCleanup();
        await runMatchTimerCheck();

        // Check for expired temporary rooms every 5 seconds
        setInterval(runTemporaryRoomCleanup, 5000);

        // Check expired matches every second
        setInterval(runMatchTimerCheck, 1000);

        server.listen(port, ()=>{
            console.log(`Server is running at http://localhost:${port}`);
    
        });
    } catch (error) {
        console.error("Server startup failed", error.message);
        process.exit(1);
    }
}

startServer();