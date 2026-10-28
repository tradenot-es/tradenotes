<p align="center">
  <img src="public/logo.png" alt="TradeNot.es Logo" width="160" />
</p>

<h1 align="center">tradenot.es</h1>

<p align="center">Kostenloses Trading-Journal für Futures-, Aktien- und Prop-Firm-Trader</p>

Trades automatisch aus NinjaTrader (Add-on) und Interactive Brokers (Flex-Abfrage) importieren, TradingView und andere per CSV; Journal, Disziplin-Limits, Pflichtpause, Fehler- und Regeltreue-Analyse, Reports, Mentor-Modus.
Ursprünglich mit Lovable gebaut, seit Oktober 2026 selbst gehostet ohne Lovable und Supabase.
Die ursprüngliche Produktbeschreibung steht in [docs/MVP-SPEC.md](docs/MVP-SPEC.md).

## Aufbau

- `src/`: Frontend (React, Vite, Tailwind/shadcn, i18n in 6 Sprachen)
- `server/`: Backend (Node, Hono, PostgreSQL, Better Auth)
  - `src/auth.ts`: Login mit E-Mail/Passwort, E-Mail-Bestätigung, Passwort-Reset, TOTP-2FA
  - `src/data.ts`: generischer Datenzugang für das Frontend (`db.from(...)` in `src/lib/api.ts`).
    Jede Tabelle steht mit erlaubten Aktionen in einer Freigabeliste, die Nutzer-ID setzt immer der Server.
  - `src/routes/import.ts`: Trade-Import (`POST /api/import-trades`): Add-on mit Header `X-API-Key`, CSV und Vorlage für eingeloggte Nutzer
  - `src/matching.ts`: Ausführungen → Trades (FIFO, flat bis flat), `src/ibkr.ts`: Interactive-Brokers-Abruf
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
