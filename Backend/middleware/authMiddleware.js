
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  // Check JWT configuration
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      success: false,
      message: "Server authentication configuration error"
    });
  }

  // Read authentication cookie
  const token = req.cookies?.codyyy_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login."
    });
  }

  let decoded;

  // Verify JWT
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      typeof decoded.id !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication session"
    });
  }

  // Verify current account status in MongoDB
  try {
    const user = await User.findById(decoded.id)
      .select("_id isActive isEmailVerified role");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account is unavailable. Please login again."
      });
    }

    // Email must have been verified during registration
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please complete email verification."
      });
    }

    // Attach authenticated user information
    req.user = {
      id: user._id.toString(),
      role: user.role
    };

    next();

  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate user"
    });
  }
};

export default authMiddleware;
