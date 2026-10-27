// Demo account for the marketing screenshots (scripts/screenshots.mjs), against the
// local dev server (npm run dev in server/). Recreates the account on every run with
// the same, deterministic trades, ending today:
//   npx tsx tools/seed-demo.ts [baseUrl]
import { createHash } from "node:crypto";
import pg from "pg";

export const DEMO_EMAIL = "demo-screens@example.com";
export const DEMO_PASSWORD = "Demo-Screens-2026";

const base = process.argv[2] ?? "http://localhost:3000";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? "postgres://tradenotes:tradenotes@localhost:54329/tradenotes" });

// --- account ------------------------------------------------------------------

async function solveCaptcha() {
  const ch = await (await fetch(`${base}/api/altcha/challenge`)).json();
  for (let n = 0; n <= ch.maxnumber; n++) {
    if (createHash("sha256").update(ch.salt + n).digest("hex") === ch.challenge) {
      return Buffer.from(JSON.stringify({ challenge: ch.challenge, salt: ch.salt, number: n, algorithm: ch.algorithm })).toString("base64");
    }
  }
  throw new Error("captcha unsolvable");
}

await pool.query(`delete from "user" where email = $1`, [DEMO_EMAIL]);
const signUp = await fetch(`${base}/api/auth/sign-up/email`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: "http://localhost:8080" },
  body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD, name: "Alex", firstName: "Alex", lastName: "Demo", altcha: await solveCaptcha() }),
});
if (!signUp.ok) throw new Error(`sign up failed: ${signUp.status} ${await signUp.text()}`);
const { rows } = await pool.query(`update "user" set "emailVerified" = true where email = $1 returning id`, [DEMO_EMAIL]);
const userId: string = rows[0].id;

// --- trades -------------------------------------------------------------------

// small seeded PRNG so every run produces the same account
let seed = 20261027;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];

const SETUPS = [
  { name: "Opening Range", checklist: ["Range marked", "Volume above average", "Stop behind range"], edge: 0.62 },
  { name: "Pullback", checklist: ["15 min trend", "Pullback to EMA", "Reward/risk ≥ 2"], edge: 0.58 },
  { name: "VWAP Reclaim", checklist: ["Close above VWAP", "No news event"], edge: 0.5 },
  { name: "Breakout", checklist: ["Base ≥ 20 min", "Breakout on volume", "Market supports"], edge: 0.44 },
];
const INSTRUMENTS = [
  { symbol: "ES", market: "Futures", point: 50, price: 6850, tick: 0.25, qty: [1, 2] },
  { symbol: "NQ", market: "Futures", point: 20, price: 25400, tick: 0.25, qty: [1] },
  { symbol: "MNQ", market: "Futures", point: 2, price: 25400, tick: 0.25, qty: [2, 3, 5] },
  { symbol: "NVDA", market: "Stock", point: 1, price: 186, tick: 0.01, qty: [50, 100] },
  { symbol: "AAPL", market: "Stock", point: 1, price: 262, tick: 0.01, qty: [40, 80] },
];
const ACCOUNTS = [
  { type: "live", name: "Live" },
  { type: "evaluation", name: "Apex Eval 50K" },
  { type: "performance", name: "Apex PA 50K" },
  { type: "sim", name: "Sim101" },
];
const EMOTIONS_GOOD = ["calm", "confident"];
const EMOTIONS_BAD = ["frustrated", "impatient", "fearful", "greedy"];

const round = (v: number, tick: number) => Math.round(v / tick) * tick;
const trades: Record<string, unknown>[] = [];
const today = new Date();
today.setHours(0, 0, 0, 0);

for (let d = 44; d >= 0; d--) {
  const day = new Date(today.getTime() - d * 86_400_000);
  if (day.getDay() === 0 || day.getDay() === 6) continue;
  const count = d === 0 ? 2 : 1 + Math.floor(rand() * 3);
  // US cash session, 15:35–21:30 Amsterdam time
  let minute = 15 * 60 + 35 + Math.floor(rand() * 40);
  for (let i = 0; i < count; i++) {
    const setup = pick(SETUPS);
    const inst = pick(INSTRUMENTS);
    const account = rand() < 0.55 ? ACCOUNTS[0] : pick(ACCOUNTS.slice(1));
    const side = rand() < 0.6 ? "long" : "short";
    const dir = side === "long" ? 1 : -1;
    const qty = pick(inst.qty);
    // checklist discipline: mostly followed, which is also when the edge holds
    const followed = rand() < 0.7;
    const checklist = setup.checklist.map(() => followed || rand() < 0.4);
    // today ends in profit so the dashboard shows a normal day
    const win = d === 0 ? i === 0 || rand() < 0.5 : rand() < (followed ? setup.edge + 0.08 : setup.edge - 0.15);
    const riskPts = inst.market === "Futures" ? round(inst.price * 0.0012, inst.tick) : round(inst.price * 0.006, inst.tick);
    const movePts = win ? riskPts * (0.8 + rand() * 1.8) : -riskPts * (0.4 + rand() * 0.7);
    const entry = round(inst.price * (1 + (rand() - 0.5) * 0.04), inst.tick);
    const exit = round(entry + dir * movePts, inst.tick);
    const fees = inst.market === "Futures" ? 4.5 * qty : 1;
    const pnl = Math.round(((exit - entry) * dir * qty * inst.point - fees) * 100) / 100;
    const risk = Math.round(riskPts * qty * inst.point);
    // mostly intraday scalps and swings within the session, a few runners held for hours
    const holdMin = rand() < 0.15 ? 90 + Math.floor(rand() * 240) : 3 + Math.floor(rand() * (win ? 70 : 35));
    const entryTime = new Date(day.getTime() + minute * 60_000);
    const exitTime = new Date(entryTime.getTime() + holdMin * 60_000);
    minute += holdMin + 5 + Math.floor(rand() * 60);

    const mistakes: string[] = [];
    if (!followed) mistakes.push(pick(["broke_rules", "fomo", "chased_entry", "moved_stop", "early_exit"]));
    if (!win && rand() < 0.15) mistakes.push("oversized");
    const favorable = Math.abs(movePts) * (win ? 1.25 : 0.4) + riskPts * 0.2;
    const adverse = win ? riskPts * (0.2 + rand() * 0.5) : Math.abs(movePts) * 1.1;

    trades.push({
      symbol: inst.symbol,
      market: inst.market,
      side,
      qty,
      entry_price: entry,
      exit_price: exit,
      entry_time: entryTime.toISOString(),
      exit_time: exitTime.toISOString(),
      fees,
      pnl_net: pnl,
      initial_risk: risk,
      r: Math.round((pnl / risk) * 100) / 100,
      setup: setup.name,
      setup_checklist_completed: checklist,
      tags: [inst.market === "Futures" ? "futures" : "momentum"],
      rating: win ? (followed ? 4 + Math.round(rand()) : 3) : followed ? 3 : 1 + Math.round(rand()),
      mistakes,
      emotions: [followed ? pick(EMOTIONS_GOOD) : pick(EMOTIONS_BAD)],
      account_type: account.type,
      account_name: account.name,
      mfe_price: round(entry + dir * favorable, inst.tick),
      mae_price: round(entry - dir * adverse, inst.tick),
      note: win && followed ? "A+ setup, plan executed." : !followed ? "Early entry, skipped the checklist." : null,
    });
  }
}

const columns = Object.keys(trades[0]);
for (const t of trades) {
  await pool.query(
    `insert into trades (user_id, ${columns.join(", ")}) values ($1, ${columns.map((_, i) => `$${i + 2}`).join(", ")})`,
    [userId, ...columns.map((c) => t[c])],
  );
}

// --- settings, journal, prep ----------------------------------------------------

const goals = {
  daily_pnl: { enabled: true, target: 500, operator: ">=" },
  max_trades: { enabled: true, target: 4, operator: "<=" },
  max_drawdown: { enabled: true, target: 600, operator: "<=" },
  min_win_rate: { enabled: true, target: 50, operator: ">=" },
  max_losing_streak: { enabled: true, target: 3, operator: "<=" },
};
await pool.query(
  `update user_settings set setup_definitions = $2, setups = $3, trading_goals = trading_goals || $4::jsonb,
     cooldown_rule = '{"enabled": true, "after_losses": 2, "minutes": 30}'
   where user_id = $1`,
  [userId, JSON.stringify(SETUPS.map(({ name, checklist }) => ({ name, checklist }))), SETUPS.map((s) => s.name), JSON.stringify(goals)],
);
await pool.query(
  `insert into journal_entries (user_id, date, content) values ($1, current_date, $2), ($1, current_date - 1, $3)`,
  [userId, "Calm start, only A setups. Took a break after the second loss.", "FOMO on the NQ breakout. Tomorrow: checklist first."],
);

console.log(`demo account ${DEMO_EMAIL}: ${trades.length} trades`);
await pool.end();
