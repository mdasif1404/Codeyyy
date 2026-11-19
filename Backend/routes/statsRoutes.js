
import express from "express";
import { getMyStats } from "../controllers/statsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyStats);

export default router;
