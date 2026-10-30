// Entry point of the Docker image. Self-hosting with one container and one volume (/data):
// - without DATABASE_URL it runs its own Postgres (data in /data/postgres, reachable only through
//   a Unix socket inside the container) and dumps it to /data/backups once a day
// - without BETTER_AUTH_SECRET it creates one and keeps it in /data, so sessions survive updates
// With DATABASE_URL set (e.g. tradenot.es or compose with a separate Postgres) it only starts the server.
import { spawn, execFile, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const DATA = process.env.DATA_DIR ?? "/data";
const PG_DATA = join(DATA, "postgres");
const BACKUPS = join(DATA, "backups");
// the Postgres major version in the image; a data directory from another version cannot be opened
const PG_MAJOR = "18";
const PG_BIN = process.env.PG_BIN ?? `/usr/libexec/postgresql${PG_MAJOR}`;
const SOCKET_DIR = "/tmp";
const DB = "tradenotes";
// set during shutdown, so the exit of Postgres is not treated as a crash
let stopping = false;

async function secret() {
  if (process.env.BETTER_AUTH_SECRET) return;
  const file = join(DATA, "secret.key");
  if (!existsSync(file)) {
    await writeFile(file, randomBytes(32).toString("hex"), { mode: 0o600 });
    console.log(`[start] created ${file}`);
  }
  process.env.BETTER_AUTH_SECRET = (await readFile(file, "utf8")).trim();
}

/**
 * After a hard stop (docker kill, power loss) postmaster.pid stays behind. Container PIDs are small
 * and get reused, so Postgres may take an unrelated process for itself and refuse to start. Nothing
 * else runs Postgres in this container before we start it: the file is stale unless its PID is a
 * live postgres process here.
 */
async function removeStaleLock() {
  const lock = join(PG_DATA, "postmaster.pid");
  if (!existsSync(lock)) return;
  const pid = (await readFile(lock, "utf8")).split("\n")[0].trim();
  const cmdline = await readFile(`/proc/${pid}/cmdline`, "utf8").catch(() => "");
  if (cmdline.includes("postgres")) return;
  await rm(lock);
  console.log("[start] removed a stale postmaster.pid (the container was not stopped cleanly)");
}

async function startPostgres(): Promise<ChildProcess> {
  if (!existsSync(join(PG_DATA, "PG_VERSION"))) {
    console.log("[start] first start: creating the database");
    await run(`${PG_BIN}/initdb`, ["-D", PG_DATA, "-U", DB, "--auth-local=trust", "--auth-host=reject", "-E", "UTF8", "--locale-provider=builtin", "--builtin-locale=C.UTF-8"]);
  } else {
    const version = (await readFile(join(PG_DATA, "PG_VERSION"), "utf8")).trim();
    if (version !== PG_MAJOR) {
      throw new Error(
        `The database in ${PG_DATA} was created by Postgres ${version}, this image has Postgres ${PG_MAJOR}. ` +
          `Restore a dump from ${BACKUPS} into a fresh /data, see docs/self-hosting.md.`,
      );
    }
  }
  await removeStaleLock();
  // no TCP port at all: only processes in this container reach it through the socket
  const pg = spawn(`${PG_BIN}/postgres`, ["-D", PG_DATA, "-c", "listen_addresses=", "-c", `unix_socket_directories=${SOCKET_DIR}`], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  pg.on("exit", (code) => {
    if (stopping) return;
    console.error(`[start] Postgres stopped unexpectedly (code ${code})`);
    process.exit(1);
  });

  for (let i = 0; ; i++) {
    try {
      await run(`${PG_BIN}/pg_isready`, ["-h", SOCKET_DIR, "-U", DB, "-q"]);
      break;
    } catch {
      if (i > 60) throw new Error("Postgres did not start within 30 seconds");
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  const { stdout } = await run(`${PG_BIN}/psql`, ["-h", SOCKET_DIR, "-U", DB, "-d", "postgres", "-tAc", `select 1 from pg_database where datname = '${DB}'`]);
  if (!stdout.trim()) await run(`${PG_BIN}/createdb`, ["-h", SOCKET_DIR, "-U", DB, DB]);
  process.env.DATABASE_URL = `postgres://${DB}@localhost/${DB}?host=${SOCKET_DIR}`;
  return pg;
}

/** Daily dump of the bundled database; BACKUP_KEEP_DAYS (default 7, 0 = off) dumps are kept. */
function scheduleBackups() {
  const keep = Number(process.env.BACKUP_KEEP_DAYS ?? 7);
  if (!(keep > 0)) return;
  const backup = async () => {
    await mkdir(BACKUPS, { recursive: true, mode: 0o700 });
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, "").replace("T", "_");
    const file = join(BACKUPS, `tradenotes_${stamp}.dump`);
    await run(`${PG_BIN}/pg_dump`, ["-h", SOCKET_DIR, "-U", DB, "-d", DB, "--format=custom", "-f", file]);
    await chmod(file, 0o600);
    const cutoff = Date.now() - keep * 24 * 60 * 60 * 1000;
    for (const name of await readdir(BACKUPS)) {
      if (name.startsWith("tradenotes_") && name.endsWith(".dump") && (await stat(join(BACKUPS, name))).mtimeMs < cutoff) {
        await rm(join(BACKUPS, name));
      }
    }
    console.log(`[backup] ${file}`);
  };
  const daily = () => backup().catch((e) => console.error("[backup] failed", e));
  // first one shortly after start, then every 24 hours
  setTimeout(daily, 5 * 60 * 1000);
  setInterval(daily, 24 * 60 * 60 * 1000);
}

/** SIGINT = Postgres "fast" shutdown: ends connections, writes a clean checkpoint. */
const stopPostgres = (pg: ChildProcess) =>
  new Promise<void>((resolve) => {
    stopping = true;
    if (pg.exitCode !== null) return resolve();
    pg.once("exit", () => resolve());
    pg.kill("SIGINT");
  });

await secret();
const pg = process.env.DATABASE_URL ? null : await startPostgres();

let server: typeof import("./index.js");
try {
  server = await import("./index.js");
} catch (e) {
  // e.g. a failed migration: shut the database down cleanly before the container stops
  console.error(e);
  if (pg) await stopPostgres(pg);
  process.exit(1);
}
if (pg) {
  scheduleBackups();
  server.onShutdown(() => stopPostgres(pg));
}
