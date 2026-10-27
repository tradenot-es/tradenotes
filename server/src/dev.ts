// Local development: starts a private Postgres (embedded-postgres, data in ./data/pg)
// and then the normal server. The Vite dev server proxies /api to it.
import EmbeddedPostgres from "embedded-postgres";

const port = 54329;
const db = new EmbeddedPostgres({
  databaseDir: "./data/pg",
  port,
  user: "tradenotes",
  password: "tradenotes",
  persistent: true,
  onLog: () => {},
});
const fresh = !(await import("node:fs")).existsSync("./data/pg/PG_VERSION");
if (fresh) await db.initialise();
await db.start();
if (fresh) await db.createDatabase("tradenotes");

process.env.DATABASE_URL ??= `postgres://tradenotes:tradenotes@localhost:${port}/tradenotes`;
process.env.BASE_URL ??= "http://localhost:8080";
process.env.BETTER_AUTH_SECRET ??= "dev-secret-dev-secret-dev-secret-0123456789";
process.env.UPLOAD_DIR ??= "./data/uploads";

const { onShutdown } = await import("./index.js");
onShutdown(() => db.stop());
