import i18n from "@/i18n/config";

/**
 * Rows and responses come back untyped; callers cast them to their own interfaces.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Untyped = any;

/** Error shape returned by the API helpers. */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

/** fetch against our own backend; never throws, returns { data, error }. */
export async function apiFetch<T = Untyped>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);
  headers.set("x-ui-lang", i18n.language || "en");
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(init.json);
  }
  try {
    const res = await fetch(path, { ...init, headers, body, credentials: "same-origin" });
    const text = await res.text();
    let payload: Untyped = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }
    if (!res.ok) {
      const message = payload?.message ?? payload?.error ?? res.statusText ?? "Request failed";
      return { data: null, error: { message, status: res.status, code: payload?.code } };
    }
    return { data: payload as T, error: null };
  } catch (e) {
    return { data: null, error: { message: (e as Error).message || "Network error", status: 0 } };
  }
}

/** Calls one of the server's action endpoints. */
export function invoke<T = Untyped>(path: string, opts: { body?: unknown } = {}) {
  return apiFetch<T>(`/api/${path}`, { method: "POST", json: opts.body ?? {} });
}

/** Fired on window after this client inserted, updated or deleted trades. */
export const TRADES_CHANGED_EVENT = "tradenotes:trades-changed";

// --- query builder ------------------------------------------------------------
// Small chainable query builder (select/insert/update/delete with filters), executed by POST /api/db
// (server/src/data.ts), which scopes every query to the logged-in user.

type Filter = { column: string; op: string; value: unknown };
type Action = "select" | "insert" | "update" | "upsert" | "delete";

class Query<T = Untyped> implements PromiseLike<ApiResult<T>> {
  private action: Action = "select";
  private columns?: string;
  private values?: unknown;
  private filters: Filter[] = [];
  private orders: { column: string; ascending: boolean }[] = [];
  private max?: number;
  private returning = false;
  private onConflict?: string;
  private mode: "many" | "single" | "maybeSingle" = "many";

  constructor(private table: string) {}

  select(columns = "*") {
    if (this.action === "select") this.columns = columns;
    else {
      this.returning = true;
      this.columns = columns;
    }
    return this;
  }
  insert(values: object | object[]) {
    this.action = "insert";
    this.values = values;
    return this;
  }
  upsert(values: object | object[], opts?: { onConflict?: string }) {
    this.action = "upsert";
    this.values = values;
    this.onConflict = opts?.onConflict;
    return this;
  }
  update(values: object) {
    this.action = "update";
    this.values = values;
    return this;
  }
  delete() {
    this.action = "delete";
    return this;
  }

  private filter(column: string, op: string, value: unknown) {
    this.filters.push({ column, op, value });
    return this;
  }
  eq(column: string, value: unknown) { return this.filter(column, "eq", value); }
  neq(column: string, value: unknown) { return this.filter(column, "neq", value); }
  gt(column: string, value: unknown) { return this.filter(column, "gt", value); }
  gte(column: string, value: unknown) { return this.filter(column, "gte", value); }
  lt(column: string, value: unknown) { return this.filter(column, "lt", value); }
  lte(column: string, value: unknown) { return this.filter(column, "lte", value); }
  ilike(column: string, value: string) { return this.filter(column, "ilike", value); }
  in(column: string, values: unknown[]) { return this.filter(column, "in", values); }
  is(column: string, value: null | boolean) { return this.filter(column, "is", value); }
  not(column: string, op: "is", value: null | boolean) { return this.filter(column, `not.${op}`, value); }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending ?? true });
    return this;
  }
  limit(n: number) {
    this.max = n;
    return this;
  }
  single() {
    this.mode = "single";
    return this as unknown as Query<Untyped>;
  }
  maybeSingle() {
    this.mode = "maybeSingle";
    return this as unknown as Query<Untyped>;
  }

  private async run(): Promise<ApiResult<Untyped>> {
    const res = await apiFetch<{ data: Untyped[] | null }>("/api/db", {
      method: "POST",
      json: {
        table: this.table,
        action: this.action,
        columns: this.columns,
        values: this.values,
        filters: this.filters,
        order: this.orders,
        limit: this.max,
        returning: this.returning,
        onConflict: this.onConflict,
      },
    });
    if (res.error) return { data: null, error: res.error };
    if (this.table === "trades" && this.action !== "select") window.dispatchEvent(new Event(TRADES_CHANGED_EVENT));
    const rows = res.data?.data ?? null;
    if (this.mode === "many" || rows === null) return { data: rows, error: null };
    if (rows.length > 1) return { data: null, error: { message: "More than one row returned", status: 406 } };
    if (rows.length === 0 && this.mode === "single") {
      return { data: null, error: { message: "No rows returned", status: 406, code: "PGRST116" } };
    }
    return { data: rows[0] ?? null, error: null };
  }

  then<R1 = ApiResult<T>, R2 = never>(
    onfulfilled?: ((value: ApiResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export const db = {
  from: <T = Untyped>(table: string) => new Query<T>(table),
};

/** Uploads a trade screenshot; returns the URL path to store in trades.screenshot_url. */
export async function uploadScreenshot(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ url: string }>("/api/screenshots", { method: "POST", body: form });
}
