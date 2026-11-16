import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  runCodeController,
  submitCodeController
} from "../controllers/codeControllers.js";

const router = express.Router();

// Execute code with custom input
router.post("/run", authMiddleware, runCodeController);

// Submit code for challenge evaluation
router.post("/submit", authMiddleware, submitCodeController);

export default router;