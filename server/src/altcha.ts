import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";

// Proof-of-work captcha compatible with src/components/AltchaWidget.tsx:
// the client searches n with SHA-256(salt + n) === challenge and sends back
// base64(JSON {challenge, salt, number, algorithm}).
// The salt carries its own expiry and an HMAC, so no server-side state is needed
// apart from a short-lived set of already used challenges.

const MAX_NUMBER = 100_000;
const EXPIRY_MS = 5 * 60 * 1000;
const used = new Map<string, number>();

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const sign = (s: string) => createHmac("sha256", env.altchaKey).update(s).digest("hex");

export function createChallenge() {
  const base = `${randomBytes(12).toString("hex")}.${Date.now() + EXPIRY_MS}`;
  const salt = `${base}.${sign(base)}.`;
  const number = randomInt(MAX_NUMBER);
  return { challenge: sha256(salt + number), salt, algorithm: "SHA-256", maxnumber: MAX_NUMBER };
}

export function verifyPayload(payload: unknown): boolean {
  if (typeof payload !== "string") return false;
  let data: { challenge?: unknown; salt?: unknown; number?: unknown };
  try {
    data = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    return false;
  }
  const { challenge, salt, number } = data;
  if (typeof challenge !== "string" || typeof salt !== "string" || typeof number !== "number") return false;

  const [random, expires, mac] = salt.split(".");
  if (!random || !expires || !mac) return false;
  const expected = Buffer.from(sign(`${random}.${expires}`));
  if (expected.length !== mac.length || !timingSafeEqual(expected, Buffer.from(mac))) return false;
  if (Number(expires) < Date.now()) return false;
  if (sha256(salt + number) !== challenge) return false;

  for (const [key, exp] of used) if (exp < Date.now()) used.delete(key);
  if (used.has(challenge)) return false;
  used.set(challenge, Number(expires));
  return true;
}
