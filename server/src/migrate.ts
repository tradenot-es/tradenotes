import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type pg from "pg";

const dir = fileURLToPath(new URL("../migrations", import.meta.url));

/** Applies migrations/*.sql in name order, each once, inside a transaction. */
export async function runMigrations(pool: pg.Pool) {
  const client = await pool.connect();
  try {
    // only one instance migrates at a time
    await client.query("select pg_advisory_lock(727001)");
    await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
    const { rows } = await client.query<{ name: string }>("select name from schema_migrations");
    const applied = new Set(rows.map((r) => r.name));
    for (const name of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
      if (applied.has(name)) continue;
      const sql = await readFile(join(dir, name), "utf8");
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [name]);
        await client.query("commit");
        console.log(`migrated ${name}`);
      } catch (e) {
        await client.query("rollback");
        throw new Error(`Migration ${name} failed: ${(e as Error).message}`);
      }
    }
  } finally {
    await client.query("select pg_advisory_unlock(727001)").catch(() => {});
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { pool } = await import("./db.js");
  await runMigrations(pool);
  await pool.end();
}
