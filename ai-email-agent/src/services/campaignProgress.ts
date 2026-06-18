import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

// ✅ UPDATED: added CompanyName
export interface Lead {
  Name: string;
  Email: string;
  CompanyName: string; // ← NEW FIELD
}

export interface CampaignState {
  campaignId: string;
  subject: string;
  body: string;
  totalLeads: number;
  sentEmails: string[];
  failedEmails: string[];
  startedAt: string;
  lastUpdatedAt: string;
  finished: boolean;
}

// ─────────────────────────────────────────────
const PROGRESS_FILE = path.join(process.cwd(), "campaign_progress.json");

export class CampaignProgress {
  private state: CampaignState;

  static create(
    subject: string,
    body: string,
    leads: Lead[],
  ): CampaignProgress {
    const state: CampaignState = {
      campaignId: `campaign_${Date.now()}`,
      subject,
      body,
      totalLeads: leads.length,
      sentEmails: [],
      failedEmails: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      finished: false,
    };

    const cp = new CampaignProgress(state);
    cp.save();
    return cp;
  }

  static load(): CampaignProgress | null {
    if (!fs.existsSync(PROGRESS_FILE)) return null;

    try {
      const raw = fs.readFileSync(PROGRESS_FILE, "utf-8");
      const state: CampaignState = JSON.parse(raw);

      if (state.finished) return null;

      return new CampaignProgress(state);
    } catch {
      return null;
    }
  }

  static hasActiveSession(): boolean {
    if (!fs.existsSync(PROGRESS_FILE)) return false;

    try {
      const state: CampaignState = JSON.parse(
        fs.readFileSync(PROGRESS_FILE, "utf-8"),
      );
      return !state.finished;
    } catch {
      return false;
    }
  }

  static clear(): void {
    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
  }

  private constructor(state: CampaignState) {
    this.state = state;
  }

  get id(): string {
    return this.state.campaignId;
  }

  get subject(): string {
    return this.state.subject;
  }

  get body(): string {
    return this.state.body;
  }

  get sentCount(): number {
    return this.state.sentEmails.length;
  }

  get failedCount(): number {
    return this.state.failedEmails.length;
  }

  get totalLeads(): number {
    return this.state.totalLeads;
  }

  alreadySent(email: string): boolean {
    return this.state.sentEmails.includes(email.toLowerCase());
  }

  isPermanentlyFailed(email: string): boolean {
    return this.state.failedEmails.includes(email.toLowerCase());
  }

  markSent(email: string): void {
    const normalized = email.toLowerCase();

    if (!this.state.sentEmails.includes(normalized)) {
      this.state.sentEmails.push(normalized);
      this.state.lastUpdatedAt = new Date().toISOString();
      this.save();
    }
  }

  markFailed(email: string): void {
    const normalized = email.toLowerCase();

    if (!this.state.failedEmails.includes(normalized)) {
      this.state.failedEmails.push(normalized);
      this.state.lastUpdatedAt = new Date().toISOString();
      this.save();
    }
  }

  markFinished(): void {
    this.state.finished = true;
    this.state.lastUpdatedAt = new Date().toISOString();
    this.save();
  }

  printStats(): void {
    const remaining =
      this.state.totalLeads -
      this.state.sentEmails.length -
      this.state.failedEmails.length;

    console.log(
      `[Progress] 📊 Total: ${this.state.totalLeads} | ` +
        `✅ Sent: ${this.state.sentEmails.length} | ` +
        `❌ Failed: ${this.state.failedEmails.length} | ` +
        `⏳ Remaining: ${remaining}`,
    );
  }

  private save(): void {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.state, null, 2));
  }
}
