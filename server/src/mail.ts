import nodemailer from "nodemailer";
import { env } from "./env.js";

export type MailType = "verify" | "reset" | "change_email" | "change_email_new";

type Template = { subject: string; heading: string; body: string; button: string; footer: string };

// German and English texts; every other UI language falls back to English (as in the Lovable version)
const templates: Record<MailType, Record<"de" | "en", Template>> = {
  verify: {
    de: {
      subject: "Willkommen bei TradeNot.es – bestätige deine E-Mail",
      heading: "Willkommen bei TradeNot.es!",
      body: "Danke für deine Registrierung. Bitte bestätige deine E-Mail-Adresse, um dein kostenloses Trading-Journal zu aktivieren.",
      button: "E-Mail bestätigen",
      footer: "Dieser Link ist 24 Stunden gültig.",
    },
    en: {
      subject: "Welcome to TradeNot.es – confirm your email",
      heading: "Welcome to TradeNot.es!",
      body: "Thank you for signing up. Please confirm your email address to activate your free trading journal.",
      button: "Confirm email",
      footer: "This link is valid for 24 hours.",
    },
  },
  reset: {
    de: {
      subject: "Passwort zurücksetzen – TradeNot.es",
      heading: "Passwort zurücksetzen",
      body: "Du hast angefragt, dein Passwort zurückzusetzen. Klicke auf den Button, um ein neues Passwort festzulegen. Falls du das nicht warst, ignoriere diese E-Mail einfach; dein Passwort bleibt unverändert.",
      button: "Neues Passwort festlegen",
      footer: "Dieser Link ist 1 Stunde gültig.",
    },
    en: {
      subject: "Reset your password – TradeNot.es",
      heading: "Reset your password",
      body: "You asked to reset your password. Click the button to set a new one. If this wasn't you, just ignore this email; your password stays unchanged.",
      button: "Set new password",
      footer: "This link is valid for 1 hour.",
    },
  },
  change_email: {
    de: {
      subject: "E-Mail-Änderung bestätigen – TradeNot.es",
      heading: "E-Mail-Adresse ändern",
      body: "Für dein Konto wurde eine Änderung der E-Mail-Adresse angefragt. Bestätige die Änderung mit dem Button. Falls du das nicht warst, ignoriere diese E-Mail und ändere am besten dein Passwort.",
      button: "Änderung bestätigen",
      footer: "Dieser Link ist 24 Stunden gültig.",
    },
    en: {
      subject: "Confirm email change – TradeNot.es",
      heading: "Change your email address",
      body: "A change of the email address for your account was requested. Confirm it with the button. If this wasn't you, ignore this email and consider changing your password.",
      button: "Confirm change",
      footer: "This link is valid for 24 hours.",
    },
  },
  change_email_new: {
    de: {
      subject: "Neue E-Mail-Adresse bestätigen – TradeNot.es",
      heading: "Neue E-Mail-Adresse bestätigen",
      body: "Bitte bestätige deine neue E-Mail-Adresse für TradeNot.es.",
      button: "E-Mail-Adresse bestätigen",
      footer: "Dieser Link ist 24 Stunden gültig.",
    },
    en: {
      subject: "Confirm your new email address – TradeNot.es",
      heading: "Confirm your new email address",
      body: "Please confirm your new email address for TradeNot.es.",
      button: "Confirm email address",
      footer: "This link is valid for 24 hours.",
    },
  },
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function render(t: Template, name: string, url: string, lang: "de" | "en") {
  const hello = lang === "de" ? `Hallo ${escapeHtml(name)},` : `Hello ${escapeHtml(name)},`;
  const fallback = lang === "de" ? "Falls der Button nicht funktioniert, kopiere diesen Link:" : "If the button doesn't work, copy this link:";
  const p = 'style="color:#d1d5db;line-height:1.6;margin:0 0 16px 0;"';
  return `<!DOCTYPE html>
<html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111827;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="color:#f9fafb;font-size:22px;margin:0 0 24px 0;">${t.heading}</h1>
        <p ${p}>${hello}</p>
        <p ${p}>${t.body}</p>
        <p style="margin:32px 0;text-align:center;">
          <a href="${url}" style="background:#10b981;color:#0a0a0a;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:8px;display:inline-block;">${t.button}</a>
        </p>
        <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0 0 8px 0;">${fallback}<br><a href="${url}" style="color:#10b981;word-break:break-all;">${url}</a></p>
        <p style="color:#6b7280;font-size:12px;margin:24px 0 0 0;">${t.footer}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

const transport = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

export async function sendMail(type: MailType, to: string, opts: { url: string; name?: string; lang?: string }) {
  const lang = opts.lang?.startsWith("de") ? "de" : "en";
  const t = templates[type][lang];
  const html = render(t, opts.name || "Trader", opts.url, lang);
  if (!transport) {
    // No SMTP configured (local development): print the link instead of sending
    console.log(`[mail] ${type} → ${to}: ${opts.url}`);
    return;
  }
  await transport.sendMail({ from: env.smtp.from, to, subject: t.subject, html });
}

/** Contact form: plain-text mail to the operator, reply goes to the sender. */
export async function sendContactMail(msg: { name: string; email: string; subject: string; message: string }) {
  const text = `Von: ${msg.name} <${msg.email}>\n\n${msg.message}`;
  if (!transport || !env.contactTo) {
    console.log(`[mail] contact form: ${msg.subject}\n${text}`);
    return;
  }
  await transport.sendMail({
    from: env.smtp.from,
    to: env.contactTo,
    replyTo: msg.email,
    subject: `[tradenot.es Kontakt] ${msg.subject}`,
    text,
  });
}

/** In-app feedback (src/feedback.ts): plain-text mail to the operator, reply goes to the user. */
export async function sendFeedbackMail(msg: { subject: string; replyTo: string; text: string }) {
  if (!transport || !env.contactTo) {
    console.log(`[mail] feedback: ${msg.subject}\n${msg.text}`);
    return;
  }
  await transport.sendMail({ from: env.smtp.from, to: env.contactTo, replyTo: msg.replyTo, subject: msg.subject, text: msg.text });
}
