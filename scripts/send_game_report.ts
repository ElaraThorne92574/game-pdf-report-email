import { sendEmail } from "../src/infrai_email.ts";
import { buildGameReportPdf, reportEmailHtml } from "../src/pdf_report.ts";
import { randomUUID } from "node:crypto";

const recipient = process.env.GAME_REPORT_TO;
if (!recipient) throw new Error("GAME_REPORT_TO is required");

const pdf = buildGameReportPdf("game backend user", 12, 8);
const result = await sendEmail(
  { to: recipient, subject: "Your game report", html: reportEmailHtml("game backend user", pdf) },
  `game-report-${recipient}-${randomUUID()}`
);
console.log(`sent message ${result.message_id}`);
