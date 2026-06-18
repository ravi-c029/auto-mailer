import nodemailer, { Transporter } from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

export interface EmailAccount {
  label: string;
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
  imapHost?: string;
  imapPort?: number;
}

// ✅ FIXED: dynamic + correct defaults
function loadAccounts(): EmailAccount[] {
  const accounts: EmailAccount[] = [];

  let i = 1;
  while (process.env[`EMAIL_USER_${i}`]) {

    // 🔥 ADD THIS
    console.log("USER:", process.env[`EMAIL_USER_${i}`]);
    console.log("PASS:", process.env[`EMAIL_PASS_${i}`]);

    const port = parseInt(
      process.env[`SMTP_PORT_${i}`] || process.env.SMTP_PORT || "465"
    );

    accounts.push({
      label: `Account ${i}`,
      user: process.env[`EMAIL_USER_${i}`]!,
      pass: process.env[`EMAIL_PASS_${i}`]!,

      host:
        process.env[`SMTP_HOST_${i}`] ||
        process.env.SMTP_HOST ||
        "smtp.titan.email",

      port: port,

      // ✅ KEY FIX: secure depends on port
      secure: port === 465, // true only for 465

      imapHost: process.env.IMAP_HOST || "imap.titan.email",
      imapPort: parseInt(process.env.IMAP_PORT || "993"),
    });

    i++;
  }

  if (accounts.length === 0) {
    throw new Error("No email accounts configured");
  }

  return accounts;
}

export const emailAccounts = loadAccounts();

// ✅ FIXED transporter (STARTTLS support)
export function createTransporter(account: EmailAccount): Transporter {
  const transporter = nodemailer.createTransport({
    host: account.host,
    port: account.port,
    secure: account.secure, // true for 465, false for 587

    auth: {
      user: account.user,
      pass: account.pass,
    },

    tls: {
      rejectUnauthorized: false,
    },

    connectionTimeout: 15000,  // 15s to connect
    greetingTimeout: 10000,    // 10s for server greeting
    socketTimeout: 30000,      // 30s socket idle timeout
  });

  // 🔥 DEBUG (important for silent fail)
  transporter.verify((err, success) => {
    if (err) {
      console.error(`❌ SMTP Error (${account.user}):`, err.message);
    } else {
      console.log(`✅ SMTP Ready: ${account.user}`);
    }
  });

  return transporter;
}

// ─────────────────────────────

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function humanMimicryDelay(
  minSeconds = 8,
  maxSeconds = 14,
  label = "",
) {
  const delay =
    Math.floor(Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000;

  console.log(`[${label}] waiting ${(delay / 1000).toFixed(1)}s`);
  return new Promise((r) => setTimeout(r, delay));
}

export function isNetworkError(err: any): boolean {
  return (
    ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(err?.code) ||
    err?.message?.toLowerCase().includes("timeout")
  );
}
