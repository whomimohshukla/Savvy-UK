import { Resend } from 'resend';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!resend && env.RESEND_API_KEY && !env.RESEND_API_KEY.includes('xxx')) {
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const client = getResend();
  if (!client) {
    logger.info(`[Email dev] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await client.emails.send({ from: env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    logger.error('Email send failed:', err);
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

function base(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:#030c18;padding:28px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#10b981;width:36px;height:36px;border-radius:10px;text-align:center;vertical-align:middle;">
                  <span style="color:white;font-size:18px;font-weight:900;line-height:36px;">S</span>
                </td>
                <td style="padding-left:12px;">
                  <span style="color:white;font-size:18px;font-weight:700;letter-spacing:-0.02em;">Savvy UK</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Savvy UK Ltd · Registered with the ICO · <a href="https://savvy-uk.com/privacy" style="color:#10b981;">Privacy Policy</a> · <a href="https://savvy-uk.com/terms" style="color:#10b981;">Terms</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">This email was sent to you because you have a Savvy UK account.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';
  const body = `
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-0.02em;">Welcome, ${firstName}! 👋</h1>
    <p style="margin:0 0 24px;font-size:16px;color:#64748b;line-height:1.6;">Your free Savvy UK account is ready. Here's what you can do right now:</p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 32px;">
      ${[
        ['💷', 'Benefits check', 'Find unclaimed UK benefits you\'re entitled to in under 60 seconds.'],
        ['⚡', 'Energy comparison', 'Upload your bill and AI will find you a cheaper tariff instantly.'],
        ['📡', 'Bill analysis', 'Upload broadband, mobile, or water bills to find savings.'],
      ].map(([emoji, title, desc]) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;height:44px;background:#f0fdf4;border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">${emoji}</td>
              <td style="padding-left:16px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${title}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;">${desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('')}
    </table>
    <a href="https://savvy-uk.com/dashboard/benefits" style="display:inline-block;background:#10b981;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:-0.01em;">
      Run your free benefits check →
    </a>
    <p style="margin:32px 0 0;font-size:13px;color:#94a3b8;">
      On average, UK households find <strong style="color:#0f172a;">£2,700/year</strong> they were missing. Good luck!
    </p>
  `;
  await send(to, 'Welcome to Savvy UK — find your unclaimed money', base('Welcome to Savvy UK', body));
}

// ─── Password changed email ───────────────────────────────────────────────────

export async function sendPasswordChangedEmail(to: string, name: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';
  const time = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#0f172a;">Password changed</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">Hi ${firstName}, your Savvy UK password was changed on <strong>${time}</strong>.</p>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">⚠️ Wasn't you?</p>
      <p style="margin:8px 0 0;font-size:13px;color:#b45309;">If you didn't change your password, please <a href="mailto:hello@savvy-uk.com" style="color:#d97706;">contact us immediately</a> or reset your password now.</p>
    </div>
    <a href="https://savvy-uk.com/auth/forgot-password" style="display:inline-block;background:#10b981;color:white;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
      Reset my password
    </a>
  `;
  await send(to, 'Your Savvy UK password has been changed', base('Password changed', body));
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#0f172a;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
      Hi ${firstName}, we received a request to reset your Savvy UK password.
      Click the button below — this link expires in <strong>1 hour</strong>.
    </p>
    <a href="${resetUrl}" style="display:inline-block;background:#10b981;color:white;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:-0.01em;margin-bottom:24px;">
      Reset my password →
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:#cbd5e1;word-break:break-all;">
      Or copy this link: <span style="color:#10b981;">${resetUrl}</span>
    </p>
  `;
  await send(to, 'Reset your Savvy UK password', base('Reset your password', body));
}

// ─── Account deleted email ────────────────────────────────────────────────────

export async function sendAccountDeletedEmail(to: string, name: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#0f172a;">Account deleted</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
      Hi ${firstName}, your Savvy UK account and all associated data have been permanently deleted as requested.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#64748b;">What we deleted:</p>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#64748b;line-height:1.8;">
      <li>Your profile and household information</li>
      <li>Your benefits check history</li>
      <li>All savings records</li>
      <li>All alert notifications</li>
    </ul>
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      If you change your mind, you can always <a href="https://savvy-uk.com/auth/register" style="color:#10b981;">create a new account</a> for free.
    </p>
  `;
  await send(to, 'Your Savvy UK account has been deleted', base('Account deleted', body));
}
