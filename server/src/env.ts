function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

const list = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 3000),
  // a self-hosted installation instead of the official tradenot.es: no landing, marketing or legal
  // pages, the first account becomes admin, sign-up closes after it (the Docker image sets this)
  selfHosted: process.env.SELF_HOSTED === "true",
  // self-hosted only: keep sign-up open for more accounts after the first one
  allowSignup: process.env.ALLOW_SIGNUP === "true",
  // shown in the app; set by the Docker build
  version: process.env.APP_VERSION ?? "dev",
  // a reverse proxy in front sets X-Forwarded-For (tradenot.es: Caddy); without one the header could
  // be sent by anyone, so a self-hosted instance only trusts it with TRUST_PROXY=true
  trustProxy: process.env.TRUST_PROXY ? process.env.TRUST_PROXY === "true" : process.env.SELF_HOSTED !== "true",
  // further addresses the app is opened under (e.g. http://192.168.1.10:3000 next to the domain)
  extraOrigins: list(process.env.TRUSTED_ORIGINS),
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
    // self-hosted: without MAIL_FROM send as the SMTP login, which every mail server accepts
    from:
      process.env.MAIL_FROM ??
      (process.env.SELF_HOSTED === "true" && process.env.SMTP_USER?.includes("@")
        ? `TradeNot.es <${process.env.SMTP_USER}>`
        : "TradeNot.es <noreply@tradenot.es>"),
  },
  // accounts with access to the admin dashboard (comma-separated e-mail addresses)
  adminEmails: list(process.env.ADMIN_EMAILS).map((e) => e.toLowerCase()),
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
