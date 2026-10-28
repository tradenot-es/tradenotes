// Mail to all users, written in the admin dashboard. Two kinds, as the law requires:
// - service: account-related notices (terms, maintenance, shutdown) to every confirmed user
// - newsletter: news only to users who opted in, every mail with a personal unsubscribe link
// Each recipient gets an own mail (no BCC lists). A worker sends pending mails in small batches
// and stays below MAIL_DAILY_LIMIT per 24 hours, so a large list simply takes several days.
// No open or click tracking.
import { createHmac, timingSafeEqual } from "node:crypto";
import { pool } from "./db.js";
import { env } from "./env.js";
import { escapeHtml, sendCampaignMail } from "./mail.js";

export type CampaignKind = "service" | "newsletter";

const RECIPIENTS: Record<CampaignKind, string> = {
  service: `select u.id, u.email from "user" u where u."emailVerified"`,
  newsletter: `select u.id, u.email from "user" u join user_settings s on s.user_id = u.id where u."emailVerified" and s.newsletter`,
};

export async function countRecipients(kind: CampaignKind): Promise<number> {
  const { rows } = await pool.query(`select count(*)::int as n from (${RECIPIENTS[kind]}) r`);
  return rows[0].n;
}

// --- unsubscribe links: signed with the server secret, nothing to store --------------------

const sign = (userId: string) => createHmac("sha256", env.authSecret).update(`newsletter:${userId}`).digest("base64url").slice(0, 32);

export function unsubscribeUrl(userId: string) {
  return `${env.baseUrl}/api/newsletter/unsubscribe?u=${userId}&t=${sign(userId)}`;
}

export function verifyUnsubscribe(userId: string, token: string) {
  const expected = Buffer.from(sign(userId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function unsubscribe(userId: string) {
  await pool.query("update user_settings set newsletter = false where user_id = $1", [userId]);
}

// --- rendering -------------------------------------------------------------------------

/** Plain text with blank lines between paragraphs; bare URLs become links. */
function bodyHtml(body: string) {
  return body
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => {
      const html = escapeHtml(paragraph)
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#10b981;">$1</a>')
        .replace(/\n/g, "<br>");
      return `<p style="color:#d1d5db;line-height:1.6;margin:0 0 16px 0;">${html}</p>`;
    })
    .join("\n");
}

export function renderCampaign(kind: CampaignKind, subject: string, body: string, unsubscribe?: string) {
  const footer =
    kind === "newsletter"
      ? `Du bekommst diese Mail, weil du Neuigkeiten von TradeNot.es abonniert hast. / You receive this because you subscribed to TradeNot.es news.`
      : `Diese Mitteilung betrifft dein Konto bei TradeNot.es. / This notice concerns your TradeNot.es account.`;
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111827;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="color:#f9fafb;font-size:22px;margin:0 0 24px 0;">${escapeHtml(subject)}</h1>
        ${bodyHtml(body)}
        <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:24px 0 0 0;">${footer}${
          unsubscribe ? `<br><a href="${unsubscribe}" style="color:#9ca3af;">Abmelden / Unsubscribe</a>` : ""
        }</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `${body.trim()}\n\n--\n${footer}${unsubscribe ? `\nAbmelden / Unsubscribe: ${unsubscribe}` : ""}\n`;
  return { html, text };
}

// --- create, test, send ----------------------------------------------------------------------

export async function sendTest(kind: CampaignKind, subject: string, body: string, to: { id: string; email: string }) {
  const unsubscribe = kind === "newsletter" ? unsubscribeUrl(to.id) : undefined;
  const { html, text } = renderCampaign(kind, subject, body, unsubscribe);
  await sendCampaignMail({ to: to.email, subject: `[Test] ${subject}`, html, text, unsubscribeUrl: unsubscribe });
}

/** Stores the campaign and queues one mail per current recipient. */
export async function createCampaign(kind: CampaignKind, subject: string, body: string, createdBy: string) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      "insert into mail_campaigns (kind, subject, body, created_by) values ($1, $2, $3, $4) returning id",
      [kind, subject, body, createdBy],
    );
    const id = rows[0].id as string;
    const queued = await client.query(
      `insert into mail_queue (campaign_id, user_id) select $1, r.id from (${RECIPIENTS[kind]}) r`,
      [id],
    );
    await client.query("commit");
    return { id, queued: queued.rowCount ?? 0 };
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

export async function listCampaigns() {
  const { rows } = await pool.query(
    `select c.id, c.kind, c.subject, c.created_at,
       count(q.id)::int as total,
       count(q.id) filter (where q.status = 'sent')::int as sent,
       count(q.id) filter (where q.status = 'pending')::int as pending,
       count(q.id) filter (where q.status in ('failed', 'skipped'))::int as failed
     from mail_campaigns c left join mail_queue q on q.campaign_id = c.id
     group by c.id order by c.created_at desc limit 50`,
  );
  return rows;
}

let running = false;

/** Sends the next pending mails, staying below the daily limit. Called every minute. */
export async function processQueue(batchSize = 20) {
  if (running) return;
  running = true;
  try {
    const { rows: sentToday } = await pool.query(
      "select count(*)::int as n from mail_queue where status = 'sent' and sent_at > now() - interval '24 hours'",
    );
    const budget = Math.min(batchSize, env.mailDailyLimit - sentToday[0].n);
    if (budget <= 0) return;
    const { rows } = await pool.query(
      `select q.id, q.user_id, u.email, u."emailVerified" as verified, s.newsletter, c.kind, c.subject, c.body
       from mail_queue q join mail_campaigns c on c.id = q.campaign_id
         join "user" u on u.id = q.user_id left join user_settings s on s.user_id = q.user_id
       where q.status = 'pending' order by q.id limit $1`,
      [budget],
    );
    for (const r of rows) {
      // unsubscribed (or address changed to unconfirmed) since the campaign was queued
      if (!r.verified || (r.kind === "newsletter" && !r.newsletter)) {
        await pool.query("update mail_queue set status = 'skipped' where id = $1", [r.id]);
        continue;
      }
      const unsubscribe = r.kind === "newsletter" ? unsubscribeUrl(r.user_id) : undefined;
      const { html, text } = renderCampaign(r.kind, r.subject, r.body, unsubscribe);
      try {
        await sendCampaignMail({ to: r.email, subject: r.subject, html, text, unsubscribeUrl: unsubscribe });
        await pool.query("update mail_queue set status = 'sent', sent_at = now() where id = $1", [r.id]);
      } catch (e) {
        await pool.query("update mail_queue set status = 'failed', error = $2 where id = $1", [r.id, String((e as Error).message).slice(0, 500)]);
      }
    }
  } finally {
    running = false;
  }
}
