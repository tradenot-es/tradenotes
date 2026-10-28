import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { pool } from "./db.js";
import { env } from "./env.js";
import { sendMail } from "./mail.js";
import { verifyPayload } from "./altcha.js";
import { deleteUserFiles } from "./uploads.js";
import { networkInterfaces } from "node:os";

// In development the Vite server is also opened from other machines in the LAN (http://<ip>:8080)
const devOrigins = () =>
  Object.values(networkInterfaces())
    .flat()
    .filter((i) => i?.family === "IPv4")
    .map((i) => `http://${i!.address === "127.0.0.1" ? "localhost" : i!.address}:8080`);

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
  advanced: {
    database: { generateId: "uuid" },
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url }, request) => {
        await sendMail("change_email", user.email, { url, name: user.name, lang: uiLang(request) });
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
      await sendMail("reset", user.email, { url, name: user.name, lang: uiLang(request) });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }, request) => {
      // after an email change, the user is already verified and this goes to the new address
      const type = user.emailVerified ? "change_email_new" : "verify";
      await sendMail(type, user.email, { url, name: user.name, lang: uiLang(request) });
    },
  },
  plugins: [twoFactor({ issuer: "TradeNot.es" })],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (CAPTCHA_PATHS.has(ctx.path) && !verifyPayload(ctx.body?.altcha)) {
        throw new APIError("BAD_REQUEST", { message: "Captcha verification failed", code: "CAPTCHA_FAILED" });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const u = user as typeof user & { firstName?: string | null; lastName?: string | null };
          await pool.query("insert into user_settings (user_id) values ($1)", [u.id]);
          await pool.query("insert into profiles (id, first_name, last_name) values ($1, $2, $3)", [
            u.id,
            u.firstName?.trim() || u.name?.trim() || "Trader",
            u.lastName?.trim() || null,
          ]);
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
