/**
 * email.service.js
 * Dual-transport email service.
 * - Primary:  Resend (set RESEND_API_KEY) — proper DKIM, lands in inbox
 * - Fallback: Gmail SMTP (SMTP_USER + SMTP_PASS) — works but may hit spam
 */

const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

// ── Resend client ─────────────────────────────────────────────────────────────
const FROM_ADDRESS = env.RESEND_FROM || 'RiseRank <onboarding@resend.dev>';

// ── Gmail SMTP fallback ───────────────────────────────────────────────────────
const createSmtpTransport = () => nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: env.SMTP_PORT || 587,
  secure: (env.SMTP_PORT || 587) === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

// ── Base HTML template ────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #1a56db; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .header p { color: #c7d9ff; margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .otp-box { background: #f0f5ff; border: 2px solid #1a56db; border-radius: 8px; text-align: center; padding: 20px; margin: 24px 0; }
    .otp-box span { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a56db; }
    .btn { display: inline-block; background: #1a56db; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0; }
    .note { font-size: 12px; color: #888; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; }
    .footer { background: #f8f9fa; padding: 16px 32px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RiseRank</h1>
      <p>Your Government Exam Preparation Partner</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} RiseRank | <a href="https://riserank.in">riserank.in</a>
    </div>
  </div>
</body>
</html>
`;

// ── Email Templates ───────────────────────────────────────────────────────────

const templates = {
  emailVerification: (name, otp) => ({
    subject: 'Verify your RiseRank account',
    html: baseTemplate(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to RiseRank! Use the OTP below to verify your email address.</p>
      <div class="otp-box">
        <span>${otp}</span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not sign up for RiseRank, please ignore this email.</p>
      <p class="note">For security, never share this OTP with anyone. RiseRank will never ask for your OTP.</p>
    `),
  }),

  forgotPassword: (name, otp) => ({
    subject: 'Reset your RiseRank password',
    html: baseTemplate(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Use the OTP below:</p>
      <div class="otp-box">
        <span>${otp}</span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
      <p class="note">For security, never share this OTP with anyone.</p>
    `),
  }),

  passwordChanged: (name) => ({
    subject: 'Your RiseRank password was changed',
    html: baseTemplate(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your RiseRank account password was successfully changed.</p>
      <p>If you did not make this change, please contact us immediately at <a href="mailto:support@riserank.in">support@riserank.in</a>.</p>
    `),
  }),

  quizCompletion: (name, quizTitle, { score, totalMarks, percentage, correctCount, wrongCount, skippedCount, attemptId }) => ({
    subject: `Quiz result: ${quizTitle} — ${percentage}% ✅`,
    html: baseTemplate(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>You just completed <strong>${quizTitle}</strong>. Here's how you did:</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr style="background:#f0f5ff;">
          <td style="padding:12px 16px;font-weight:bold;border-radius:4px 0 0 4px;">Score</td>
          <td style="padding:12px 16px;text-align:right;font-size:20px;font-weight:bold;color:#1a56db;">${score} / ${totalMarks}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#555;">Accuracy</td>
          <td style="padding:10px 16px;text-align:right;font-weight:bold;color:${percentage >= 70 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626'};">${percentage}%</td>
        </tr>
        <tr style="background:#f8f9fa;">
          <td style="padding:10px 16px;color:#555;">✅ Correct</td>
          <td style="padding:10px 16px;text-align:right;color:#16a34a;font-weight:bold;">${correctCount}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#555;">❌ Wrong</td>
          <td style="padding:10px 16px;text-align:right;color:#dc2626;font-weight:bold;">${wrongCount}</td>
        </tr>
        <tr style="background:#f8f9fa;">
          <td style="padding:10px 16px;color:#555;">⏭ Skipped</td>
          <td style="padding:10px 16px;text-align:right;color:#888;font-weight:bold;">${skippedCount}</td>
        </tr>
      </table>

      <p>Want to see which questions you got wrong?</p>
      <a href="riserank://quiz/review/${attemptId}" class="btn">Review Your Answers</a>

      <p style="margin-top:24px;">Keep the streak going — attempt tomorrow's quiz too! 🔥</p>
      <p class="note">Open in the RiseRank app or visit <a href="https://riserank.in">riserank.in</a></p>
    `),
  }),

  welcomeEmail: (name) => ({
    subject: 'Welcome to RiseRank! 🎯',
    html: baseTemplate(`
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to <strong>RiseRank</strong> — your bilingual government exam preparation platform!</p>
      <p>Here's what you can do:</p>
      <ul>
        <li>📰 Read daily current affairs in English or Hindi</li>
        <li>🧠 Attempt daily quizzes and track your score</li>
        <li>🏆 Compete on the leaderboard</li>
        <li>🔖 Bookmark important questions</li>
        <li>🔥 Maintain your daily streak</li>
      </ul>
      <p>Start preparing today!</p>
      <a href="https://riserank.in" class="btn">Go to RiseRank</a>
    `),
  }),
};

// ── Send Function ─────────────────────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, text }) => {
  const plainText = text ?? html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // ── Try Resend first (better deliverability) ──────────────────────────────
  if (env.RESEND_API_KEY) {
    try {
      const resend = new Resend(env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: Array.isArray(to) ? to : [to],
        subject, html, text: plainText,
      });
      if (error) throw new Error(error.message);
      logger.info(`[Resend] Email sent to ${to}: ${data.id}`);
      return;
    } catch (err) {
      logger.error(`[Resend] Failed, falling back to SMTP: ${err.message}`);
    }
  }

  // ── Fall back to Gmail SMTP ───────────────────────────────────────────────
  if (env.SMTP_USER && env.SMTP_PASS) {
    try {
      const transporter = createSmtpTransport();
      const info = await transporter.sendMail({
        from: `"RiseRank" <${env.SMTP_USER}>`,
        to, subject, html, text: plainText,
      });
      logger.info(`[SMTP] Email sent to ${to}: ${info.messageId}`);
      return;
    } catch (err) {
      logger.error(`[SMTP] Email send failed to ${to}: ${err.message}`);
    }
  }

  logger.warn(`No email transport configured — skipping send to ${to}`);
};

// ── Convenience methods ───────────────────────────────────────────────────────

const sendVerificationOTP = async (email, name, otp) => {
  const { subject, html } = templates.emailVerification(name, otp);
  const text = `Hi ${name},\n\nYour RiseRank email verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you did not sign up for RiseRank, please ignore this email.\n\n— RiseRank Team`;
  await sendEmail({ to: email, subject, html, text });
};

const sendForgotPasswordOTP = async (email, name, otp) => {
  const { subject, html } = templates.forgotPassword(name, otp);
  const text = `Hi ${name},\n\nYour RiseRank password reset code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\n— RiseRank Team`;
  await sendEmail({ to: email, subject, html, text });
};

const sendPasswordChangedAlert = async (email, name) => {
  const { subject, html } = templates.passwordChanged(name);
  await sendEmail({ to: email, subject, html });
};

const sendWelcomeEmail = async (email, name) => {
  const { subject, html } = templates.welcomeEmail(name);
  await sendEmail({ to: email, subject, html });
};

const sendQuizCompletionEmail = async (email, name, quizTitle, stats) => {
  const { subject, html } = templates.quizCompletion(name, quizTitle, stats);
  await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendVerificationOTP,
  sendForgotPasswordOTP,
  sendPasswordChangedAlert,
  sendWelcomeEmail,
  sendQuizCompletionEmail,
};
