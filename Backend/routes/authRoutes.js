
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMe, login, logout, register, updateProfile } from "../Controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);

export default router;
