// Generic, user-scoped table access for the frontend's query builder (src/lib/db.ts).
// Every table is whitelisted with the operations it allows, and the owner column is always forced to the logged-in user.
import { z } from "zod";
import { pool } from "./db.js";
import { deleteScreenshotUrl } from "./uploads.js";

type Action = "select" | "insert" | "update" | "upsert" | "delete";

interface TableConfig {
  /** Column holding the user id; null for global read-only tables */
  owner: string | null;
  actions: Action[];
  /** Columns the client may never write */
  protected: string[];
  /** Allowed conflict targets for upsert */
  conflict?: string[];
}

const BASE_PROTECTED = ["id", "user_id", "created_at", "updated_at"];

const TABLES: Record<string, TableConfig> = {
  trades: { owner: "user_id", actions: ["select", "insert", "update", "delete"], protected: BASE_PROTECTED },
  journal_entries: { owner: "user_id", actions: ["select", "insert", "update", "delete"], protected: BASE_PROTECTED },
  daily_prep: {
    owner: "user_id",
    actions: ["select", "insert", "update", "upsert", "delete"],
    protected: BASE_PROTECTED,
    conflict: ["user_id,date"],
  },
  user_settings: {
    owner: "user_id",
    actions: ["select", "update"],
    // newsletter consent and activity are only set by the server (/api/newsletter, auth middleware)
    protected: [...BASE_PROTECTED, "webhook_api_key", "subscription_tier", "newsletter", "newsletter_consent_at", "last_active_at"],
  },
  profiles: { owner: "id", actions: ["select", "update", "upsert"], protected: BASE_PROTECTED, conflict: ["id"] },
  user_achievements: {
    owner: "user_id",
    actions: ["select", "insert", "update", "upsert", "delete"],
    protected: BASE_PROTECTED,
    conflict: ["user_id,achievement_type"],
  },
  executions: { owner: "user_id", actions: ["select", "delete"], protected: BASE_PROTECTED },
};

const filterSchema = z.object({
  column: z.string(),
  op: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "is", "not.is", "ilike"]),
  value: z.unknown(),
});

export const querySchema = z.object({
  table: z.string(),
  action: z.enum(["select", "insert", "update", "upsert", "delete"]),
  columns: z.string().optional(),
  values: z.union([z.record(z.string(), z.unknown()), z.array(z.record(z.string(), z.unknown()))]).optional(),
  filters: z.array(filterSchema).default([]),
  order: z.array(z.object({ column: z.string(), ascending: z.boolean().default(true) })).default([]),
  limit: z.number().int().positive().max(50_000).optional(),
  returning: z.boolean().default(false),
  onConflict: z.string().optional(),
});

export type Query = z.infer<typeof querySchema>;

export class QueryError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// column name → postgres data type, loaded once from the catalog
let columnTypes: Map<string, Map<string, string>> | null = null;

async function columnsOf(table: string) {
  if (!columnTypes) {
    const { rows } = await pool.query<{ table_name: string; column_name: string; data_type: string }>(
      `select table_name, column_name, data_type from information_schema.columns
       where table_schema = 'public' and table_name = any($1)`,
      [Object.keys(TABLES)],
    );
    columnTypes = new Map();
    for (const r of rows) {
      if (!columnTypes.has(r.table_name)) columnTypes.set(r.table_name, new Map());
      columnTypes.get(r.table_name)!.set(r.column_name, r.data_type);
    }
  }
  return columnTypes.get(table)!;
}

const ident = (name: string) => `"${name}"`;

export async function runQuery(userId: string, q: Query) {
  const config = TABLES[q.table];
  if (!config) throw new QueryError(`Unknown table ${q.table}`, 404);
  if (!config.actions.includes(q.action)) throw new QueryError(`${q.action} not allowed on ${q.table}`, 403);
  const cols = await columnsOf(q.table);

  const column = (name: string) => {
    if (!cols.has(name)) throw new QueryError(`Unknown column ${q.table}.${name}`);
    return ident(name);
  };

  const params: unknown[] = [];
  const param = (value: unknown, col?: string) => {
    const type = col ? cols.get(col) : undefined;
    // json columns need serialized values, otherwise pg would turn JS arrays into postgres arrays
    params.push((type === "jsonb" || type === "json") && value !== null && value !== undefined ? JSON.stringify(value) : value);
    return `$${params.length}`;
  };

  const selectList = (spec?: string) => {
    if (!spec || spec.trim() === "*") return "*";
    return spec
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map(column)
      .join(", ");
  };

  // WHERE: owner first, then client filters (built only where used, params are positional)
  const buildWhere = () => {
    const where: string[] = [];
    if (config.owner) where.push(`${ident(config.owner)} = ${param(userId)}`);
    for (const f of q.filters) {
      const c = column(f.column);
      switch (f.op) {
        case "eq": where.push(`${c} = ${param(f.value, f.column)}`); break;
        case "neq": where.push(`${c} <> ${param(f.value, f.column)}`); break;
        case "gt": where.push(`${c} > ${param(f.value)}`); break;
        case "gte": where.push(`${c} >= ${param(f.value)}`); break;
        case "lt": where.push(`${c} < ${param(f.value)}`); break;
        case "lte": where.push(`${c} <= ${param(f.value)}`); break;
        case "ilike": where.push(`${c} ilike ${param(f.value)}`); break;
        case "in":
          if (!Array.isArray(f.value)) throw new QueryError("in() needs an array");
          where.push(`${c} = any(${param(f.value)})`);
          break;
        case "is":
        case "not.is": {
          const neg = f.op === "not.is" ? " not" : "";
          if (f.value === null) where.push(`${c} is${neg} null`);
          else if (f.value === true || f.value === false) where.push(`${c} is${neg} ${f.value}`);
          else throw new QueryError("is() supports null, true or false");
          break;
        }
      }
    }
    return where.length ? ` where ${where.join(" and ")}` : "";
  };

  const writableRow = (row: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (config.protected.includes(k)) continue;
      column(k);
      if (v !== undefined) out[k] = v;
    }
    return out;
  };

  const returning = q.action === "select" || q.returning ? ` returning ${selectList(q.columns)}` : "";
  let sql: string;

  switch (q.action) {
    case "select": {
      const order = q.order.map((o) => `${column(o.column)} ${o.ascending ? "asc" : "desc"}`).join(", ");
      sql = `select ${selectList(q.columns)} from ${ident(q.table)}${buildWhere()}`;
      if (order) sql += ` order by ${order}`;
      if (q.limit) sql += ` limit ${q.limit}`;
      break;
    }
    case "insert":
    case "upsert": {
      const rows = (Array.isArray(q.values) ? q.values : q.values ? [q.values] : []).map(writableRow);
      if (rows.length === 0) throw new QueryError("No values to insert");
      for (const r of rows) r[config.owner!] = userId;
      const keys = [...new Set(rows.flatMap(Object.keys))];
      const tuples = rows.map((r) => `(${keys.map((k) => (k in r ? param(r[k], k) : "default")).join(", ")})`);
      sql = `insert into ${ident(q.table)} (${keys.map(ident).join(", ")}) values ${tuples.join(", ")}`;
      if (q.action === "upsert") {
        const target = q.onConflict?.replace(/\s/g, "") ?? config.conflict![0];
        if (!config.conflict?.includes(target)) throw new QueryError(`Invalid onConflict ${q.onConflict}`);
        const updates = keys.filter((k) => !target.split(",").includes(k)).map((k) => `${ident(k)} = excluded.${ident(k)}`);
        sql += ` on conflict (${target.split(",").map(ident).join(", ")})`;
        sql += updates.length ? ` do update set ${updates.join(", ")}` : " do nothing";
      }
      sql += returning;
      break;
    }
    case "update": {
      if (!q.values || Array.isArray(q.values)) throw new QueryError("update() needs one object");
      const row = writableRow(q.values);
      const sets = Object.entries(row).map(([k, v]) => `${ident(k)} = ${param(v, k)}`);
      if (sets.length === 0) throw new QueryError("No values to update");
      sql = `update ${ident(q.table)} set ${sets.join(", ")}${buildWhere()}${returning}`;
      break;
    }
    case "delete": {
      // trades: also remove their screenshot files
      const extra = q.table === "trades" ? (returning ? `${returning}, "screenshot_url" as "__screenshot"` : ` returning "screenshot_url" as "__screenshot"`) : returning;
      sql = `delete from ${ident(q.table)}${buildWhere()}${extra}`;
      break;
    }
  }

  const { rows } = await pool.query(sql!, params);
  if (q.action === "delete" && q.table === "trades") {
    for (const r of rows) {
      await deleteScreenshotUrl(userId, r.__screenshot);
      delete r.__screenshot;
    }
  }
  return q.action === "select" || q.returning ? rows : null;
}
