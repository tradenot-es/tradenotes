

# Erweiterung Trading Goals System

## Übersicht

Basierend auf TradesViz werden die Trading-Ziele um zusätzliche sinnvolle Metriken erweitert und eine dedizierte Settings-Karte für die Ziel-Konfiguration hinzugefügt.

---

## Neue Ziele (inspiriert von TradesViz)

### Aktuelle 8 Ziele
| Ziel | Typ | Status |
|------|-----|--------|
| Daily PnL | >= | Vorhanden |
| Max Trades | <= | Vorhanden |
| Min Win Rate | >= | Vorhanden |
| Max Drawdown | <= | Vorhanden |
| Max Commissions | <= | Vorhanden |
| Min Avg R | >= | Vorhanden |
| Max Losing Streak | <= | Vorhanden |
| Min Profit Factor | >= | Vorhanden |

### Neue 7 Ziele (insgesamt 15)
| Ziel | Typ | Beschreibung |
|------|-----|--------------|
| Min Wins | >= | Mindestanzahl gewinnender Trades |
| Max Losses | <= | Maximale Anzahl Verlust-Trades |
| Min Avg Win | >= | Mindest-Durchschnittsgewinn pro Winner |
| Max Avg Loss | <= | Maximaler Durchschnittsverlust pro Loser |
| Max Risk per Trade | <= | Maximales Initial Risk pro Trade |
| Min Best Trade | >= | Mindest-P&L des besten Trades |
| Max Worst Trade | <= | Maximaler Verlust eines einzelnen Trades |

---

## Technische Umsetzung

### 1. Types erweitern (`src/types/tradingGoals.ts`)

```typescript
// Neue Keys zum TradingGoalsConfig hinzufügen:
min_wins: TradingGoal;
max_losses: TradingGoal;
min_avg_win: TradingGoal;
max_avg_loss: TradingGoal;
max_risk_per_trade: TradingGoal;
min_best_trade: TradingGoal;
max_worst_trade: TradingGoal;
```

### 2. Hook erweitern (`src/hooks/useTradingGoals.tsx`)

Neue Berechnungen für jeden Trade-Tag:
- **min_wins**: `dayTrades.filter(t => t.pnl_net > 0).length`
- **max_losses**: `dayTrades.filter(t => t.pnl_net < 0).length`
- **min_avg_win**: `totalWins / wins.length`
- **max_avg_loss**: `|totalLosses| / losses.length`
- **max_risk_per_trade**: `Math.max(...dayTrades.map(t => t.initial_risk || 0))`
- **min_best_trade**: `Math.max(...dayTrades.map(t => t.pnl_net))`
- **max_worst_trade**: `|Math.min(...dayTrades.map(t => t.pnl_net))|`

### 3. Settings UI (`src/pages/Settings.tsx`)

Neue dedizierte Karte "Trading Goals" mit:

```text
+--------------------------------------------------------------+
| 🎯 Trading Goals                                              |
| Definiere deine täglichen Ziele für den Goals Tracker         |
+--------------------------------------------------------------+
|                                                               |
| [Accordion: Gewinn-Ziele]                                     |
|   ☑ Täglicher Gewinn       >= $[___500___]                   |
|   ☐ Min Best Trade         >= $[___100___]                   |
|   ☐ Min Avg Win            >= $[____50___]                   |
|   ☐ Min Wins               >= [_____3___]                    |
|                                                               |
| [Accordion: Risiko-Limits]                                    |
|   ☑ Max Trades             <= [____10___]                    |
|   ☐ Max Losses             <= [_____3___]                    |
|   ☐ Max Drawdown           <= $[___200___]                   |
|   ☐ Max Worst Trade        <= $[___100___]                   |
|   ☐ Max Avg Loss           <= $[____30___]                   |
|   ☐ Max Risk per Trade     <= $[____50___]                   |
|   ☐ Max Commissions        <= $[____50___]                   |
|   ☐ Max Verlustserie       <= [_____3___]                    |
|                                                               |
| [Accordion: Performance-Ziele]                                |
|   ☐ Min Win Rate           >= [____50___] %                  |
|   ☐ Min Avg R              >= [___1.0___]                    |
|   ☐ Min Profit Factor      >= [___1.5___]                    |
|                                                               |
+--------------------------------------------------------------+
```

Komponenten:
- Checkbox zum Aktivieren/Deaktivieren jedes Ziels
- Input-Feld für den Zielwert
- Gruppierung in 3 Accordions: Gewinn-Ziele, Risiko-Limits, Performance-Ziele
- Automatisches Speichern bei Änderung

### 4. Übersetzungen erweitern

Neue Keys für alle 6 Sprachen (DE, EN, FR, ES, NL, IT):

```json
"tradingGoals": {
  // Existing...
  "minWins": "Min Gewinntrades",
  "maxLosses": "Max Verlusttrades", 
  "minAvgWin": "Min Ø Gewinn",
  "maxAvgLoss": "Max Ø Verlust",
  "maxRiskPerTrade": "Max Risiko/Trade",
  "minBestTrade": "Min bester Trade",
  "maxWorstTrade": "Max schlechtester Trade",
  "profitGoals": "Gewinn-Ziele",
  "riskLimits": "Risiko-Limits",
  "performanceGoals": "Performance-Ziele",
  "goalEnabled": "Aktiviert",
  "goalTarget": "Zielwert"
}
```

### 5. Tracker-Tabelle erweitern (`TradingGoalsTracker.tsx`)

Neue Goal-Labels hinzufügen:
```typescript
const goalLabels: Record<GoalKey, string> = {
  // Existing...
  min_wins: "Wins",
  max_losses: "Losses",
  min_avg_win: "Ø Win",
  max_avg_loss: "Ø Loss",
  max_risk_per_trade: "Risk",
  min_best_trade: "Best",
  max_worst_trade: "Worst",
};
```

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/types/tradingGoals.ts` | +7 neue Goal-Keys und Defaults |
| `src/hooks/useTradingGoals.tsx` | +7 neue Berechnungen |
| `src/pages/Settings.tsx` | +Neue Trading Goals Karte mit Accordions |
| `src/components/TradingGoalsTracker.tsx` | +7 neue Labels |
| `src/i18n/locales/de.json` | +15 neue Übersetzungskeys |
| `src/i18n/locales/en.json` | +15 neue Übersetzungskeys |
| `src/i18n/locales/fr.json` | +15 neue Übersetzungskeys |
| `src/i18n/locales/es.json` | +15 neue Übersetzungskeys |
| `src/i18n/locales/nl.json` | +15 neue Übersetzungskeys |
| `src/i18n/locales/it.json` | +15 neue Übersetzungskeys |

---

## Datenbank-Änderungen

Keine Schema-Änderungen nötig - das `trading_goals` JSONB-Feld in `user_settings` ist bereits flexibel genug für neue Keys.

---

## Zusammenfassung

| Aspekt | Wert |
|--------|------|
| Neue Ziele | 7 (von 8 auf 15 total) |
| Neue Settings-UI | Trading Goals Karte mit 3 Accordions |
| Dateien betroffen | 10 |
| Datenbankänderungen | Keine |

