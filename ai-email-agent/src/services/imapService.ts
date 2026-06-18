import Imap from "imap";
import * as dotenv from "dotenv";

dotenv.config();

// ─────────────────────────────────────────────
//  Append email to the Sent folder of a
//  specific account (called after SMTP send)
//
//  Parameters fallback to .env if not provided,
//  so the old single-account code still works.
// ─────────────────────────────────────────────
export async function appendToSentFolder(
  from: string,
  to: string,
  subject: string,
  body: string,
  date: Date = new Date(),
  imapHost?: string,
  password?: string,
  user?: string,
  imapPort?: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = {
      user: user || process.env.EMAIL_USER!,
      password: password || process.env.EMAIL_PASS!,
      host: imapHost || process.env.IMAP_HOST || process.env.SMTP_HOST!,
      port: imapPort || parseInt(process.env.IMAP_PORT || "993"),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    };

    if (!config.user || !config.password || !config.host) {
      return reject(new Error("Missing IMAP credentials"));
    }

    const imap = new Imap(config);
    const rawEmail = buildRawEmail(from, to, subject, body, date);

    imap.once("ready", () => {
      const sentFolders = ["Sent", "Sent Items", "Sent Messages", "INBOX.Sent"];

      const tryNext = (index: number) => {
        if (index >= sentFolders.length) {
          imap.end();
          return reject(
            new Error(
              "Sent folder not found. Tried: " + sentFolders.join(", "),
            ),
          );
        }

        imap.openBox(sentFolders[index], false, (err: any) => {
          if (err) return tryNext(index + 1);

          imap.append(rawEmail, { flags: ["\\Seen"] }, (appendErr: any) => {
            imap.end();
            if (appendErr) {
              reject(new Error(`IMAP append failed: ${appendErr.message}`));
            } else {
              resolve();
            }
          });
        });
      };

      tryNext(0);
    });

    imap.once("error", (err: Error) => {
      reject(new Error(`IMAP connection error: ${err.message}`));
    });

    imap.connect();
  });
}

// ─────────────────────────────────────────────
//  Build RFC 822 raw email buffer
// ─────────────────────────────────────────────
function buildRawEmail(
  from: string,
  to: string,
  subject: string,
  body: string,
  date: Date,
): Buffer {
  const email = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${date.toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    body,
  ].join("\r\n");

  return Buffer.from(email, "utf-8");
}

// ─────────────────────────────────────────────
//  Test IMAP connection (for startup check)
// ─────────────────────────────────────────────
export async function testImapConnection(
  user?: string,
  password?: string,
  host?: string,
  port?: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    const config = {
      user: user || process.env.EMAIL_USER!,
      password: password || process.env.EMAIL_PASS!,
      host: host || process.env.IMAP_HOST || process.env.SMTP_HOST!,
      port: port || parseInt(process.env.IMAP_PORT || "993"),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    };

    if (!config.user || !config.password || !config.host) {
      console.log("❌ Missing IMAP credentials");
      return resolve(false);
    }

    const imap = new Imap(config);

    imap.once("ready", () => {
      imap.end();
      resolve(true);
    });

    imap.once("error", (err: Error) => {
      console.log(`❌ IMAP failed (${config.user}): ${err.message}`);
      resolve(false);
    });

    imap.connect();
  });
}
