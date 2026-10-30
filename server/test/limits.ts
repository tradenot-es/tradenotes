// Per-IP limiter and honeypot helpers: npx tsx test/limits.ts
import { CLIENT_IP_HEADER, clientIp, createLimiter, isHoneypotFilled, resolveClientIp } from "../src/limits.js";

let failures = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) failures++;
}

const limit = createLimiter(5, 60 * 60 * 1000);
const t = 1_000_000;
const results = [1, 2, 3, 4, 5, 6].map((i) => limit("1.2.3.4", t + i));
check("5 per hour allowed, 6th refused", JSON.stringify(results) === "[true,true,true,true,true,false]");
check("other IP unaffected", limit("5.6.7.8", t));
check("allowed again after the window", limit("1.2.3.4", t + 61 * 60 * 1000));
const forwarded = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
check("behind a trusted proxy: first X-Forwarded-For entry", resolveClientIp(forwarded, "172.18.0.5", true) === "203.0.113.7");
check("no trusted proxy: X-Forwarded-For ignored", resolveClientIp(forwarded, "198.51.100.4", false) === "198.51.100.4");
check("IPv4-mapped socket address shortened", resolveClientIp(new Headers(), "::ffff:192.168.1.20", false) === "192.168.1.20");
check("trusted proxy without header: socket address", resolveClientIp(new Headers(), "172.18.0.5", true) === "172.18.0.5");
check("clientIp reads the server's header", clientIp(new Headers({ [CLIENT_IP_HEADER]: "203.0.113.7" })) === "203.0.113.7");
check("honeypot empty", !isHoneypotFilled({ website: "" }) && !isHoneypotFilled({}) && !isHoneypotFilled(null));
check("honeypot filled", isHoneypotFilled({ website: "http://spam.example" }));

console.log(failures ? `\n${failures} check(s) failed` : "\nall limit tests passed");
process.exit(failures ? 1 : 0);
