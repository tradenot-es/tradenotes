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
  - `src/marketEvents.ts`: holt stündlich Fed-Reden/FOMC-Protokolle (federalreserve.gov) und angekündigte Auftritte des US-Präsidenten (Roll Call Factba.se) für den Kalender; Tests in `test/marketEvents.ts`
  - `migrations/`: SQL-Migrationen, laufen beim Start automatisch
- `src/config/operator.ts`: Betreiber und E-Mail-Adresse für Impressum, Datenschutz, Kontakt; die Texte selbst stehen unter `legal.*` in den Sprachdateien
- `src/export.ts` (Server): Datenexport als ZIP (`GET /api/export`)

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
davor sitzt der Caddy des Servers. Alles für den Server liegt in `deploy/`:

- `deploy/Caddyfile.tradenotes`: Site-Block (HTTPS, www → ohne www, Sicherheits-Header, **kein Zugriffslog**,
  so steht es in der Datenschutzerklärung)
- `deploy/deploy.sh`: `git pull`, Image bauen, neu starten, auf den Health-Check warten
- `deploy/backup.sh`: täglich Datenbank-Dump und Screenshots nach `/opt/tradenotes-backups`, 14 Tage aufbewahrt
  (die Datenschutzerklärung nennt diese 14 Tage)

Erstes Einrichten:

```sh
git clone -b eigenes-backend git@github.com:tradenot-es/tradenotes.git /opt/tradenotes
cd /opt/tradenotes
cp .env.example .env   # Werte eintragen, Geheimnisse mit openssl rand -hex 32 / -hex 24
docker compose up -d --build
# Caddy: Inhalt von deploy/Caddyfile.tradenotes in den Caddyfile übernehmen, Caddy neu laden
# Backup: Cron-Zeile aus deploy/backup.sh eintragen
```

Danach genügt für Updates `deploy/deploy.sh`. Migrationen laufen beim Start der App.

Wiederherstellen aus dem Backup:

```sh
docker compose exec -T db pg_restore -U tradenotes -d tradenotes --clean --if-exists < /opt/tradenotes-backups/db_<stempel>.dump
docker run --rm -v tradenotes_uploads:/data -v /opt/tradenotes-backups:/backup alpine \
  sh -c 'rm -rf /data/* && tar xzf /backup/uploads_<stempel>.tar.gz -C /data'
```
