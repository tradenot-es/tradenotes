// Abuse protection for endpoints outside Better Auth (contact form): a small in-memory limit per
// client IP, enough for a single server. Behind Caddy the client address is the first entry of
// X-Forwarded-For (Caddy sets it; the app itself only listens on 127.0.0.1).

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** Allows `max` calls per key within `windowMs`. */
export function createLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    // forget idle keys now and then so the map does not grow forever
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.every((t) => t <= now - windowMs)) hits.delete(k);
    return true;
  };
}

/** Hidden form field that people never see and simple bots fill in. */
export const HONEYPOT = "website";
export const isHoneypotFilled = (body: unknown) =>
  typeof body === "object" && body !== null && typeof (body as Record<string, unknown>)[HONEYPOT] === "string" &&
  ((body as Record<string, string>)[HONEYPOT]).trim() !== "";
