import nodemailer from "nodemailer";
import config from "../../../config";

interface EmailPayload {
  to: string;
  subject: string;

  html?: string;
}

const emailSender = async (payload: EmailPayload): Promise<void> => {
  const { to, subject, html } = payload;

  // Debug: log email and mask password
  console.log("Email:", process.env.EMAIL);
  console.log("Password set:", !!process.env.APP_PASSWORD);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Takeout Bhairab" <${process.env.EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default emailSender;
