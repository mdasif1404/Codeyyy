
import crypto from "crypto";

// OTP configuration
export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const MAX_OTP_ATTEMPTS = 5;

// Generate a cryptographically secure 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Hash OTP using HMAC-SHA256
export const hashOTP = (otp) => {
  if (!process.env.OTP_SECRET) {
    throw new Error("OTP_SECRET is not configured");
  }

  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(otp)
    .digest("hex");
};

// Compare OTP hashes securely
export const verifyOTP = (otp, storedHash) => {
  if (
    typeof otp !== "string" ||
    !/^\d{6}$/.test(otp) ||
    typeof storedHash !== "string"
  ) {
    return false;
  }

  const submittedHash = Buffer.from(hashOTP(otp), "hex");
  const originalHash = Buffer.from(storedHash, "hex");

  if (submittedHash.length !== originalHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    submittedHash,
    originalHash
  );
};
