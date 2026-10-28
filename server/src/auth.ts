import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { pool } from "./db.js";
import { env } from "./env.js";
import { sendMail } from "./mail.js";
import { verifyPayload } from "./altcha.js";
import { deleteUserFiles } from "./uploads.js";
import { isHoneypotFilled } from "./limits.js";
import { isLocked, recordFailure, recordSuccess } from "./loginGuard.js";
import { networkInterfaces } from "node:os";

// In development the Vite server is also opened from other machines in the LAN (http://<ip>:8080)
const devOrigins = () =>
  Object.values(networkInterfaces())
    .flat()
    .filter((i) => i?.family === "IPv4")
    .map((i) => `http://${i!.address === "127.0.0.1" ? "localhost" : i!.address}:8080`);

/** Name for the mail greeting: the nickname from the profile, if any. */
async function greeting(user: { id: string; name?: string | null }) {
  const { rows } = await pool.query("select nickname from profiles where id = $1", [user.id]);
  return rows[0]?.nickname ?? (user.name?.trim() || undefined);
}

/** One mail when an account gets locked for too many wrong passwords (only if it exists). */
async function warnAboutLock(email: unknown, request?: Request) {
  if (typeof email !== "string") return;
  const { rows } = await pool.query(`select id, email, name from "user" where lower(email) = lower($1)`, [email.trim()]);
  if (!rows[0]) return;
  await sendMail("login_locked", rows[0].email, {
    url: `${env.baseUrl}/auth?forgot=1`,
    name: await greeting(rows[0]),
    lang: uiLang(request),
  });
}

const uiLang = (request?: Request) =>
  request?.headers.get("x-ui-lang") ?? request?.headers.get("accept-language") ?? "en";

// Endpoints reachable without login that send mail: protected by the proof-of-work captcha
const CAPTCHA_PATHS = new Set(["/sign-up/email", "/request-password-reset"]);

export const auth = betterAuth({
  appName: "TradeNot.es",
  baseURL: env.baseUrl,
  basePath: "/api/auth",
  secret: env.authSecret,
  database: pool,
  trustedOrigins: [env.baseUrl, ...(process.env.NODE_ENV === "production" ? [] : devOrigins())],
  // On in production (Better Auth's defaults: sign-in 3 per 10 s per IP, everything else 100 per
  // 10 s). Sign-up and the mails it triggers get a much tighter limit, so nobody can use the form
  // to send confirmation or reset mails to strangers in bulk.
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    customRules: {
      "/sign-up/email": { window: 60 * 60, max: 5 },
      "/request-password-reset": { window: 60 * 60, max: 5 },
      "/send-verification-email": { window: 60 * 60, max: 5 },
    },
  },
  advanced: {
    database: { generateId: "uuid" },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url }, request) => {
        await sendMail("change_email", user.email, { url, name: await greeting(user), lang: uiLang(request) });
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        // app tables cascade via foreign keys; uploaded screenshots live on disk
        await deleteUserFiles(user.id);
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }, request) => {
      await sendMail("reset", user.email, { url, name: await greeting(user), lang: uiLang(request) });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }, request) => {
      // after an email change, the user is already verified and this goes to the new address
      const type = user.emailVerified ? "change_email_new" : "verify";
      await sendMail(type, user.email, { url, name: await greeting(user), lang: uiLang(request) });
    },
  },
  plugins: [twoFactor({ issuer: "TradeNot.es" })],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // account locked after too many wrong passwords: same answer as a wrong password
      if (ctx.path === "/sign-in/email" && isLocked(ctx.body?.email)) {
        throw new APIError("UNAUTHORIZED", { message: "Invalid email or password", code: "INVALID_EMAIL_OR_PASSWORD" });
      }
      // a filled hidden field means a bot; answer like a failed captcha
      if (CAPTCHA_PATHS.has(ctx.path) && (isHoneypotFilled(ctx.body) || !verifyPayload(ctx.body?.altcha))) {
        throw new APIError("BAD_REQUEST", { message: "Captcha verification failed", code: "CAPTCHA_FAILED" });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      // newsletter opt-in from the sign-up form (unchecked by default); consent time is the proof
      if (ctx.path === "/sign-up/email") {
        if (ctx.body?.newsletter === true && !(ctx.context.returned instanceof APIError)) {
          await pool.query(
            `update user_settings set newsletter = true, newsletter_consent_at = now()
             where user_id = (select id from "user" where lower(email) = lower($1))`,
            [String(ctx.body.email ?? "").trim()],
          );
        }
        return;
      }
      if (ctx.path !== "/sign-in/email") return;
      const returned = ctx.context.returned;
      if (returned instanceof APIError) {
        if (returned.status === "UNAUTHORIZED" && recordFailure(ctx.body?.email)) {
          await warnAboutLock(ctx.body?.email, ctx.request).catch((e) => console.error("lock warning mail failed", e));
        }
      } else {
        recordSuccess(ctx.body?.email);
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await pool.query("insert into user_settings (user_id) values ($1)", [user.id]);
          // the optional nickname from sign-up travels in Better Auth's "name"
          await pool.query("insert into profiles (id, nickname) values ($1, $2)", [user.id, user.name?.trim().slice(0, 40) || null]);
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
