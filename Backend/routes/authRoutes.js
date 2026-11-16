import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

import {
  registerLimiter,
  loginLimiter,
  verifyOTPLimiter,
  resendOTPLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter
} from "../middleware/rateLimiters.js";

const router = express.Router();

// Public routes
router.post("/register", registerLimiter, register);
router.post("/verify-email", verifyOTPLimiter, verifyEmail);
router.post("/resend-otp", resendOTPLimiter, resendOTP);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.post("/logout", logout);

// Protected routes
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);

export default router;