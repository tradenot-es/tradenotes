// Per-IP limiter and honeypot helpers: npx tsx test/limits.ts
import { clientIp, createLimiter, isHoneypotFilled } from "../src/limits.js";

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
check("client IP from X-Forwarded-For", clientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })) === "203.0.113.7");
check("honeypot empty", !isHoneypotFilled({ website: "" }) && !isHoneypotFilled({}) && !isHoneypotFilled(null));
check("honeypot filled", isHoneypotFilled({ website: "http://spam.example" }));

console.log(failures ? `\n${failures} check(s) failed` : "\nall limit tests passed");
process.exit(failures ? 1 : 0);
