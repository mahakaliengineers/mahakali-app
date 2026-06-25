import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { inquiriesTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/contact", async (req, res) => {
  const { firstName, lastName, email, phone, projectType, message } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    projectType?: string;
    message?: string;
  };

  if (!firstName || !email || !message) {
    res.status(400).json({ error: "firstName, email, and message are required." });
    return;
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  // Always save to DB first — so no inquiry is ever lost
  try {
    await db.insert(inquiriesTable).values({
      firstName,
      lastName: lastName ?? "",
      email,
      phone: phone ?? "",
      projectType: projectType ?? "",
      message,
    });
    req.log.info({ email, name: fullName }, "Inquiry saved to database");
  } catch (err) {
    req.log.error({ err }, "Failed to save inquiry to database");
    res.status(500).json({ error: "Failed to submit inquiry. Please try again." });
    return;
  }

  // Attempt email notification — if it fails we still return success
  const gmailUser = "mahakaliengineers885@gmail.com";
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #E8192C; padding: 24px 32px;">
          <h2 style="color: white; margin: 0; font-size: 22px;">New Project Inquiry</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Mahakali Engineers and Developers Pvt. Ltd.</p>
        </div>
        <div style="padding: 32px; background: #fff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px; font-size: 13px;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b;">${fullName}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;"><a href="mailto:${email}" style="color: #E8192C;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${phone}</td></tr>` : ""}
            ${projectType ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">Project Type</td><td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${projectType}</td></tr>` : ""}
          </table>
          <div style="margin-top: 24px;">
            <p style="color: #64748b; font-size: 13px; margin-bottom: 8px;">Message</p>
            <div style="background: #f8fafc; border-left: 4px solid #E8192C; padding: 16px; border-radius: 0 4px 4px 0; color: #1e293b; line-height: 1.7; white-space: pre-wrap;">${message}</div>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; text-align: center; color: #94a3b8; font-size: 12px;">
          Sent from mahakaliengineers.com.np · Chabahil-07, Kathmandu, Nepal
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Mahakali Website" <${gmailUser}>`,
        to: gmailUser,
        replyTo: email,
        subject: `New Inquiry from ${fullName} — ${projectType || "General"}`,
        html: htmlBody,
      });

      await transporter.sendMail({
        from: `"Mahakali Engineers" <${gmailUser}>`,
        to: email,
        subject: "We received your inquiry — Mahakali Engineers and Developers",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #E8192C; padding: 24px 32px;">
              <h2 style="color: white; margin: 0;">Thank you, ${firstName}!</h2>
            </div>
            <div style="padding: 32px; background: #fff; color: #1e293b; line-height: 1.7;">
              <p>We have received your project inquiry and our team will get back to you within <strong>24 hours</strong>.</p>
              <p>If you need immediate assistance, please call us at <strong>+977 9851405916</strong> or send a WhatsApp message.</p>
              <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #64748b;">
                <strong style="color: #1e293b;">Mahakali Engineers and Developers Pvt. Ltd.</strong><br/>
                Chabahil-07, Kathmandu, Nepal<br/>
                📞 +977 9851405916 &nbsp;·&nbsp; 🌐 mahakaliengineers.com.np
              </div>
            </div>
          </div>
        `,
      });

      req.log.info({ email, name: fullName }, "Contact confirmation emails sent");
    } catch (emailErr) {
      req.log.warn({ err: emailErr }, "Email sending failed — inquiry already saved to DB");
    }
  } else {
    req.log.warn("GMAIL_APP_PASSWORD not set — skipping email, inquiry saved to DB only");
  }

  res.json({ success: true, message: "Inquiry submitted successfully." });
});

export default router;
