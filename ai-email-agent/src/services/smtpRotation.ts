import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // cPanel servers sometimes have certificate issues or need specific TLS versions
    rejectUnauthorized: false,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

export const getNextTransporter = () => {
  console.log(`[Dispatcher] Using SMTP Account: ${process.env.EMAIL_USER}`);
  return transporter;
};

export const humanMimicryDelay = async (minSeconds = 40, maxSeconds = 50) => {
  const minMs = minSeconds * 1000;
  const maxMs = maxSeconds * 1000;
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1) + minMs);

  console.log(
    `[Dispatcher] Sleeping for ${(delay / 1000).toFixed(1)} seconds...`,
  );
  return new Promise((resolve) => setTimeout(resolve, delay));
};
