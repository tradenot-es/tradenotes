// "Download my data": everything stored for a user as one ZIP (GDPR art. 15/20).
// data.json holds all rows, trades.csv uses the import template's columns so it can be
// imported again, screenshots/ holds the uploaded images.
import { pool } from "./db.js";
import { listScreenshots, readScreenshot } from "./uploads.js";
import { createZip } from "./zip.js";

// secrets stay out of the export: they grant access and the user can create new ones
const OMIT: Record<string, string[]> = {
  user_settings: ["webhook_api_key"],
  broker_connections: ["token"],
};

// table → column the rows are sorted by
const TABLES: Record<string, string> = {
  user_settings: "created_at",
  trades: "exit_time",
  journal_entries: "date",
  daily_prep: "date",
  user_achievements: "achieved_at",
  executions: "time",
  broker_connections: "created_at",
  trade_shares: "created_at",
};

const CSV_COLUMNS = [
  "symbol", "side", "market", "qty", "entryPrice", "exitPrice", "entryTime", "exitTime", "fees", "pnlNet",
  "tags", "setup", "note", "rating", "mistakes", "emotions", "accountType", "accountName",
];

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : Array.isArray(value) ? value.join(";") : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function tradesCsv(trades: Record<string, any>[]): string {
  const rows = trades.map((t) =>
    [
      t.symbol, t.side, t.market, t.qty, t.entry_price, t.exit_price, t.entry_time, t.exit_time, t.fees, t.pnl_net,
      t.tags, t.setup, t.note, t.rating, t.mistakes, t.emotions, t.account_type, t.account_name,
    ].map(csvCell).join(","),
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\r\n") + "\r\n";
}

export async function buildExport(userId: string): Promise<Buffer> {
  const { rows: users } = await pool.query(
    `select email, "emailVerified", "twoFactorEnabled", "createdAt" from "user" where id = $1`,
    [userId],
  );
  const { rows: profiles } = await pool.query("select * from profiles where id = $1", [userId]);

  const data: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    account: users[0] ?? null,
    profile: profiles[0] ?? null,
  };
  for (const [table, order] of Object.entries(TABLES)) {
    const { rows } = await pool.query(`select * from ${table} where user_id = $1 order by ${order}`, [userId]);
    data[table] = rows.map((row) => {
      for (const column of OMIT[table] ?? []) delete row[column];
      return row;
    });
  }

  const files: { name: string; content: string | Uint8Array }[] = [
    { name: "data.json", content: JSON.stringify(data, null, 2) },
    { name: "trades.csv", content: tradesCsv(data.trades as Record<string, any>[]) },
  ];
  for (const name of await listScreenshots(userId)) {
    const file = await readScreenshot(userId, name);
    if (file) files.push({ name: `screenshots/${name}`, content: file.data });
  }
  return createZip(files);
}
