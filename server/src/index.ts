import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { pool } from "./db.js";
import { env } from "./env.js";
import { runMigrations } from "./migrate.js";
import { syncDueIbkr } from "./ibkr.js";
import { syncMarketEvents } from "./marketEvents.js";
import { processQueue } from "./campaigns.js";

await runMigrations(pool);
// loaded after migrating: Better Auth checks its tables on startup
const { app } = await import("./app.js");

if (env.staticDir) {
  // built frontend; unknown paths fall back to index.html for client-side routing
  app.use("/*", serveStatic({ root: env.staticDir }));
  app.get("/*", serveStatic({ root: env.staticDir, path: "index.html" }));
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

const server = serve({ fetch: app.fetch, port: env.port }, (info) => console.log(`tradenotes server on :${info.port}`));

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
