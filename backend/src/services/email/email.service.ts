import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

// ─── Transporter ──────────────────────────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  return transporter;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const client = getTransporter();

  if (!client) {
    logger.info(`[Email - no SMTP configured] To: ${to} | Subject: ${subject}`);
    logger.info('[Email] Add SMTP_USER + SMTP_PASS to .env to send real emails');
    return;
  }

  try {
    const info = await client.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`[Email sent] To: ${to} | MessageId: ${info.messageId}`);
  } catch (err: any) {
    logger.error(`[Email failed] To: ${to} | Error: ${err.message}`);
    throw err;
  }
}

// ─── Base Template ────────────────────────────────────────────────────────────

function base(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>ClaimWise UK</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f0fdf4;line-height:1px;max-width:0;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0fdf4;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d1fae5;box-shadow:0 4px 24px rgba(16,185,129,0.08);">

          <!-- ── Header ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#065f46 0%,#047857 60%,#10b981 100%);padding:32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:12px;text-align:center;vertical-align:middle;backdrop-filter:blur(10px);">
                    <span style="display:block;font-size:22px;font-weight:900;color:#ffffff;line-height:44px;letter-spacing:-1px;">C</span>
                  </td>
                  <td style="padding-left:14px;">
                    <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">ClaimWise <span style="color:#6ee7b7;">UK</span></p>
                    <p style="margin:2px 0 0;font-size:11px;color:#a7f3d0;letter-spacing:0.5px;text-transform:uppercase;">Benefits &amp; Bill Savings</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${body}
            </td>
          </tr>

          <!-- ── Divider ── -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#d1fae5;"></div>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:24px 40px;background:#f0fdf4;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">
                      <a href="https://claimwise.co.uk/privacy" style="color:#10b981;text-decoration:none;">Privacy Policy</a>
                      &nbsp;&middot;&nbsp;
                      <a href="https://claimwise.co.uk/terms" style="color:#10b981;text-decoration:none;">Terms of Service</a>
                      &nbsp;&middot;&nbsp;
                      <a href="mailto:hello@claimwise.co.uk" style="color:#10b981;text-decoration:none;">Contact Us</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                      ClaimWise UK · Informational tool only — not regulated financial advice.<br/>
                      Registered with the ICO. You received this because you have a ClaimWise UK account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Bottom spacer -->
        <p style="margin:20px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
          © ${new Date().getFullYear()} ClaimWise UK Ltd. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Button helper ────────────────────────────────────────────────────────────

function btn(href: string, label: string, secondary = false): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
      <tr>
        <td style="border-radius:12px;${secondary ? 'border:2px solid #10b981;' : 'background:linear-gradient(135deg,#059669,#10b981);box-shadow:0 4px 14px rgba(16,185,129,0.35);'}">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:${secondary ? '#059669' : '#ffffff'};text-decoration:none;letter-spacing:-0.2px;border-radius:12px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

// ─── Stat badge helper ────────────────────────────────────────────────────────

function statRow(emoji: string, value: string, label: string): string {
  return `
    <td style="text-align:center;padding:0 12px;">
      <div style="font-size:22px;margin-bottom:4px;">${emoji}</div>
      <div style="font-size:20px;font-weight:900;color:#065f46;letter-spacing:-0.5px;">${value}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;line-height:1.3;">${label}</div>
    </td>`;
}

// ─── Welcome email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';

  const features = [
    { emoji: '💷', title: 'Benefits check', desc: 'Scan 40+ UK benefits and find what you\'re owed in 60 seconds.' },
    { emoji: '⚡', title: 'Energy savings', desc: 'Compare tariffs and switch to the cheapest deal for your home.' },
    { emoji: '📄', title: 'Bill analysis', desc: 'Upload any bill as PDF — AI extracts details and finds savings.' },
    { emoji: '🔔', title: 'Smart alerts', desc: 'Get notified when new benefits open or prices change.' },
  ];

  const body = `
    <!-- Hero -->
    <h1 style="margin:0 0 6px;font-size:30px;font-weight:900;color:#064e3b;letter-spacing:-0.8px;line-height:1.15;">
      Welcome, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 28px;font-size:16px;color:#6b7280;line-height:1.6;">
      Your free ClaimWise UK account is ready. The average UK household finds
      <strong style="color:#065f46;">£2,700/year</strong> they didn't know they were owed.
    </p>

    <!-- Stats strip -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:14px;padding:20px;margin:0 0 28px;">
      <tr>
        ${statRow('💰', '£24B', 'unclaimed UK benefits each year')}
        ${statRow('🏠', '7M+', 'households missing out')}
        ${statRow('⏱️', '60s', 'to find your entitlements')}
      </tr>
    </table>

    <!-- What you can do -->
    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">What you can do with ClaimWise UK</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
      ${features.map((f, i) => `
      <tr>
        <td style="padding:12px 0;${i < features.length - 1 ? 'border-bottom:1px solid #f0fdf4;' : ''}">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="width:48px;vertical-align:top;padding-top:2px;">
                <div style="width:40px;height:40px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;text-align:center;line-height:40px;font-size:18px;">${f.emoji}</div>
              </td>
              <td style="padding-left:14px;vertical-align:top;">
                <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#064e3b;">${f.title}</p>
                <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${f.desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('')}
    </table>

    ${btn('https://claimwise.co.uk/dashboard/benefits', 'Run your free benefits check →')}

    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      Questions? Reply to this email or visit
      <a href="https://claimwise.co.uk" style="color:#10b981;text-decoration:none;">claimwise.co.uk</a>.
      We're here to help.
    </p>
  `;

  await send(to, `Welcome to ClaimWise UK, ${firstName}! 🎉 Your account is ready`, base(
    `Hi ${firstName}! Your ClaimWise UK account is ready — find your unclaimed UK benefits in 60 seconds.`,
    body,
  ));
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';

  const body = `
    <!-- Icon -->
    <div style="width:60px;height:60px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #bbf7d0;border-radius:16px;text-align:center;line-height:60px;font-size:28px;margin:0 0 24px;">
      🔑
    </div>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#064e3b;letter-spacing:-0.5px;">
      Reset your password
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Hi ${firstName}, we received a request to reset the password for your ClaimWise UK account
      (<strong style="color:#374151;">${to}</strong>).
      Click the button below — this link expires in <strong style="color:#064e3b;">1 hour</strong>.
    </p>

    ${btn(`${resetUrl}`, 'Reset my password →')}

    <!-- Security box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400e;">⚠️ Didn't request this?</p>
          <p style="margin:0;font-size:13px;color:#b45309;line-height:1.5;">
            Ignore this email — your password won't change. If you're concerned,
            <a href="mailto:hello@claimwise.co.uk" style="color:#d97706;font-weight:600;">contact us</a> immediately.
          </p>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
      Button not working? Copy and paste this link into your browser:<br/>
      <a href="${resetUrl}" style="color:#10b981;word-break:break-all;font-size:11px;">${resetUrl}</a>
    </p>
  `;

  await send(to, 'Reset your ClaimWise UK password — link expires in 1 hour', base(
    `Hi ${firstName}, here is your ClaimWise UK password reset link. It expires in 1 hour.`,
    body,
  ));
}

// ─── Password changed confirmation ───────────────────────────────────────────

export async function sendPasswordChangedEmail(to: string, name: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';
  const time = new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/London' });

  const body = `
    <!-- Icon -->
    <div style="width:60px;height:60px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #bbf7d0;border-radius:16px;text-align:center;line-height:60px;font-size:28px;margin:0 0 24px;">
      🔒
    </div>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#064e3b;letter-spacing:-0.5px;">
      Password changed
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Hi ${firstName}, the password for your ClaimWise UK account
      (<strong style="color:#374151;">${to}</strong>) was successfully changed on
      <strong style="color:#064e3b;">${time} (UK time)</strong>.
    </p>

    <!-- Info box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#065f46;">✅ What changed</p>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
            Your password has been updated. All other active sessions have been signed out for security.
          </p>
        </td>
      </tr>
    </table>

    <!-- Warning box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400e;">⚠️ Wasn't you?</p>
          <p style="margin:0;font-size:13px;color:#b45309;line-height:1.5;">
            If you didn't make this change,
            <a href="https://claimwise.co.uk/auth/forgot-password" style="color:#d97706;font-weight:600;">reset your password immediately</a>
            and contact us at
            <a href="mailto:hello@claimwise.co.uk" style="color:#d97706;">hello@claimwise.co.uk</a>.
          </p>
        </td>
      </tr>
    </table>

    ${btn('https://claimwise.co.uk/auth', 'Sign in to your account', true)}
  `;

  await send(to, 'Your ClaimWise UK password was changed', base(
    `Your ClaimWise UK password was changed on ${time}. If this wasn't you, act now.`,
    body,
  ));
}

// ─── Account deleted email ────────────────────────────────────────────────────

export async function sendAccountDeletedEmail(to: string, name: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'there';

  const deletedItems = [
    'Your profile and household information',
    'All benefits check history and results',
    'All savings records and progress',
    'All alert notifications',
    'Your subscription data',
  ];

  const body = `
    <!-- Icon -->
    <div style="width:60px;height:60px;background:#fef2f2;border:2px solid #fecaca;border-radius:16px;text-align:center;line-height:60px;font-size:28px;margin:0 0 24px;">
      👋
    </div>

    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#064e3b;letter-spacing:-0.5px;">
      Account deleted
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Hi ${firstName}, your ClaimWise UK account (<strong style="color:#374151;">${to}</strong>)
      and all associated data have been permanently deleted as requested.
    </p>

    <!-- Deleted items -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#991b1b;">What was deleted:</p>
          ${deletedItems.map(item => `
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
            <span style="color:#f87171;margin-right:8px;">✕</span>${item}
          </p>`).join('')}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
      We're sorry to see you go. If we could have done anything better, please reply to this email and let us know.
    </p>

    <!-- Come back -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin:0 0 24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#065f46;line-height:1.5;">
            Changed your mind? You can always
            <a href="https://claimwise.co.uk/auth/register" style="color:#10b981;font-weight:700;">create a new free account</a>
            anytime. Your data will not be restored, but you can start fresh.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#9ca3af;">
      Take care, and best of luck with your savings journey. 🍀
    </p>
  `;

  await send(to, 'Your ClaimWise UK account has been deleted', base(
    `Your ClaimWise UK account has been permanently deleted. Thank you for using our service.`,
    body,
  ));
}
