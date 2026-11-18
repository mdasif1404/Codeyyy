
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createRoom,
  joinRoom,
  leaveRoom,
  startRoomMatch,
  getRoomChallenge,
  getRoomDetails,
  createTemporaryRoom,
  joinTemporaryRoom,
  getTemporaryRoomDetails,
  startTemporaryRoomMatch,
  getMyTemporaryRoom,
  leaveTemporaryRoom,
  getTemporaryRoomMatchDetails,
  getPermanentRoomMatchDetails
} from "../controllers/roomController.js";

const router = express.Router();

// Temporary room routes
router.post("/temporary", authMiddleware, createTemporaryRoom);
router.post("/temporary/join", authMiddleware, joinTemporaryRoom);
router.get("/temporary/my-room", authMiddleware, getMyTemporaryRoom);
router.get("/temporary/:roomId", authMiddleware, getTemporaryRoomDetails);
router.post("/temporary/:roomId/start", authMiddleware, startTemporaryRoomMatch);
router.post("/temporary/:roomId/leave", authMiddleware, leaveTemporaryRoom);
router.get("/temporary/:roomId/matches/:matchId", authMiddleware, getTemporaryRoomMatchDetails);

// Create a permanent room
router.post("/", authMiddleware, createRoom);

// Join a room using room code
router.post("/join", authMiddleware, joinRoom);
router.post("/:roomId/leave", authMiddleware, leaveRoom);

// Start a match inside a room (owner only)
router.post("/:roomId/start", authMiddleware, startRoomMatch);
router.get(
  "/:roomId/matches/:matchId",
  authMiddleware,
  getPermanentRoomMatchDetails
);

// Get the assigned challenge
router.get("/:roomId/challenge", authMiddleware, getRoomChallenge);
router.get("/:roomId", authMiddleware, getRoomDetails);

export default router;
