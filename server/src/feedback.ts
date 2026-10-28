// "Bug or idea?" from inside the app. Every message goes by mail to the operator (reply goes to
// the user). If a GitHub token is configured, it also becomes an issue in the (private) repo, so
// ideas and bugs can be tracked there. The issue never contains the user's name or address.
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { env } from "./env.js";
import { sendFeedbackMail } from "./mail.js";

export const feedbackSchema = z.object({
  type: z.enum(["bug", "idea", "other"]),
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
  // only sent when the user leaves "include page and technical details" on
  context: z
    .object({
      path: z.string().max(200),
      language: z.string().max(20),
      timeZone: z.string().max(60),
      viewport: z.string().max(20),
      userAgent: z.string().max(400),
    })
    .partial()
    .optional(),
});
export type Feedback = z.infer<typeof feedbackSchema>;

const TYPE_LABEL = { bug: "Bug", idea: "Idee", other: "Feedback" } as const;
// GitHub's default labels plus one for everything that came through the app
const GITHUB_LABELS = { bug: ["bug", "feedback"], idea: ["enhancement", "feedback"], other: ["feedback"] } as const;

function contextLines(context: Feedback["context"]) {
  if (!context) return [];
  const rows: [string, string | undefined][] = [
    ["Seite", context.path],
    ["Sprache", context.language],
    ["Zeitzone", context.timeZone],
    ["Fenster", context.viewport],
    ["Browser", context.userAgent],
  ];
  return rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
}

/** Issue text: the message and the optional technical details, nothing that identifies the user. */
export function issueBody(feedback: Feedback, ref: string) {
  const details = contextLines(feedback.context);
  return [
    feedback.message,
    "",
    "---",
    `Gemeldet über die App (${TYPE_LABEL[feedback.type]}, Referenz ${ref}).`,
    ...(details.length ? ["", "<details><summary>Technische Angaben</summary>", "", ...details.map((l) => `- ${l}`), "", "</details>"] : []),
  ].join("\n");
}

async function createIssue(feedback: Feedback, ref: string): Promise<string | null> {
  const { githubToken, githubRepo } = env.feedback;
  if (!githubToken || !githubRepo) return null;
  const res = await fetch(`https://api.github.com/repos/${githubRepo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "tradenot.es",
    },
    body: JSON.stringify({
      title: `[${TYPE_LABEL[feedback.type]}] ${feedback.title}`,
      body: issueBody(feedback, ref),
      labels: GITHUB_LABELS[feedback.type],
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GitHub issue: HTTP ${res.status} ${await res.text()}`);
  return ((await res.json()) as { html_url: string }).html_url;
}

// at most 5 messages per user and hour (kept in memory, enough for a single server)
const recent = new Map<string, number[]>();
export function allowFeedback(userId: string, now = Date.now()) {
  const hour = now - 60 * 60 * 1000;
  const times = (recent.get(userId) ?? []).filter((t) => t > hour);
  if (times.length >= 5) return false;
  recent.set(userId, [...times, now]);
  return true;
}

export async function submitFeedback(feedback: Feedback, user: { email: string }) {
  const ref = randomBytes(3).toString("hex");
  // the mail is the reliable copy; a GitHub outage must not lose the message
  let issueUrl: string | null = null;
  try {
    issueUrl = await createIssue(feedback, ref);
  } catch (e) {
    console.error("feedback: creating the GitHub issue failed", e);
  }
  await sendFeedbackMail({
    subject: `[tradenot.es ${TYPE_LABEL[feedback.type]}] ${feedback.title}`,
    replyTo: user.email,
    text: [
      `Von: ${user.email}`,
      `Art: ${TYPE_LABEL[feedback.type]} · Referenz ${ref}`,
      ...(issueUrl ? [`GitHub: ${issueUrl}`] : []),
      "",
      feedback.message,
      ...(feedback.context ? ["", ...contextLines(feedback.context)] : []),
    ].join("\n"),
  });
  return { ref };
}
