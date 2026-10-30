import { serve, type HttpBindings, type Http2Bindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { pool } from "./db.js";
import { env } from "./env.js";
import { CLIENT_IP_HEADER, resolveClientIp } from "./limits.js";
import { runMigrations } from "./migrate.js";
import { syncDueIbkr } from "./ibkr.js";
import { syncMarketEvents } from "./marketEvents.js";
import { processQueue } from "./campaigns.js";

await runMigrations(pool);
// loaded after migrating: Better Auth checks its tables on startup
const { app } = await import("./app.js");

if (env.staticDir) {
  const root = resolve(env.staticDir);
  // settings the frontend needs before it renders, as a meta tag in every page (no inline script)
  const settings = JSON.stringify({ selfHosted: env.selfHosted, mail: !!env.smtp.host, version: env.version });
  const meta = `<meta name="tn-instance" content="${settings.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">`;
  const pages = new Map<string, string>();
  const page = async (file: string) => {
    if (!pages.has(file)) pages.set(file, (await readFile(file, "utf8")).replace("</head>", `${meta}</head>`));
    return pages.get(file)!;
  };
  // pages: the pre-rendered dist/<path>/index.html (scripts/seo-pages.mjs) if there is one, else
  // index.html for client-side routing. A self-hosted instance has no public pages to pre-render.
  app.get("/*", async (c, next) => {
    const path = c.req.path;
    if (path.startsWith("/api/") || /\.[a-z0-9]+$/i.test(path)) return next();
    const own = env.selfHosted ? null : join(root, path, "index.html");
    const file = own && own.startsWith(root + sep) && existsSync(own) ? own : join(root, "index.html");
    return c.html(await page(file), 200, { "Cache-Control": "no-cache" });
  });
  // built assets
  app.use("/*", serveStatic({ root: env.staticDir }));
}

// housekeeping (replaces the Supabase cron jobs)
const cleanup = async () => {
  // matched executions are only kept to skip resent duplicates (the add-on resends the session)
  // (IBKR Flex reports can cover up to a year, so they are kept that long)
  await pool.query("delete from executions where matched and time < now() - interval '400 days'");
  await pool.query(`delete from verification where "expiresAt" < now()`);
  // the privacy policy promises both: sessions hold IP address and browser
  await pool.query(`delete from session where "expiresAt" < now()`);
  await pool.query(`delete from "user" where not "emailVerified" and "createdAt" < now() - interval '7 days'`);
};
setInterval(() => cleanup().catch((e) => console.error("cleanup failed", e)), 60 * 60 * 1000);
// Interactive Brokers: fetch each connection's Flex report once a day
setInterval(() => syncDueIbkr().catch((e) => console.error("ibkr sync failed", e)), 60 * 60 * 1000);
// mails to all users: send queued mails in small batches, within MAIL_DAILY_LIMIT
setInterval(() => processQueue().catch((e) => console.error("mail queue failed", e)), 60 * 1000);
// Fed speeches and the President's schedule for the calendar: at start and then hourly
if (process.env.MARKET_EVENTS !== "off") {
  syncMarketEvents();
  setInterval(syncMarketEvents, 60 * 60 * 1000);
}

// every request carries the visitor's address in our own header (rate limits, Better Auth)
const fetchWithIp = (req: Request, bindings: HttpBindings | Http2Bindings) => {
  req.headers.set(CLIENT_IP_HEADER, resolveClientIp(req.headers, bindings.incoming.socket.remoteAddress, env.trustProxy));
  return app.fetch(req, bindings);
};
const server = serve({ fetch: fetchWithIp, port: env.port }, (info) => console.log(`tradenotes server on :${info.port}`));

const shutdownHooks: Array<() => Promise<unknown>> = [];
/** Lets the dev runner stop its embedded Postgres after the pool is closed. */
export const onShutdown = (fn: () => Promise<unknown>) => shutdownHooks.push(fn);

const shutdown = async () => {
  server.close();
  await pool.end().catch(() => {});
  for (const fn of shutdownHooks) await fn().catch(() => {});
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
