function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  // Public origin of the app, e.g. https://tradenot.es (used for links in mails and cookie security)
  baseUrl: required("BASE_URL"),
  authSecret: required("BETTER_AUTH_SECRET"),
  // HMAC key for Altcha captcha challenges
  altchaKey: process.env.ALTCHA_HMAC_KEY ?? required("BETTER_AUTH_SECRET"),
  uploadDir: process.env.UPLOAD_DIR ?? "./data/uploads",
  // Directory with the built frontend (vite build output); unset in dev
  staticDir: process.env.STATIC_DIR,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM ?? "TradeNot.es <noreply@tradenot.es>",
  },
  // accounts with access to the admin dashboard (comma-separated e-mail addresses)
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  // mails to all users: at most this many per 24 hours, leaving room for confirmation mails
  // (Hostinger Business Starter allows 1000 per day and mailbox)
  mailDailyLimit: Number(process.env.MAIL_DAILY_LIMIT ?? 800),
  // recipient of the contact form and of in-app feedback
  contactTo: process.env.CONTACT_TO,
  // optional: in-app feedback also becomes a GitHub issue (fine-grained token with
  // "Issues: read and write" on this one repository; repo as "owner/name")
  feedback: {
    githubToken: process.env.GITHUB_FEEDBACK_TOKEN,
    githubRepo: process.env.GITHUB_FEEDBACK_REPO,
  },
};
