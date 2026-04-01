import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { getNextTransporter, humanMimicryDelay } from "./services/smtpRotation";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());

app.post("/api/start-campaign", async (req, res) => {
  const { subject, body, leads } = req.body;

  if (!subject || !body || !leads || leads.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  res
    .status(200)
    .json({ message: "Campaign started successfully in background!" });

  console.log("🤖 Background Campaign Triggered from UI...");

  // Background me emails bhejna shuru
  for (const [index, lead] of leads.entries()) {
    try {
      // Tags replace karna (e.g. {{Name}})
      const finalSubject = subject.replace(/{{Name}}/g, lead.Name);
      const finalBody = body.replace(/{{Name}}/g, lead.Name);

      const transporter = getNextTransporter();
      const currentSender = (transporter.options as any).auth.user;

      const mailOptions = {
        from: `Ravi <${currentSender}>`,
        to: lead.Email,
        bcc: currentSender, // Tracking copy for "Sent" folder substitute
        subject: finalSubject,
        text: finalBody,
      };

      await transporter.sendMail(mailOptions);

      // Success Logging
      const successLog = `✅ ${new Date().toISOString()} - Sent to ${lead.Email} via ${currentSender}\n`;
      fs.appendFileSync(path.join(process.cwd(), "sent_log.txt"), successLog);
      console.log(`[Dispatcher] ✅ Sent to ${lead.Email} via ${currentSender}`);

      if (index < leads.length - 1) {
        await humanMimicryDelay(45, 70); // 45-70 seconds ka delay
      }
    } catch (error: any) {
      // Error Logging
      const failLog = `❌ ${new Date().toISOString()} - Failed: ${lead.Email} - ${error.message}\n`;
      fs.appendFileSync(path.join(process.cwd(), "sent_log.txt"), failLog);
      console.error(`❌ Failed to process lead ${lead.Email}:`, error);
    }
  }
  console.log("\n🎉 Campaign finished!");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`Waiting for frontend to trigger campaign...`);
});
