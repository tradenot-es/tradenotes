<p align="center">
  <a href="https://tradenot.es"><img src="public/logo.png" alt="TradeNot.es" width="140" /></a>
</p>

<h1 align="center">TradeNot.es</h1>

<p align="center">
  <strong>Kostenloses Trading-Journal für Futures-, Aktien- und Prop-Firm-Trader.</strong><br />
  Ohne Abo, ohne Werbung, ohne Tracking. Als Dienst auf <a href="https://tradenot.es">tradenot.es</a> und selbst hostbar.
</p>

<p align="center">
  <a href="https://tradenot.es">Website</a> ·
  <a href="https://tradenot.es/features">Funktionen</a> ·
  <a href="https://tradenot.es/hilfe">Hilfe</a> ·
  <a href="#selbst-hosten">Selbst hosten</a> ·
  <a href="#lizenz">Lizenz</a>
</p>

<p align="center">
  <img alt="Lizenz AGPL-3.0" src="https://img.shields.io/badge/Lizenz-AGPL--3.0-10b981" />
  <img alt="Sprachen" src="https://img.shields.io/badge/Sprachen-DE%20·%20EN%20·%20ES%20·%20FR%20·%20IT%20·%20NL-10b981" />
  <img alt="Selbst hostbar" src="https://img.shields.io/badge/selbst%20hostbar-Docker-10b981" />
  <a href="https://ko-fi.com/tradenotes"><img alt="Unterstützen auf Ko-fi" src="https://img.shields.io/badge/Ko--fi-Kaffee%20spendieren-10b981?logo=kofi&logoColor=white" /></a>
</p>

<p align="center">
  <img src="src/assets/screens/de/hero-dashboard.webp" alt="Dashboard von TradeNot.es" width="860" />
</p>

> *English: TradeNot.es is a free, open-source trading journal (AGPL-3.0) with automatic import from
> NinjaTrader and Interactive Brokers, discipline limits, behaviour and rule-adherence analytics. Use it at
> [tradenot.es](https://tradenot.es) or host it yourself with Docker. The app is available in six languages.*

## Was TradeNot.es kann

- **Trades kommen von selbst:** NinjaTrader-Add-on (alle Konten, Teilausführungen, Gebühren, MFE/MAE),
  Interactive Brokers per Flex-Abfrage (täglicher Abruf), TradingView-Export und eigene CSV-Vorlage
- **Disziplin:** Tageslimits für Trades, Verlust und Verlustserien, Pflichtpause nach Verlustserie,
  automatische Erkennung von Revenge-Trades und Overtrading
- **Auswertungen:** Fehler und Gefühlslage pro Trade, Regeltreue (Prozess gegen Ergebnis), „Was bei dir funktioniert“,
  Equity-Kurve, R-Multiple, Risiko-Simulator, Reports nach Setup, Symbol, Zeit, Konto (Sim/Evaluation/Funded/Live)
- **Wirtschaftskalender:** Fed, EZB, BoE, BoJ, CPI, NFP, dazu Fed-Reden und angekündigte Auftritte des US-Präsidenten,
  jede Uhrzeit in der Zeitzone des Nutzers
- **Journal, Tagesvorbereitung, Mentor-Modus** (einzelne Trades per Link teilen)
- **Deine Daten gehören dir:** Export als ZIP (inkl. wieder importierbarer CSV und Screenshots), Löschen jederzeit,
  Server in der EU, keine Analyse- oder Werbedienste
- **6 Sprachen:** Deutsch, Englisch, Spanisch, Französisch, Italienisch, Niederländisch

## Selbst hosten

Ein Container, ein Ordner, kein Mailserver nötig: TradeNot.es bringt seine eigene Datenbank mit.

```sh
docker run -d --name tradenotes --restart unless-stopped -p 3000:3000 \
  -v /pfad/zu/tradenotes:/data -e BASE_URL=http://192.168.1.10:3000 \
  ghcr.io/tradenot-es/tradenotes:latest
```

Dann `BASE_URL` im Browser öffnen: Das erste Konto wird Administrator, danach ist die Registrierung zu
(`ALLOW_SIGNUP=true` öffnet sie). Eine selbst gehostete Instanz zeigt keine Startseite, keine Rechtstexte und
keinen Newsletter von tradenot.es und ist für Suchmaschinen gesperrt. Docker Compose: [`compose.yaml`](compose.yaml),
Unraid: [`deploy/unraid/tradenotes.xml`](deploy/unraid/tradenotes.xml). Alle Einstellungen, Reverse-Proxy,
Backups und Updates: **[docs/self-hosting.md](docs/self-hosting.md)** (Englisch).

## Aufbau

- `src/`: Frontend (React, Vite, Tailwind/shadcn, i18n in 6 Sprachen)
- `server/`: Backend (Node, Hono, PostgreSQL, Better Auth)
  - `src/auth.ts`: Login mit E-Mail/Passwort, E-Mail-Bestätigung, Passwort-Reset, TOTP-2FA
  - `src/data.ts`: generischer Datenzugang für das Frontend (`db.from(...)` in `src/lib/api.ts`).
    Jede Tabelle steht mit erlaubten Aktionen in einer Freigabeliste, die Nutzer-ID setzt immer der Server.
  - `src/routes/import.ts`: Trade-Import (`POST /api/import-trades`): Add-on mit Header `X-API-Key`, CSV und Vorlage für eingeloggte Nutzer
  - `src/matching.ts`: Ausführungen → Trades (FIFO, flat bis flat), `src/ibkr.ts`: Interactive-Brokers-Abruf
  - Kalenderzeiten: jeder Termin steht in der Zeitzone seiner Institution (`eventTimeZone` in `src/lib/economicCalendar.ts`) und wird mit `src/lib/timezone.ts` in die Zeitzone des Nutzers umgerechnet (Einstellung oder Gerät); Prüfungen rund um die Zeitumstellung: `npx tsx src/lib/timezone.check.ts`
  - `src/feedback.ts`: „Verbesserungsvorschlag?“ in der Seitenleiste (Fehler/Idee/Sonstiges) → Mail an `CONTACT_TO` (Antwort an den Nutzer) und, wenn `GITHUB_FEEDBACK_TOKEN`/`GITHUB_FEEDBACK_REPO` gesetzt sind, ein öffentliches GitHub-Issue nur mit Titel und Text (Name, E-Mail und technische Angaben nur in der Mail); höchstens 5 pro Nutzer und Stunde. Tests: `test/feedback.ts`
  - `src/marketEvents.ts`: holt stündlich Fed-Reden/FOMC-Protokolle (federalreserve.gov) und angekündigte Auftritte des US-Präsidenten (Roll Call Factba.se) für den Kalender; Tests in `test/marketEvents.ts`
  - `migrations/`: SQL-Migrationen, laufen beim Start automatisch
- Passwörter mindestens 12 Zeichen (`src/lib/password.ts` und `minPasswordLength` im Server); nach 10 falschen Passwörtern innerhalb einer Stunde ist ein Konto 15 Minuten für Passwort-Anmeldungen gesperrt, mit Warn-Mail (`server/src/loginGuard.ts`, Tests: `test/loginGuard.ts`)
- Zwei-Faktor-Anmeldung freiwillig, aber empfohlen: Dialog nach der ersten Anmeldung, danach Hinweis im Dashboard bis 2FA aktiv oder weggeklickt (`src/components/TwoFactorReminder.tsx`, `user_settings.two_factor_reminder`)
- Schutz vor Bots: Limits pro IP in Produktion (Registrierung, Passwort-Reset, Bestätigungsmail je 5/Stunde, Anmeldung 3/10 s über Better Auth; Kontaktformular 5/Stunde in `server/src/limits.ts`), verstecktes Honeypot-Feld in Registrierung und Kontaktformular, Tests: `test/limits.ts`
- Captcha: eigenes Proof-of-Work im ALTCHA-Format (`server/src/altcha.ts`, `src/components/AltchaWidget.tsx`), ohne Fremddienst und ohne Cookies; rechnet beim Anzeigen des Formulars von selbst los, SHA-256 in reinem JS (`src/lib/sha256.ts`, Prüfung: `npx tsx src/lib/sha256.check.ts`), daher auch ohne HTTPS (z. B. Dev-Server im LAN)
- Admin-Dashboard `/dashboard/admin` (`server/src/admin.ts`): nur Summen (Nutzer, Wachstum, Aktivität, Nutzung, GitHub, Technik); Zugang über `ADMIN_EMAILS`, in Produktion nur mit 2FA. „Mail an alle“ (`server/src/campaigns.ts`): Service-Mitteilung an alle bestätigten Nutzer oder Newsletter nur an Abonnenten (Opt-in mit Zeitpunkt, Abmelde-Link + List-Unsubscribe), einzeln versendet über eine Warteschlange innerhalb `MAIL_DAILY_LIMIT`, ohne Öffnungs-Tracking. Tests: `test/campaigns.ts`
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

Dieser Abschnitt beschreibt die offizielle Instanz tradenot.es. `compose.hosted.yaml` startet App und
Datenbank als eigenen Stack (`SELF_HOSTED=false`); die `.env` auf dem Server setzt
`COMPOSE_FILE=compose.hosted.yaml`, damit ein einfaches `docker compose` diese Datei nimmt und nicht das
Selbsthost-Beispiel `compose.yaml`. Davor sitzt ein Caddy als Reverse Proxy
(in einem Container). Er erreicht die App über das externe Docker-Netz `edge`
als `tradenotes-app:3000`; die Datenbank hängt nur im eigenen Netz. Auf `127.0.0.1:3010` lauscht die App
zusätzlich für den Health-Check. Alles für den Server liegt in `deploy/`:

- `deploy/Caddyfile.tradenotes`: Site-Block (HTTPS, www → ohne www, Sicherheits-Header, **kein Zugriffslog**,
  so steht es in der Datenschutzerklärung)
- `deploy/deploy.sh`: `git pull`, Image bauen, neu starten, auf den Health-Check warten
- `deploy/backup.sh`: täglich Datenbank-Dump und Screenshots nach `/opt/tradenotes-backups`, 14 Tage aufbewahrt
  (die Datenschutzerklärung nennt diese 14 Tage)

Erstes Einrichten:

```sh
git clone -b eigenes-backend git@github.com:tradenot-es/tradenotes.git /opt/tradenotes
cd /opt/tradenotes
cp deploy/hosted.env.example .env   # Werte eintragen, Geheimnisse mit openssl rand -hex 32 / -hex 24
docker compose up -d --build   # das Netz edge muss es schon geben (docker network create edge)
# Caddy: Site-Block aus deploy/Caddyfile.tradenotes in die Caddy-Konfiguration übernehmen und Caddy neu laden
#        (Caddy ohne Docker-Netz edge: reverse_proxy 127.0.0.1:3010)
# Backup: Cron-Zeile aus deploy/backup.sh eintragen
```

Danach genügt für Updates `deploy/deploy.sh`. Migrationen laufen beim Start der App.

Wiederherstellen aus dem Backup:

```sh
docker compose exec -T db pg_restore -U tradenotes -d tradenotes --clean --if-exists < /opt/tradenotes-backups/db_<stempel>.dump
docker run --rm -v tradenotes_uploads:/data -v /opt/tradenotes-backups:/backup alpine \
  sh -c 'rm -rf /data/* && tar xzf /backup/uploads_<stempel>.tar.gz -C /data'
```

## Lizenz

tradenot.es steht unter der **GNU Affero General Public License v3.0 oder später** (`AGPL-3.0-or-later`),
siehe [LICENSE](LICENSE). Jeder darf den Code nutzen, ändern und selbst betreiben. Wer eine veränderte
Version als Dienst im Netz anbietet, muss deren Quellcode den Nutzern ebenfalls unter der AGPL zugänglich
machen. Eingebundene Fremdbausteine (z. B. shadcn/ui, Radix, Recharts) behalten ihre eigenen Lizenzen (MIT u. a.).
