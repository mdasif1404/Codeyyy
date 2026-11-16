
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
  startTemporaryRoomMatch
} from "../controllers/roomController.js";

const router = express.Router();

// Temporary room routes
router.post("/temporary", authMiddleware, createTemporaryRoom);
router.post("/temporary/join", authMiddleware, joinTemporaryRoom);
router.get("/temporary/:roomId", authMiddleware, getTemporaryRoomDetails);
router.post("/temporary/:roomId/start", authMiddleware, startTemporaryRoomMatch);

// Create a permanent room
router.post("/", authMiddleware, createRoom);

// Join a room using room code
router.post("/join", authMiddleware, joinRoom);
router.post("/:roomId/leave", authMiddleware, leaveRoom);

// Start a match inside a room (owner only)
router.post("/:roomId/start", authMiddleware, startRoomMatch);

// Get the assigned challenge
router.get("/:roomId/challenge", authMiddleware, getRoomChallenge);
router.get("/:roomId", authMiddleware, getRoomDetails);

export default router;
