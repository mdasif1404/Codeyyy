
import nodemailer from "nodemailer";

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP verification email
export const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Codyyy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Codyyy Account",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px;">

        <h1 style="text-align: center; color: #4F46E5;">
          Codyyy
        </h1>

        <h2>Verify Your Email</h2>

        <p>
          Welcome to Codyyy! Use the verification code below
          to complete your registration.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <h1 style="letter-spacing: 10px; color: #4F46E5;">
            ${otp}
          </h1>
        </div>

        <p>
          This verification code expires in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this, you can safely ignore this email.
        </p>

        <hr />

        <p style="font-size: 12px; color: #777; text-align: center;">
          © ${new Date().getFullYear()} Codyyy. All rights reserved.
        </p>

      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: `"Codyyy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Codyyy Password",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px;">

        <h1 style="text-align: center; color: #4F46E5;">
          Codyyy
        </h1>

        <h2>Reset Your Password</h2>

        <p>
          We received a request to reset your Codyyy account password.
          Click the button below to choose a new password.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>
          This link expires in <strong>15 minutes</strong>
          and can only be used once.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <hr />

        <p style="font-size: 12px; color: #777; text-align: center;">
          © ${new Date().getFullYear()} Codyyy. All rights reserved.
        </p>

      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// Verify Gmail SMTP connection
export const verifyEmailConnection = async () => {
  return await transporter.verify();
};
