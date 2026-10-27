import pg from "pg";
import { env } from "./env.js";

// numeric columns come back as strings by default; the frontend expects numbers
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => (v === null ? null : Number(v)));
// keep DATE columns as "YYYY-MM-DD" strings instead of JS Dates in local time
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

export const pool = new pg.Pool({ connectionString: env.databaseUrl, max: 10 });
