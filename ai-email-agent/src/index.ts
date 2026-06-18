import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import {
  emailAccounts,
  createTransporter,
  humanMimicryDelay,
  isNetworkError,
  EmailAccount,
  isValidEmail,
} from "./services/smtpRotation";
import { appendToSentFolder } from "./services/imapService";
import { CampaignProgress, Lead } from "./services/campaignProgress";
import * as dotenv from "dotenv";

dotenv.config();

const LOG_FILE = path.join(process.cwd(), "sent_log.txt");
const MIN_DELAY_SECONDS = 8;
const MAX_DELAY_SECONDS = 14;
const MAX_NETWORK_RETRIES = 5;
const NETWORK_RETRY_WAIT = 20;
const RATE_LIMIT_BACKOFF_MS = 60_000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let campaignRunning = false;

(async () => {
  console.log("\n📬 Email Campaign Server Starting...");
  console.log(`📧 Loaded ${emailAccounts.length} email account(s):`);
  emailAccounts.forEach((acc, i) => {
    console.log(`   ${i + 1}. ${acc.user} → ${acc.host}:${acc.port}`);
  });

  if (CampaignProgress.hasActiveSession()) {
    console.log("\n⚡ FOUND UNFINISHED CAMPAIGN.");
  }
})();

function createLeadQueue(leads: Lead[], progress: CampaignProgress) {
  let index = 0;
  const retryQueue: Lead[] = [];

  return {
    next(): Lead | null {
      while (retryQueue.length > 0) {
        const lead = retryQueue.shift()!;
        if (
          !progress.alreadySent(lead.Email) &&
          !progress.isPermanentlyFailed(lead.Email)
        ) {
          return lead;
        }
      }

      while (index < leads.length) {
        const lead = leads[index++];
        if (
          progress.alreadySent(lead.Email) ||
          progress.isPermanentlyFailed(lead.Email)
        )
          continue;

        return lead;
      }
      return null;
    },

    requeue(lead: Lead): void {
      retryQueue.push(lead);
    },
  };
}

// ✅ UPDATED FUNCTION
async function sendWithRetry(
  transporter: ReturnType<typeof createTransporter>,
  account: EmailAccount,
  lead: Lead,
  subject: string,
  body: string,
): Promise<"sent" | "failed" | "skipped" | "requeue"> {
  if (!isValidEmail(lead.Email)) return "skipped";

  // ✅ FIXED TEMPLATE REPLACEMENT
  const finalSubject = subject
    .replace(/{{Name}}/g, lead.Name || "Sir/Madam")
    .replace(/{{CompanyName}}/g, lead.CompanyName || "");

  const finalBody = body
    .replace(/{{Name}}/g, lead.Name || "Sir/Madam")
    .replace(/{{CompanyName}}/g, lead.CompanyName || "");

  const sendTime = new Date();

  const mailOptions = {
    from: `White Hope Foundation <${account.user}>`,
    to: lead.Email,
    subject: finalSubject,
    text: finalBody,
  };

  let attempt = 0;

  while (attempt <= MAX_NETWORK_RETRIES) {
    try {
      await transporter.sendMail(mailOptions);

      fs.appendFileSync(
        LOG_FILE,
        `✅ ${sendTime.toISOString()} | ${account.user} → ${lead.Email}\n`,
      );

      appendToSentFolder(
        `White Hope Foundation <${account.user}>`,
        lead.Email,
        finalSubject,
        finalBody,
        sendTime,
        account.imapHost,
        account.pass,
        account.user,
        account.imapPort,
      ).catch((e: any) => {
        console.warn(`[${account.label}] ⚠️  IMAP save failed: ${e.message}`);
      });

      return "sent";
    } catch (err: any) {
      if (isNetworkError(err)) {
        attempt++;
        await new Promise((r) => setTimeout(r, NETWORK_RETRY_WAIT * 1000));
      } else {
        return "failed";
      }
    }
  }

  return "requeue";
}

async function runAccountWorker(
  account: EmailAccount,
  queue: any,
  progress: CampaignProgress,
  subject: string,
  body: string,
) {
  const transporter = createTransporter(account);

  while (true) {
    const lead = queue.next();
    if (!lead) break;

    const result = await sendWithRetry(
      transporter,
      account,
      lead,
      subject,
      body,
    );

    if (result === "sent") progress.markSent(lead.Email);
    else if (result === "failed") progress.markFailed(lead.Email);
    else if (result === "requeue") queue.requeue(lead);

    await humanMimicryDelay(
      MIN_DELAY_SECONDS,
      MAX_DELAY_SECONDS,
      account.label,
    );
  }
}

async function runCampaign(leads: Lead[], progress: CampaignProgress) {
  const { subject, body } = progress;

  const queue = createLeadQueue(leads, progress);

  const workers = emailAccounts.map((acc) =>
    runAccountWorker(acc, queue, progress, subject, body),
  );

  await Promise.all(workers);

  progress.markFinished();
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

app.post("/api/start-campaign", async (req, res) => {
  const { subject, body, leads } = req.body;

  const progress = CampaignProgress.create(subject, body, leads);

  res.json({ message: "Campaign started" });

  campaignRunning = true;
  await runCampaign(leads, progress);
  campaignRunning = false;
});

app.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});
