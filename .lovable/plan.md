
# Trading Goals Tracker: Erweitertes Zielerfüllungs-Dashboard

## Übersicht

Erstellung eines umfassenden "Trading Goals Tracker" nach dem Vorbild von TradesViz, der multiple benutzerdefinierte Ziele pro Tag in einer Matrix-Ansicht mit Radial-Progress-Charts visualisiert.

---

## Aktuelle Situation vs. Verbesserung

| Aktuell | Neu |
|---------|-----|
| 2 feste Ziele (PnL, Max Trades) | 6+ konfigurierbare Ziele |
| Einzelner Tag-Fokus | Matrix-Ansicht für mehrere Tage |
| Nur binär (erreicht/nicht) | Prozentuale Erfüllung pro Ziel |
| Keine Composite-Score | Gesamt-Zielerfüllung pro Tag |
| Nur in Reports-Tab | Eigene Seite oder Dashboard-Widget |

---

## Neue Features

### 1. Konfigurierbare Ziel-Typen

Benutzer können in Settings folgende Ziele aktivieren/deaktivieren:

| Ziel | Beschreibung | Operator | Beispiel |
|------|--------------|----------|----------|
| Daily PnL Target | Tägliches Gewinnziel | ≥ | $500 |
| Max Trades | Maximale Trades pro Tag | ≤ | 10 |
| Min Win Rate | Mindest-Gewinnrate | ≥ | 50% |
| Max Drawdown | Maximaler Tages-Drawdown | ≤ | $200 |
| Max Commissions | Maximale Gebühren | ≤ | $50 |
| Avg R-Multiple | Durchschnittlicher R-Wert | ≥ | 1.0 |
| Max Losing Streak | Maximale Verlustserie | ≤ | 3 |
| Min Profit Factor | Mindest-Profit-Faktor | ≥ | 1.5 |

### 2. Goals Matrix Komponente

Neue `TradingGoalsTracker.tsx` Komponente mit:

```text
+------------------------------------------------------------------+
| Trading Goals Tracker                    [Daily|Weekly|Monthly]   |
|                        [Date Range: Jan 1 - Jan 31]               |
+------------------------------------------------------------------+
|         | PnL ≥500 | Trades ≤10 | WinRate ≥50% | R ≥1.0 | Total  |
|---------|----------|------------|--------------|--------|--------|
| Jan 15  |   (100%) |    (100%)  |     (78%)    |  (50%) |  82%   |
| Jan 14  |    (0%)  |    (100%)  |    (100%)    | (100%) |  75%   |
| Jan 13  |   (60%)  |     (80%)  |     (45%)    |  (80%) |  66%   |
| ...     |          |            |              |        |        |
+------------------------------------------------------------------+
```

Jede Zelle enthält:
- `RadialProgress` Mini-Chart (40x40px)
- Prozent-Wert
- Farbcodierung: Grün ≥100%, Gelb ≥50%, Rot <50%

### 3. Composite Goal Score

Aggregierte Zielerfüllung pro Tag:
- Gewichteter Durchschnitt aller Ziele
- Visual: Große Radial-Progress + Prozent
- Farbcodierte Zusammenfassung

### 4. Dashboard-Widget (Kompakt)

Kleine Version für Dashboard:
- Letzte 7 Tage als Mini-Radials
- Wöchentlicher Durchschnitt
- CTA zu voller Ansicht in Reports

---

## Technische Implementierung

### Phase 1: Datenbank-Erweiterung

**Migration: `user_settings` erweitern**

```sql
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS 
  trading_goals JSONB DEFAULT '{
    "daily_pnl": {"enabled": true, "target": 500, "operator": ">="},
    "max_trades": {"enabled": true, "target": 10, "operator": "<="},
    "min_win_rate": {"enabled": false, "target": 50, "operator": ">="},
    "max_drawdown": {"enabled": false, "target": 200, "operator": "<="},
    "max_commissions": {"enabled": false, "target": 50, "operator": "<="},
    "min_avg_r": {"enabled": false, "target": 1.0, "operator": ">="},
    "max_losing_streak": {"enabled": false, "target": 3, "operator": "<="},
    "min_profit_factor": {"enabled": false, "target": 1.5, "operator": ">="}
  }'::jsonb;
```

### Phase 2: Neue Komponenten

**Dateien:**

1. `src/components/TradingGoalsTracker.tsx`
   - Matrix-Tabelle mit Radial-Progress pro Zelle
   - Zeit-Filter (Daily/Weekly/Monthly)
   - Datums-Range-Picker
   - Account-Type-Filter

2. `src/components/GoalRadialCell.tsx`
   - Mini-Radial-Progress (40x40)
   - Tooltip mit Details
   - Klickbar → navigiert zu Trades

3. `src/components/TradingGoalsWidget.tsx`
   - Kompakte Dashboard-Version
   - 7-Tage-Übersicht
   - Link zu voller Ansicht

4. `src/hooks/useTradingGoals.tsx`
   - Lädt Goals-Konfiguration
   - Berechnet Erfüllung pro Tag
   - Caching für Performance

### Phase 3: Settings-Erweiterung

**In `src/pages/Settings.tsx`:**

Neue Card "Trading Goals Configuration":
- Toggle pro Ziel-Typ
- Eingabefeld für Target-Wert
- Gewichtung (für Composite Score)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Trading Goals</CardTitle>
    <CardDescription>Configure your daily trading goals</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Goal rows with toggle, input, weight */}
    <GoalConfigRow 
      label="Daily PnL Target"
      enabled={goals.daily_pnl.enabled}
      target={goals.daily_pnl.target}
      onToggle={...}
      onTargetChange={...}
    />
    {/* ... weitere Ziele */}
  </CardContent>
</Card>
```

### Phase 4: Reports-Integration

**In `src/pages/Reports.tsx`:**

Erweiterung des "goals" Tabs:
- Bestehende `DailyGoalProgress` Komponente erhalten
- Neue `TradingGoalsTracker` Matrix darunter
- Export-Button für CSV

### Phase 5: Dashboard-Widget

**In `src/pages/Index.tsx`:**

Neues Widget nach `AchievementsWidget`:

```tsx
<TradingGoalsWidget 
  trades={trades}
  goals={userGoals}
  onClick={() => navigate('/dashboard/reports?tab=goals')}
/>
```

---

## UI/UX Design

### Farbschema für Ziel-Erfüllung

| Erfüllung | Farbe | CSS Variable |
|-----------|-------|--------------|
| ≥100% | Grün | `bg-success` |
| ≥75% | Hellgrün | `bg-success/70` |
| ≥50% | Gelb | `bg-warning` |
| ≥25% | Orange | `bg-warning/70` |
| <25% | Rot | `bg-destructive` |

### Radial-Größen

| Kontext | Größe | strokeWidth |
|---------|-------|-------------|
| Matrix-Zelle | 40px | 4px |
| Dashboard-Widget | 48px | 5px |
| Daily Goal Detail | 120px | 10px |

### Responsive Verhalten

| Viewport | Layout |
|----------|--------|
| Desktop | Volle Matrix-Tabelle |
| Tablet | Horizontales Scrollen |
| Mobile | Card-View pro Tag (statt Tabelle) |

---

## Dateistruktur

```text
src/
├── components/
│   ├── TradingGoalsTracker.tsx (NEU)
│   ├── GoalRadialCell.tsx (NEU)
│   ├── TradingGoalsWidget.tsx (NEU)
│   └── DailyGoalProgress.tsx (erweitert)
├── hooks/
│   └── useTradingGoals.tsx (NEU)
├── pages/
│   ├── Settings.tsx (erweitert)
│   ├── Reports.tsx (erweitert)
│   └── Index.tsx (erweitert)
└── i18n/locales/
    └── {de,en,...}.json (erweitert)
```

---

## i18n-Erweiterungen

```json
{
  "tradingGoals": {
    "title": "Trading Goals Tracker",
    "dailyPnl": "Daily PnL",
    "maxTrades": "Max Trades",
    "minWinRate": "Min Win Rate",
    "maxDrawdown": "Max Drawdown",
    "maxCommissions": "Max Commissions",
    "minAvgR": "Min Avg R",
    "maxLosingStreak": "Max Losing Streak",
    "minProfitFactor": "Min Profit Factor",
    "totalGoal": "Total Goal",
    "achieved": "Goal Achieved",
    "notAchieved": "Goal Not Met",
    "configureGoals": "Configure Goals",
    "noGoalsConfigured": "No goals configured",
    "viewDetails": "View Details"
  }
}
```

---

## Zusammenfassung

| Aspekt | Details |
|--------|---------|
| Neue Komponenten | 3 (TradingGoalsTracker, GoalRadialCell, TradingGoalsWidget) |
| Neue Hooks | 1 (useTradingGoals) |
| DB-Migration | 1 (trading_goals JSONB) |
| Geänderte Dateien | 4 (Settings, Reports, Index, Locales) |
| Ziel-Typen | 8 konfigurierbare Ziele |
| Visualisierung | Matrix mit Mini-Radials + Composite Score |

Diese Erweiterung macht TradeNotes zu einem professionellen Trading-Journal mit umfassender Zielerfüllungs-Analyse auf dem Niveau von TradesViz.
