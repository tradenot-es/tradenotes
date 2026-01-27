
# TradesViz Feature-Upgrade Plan

## Übersicht

Basierend auf der Konkurrenzanalyse werden folgende 4 Features implementiert, um TradeNot.es gegenüber TradesViz.com zu differenzieren:

| Feature | Priorität | Aufwand | Differenzierung |
|---------|-----------|---------|-----------------|
| AI Daily Summary | Hoch | Mittel | Automatische Tages-Zusammenfassung mit Verbesserungsvorschlägen |
| What-If Risk Simulator | Mittel | Hoch | Monte-Carlo-Simulation basierend auf echten Trade-Daten |
| Goal Alerts & Notifications | Mittel | Mittel | Browser-Push + Toast bei Zielerreichung/Drawdown |
| AI Chat mit Inline-Charts | Hoch | Hoch | Visualisierte Antworten statt nur Text |

---

## Feature 1: AI Daily Summary

### Konzept
Am Ende jedes Trading-Tages (oder auf Abruf) wird eine KI-generierte Zusammenfassung erstellt, die Performance, Muster und emotionale Trigger analysiert.

### User Flow
1. Nutzer beendet Trading-Tag
2. Button "Tages-Zusammenfassung generieren" oder automatisch bei letztem Trade
3. AI analysiert alle Trades des Tages
4. Zusammenfassung wird als Card angezeigt mit:
   - Performance-Highlights
   - Erkannte Muster (beste/schlechteste Zeiten)
   - Emotionale Trigger-Analyse
   - 3 konkrete Verbesserungsvorschläge

### Technische Umsetzung

#### Neue Edge Function: `daily-summary`
```text
- Holt alle Trades des gewählten Tages
- Berechnet Tages-KPIs
- Analysiert Muster (Zeit, Symbol, Setup)
- Nutzt Lovable AI (gemini-3-flash-preview) für Summary
- Speichert Summary in neuer Tabelle
```

#### Neue Datenbank-Tabelle: `daily_summaries`
```text
Spalten:
- id (uuid, primary key)
- user_id (uuid, foreign key)
- date (date, unique per user)
- summary_text (text)
- highlights (jsonb) - strukturierte Daten
- suggestions (jsonb) - Verbesserungsvorschläge
- trades_count (integer)
- net_pnl (numeric)
- created_at (timestamp)
```

#### Neue Komponente: `DailySummaryCard.tsx`
- Zeigt Summary im Dashboard nach dem Kalender
- Button zum manuellen Generieren
- Markdown-Rendering für AI-Text
- Collapsible für lange Summaries

### Dateien

| Aktion | Datei |
|--------|-------|
| Neu | `supabase/functions/daily-summary/index.ts` |
| Neu | `src/components/DailySummaryCard.tsx` |
| Bearbeiten | `src/pages/Index.tsx` - Integration |
| Migration | `daily_summaries` Tabelle |
| Bearbeiten | `src/i18n/locales/*.json` - Übersetzungen |

---

## Feature 2: What-If Risk Simulator

### Konzept
Interaktiver Simulator, der verschiedene "Was wäre wenn"-Szenarien basierend auf historischen Trade-Daten visualisiert.

### Szenarien
1. **Exit-Timing**: "Was wäre mein P&L, wenn ich immer bei 1R/2R/3R ausgestiegen wäre?"
2. **Position Size**: "Wie würde meine Equity Curve bei 50%/100%/200% Position Size aussehen?"
3. **Trade Filter**: "Wie wäre meine Performance nur mit Setup X / Symbol Y?"
4. **Monte Carlo**: Zukünftige Equity-Verteilung basierend auf historischer Win-Rate

### User Flow
1. Nutzer öffnet Reports → "Risk Simulator" Tab
2. Wählt Szenario-Typ aus Dropdown
3. Stellt Parameter ein (z.B. Target-R-Multiple)
4. Chart zeigt Original vs. Simulierte Equity Curve

### Technische Umsetzung

#### Neue Komponente: `RiskSimulator.tsx`
```text
- Dropdown für Szenario-Typ
- Slider für Parameter
- Recharts LineChart für Vergleich
- Client-side Berechnung (kein Backend nötig)
```

#### Berechnungslogik (Client-side)
```text
- R-Exit Simulation: Trades mit initial_risk neu berechnen
- Position Size: Trades proportional skalieren
- Trade Filter: Subset der Trades verwenden
- Monte Carlo: Random Sampling mit 1000 Iterationen
```

### Dateien

| Aktion | Datei |
|--------|-------|
| Neu | `src/components/reports/RiskSimulator.tsx` |
| Bearbeiten | `src/pages/Reports.tsx` - Neuer Tab |
| Bearbeiten | `src/i18n/locales/*.json` - Übersetzungen |

---

## Feature 3: Goal Alerts & Notifications

### Konzept
Echtzeit-Benachrichtigungen bei Zielerreichung oder Drawdown-Limits während des Trading-Tages.

### Alert-Typen
1. **Goal Achieved**: Tagesziel erreicht → Grüner Toast + optionaler Sound
2. **Drawdown Warning**: 50% des Tagesziels verloren → Gelber Toast
3. **Drawdown Critical**: 100% des Tagesziels verloren → Roter Toast + Warnung
4. **Trade Limit**: Max-Trades erreicht → Info-Toast

### Technische Umsetzung

#### Browser Notifications
```text
- Permission Request beim ersten Trade
- Service Worker nicht nötig (nur Foreground)
- Toast-Fallback wenn Notifications abgelehnt
```

#### Neue Komponente: `GoalAlertsProvider.tsx`
```text
- Context Provider um App
- Überwacht Trades-State
- Berechnet aktuellen Tages-Fortschritt
- Triggert Toasts/Notifications bei Schwellenwerten
```

#### Settings-Erweiterung
```text
- Toggle für Notifications aktivieren
- Toggle für Sound aktivieren
- Drawdown-Warnschwelle (Standard: 50%)
```

### Dateien

| Aktion | Datei |
|--------|-------|
| Neu | `src/components/GoalAlertsProvider.tsx` |
| Bearbeiten | `src/App.tsx` - Provider einbinden |
| Bearbeiten | `src/pages/Settings.tsx` - Notification-Settings |
| Migration | `user_settings` - neue Spalten |
| Bearbeiten | `src/i18n/locales/*.json` - Übersetzungen |

---

## Feature 4: AI Assistant mit Inline-Charts

### Konzept
Der AI Trading Assistant kann Fragen mit eingebetteten Charts/Tabellen beantworten, nicht nur mit Text.

### Beispiel-Queries mit Chart-Response
- "Zeige meine Performance nach Wochentag" → Bar Chart
- "Wie war mein Monatsverlauf?" → Line Chart
- "Top 5 Symbole nach Profit" → Tabelle
- "Vergleiche Long vs Short" → Pie Chart

### Technische Umsetzung

#### Erweiterte Edge Function
```text
- AI entscheidet, ob Chart sinnvoll ist
- Strukturierte Daten im Response zusätzlich zu Text
- Chart-Typ und Daten als JSON
```

#### Response-Format
```text
{
  "answer": "Deine Performance ist montags am besten...",
  "visualization": {
    "type": "bar",
    "title": "Win-Rate nach Wochentag",
    "data": [
      { "day": "Montag", "winRate": 65 },
      { "day": "Dienstag", "winRate": 52 },
      ...
    ]
  }
}
```

#### Chat-UI Erweiterung
```text
- Erkennt visualization in Response
- Rendert entsprechenden Recharts-Chart
- Mini-Charts (200px Höhe) passend zum Chat
```

### Unterstützte Chart-Typen
| Typ | Verwendung |
|-----|------------|
| `bar` | Vergleiche (Wochentag, Symbol, Setup) |
| `line` | Zeitverläufe (täglich, wöchentlich) |
| `pie` | Anteile (Long/Short, Win/Loss) |
| `table` | Top-Listen, Rankings |

### Dateien

| Aktion | Datei |
|--------|-------|
| Bearbeiten | `supabase/functions/trading-assistant/index.ts` - Chart-Logik |
| Neu | `src/components/ChatVisualization.tsx` - Chart-Renderer |
| Bearbeiten | `src/components/AIAssistantFAB.tsx` - Chart-Integration |
| Bearbeiten | `src/i18n/locales/*.json` - Übersetzungen |

---

## Implementierungs-Reihenfolge

```text
Phase 1 (Schnelle Wins):
├── Feature 3: Goal Alerts (1-2 Stunden)
│   └── Sofortiger Nutzen, einfache Implementierung
└── Feature 1: AI Daily Summary (2-3 Stunden)
    └── Nutzt bestehende AI-Infrastruktur

Phase 2 (Differenzierung):
├── Feature 4: AI Chat Charts (3-4 Stunden)
│   └── Erweitert bestehende Funktion
└── Feature 2: Risk Simulator (4-5 Stunden)
    └── Komplexeste Logik, rein Frontend
```

---

## Zusammenfassung der Änderungen

### Neue Dateien
- `supabase/functions/daily-summary/index.ts`
- `src/components/DailySummaryCard.tsx`
- `src/components/reports/RiskSimulator.tsx`
- `src/components/GoalAlertsProvider.tsx`
- `src/components/ChatVisualization.tsx`

### Bearbeitete Dateien
- `src/pages/Index.tsx`
- `src/pages/Reports.tsx`
- `src/pages/Settings.tsx`
- `src/App.tsx`
- `src/components/AIAssistantFAB.tsx`
- `supabase/functions/trading-assistant/index.ts`
- `src/i18n/locales/de.json`, `en.json`, `fr.json`, `es.json`, `nl.json`, `it.json`

### Datenbank-Migrationen
- Neue Tabelle: `daily_summaries`
- Neue Spalten in `user_settings`: `notifications_enabled`, `notification_sound`, `drawdown_warning_threshold`
