// One-off: print the SQL Better Auth needs for our auth config (→ migrations/001_auth.sql)
import EmbeddedPostgres from "embedded-postgres";
const dir = process.argv[2];
const db = new EmbeddedPostgres({ databaseDir: dir, port: 55433, user: "postgres", password: "postgres", persistent: false, onLog: () => {} });
await db.initialise();
await db.start();
Object.assign(process.env, { DATABASE_URL: "postgres://postgres:postgres@localhost:55433/postgres", BASE_URL: "http://localhost:3000", BETTER_AUTH_SECRET: "x".repeat(32) });
const { auth } = await import("../src/auth.js");
const { getMigrations } = await import("better-auth/db/migration");
const m = await getMigrations(auth.options);
console.log(await m.compileMigrations());
const { pool } = await import("../src/db.js");
await pool.end();
await db.stop();
