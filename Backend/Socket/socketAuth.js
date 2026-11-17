
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import User from "../models/User.js";

const parseCookies = cookieParser();

const socketAuth = (socket, next) => {

  // Parse cookies from Socket.IO handshake request
  parseCookies(socket.request, {}, async (error) => {
    if (error) {
      return next(new Error("Unable to read authentication cookie"));
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
      }

      // Read authentication cookie
      const token = socket.request.cookies?.codyyy_token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify JWT
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (
        typeof decoded !== "object" ||
        typeof decoded.id !== "string"
      ) {
        return next(new Error("Invalid authentication token"));
      }

      // Check user in MongoDB
      const user = await User.findById(decoded.id)
        .select("_id username isActive isEmailVerified");

      if (!user || !user.isActive) {
        return next(new Error("Account unavailable"));
      }

      if (!user.isEmailVerified) {
        return next(new Error("Email verification required"));
      }

      // Attach authenticated user information
      socket.user = {
        id: user._id.toString(),
        username: user.username
      };

      next();

    } catch (error) {
      console.error("Socket authentication error:", error.message);

      next(new Error("Invalid or expired authentication session"));
    }
  });
};

export default socketAuth;
