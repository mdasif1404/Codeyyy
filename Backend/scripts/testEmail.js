
import "dotenv/config";

import {
  verifyEmailConnection,
  sendVerificationEmail
} from "../services/emailService.js";

const testEmail = async () => {
  try {
    console.log("Checking Gmail SMTP connection...");

    await verifyEmailConnection();

    console.log("Gmail SMTP connected successfully!");

    console.log("Sending test email...");

    await sendVerificationEmail(
      process.env.EMAIL_USER,
      "123456"
    );

    console.log("Test email sent successfully!");
    console.log("Check your Gmail inbox.");

  } catch (error) {
    console.error("Email test failed:", error.message);
  }
};

testEmail();
