// In-app feedback: issue text, GitHub request (fetch is stubbed, nothing is sent) and rate limit.
//   DATABASE_URL=postgres://x@localhost/x BASE_URL=http://x BETTER_AUTH_SECRET=<32 chars> npx tsx test/feedback.ts
process.env.GITHUB_FEEDBACK_TOKEN = "test-token";
process.env.GITHUB_FEEDBACK_REPO = "tradenot-es/tradenotes";
delete process.env.SMTP_HOST;

const { allowFeedback, feedbackSchema, issueBody, submitFeedback } = await import("../src/feedback.js");

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok || detail === undefined ? "" : ` → ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
}

const feedback = feedbackSchema.parse({
  type: "idea",
  title: "  Export als PDF  ",
  message: "Ein Monatsbericht als PDF wäre super.",
  context: { path: "/dashboard/reports", language: "de", timeZone: "Europe/Berlin", viewport: "1400x900", userAgent: "Firefox" },
});
check("title trimmed", feedback.title === "Export als PDF");
check("too short message rejected", !feedbackSchema.safeParse({ type: "bug", title: "abc", message: "kurz" }).success);
check("unknown type rejected", !feedbackSchema.safeParse({ type: "spam", title: "abc", message: "0123456789" }).success);

const body = issueBody(feedback, "abc123");
check("issue body has message and details", body.includes("Monatsbericht") && body.includes("Seite: /dashboard/reports") && body.includes("Referenz abc123"));

// GitHub call with a stubbed fetch
const calls: { url: string; init: RequestInit }[] = [];
globalThis.fetch = (async (url: string, init: RequestInit) => {
  calls.push({ url, init });
  return new Response(JSON.stringify({ html_url: "https://github.com/tradenot-es/tradenotes/issues/1" }), { status: 201 });
}) as typeof fetch;
const logs: string[] = [];
const log = console.log;
console.log = (...args: unknown[]) => logs.push(args.join(" "));
const result = await submitFeedback(feedback, { email: "anna@example.com" });
console.log = log;
const sent = JSON.parse(String(calls[0]?.init.body ?? "{}"));
check("issue created in the repo", calls[0]?.url === "https://api.github.com/repos/tradenot-es/tradenotes/issues");
check("token sent as bearer", new Headers(calls[0]?.init.headers).get("authorization") === "Bearer test-token");
check("issue title and labels", sent.title === "[Idee] Export als PDF" && JSON.stringify(sent.labels) === '["enhancement","feedback"]', sent);
check("issue has no e-mail address", !JSON.stringify(sent).includes("anna@example.com"));
check("mail has reply address, reference and issue link", logs.some((l) => l.includes("anna@example.com") && l.includes(result.ref) && l.includes("issues/1")), logs);

// GitHub down: the mail still goes out
globalThis.fetch = (async () => new Response("boom", { status: 502 })) as typeof fetch;
const errors: unknown[] = [];
const error = console.error;
console.error = (...args: unknown[]) => errors.push(args);
console.log = (...args: unknown[]) => logs.push(args.join(" "));
const fallback = await submitFeedback({ ...feedback, type: "bug" }, { email: "anna@example.com" });
console.log = log;
console.error = error;
check("GitHub failure is logged, mail still sent", errors.length === 1 && logs.some((l) => l.includes(fallback.ref)));

const now = Date.now();
const allowed = [1, 2, 3, 4, 5, 6].map((i) => allowFeedback("user-1", now + i));
check("rate limit: 5 per hour", JSON.stringify(allowed) === "[true,true,true,true,true,false]", allowed);
check("rate limit is per user", allowFeedback("user-2", now));
check("rate limit resets after an hour", allowFeedback("user-1", now + 61 * 60 * 1000));

console.log(failures ? `\n${failures} check(s) failed` : "\nall feedback tests passed");
process.exit(failures ? 1 : 0);
