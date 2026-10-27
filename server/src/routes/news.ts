// Port of the Supabase edge function "marketaux-news". Without MARKETAUX_API_KEY
// every action answers with empty data (meta.disabled), so the widgets just show no news.
import { pool } from "../db.js";
import { env } from "../env.js";

const CACHE_DURATION_HOURS = 6;
const API = "https://api.marketaux.com/v1/news/all";

// Futures/commodities → news-searchable proxies (news rarely mention futures tickers)
const NEWS_PROXY_MAPPING: Record<string, string[]> = {
  NQ: ["QQQ", "NDX"], ES: ["SPY", "SPX"], YM: ["DIA", "DJI"], RTY: ["IWM", "RUT"],
  MNQ: ["QQQ", "NDX"], MES: ["SPY", "SPX"], MYM: ["DIA", "DJI"], M2K: ["IWM", "RUT"],
  GC: ["GLD"], SI: ["SLV"], CL: ["USO"], NG: ["UNG"],
  BTC: ["COIN", "MSTR"], ETH: ["ETHE"],
};
const proxySymbols = (symbol: string) => NEWS_PROXY_MAPPING[symbol.toUpperCase()] || [symbol];

const SECTORS = [
  "Technology", "Energy", "Healthcare", "Financials", "Consumer Cyclical", "Consumer Defensive",
  "Industrials", "Basic Materials", "Real Estate", "Utilities", "Communication Services",
];

// simple per-user rate limit (the old function allowed 30 requests per minute)
const RATE_LIMIT = 30;
const hits = new Map<string, { count: number; windowStart: number }>();
function rateLimited(userId: string) {
  const now = Date.now();
  const entry = hits.get(userId);
  if (!entry || now - entry.windowStart > 60_000) {
    hits.set(userId, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

async function marketaux(params: Record<string, string>) {
  const url = new URL(API);
  url.searchParams.set("api_token", env.marketauxApiKey!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const data: any = await res.json().catch(() => null);
  return { ok: res.ok && Array.isArray(data?.data), status: res.status, data: (data?.data ?? []) as any[] };
}

async function cacheGet(key: string) {
  const { rows } = await pool.query("select articles, sentiment_data from news_cache where cache_key = $1 and expires_at > now()", [key]);
  return rows[0] as { articles: any; sentiment_data: any } | undefined;
}

async function cachePut(key: string, symbols: string[], articles: unknown, hours: number, sentiment: unknown = {}) {
  await pool.query(
    `insert into news_cache (cache_key, symbols, articles, sentiment_data, expires_at)
     values ($1, $2, $3, $4, now() + make_interval(hours => $5))
     on conflict (cache_key) do update set articles = excluded.articles, sentiment_data = excluded.sentiment_data,
       expires_at = excluded.expires_at, created_at = now()`,
    [key, symbols, JSON.stringify(articles), JSON.stringify(sentiment), hours],
  );
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const day = (iso: string) => iso.split("T")[0];

export async function news(userId: string, body: any): Promise<{ status: number; body: unknown }> {
  const { action, date, symbols, timeWindow, keywords = "Trump,Fed,Powell" } = body ?? {};

  if (!env.marketauxApiKey) {
    const meta = { cached: false, disabled: true };
    if (action === "get-sentiment") return { status: 200, body: { success: true, sentiment: { symbol: symbols?.[0], avg_sentiment: 0, article_count: 0, timeWindow }, meta } };
    if (action === "get-news-volume") return { status: 200, body: { success: true, hourlyVolume: [], meta } };
    if (action === "get-sector-overview") return { status: 200, body: { success: true, sectors: [], meta } };
    return { status: 200, body: { success: true, articles: [], meta } };
  }
  if (rateLimited(userId)) {
    return { status: 429, body: { success: false, error: `Rate limit exceeded. Maximum ${RATE_LIMIT} requests per minute.`, retryAfter: 60 } };
  }

  // sentiment of a symbol in a time window (trade validation)
  if (action === "get-sentiment") {
    const symbol = symbols?.[0];
    if (!symbol || !timeWindow) return { status: 400, body: { success: false, error: "Symbol and timeWindow required" } };
    const key = `sentiment-${symbol}-${timeWindow.start}-${timeWindow.end}`;
    const cached = await cacheGet(key);
    if (cached?.sentiment_data?.symbol) return { status: 200, body: { success: true, sentiment: cached.sentiment_data, meta: { cached: true } } };

    const proxies = proxySymbols(symbol);
    const res = await marketaux({
      symbols: proxies.join(","), published_after: day(timeWindow.start), published_before: day(timeWindow.end),
      filter_entities: "true", limit: "50",
    });
    if (!res.ok) return { status: 502, body: { success: false, error: "Failed to fetch sentiment data" } };
    const scores = res.data.flatMap((a) =>
      (a.entities ?? []).filter((e: any) => proxies.includes(e.symbol) && e.sentiment_score != null).map((e: any) => e.sentiment_score as number),
    );
    const sentiment = { symbol, avg_sentiment: avg(scores), article_count: scores.length, timeWindow };
    await cachePut(key, [symbol], [], CACHE_DURATION_HOURS, sentiment);
    return { status: 200, body: { success: true, sentiment, meta: { cached: false } } };
  }

  // hype level: articles per hour
  if (action === "get-news-volume") {
    const symbol = symbols?.[0];
    if (!symbol || !timeWindow) return { status: 400, body: { success: false, error: "Symbol and timeWindow required" } };
    const key = `volume-${symbol}-${timeWindow.start}`;
    const cached = await cacheGet(key);
    if (cached?.articles) return { status: 200, body: { success: true, hourlyVolume: cached.articles, meta: { cached: true } } };

    const res = await marketaux({ symbols: proxySymbols(symbol).join(","), published_after: day(timeWindow.start), limit: "100" });
    if (!res.ok) return { status: 502, body: { success: false, error: "Failed to fetch volume data" } };
    const perHour: Record<string, number> = {};
    for (const a of res.data) {
      const hour = new Date(a.published_at).toISOString().substring(0, 13);
      perHour[hour] = (perHour[hour] || 0) + 1;
    }
    const hourlyVolume = Object.entries(perHour).map(([hour, count]) => ({ hour, count }));
    await cachePut(key, [symbol], hourlyVolume, 1);
    return { status: 200, body: { success: true, hourlyVolume, meta: { cached: false } } };
  }

  // sector sentiment widget on the dashboard
  if (action === "get-sector-overview") {
    const today = new Date().toISOString().split("T")[0];
    if (body.forceRefresh !== true) {
      const { rows } = await pool.query(
        "select * from sector_sentiments where date = $1 and expires_at > now() and article_count > 0",
        [today],
      );
      // fewer than 3 sectors usually means an incomplete earlier fetch
      if (rows.length >= 3) return { status: 200, body: { success: true, sectors: rows, meta: { cached: true } } };
    }

    const sectors = [];
    for (const sector of SECTORS) {
      const res = await marketaux({ industries: sector, published_on: today, filter_entities: "true", limit: "50" });
      if (!res.ok || res.data.length === 0) continue;

      const scores: number[] = res.data.flatMap((a) =>
        (a.entities ?? []).filter((e: any) => e.sentiment_score != null).map((e: any) => e.sentiment_score as number),
      );
      const mean = avg(scores);
      const articles = res.data.map((a) => {
        const s = (a.entities ?? []).map((e: any) => e.sentiment_score).filter((x: number | null) => x != null);
        return { title: a.title, url: a.url, sentiment_score: avg(s), published_at: a.published_at };
      });
      // the three most positive and three most negative articles, strongest first
      const byScore = [...articles].sort((a, b) => b.sentiment_score - a.sentiment_score);
      const top = [...byScore.slice(0, 3), ...byScore.slice(-3).reverse()]
        .filter((a, i, all) => i === all.findIndex((b) => b.url === a.url))
        .sort((a, b) => Math.abs(b.sentiment_score) - Math.abs(a.sentiment_score))
        .slice(0, 6);

      const info = {
        date: today,
        sector,
        avg_sentiment: mean,
        min_sentiment: scores.length ? Math.min(...scores) : 0,
        max_sentiment: scores.length ? Math.max(...scores) : 0,
        volatility: Math.sqrt(avg(scores.map((s) => (s - mean) ** 2))),
        negative_count: scores.filter((s) => s < -0.3).length,
        strongly_negative_count: scores.filter((s) => s < -0.5).length,
        article_count: res.data.length,
        articles: top,
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      };
      sectors.push(info);
      await pool.query(
        `insert into sector_sentiments (date, sector, avg_sentiment, article_count, articles, expires_at)
         values ($1, $2, $3, $4, $5, $6)
         on conflict (date, sector) do update set avg_sentiment = excluded.avg_sentiment, article_count = excluded.article_count,
           articles = excluded.articles, expires_at = excluded.expires_at`,
        [today, sector, mean, info.article_count, JSON.stringify(top), info.expires_at],
      );
    }
    return { status: 200, body: { success: true, sectors, meta: { cached: false } } };
  }

  // political events for the calendar (announced for future dates, past otherwise)
  if (action === "get-political-events") {
    const start: string | undefined = body.startDate || date;
    const end: string | undefined = body.endDate || date;
    const today = new Date().toISOString().split("T")[0];
    const isFuture = !!start && start > today;
    const eventType = isFuture ? "announced" : "past";
    const key = `political-${start}-${end || "single"}-${keywords}`;
    const cached = await cacheGet(key);
    if (cached?.articles) return { status: 200, body: { success: true, articles: cached.articles, eventType, meta: { cached: true } } };

    const params: Record<string, string> = { search: String(keywords), language: "en", limit: String(body.limit || 50) };
    if (isFuture) {
      params.published_after = new Date(Date.now() - 7 * 86_400_000).toISOString().split("T")[0];
      params.published_before = today;
    } else if (start && end && start !== end) {
      params.published_after = start;
      params.published_before = end;
    } else if (start) {
      params.published_on = start;
    }
    const res = await marketaux(params);
    if (!res.ok) return { status: 502, body: { success: false, error: `API request failed with status ${res.status}` } };
    const articles = res.data.map((a) => ({
      uuid: a.uuid,
      title: a.title,
      snippet: a.snippet || a.description?.substring(0, 200) || "",
      url: a.url,
      published_at: a.published_at,
      source: a.source,
      date: a.published_at ? day(a.published_at) : today,
    }));
    if (articles.length > 0) await cachePut(key, [], articles, isFuture ? 24 : 168);
    return { status: 200, body: { success: true, articles, eventType, meta: { cached: false } } };
  }

  // default: latest articles per symbol (portfolio news, trade context)
  if (!Array.isArray(symbols) || symbols.length === 0) return { status: 400, body: { success: false, error: "Symbols required" } };
  let range: string;
  let publishedAfter = "";
  if (date) range = date;
  else {
    publishedAfter = new Date(Date.now() - 3 * 86_400_000).toISOString().split("T")[0];
    range = `range-${publishedAfter}`;
  }

  const all: any[] = [];
  const toFetch: string[] = [];
  for (const symbol of symbols.slice(0, 25)) {
    const cached = await cacheGet(`articles-single-${symbol}-${range}`);
    if (Array.isArray(cached?.articles)) all.push(...cached.articles);
    else toFetch.push(symbol);
  }

  const results = await Promise.all(
    toFetch.map(async (symbol) => {
      try {
        const res = await marketaux({
          symbols: symbol, filter_entities: "true", limit: "5",
          ...(date ? { published_on: date } : { published_after: publishedAfter }),
        });
        const articles = res.data.map((a) => ({
          uuid: a.uuid,
          title: a.title,
          snippet: a.snippet || a.description?.substring(0, 200) || "",
          url: a.url,
          image_url: a.image_url,
          published_at: a.published_at,
          source: a.source,
          entities: (a.entities ?? []).map((e: any) => ({
            symbol: e.symbol,
            name: e.name,
            type: e.type,
            industry: e.industry || "",
            match_score: e.match_score || 0,
            sentiment_score: e.sentiment_score || 0,
            highlights: (e.highlights ?? []).map((h: any) => ({
              highlight: h.highlight || "",
              sentiment: h.sentiment || 0,
              highlighted_in: h.highlighted_in || "main_text",
            })),
          })),
        }));
        return { symbol, articles, ok: res.ok };
      } catch {
        return { symbol, articles: [], ok: false };
      }
    }),
  );
  for (const r of results) {
    // failed fetches are not cached, so they are retried next time
    if (r.ok) await cachePut(`articles-single-${r.symbol}-${range}`, [r.symbol], r.articles, CACHE_DURATION_HOURS);
    all.push(...r.articles);
  }

  const unique = [...new Map(all.map((a) => [a.uuid, a])).values()];
  return {
    status: 200,
    body: { success: true, articles: unique, meta: { cached: toFetch.length === 0, partial_cache: all.length > 0 && toFetch.length > 0 } },
  };
}
