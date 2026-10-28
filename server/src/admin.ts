// Admin dashboard: totals only, no individual profiles. Access for the addresses in ADMIN_EMAILS,
// in production only with two-factor login turned on.
import { readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pool } from "./db.js";
import { env } from "./env.js";

export function isAdmin(user: { email: string; twoFactorEnabled?: boolean | null }) {
  if (!env.adminEmails.includes(user.email.toLowerCase())) return false;
  return process.env.NODE_ENV !== "production" || !!user.twoFactorEnabled;
}

async function directorySize(dir: string): Promise<number> {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? await directorySize(path) : (await stat(path).catch(() => ({ size: 0 }))).size;
  }
  return total;
}

// --- GitHub (stars, forks, issues): cached, the API allows 5000 requests an hour with a token ---

let githubCache: { at: number; data: unknown } | null = null;

async function githubStats() {
  const { githubToken, githubRepo } = env.feedback;
  if (!githubRepo) return null;
  if (githubCache && Date.now() - githubCache.at < 15 * 60 * 1000) return githubCache.data;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "tradenot.es" };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
  const get = async (path: string) => {
    const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`GitHub ${path}: HTTP ${res.status}`);
    return res.json();
  };
  try {
    const repo = await get(`/repos/${githubRepo}`);
    const search = async (q: string) => (await get(`/search/issues?q=${encodeURIComponent(`repo:${githubRepo} ${q}`)}&per_page=1`)).total_count as number;
    const data = {
      repo: githubRepo,
      url: repo.html_url,
      private: repo.private,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.subscribers_count,
      openIssues: await search("is:issue is:open"),
      feedbackOpen: await search("is:issue is:open label:feedback"),
      feedbackTotal: await search("is:issue label:feedback"),
    };
    githubCache = { at: Date.now(), data };
    return data;
  } catch (e) {
    return { repo: githubRepo, error: (e as Error).message };
  }
}

export async function adminStats() {
  const one = async (sql: string) => (await pool.query(sql)).rows[0];
  const [users, active, weekly, trades, sources, other, uploads, db, mail, events] = await Promise.all([
    one(`select count(*)::int as total,
           count(*) filter (where "emailVerified")::int as verified,
           count(*) filter (where "twoFactorEnabled")::int as two_factor,
           count(*) filter (where "createdAt" > now() - interval '7 days')::int as new_7d,
           count(*) filter (where "createdAt" > now() - interval '30 days')::int as new_30d
         from "user"`),
    one(`select count(*) filter (where last_active_at > now() - interval '1 day')::int as d1,
           count(*) filter (where last_active_at > now() - interval '7 days')::int as d7,
           count(*) filter (where last_active_at > now() - interval '30 days')::int as d30,
           count(*) filter (where newsletter)::int as newsletter
         from user_settings`),
    pool.query(`select to_char(date_trunc('week', "createdAt"), 'YYYY-MM-DD') as week, count(*)::int as signups
                from "user" where "createdAt" > now() - interval '12 weeks' group by 1 order by 1`),
    one(`select count(*)::int as total, count(distinct user_id)::int as users,
           count(*) filter (where created_at > now() - interval '7 days')::int as new_7d,
           count(*) filter (where screenshot_url is not null)::int as with_screenshot
         from trades`),
    pool.query(`select source, count(distinct trade_id)::int as trades, count(distinct user_id)::int as users
                from executions where trade_id is not null group by source order by 2 desc`),
    one(`select (select count(*)::int from broker_connections) as ibkr_connections,
           (select count(*)::int from trade_shares) as shares,
           (select coalesce(sum(view_count), 0)::int from trade_shares) as share_views,
           (select count(*)::int from journal_entries) as journal_entries,
           (select count(*)::int from trades t where not exists (select 1 from executions e where e.trade_id = t.id)) as manual_trades`),
    directorySize(resolve(env.uploadDir)),
    one(`select pg_database_size(current_database())::bigint as bytes`),
    one(`select count(*) filter (where status = 'pending')::int as pending,
           count(*) filter (where status = 'sent' and sent_at > now() - interval '24 hours')::int as sent_24h
         from mail_queue`),
    pool.query(`select source, max(updated_at) as last_sync, count(*)::int as events from market_events group by source`),
  ]);
  return {
    users: { ...users, ...active },
    signupsPerWeek: weekly.rows,
    trades: { ...trades, manual: other.manual_trades, bySource: sources.rows },
    usage: { ibkrConnections: other.ibkr_connections, shares: other.shares, shareViews: other.share_views, journalEntries: other.journal_entries },
    tech: {
      uploadsBytes: uploads,
      databaseBytes: Number(db.bytes),
      mailQueuePending: mail.pending,
      mailSent24h: mail.sent_24h,
      mailDailyLimit: env.mailDailyLimit,
      smtpConfigured: !!env.smtp.host,
      marketEvents: events.rows,
    },
    github: await githubStats(),
  };
}
