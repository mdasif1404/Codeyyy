
import express from "express";

import {
  getGlobalLeaderboard,
  getWeeklyLeaderboard
} from "../controllers/leaderboardController.js";

const router = express.Router();

// Global leaderboard
router.get("/global", getGlobalLeaderboard);

// Weekly and monthly leaderboard
router.get("/weekly", getWeeklyLeaderboard);

export default router;
