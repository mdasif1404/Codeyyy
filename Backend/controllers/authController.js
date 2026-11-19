import { sendVerificationEmail } from "../services/emailService.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_MS,
  MAX_OTP_ATTEMPTS
} from "../services/otpService.js";

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Cookie configuration
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

// Generate JWT and send authentication cookie
const sendTokenCookie = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.cookie("codyyy_token", token, getCookieOptions());
};

// Safe user response
const userResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  stats: user.stats
});

// REGISTER

export const register = async (req, res) => {
  let createdUser = null;

  try {
    const { username, email, password } = req.body ?? {};

    // Validate input types
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required"
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Username validation
    if (
      cleanUsername.length < 3 ||
      cleanUsername.length > 20 ||
      !/^[a-z0-9_]+$/.test(cleanUsername)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid username"
      });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    // Password validation
    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes"
      });
    }

    // Check existing account
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanUsername }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    const now = new Date();

    // Create unverified user
    createdUser = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,

      isEmailVerified: false,
      emailVerificationOTP: hashedOTP,
      emailVerificationExpires: new Date(
        now.getTime() + OTP_EXPIRY_MS
      ),
      otpAttempts: 0,
      otpLastSentAt: now
    });

    // Send verification email
    await sendVerificationEmail(cleanEmail, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email using the OTP sent to your inbox.",
      email: cleanEmail,
      requiresEmailVerification: true
    });

  } catch (error) {
    // Remove newly created account if email delivery fails
    if (createdUser) {
      try {
        await User.deleteOne({ _id: createdUser._id });
      } catch (cleanupError) {
        console.error("Unverified account cleanup failed:", cleanupError);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered"
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};

    // Validate input
    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and six-digit OTP"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Retrieve OTP fields explicitly because they use select: false
    const user = await User.findOne({
      email: cleanEmail
    }).select(
      "+emailVerificationOTP +emailVerificationExpires +otpAttempts"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    if (
      !user.emailVerificationOTP ||
      !user.emailVerificationExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "No active OTP found. Please request a new OTP."
      });
    }

    // Check maximum attempts
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.emailVerificationOTP = undefined;
      user.emailVerificationExpires = undefined;
      user.otpAttempts = 0;

      await user.save();

      return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts reached. Please request a new OTP."
      });
    }

    // Check expiration
    if (user.emailVerificationExpires.getTime() <= Date.now()) {
      user.emailVerificationOTP = undefined;
      user.emailVerificationExpires = undefined;
      user.otpAttempts = 0;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP."
      });
    }

    // Verify submitted OTP
    const isValidOTP = verifyOTP(
      otp,
      user.emailVerificationOTP
    );

    if (!isValidOTP) {
      user.otpAttempts += 1;

      const remainingAttempts =
        MAX_OTP_ATTEMPTS - user.otpAttempts;

      if (remainingAttempts <= 0) {
        user.emailVerificationOTP = undefined;
        user.emailVerificationExpires = undefined;
        user.otpAttempts = 0;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: remainingAttempts <= 0
          ? "Maximum OTP attempts reached. Please request a new OTP."
          : "Incorrect OTP",
        remainingAttempts: Math.max(0, remainingAttempts)
      });
    }

    // Successfully verified
    user.isEmailVerified = true;

    // Remove OTP information
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    user.otpAttempts = 0;
    user.otpLastSentAt = null;

    await user.save();

    // Issue login cookie only after verification
    sendTokenCookie(user._id.toString(), res);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome to Codyyy!",
      user: userResponse(user)
    });

  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Email verification failed"
    });
  }
};


export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail
    }).select(
      "+emailVerificationOTP +emailVerificationExpires +otpAttempts +otpLastSentAt"
    );

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Check resend cooldown
    const now = Date.now();

    if (user.otpLastSentAt) {
      const elapsed = now - user.otpLastSentAt.getTime();
      const cooldownRemaining =
        OTP_RESEND_COOLDOWN_MS - elapsed;

      if (cooldownRemaining > 0) {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another OTP",
          retryAfter: Math.ceil(cooldownRemaining / 1000)
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationExpires = new Date(
      now + OTP_EXPIRY_MS
    );
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date(now);

    await user.save();

    // Send new OTP
    try {
      await sendVerificationEmail(cleanEmail, otp);
    } catch (emailError) {
      // Invalidate the OTP if email delivery fails
      user.emailVerificationOTP = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message: "A new verification OTP has been sent to your email"
    });

  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send verification OTP. Please try again later."
    });
  }
};


// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in"
      });
    }
    
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    sendTokenCookie(user._id.toString(), res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse(user)
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("codyyy_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

// GET LOGGED-IN USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: userResponse(user)
    });

  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile"
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body ?? {};

    const updates = {};

    if (username !== undefined) {
      if (typeof username !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid username"
        });
      }

      const cleanUsername = username.trim().toLowerCase();

      if (
        cleanUsername.length < 3 ||
        cleanUsername.length > 20 ||
        !/^[a-z0-9_]+$/.test(cleanUsername)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid username"
        });
      }

      updates.username = cleanUsername;
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Bio must not exceed 200 characters"
        });
      }

      updates.bio = bio.trim();
    }

    if (avatar !== undefined) {
      const allowedAvatars = [
        "/assets/avatar-cat.jpg",
        "/assets/avatar-dog.jpg",
        "/assets/avatar-doge.jpg",
        "/assets/avatar-duck.jpg",
        "/assets/avatar-frog.jpg",
        "/assets/avatar-hacker.jpg",
        "/assets/avatar-spiderman.jpg"
      ];
    
      if (
        typeof avatar !== "string" ||
        (avatar !== "" && !allowedAvatars.includes(avatar))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid avatar selection"
        });
      }
    
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile changes provided"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse(user)
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken"
      });
    }

    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Profile update failed"
    });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const genericResponse = {
      success: true,
      message: "If an eligible account exists, a password reset link will be sent to its email."
    };

    const user = await User.findOne({
      email: cleanEmail,
      isActive: true,
      isEmailVerified: true
    }).select("+resetPasswordToken +resetPasswordExpires +resetPasswordRequestedAt");

    // Do not reveal whether an account exists.
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Allow only one reset request every 60 seconds.
    if (
      user.resetPasswordRequestedAt &&
      Date.now() - user.resetPasswordRequestedAt.getTime() < 60000
    ) {
      return res.status(200).json(genericResponse);
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordRequestedAt = new Date();

    await user.save();

    const frontendUrl = process.env.CLIENT_URL;

    if (!frontendUrl) {
      throw new Error("CLIENT_URL is not configured");
    }

    const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      throw emailError;
    }

    return res.status(200).json(genericResponse);

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again later."
    });
  }
};


// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body ?? {};

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request"
      });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true
    }).select("+resetPasswordToken +resetPasswordExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired"
      });
    }

    user.password = await bcrypt.hash(password, 12);

    // Invalidate the reset link after successful use.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordRequestedAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again."
    });
  }
};