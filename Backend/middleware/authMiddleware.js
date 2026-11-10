
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.codyyy_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decoded.id
    };

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication session"
    });
  }
};

export default authMiddleware;
