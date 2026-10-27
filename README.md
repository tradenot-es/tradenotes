# tradenot.es

Einfaches Trading‑Journal (MVP) nach Vorbild Tradervue/TraderSync

Goal

Baue ein leichtgewichtiges, webbasiertes Trading‑Journal mit den Kernmustern etablierter Tools: schneller CSV‑Import, einfache Trade‑Erfassung, Tags/Setups, Basis‑Analytics (Win‑Rate, PnL, Equity‑Curve), Filter/Views, Notizen je Trade.​

Priorisiere „so wenig Klicks wie möglich“ und klare, nicht überladene Dashboards im Stil der Minimal‑UIs von Tradervue/Edgewonk/TradeZella.​

Non‑Goals

Kein Live‑Trading, keine Broker‑APIs im MVP, keine KI‑Features, keine komplexe Optionsflüsse/Simulatoren; Fokus auf sauberes Journaling und Basis‑Auswertung.​

Pages and Navigation

Dashboard: KPI‑Tiles (Trades, Win‑Rate, Netto‑PnL, Profit‑Factor), Equity‑Curve, Top‑/Flop‑Setups, Tages/Monat‑PnL; einfache, ruhige Kachel‑Optik.​

Trades: Tabelle mit Spalten Symbol, Datum, Direction, Qty, Entry, Exit, Fees, PnL, R, Tags, Setup; schneller Detail‑Drawer mit Notizen und Screenshot.​

Import: CSV‑Wizard mit Mapping, Validierung und Preview; starte mit Template‑Profilen „Generic CSV“, „Tradervue‑ähnlich“.​

Journal: Tagesnotizen, verlinkbar mit Trades/Tags, einfache Suche/Filter.​

Settings: Währung/Zeitzone, Standard‑Fees, Strategien/Setups, Tag‑Farben.​

Core Features (MVP)

CSV‑Import: Ein‑Seiten‑Wizard (Upload → Feld‑Mapping → Preview → Import). Speichere Mapping‑Profile. Fehlerrapport mit Zeilennummern.​

Manuelle Erfassung: „Neuer Trade“ mit minimalen Pflichtfeldern (Symbol, Side, Entry, Exit, Qty, Datum/Zeit); optionale Felder (Fees, Tags, Setup, Screenshot, Notiz).​

Tags/Setups: Autocomplete; Filterbar in Trades‑Tabelle und Dashboard‑Kacheln.​

Analytics:

KPIs: Win‑Rate, Profit‑Factor, Netto‑PnL, Avg Win/Loss, Max Drawdown (einfach), R‑verteilte Histogramm‑Ansicht optional.​

Charts: Equity‑Curve (Netto‑PnL kumuliert), PnL nach Tag/Monat, PnL nach Symbol/Setup.​

Tabellen/Filter: Schnelle Spalten‑Filter, Sortierung, gespeicherte Ansichten, CSV‑Export.​

Notizen & Screenshots: Pro Trade eine Kurznotiz und 1–3 Bilder; Anzeige im Detail‑Drawer.​

UX Prinzipien

Minimalistische Sidebar (Dashboard, Trades, Import, Journal, Settings) wie bei Tradervue/TradeZella; Dark Mode optional, klare Typografie.​

„Add Trade“ Floating‑Action‑Button, Tastatur‑Shortcut „N“; Undo‑Snackbar nach Speichern/Löschen.​

Data Model (vereinfacht)

Trade(id, symbol, side, qty, entryPrice, exitPrice, entryTime, exitTime, fees, pnlNet, r, tags[], setup, note, screenshotUrl).​

JournalEntry(id, date, content, linkedTradeIds[]).​

Settings(id, baseCurrency, timezone, defaultFees, setups[], tags[]).​

Calculations

PnL Netto = (exitPrice − entryPrice) × qty − fees; Short berücksichtigt Vorzeichen.​

R = Netto‑PnL / geplantes Risiko; wenn kein Stop angegeben, R leer lassen (MVP), nur Netto‑PnL und KPIs rechnen.​

Profit‑Factor = Sum(Gewinne) / |Sum(Verluste)|; Equity‑Curve = kumulierte Netto‑PnL über Zeit ​.

Acceptance Criteria

Importiert eine Beispiel‑CSV (Tradervue‑ähnliches Template) in <10 Sekunden; Mapping‑Profile speicherbar.​

5 Basis‑KPIs und 2 Charts (Equity‑Curve, PnL nach Monat) funktionsfähig; Trades‑Tabelle filterbar nach Tag/Setup/Symbol.​

Manuelle Erfassung in <15 Sekunden pro Trade; Notiz + 1 Screenshot speicherbar.​

Export: Gefilterte Trades als CSV.​

Tech Preferences

Frontend: React + Tailwind; Charts: Recharts; State: Zustand; Routing: React Router.​

Backend: Node/TypeScript, Express; DB: Postgres (Prisma ORM); Auth kann entfallen im MVP Single‑User, sonst simple Email/Passwort.​

Out of Scope (MVP)

Multi‑Account, Broker‑APIs, komplexe Optionsanalysen, AI‑Q&A, Simulatoren.​

Seed & Templates

Stelle 50 Muster‑Trades (Long/Short, verschiedene Symbole) bereit; lege eine Beispiel‑CSV im Tradervue‑Stil bei; README mit Importfeldern.​

Hinweis zur Einfachheit

Orientiere dich bei Layout, Terminologie und Navigationsstruktur an Tradervue/TraderSync/TradesViz „Basic“-Funktionssätzen, um die Lernkurve niedrig zu halten und schnelle Journaleinträge zu ermöglichen.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2885b347-229a-400d-ab3b-8c3e704cd80d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
