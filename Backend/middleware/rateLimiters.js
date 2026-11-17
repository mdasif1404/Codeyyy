import rateLimit from "express-rate-limit";

const createLimiter = (windowMs, limit, message) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
      success: false,
      message
    }
  });
};

// Registration: 5 attempts per 15 minutes
export const registerLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many registration attempts. Please try again later."
);

// Login: 10 attempts per 15 minutes
export const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again later."
);

// OTP verification: 10 requests per 15 minutes
export const verifyOTPLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many OTP verification requests. Please try again later."
);

// OTP resend: 5 requests per 15 minutes
export const resendOTPLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many OTP resend requests. Please try again later."
);

// Forgot password: 5 requests per 15 minutes
export const forgotPasswordLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many password reset requests. Please try again later."
);

// Reset password: 10 attempts per 15 minutes
export const resetPasswordLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many password reset attempts. Please try again later."
);