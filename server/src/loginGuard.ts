// Per-account protection against password guessing, on top of Better Auth's per-IP limit (which an
// attacker with many addresses gets around): after 10 wrong passwords for one e-mail address within
// an hour, that account refuses password logins for 15 minutes, from every IP. The answer stays the
// same "invalid email or password", so nobody learns whether the account exists. The owner gets
// one warning mail per lock. Kept in memory: a restart only shortens a running lock.

export const MAX_FAILURES = 10;
const WINDOW_MS = 60 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

const failures = new Map<string, number[]>();
const lockedUntil = new Map<string, number>();

const key = (email: unknown) => (typeof email === "string" ? email.trim().toLowerCase() : "");

export function isLocked(email: unknown, now = Date.now()) {
  const until = lockedUntil.get(key(email));
  if (until && until > now) return true;
  if (until) lockedUntil.delete(key(email));
  return false;
}

/** Records a wrong password; returns true when this failure locks the account. */
export function recordFailure(email: unknown, now = Date.now()) {
  const k = key(email);
  if (!k) return false;
  const recent = (failures.get(k) ?? []).filter((t) => t > now - WINDOW_MS);
  recent.push(now);
  if (recent.length >= MAX_FAILURES) {
    failures.delete(k);
    lockedUntil.set(k, now + LOCK_MS);
    return true;
  }
  failures.set(k, recent);
  return false;
}

export function recordSuccess(email: unknown) {
  failures.delete(key(email));
}
