# tradenot.es

Kostenloses Trading-Journal: Trades erfassen und importieren (CSV, NinjaTrader-Webhook), Journal, Reports, Ziele.
Ursprünglich mit Lovable gebaut, seit Oktober 2026 selbst gehostet ohne Lovable und Supabase.
Die ursprüngliche Produktbeschreibung steht in [docs/MVP-SPEC.md](docs/MVP-SPEC.md).

## Aufbau

- `src/`: Frontend (React, Vite, Tailwind/shadcn, i18n in 6 Sprachen)
- `server/`: Backend (Node, Hono, PostgreSQL, Better Auth)
  - `src/auth.ts`: Login mit E-Mail/Passwort, E-Mail-Bestätigung, Passwort-Reset, TOTP-2FA
  - `src/data.ts`: generischer Datenzugang für das Frontend (`db.from(...)` in `src/lib/api.ts`).
    Jede Tabelle steht mit erlaubten Aktionen in einer Freigabeliste, die Nutzer-ID setzt immer der Server.
  - `src/routes/import.ts`: Trade-Import und NinjaTrader/TradingView-Webhook (`POST /api/import-trades`, Header `X-API-Key`)
  - `src/routes/news.ts`: Marktnews über Marketaux (optional, nur mit API-Key)
  - `migrations/`: SQL-Migrationen, laufen beim Start automatisch
- KI-Funktionen sind über `AI_FEATURES` in `src/config/featureFlags.ts` abgeschaltet.

## Entwicklung

```sh
npm install && npm --prefix server install
npm run dev:server   # Backend auf :3000 mit eigener Postgres (embedded-postgres, Daten in server/data/)
npm run dev          # Frontend auf :8080, leitet /api an das Backend weiter
```

Ohne SMTP-Konfiguration verschickt das Backend keine Mails, sondern schreibt die Links
(Bestätigung, Passwort-Reset) ins Log.

Smoke-Test gegen das laufende Backend (Log-Datei für die Bestätigungslinks):

```sh
npm --prefix server run dev > /tmp/tradenotes-dev.log 2>&1 &
cd server && npx tsx test/smoke.ts http://localhost:3000 /tmp/tradenotes-dev.log
```

## Betrieb

`compose.yaml` startet App und Datenbank als eigenen Stack. Die App lauscht nur auf `127.0.0.1:3010`,
davor sitzt der Caddy des Servers.

```sh
cp .env.example .env   # Werte eintragen
docker compose up -d --build
```

Caddy-Site-Block:

```
tradenot.es, www.tradenot.es {
	reverse_proxy 127.0.0.1:3010
}
```
