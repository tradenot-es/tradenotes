import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { pool } from "./db.js";
import { env } from "./env.js";
import { sendMail } from "./mail.js";
import { verifyPayload } from "./altcha.js";
import { deleteUserFiles } from "./uploads.js";
import { isHoneypotFilled } from "./limits.js";
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
    minPasswordLength: 8,
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
      // a filled hidden field means a bot; answer like a failed captcha
      if (CAPTCHA_PATHS.has(ctx.path) && (isHoneypotFilled(ctx.body) || !verifyPayload(ctx.body?.altcha))) {
        throw new APIError("BAD_REQUEST", { message: "Captcha verification failed", code: "CAPTCHA_FAILED" });
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
