# Empfohlene zusätzliche Metriken für TradeNotes Dashboard

Basierend auf den vorhandenen Trade-Daten könnten folgende zusätzliche Metriken einen großen Mehrwert bieten:

## 1. Streak-Analyse
**Datenquelle:** Sequenzielle Trades aus der Datenbank

### Metriken:
- **Längste Gewinnserie:** Maximale Anzahl aufeinanderfolgender gewinnender Trades
- **Längste Verlustserie:** Maximale Anzahl aufeinanderfolgender verlustbringender Trades
- **Aktuelle Serie:** Zeige die aktuelle Gewinn- oder Verlustserie

**Nutzen:** 
- Psychologisches Verständnis: Wie resilient ist der Trader nach Verlusten?
- Identifikation von "Revenge Trading" (Trading nach Verlustserie oft destruktiv)
- Positive Verstärkung bei Gewinnserien

**Implementierung:**
```typescript
const calculateStreaks = (trades: Trade[]) => {
  let currentStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentIsWin = null;

  trades.forEach(trade => {
    const isWin = trade.pnl_net > 0;
    
    if (currentIsWin === null || currentIsWin === isWin) {
      currentStreak++;
    } else {
      if (currentIsWin) {
        longestWinStreak = Math.max(longestWinStreak, currentStreak);
      } else {
        longestLossStreak = Math.max(longestLossStreak, currentStreak);
      }
      currentStreak = 1;
    }
    currentIsWin = isWin;
  });

  return { longestWinStreak, longestLossStreak, currentStreak };
};
```

## 2. Durchschnittliche Haltedauer
**Datenquelle:** `entry_time` und `exit_time` aus Trades

### Metriken:
- **Ø Haltedauer Gewinn-Trades:** In Stunden/Tagen
- **Ø Haltedauer Verlust-Trades:** In Stunden/Tagen
- **Haltedauer-Ratio:** Vergleich zwischen Gewinnen und Verlusten

**Nutzen:**
- Identifikation von "Cut winners short, let losses run" (typischer Fehler)
- Optimal: Gewinn-Trades länger halten als Verlust-Trades
- Setup-spezifische Haltedauer-Optimierung

**Implementierung:**
```typescript
const calculateHoldingPeriods = (trades: Trade[]) => {
  const winTrades = trades.filter(t => t.pnl_net > 0);
  const lossTrades = trades.filter(t => t.pnl_net < 0);

  const avgWinHold = winTrades.reduce((sum, t) => 
    sum + (new Date(t.exit_time).getTime() - new Date(t.entry_time).getTime()), 0
  ) / winTrades.length / (1000 * 60 * 60); // in hours

  const avgLossHold = lossTrades.reduce((sum, t) => 
    sum + (new Date(t.exit_time).getTime() - new Date(t.entry_time).getTime()), 0
  ) / lossTrades.length / (1000 * 60 * 60);

  return { avgWinHold, avgLossHold, ratio: avgWinHold / avgLossHold };
};
```

## 3. Volatilität der Returns (Sharpe Ratio Annäherung)
**Datenquelle:** Sequenzielle P&L-Daten

### Metriken:
- **Standardabweichung der Returns:** Misst die Konsistenz
- **Sharpe-ähnlicher Score:** Return / Volatilität
- **Monatliche Volatilität:** Wie stark schwanken monatliche Returns?

**Nutzen:**
- Unterscheidung zwischen "smooth grower" vs. "volatile gambler"
- Risikoadjustierte Performance-Bewertung
- Identifikation von inkonsistentem Position Sizing

## 4. Performance nach Tageszeit
**Datenquelle:** `entry_time` oder `exit_time`

### Metriken:
- **Performance nach Stunde:** Win Rate und Avg P&L pro Tages-Stunde (z.B. 9:00-10:00, 10:00-11:00)
- **Beste/Schlechteste Handelszeit**

**Nutzen:**
- Identifikation optimaler Trading-Zeiten (z.B. Market Open vs. Lunch vs. Close)
- Vermeidung von unprofitablen Zeiten (z.B. Low-Volume-Perioden)
- Setup-spezifische Timing-Optimierung

## 5. Recovery Factor
**Datenquelle:** Max Drawdown + Total Net P&L

### Metrik:
```
Recovery Factor = Net Profit / Max Drawdown
```

**Nutzen:**
- Misst wie effizient ein Trader sich von Verlusten erholt
- Werte > 3 sind hervorragend, > 2 gut, < 1 problematisch
- Bessere Risikomaßzahl als bloßer Profit

## 6. Wochentag-Performance-Matrix
**Datenquelle:** Wochentag aus `exit_time`

### Visualisierung:
Erweiterte Tabelle mit:
- Montag-Freitag
- Avg P&L
- Win Rate
- Anzahl Trades
- Heatmap-Darstellung

**Bereits teilweise vorhanden in Reports, könnte auf Dashboard prominent platziert werden**

## 7. Symbol-spezifische Performance
**Datenquelle:** `symbol` + P&L

### Metriken:
- **Top 5 profitabelste Symbole**
- **Top 5 unprofitabelste Symbole**
- **Most traded symbols**

**Nutzen:**
- Fokus auf profitable Symbole
- Vermeidung von "Problem-Symbolen"
- Identifikation von Edge in spezifischen Instrumenten

## 8. Setup-Effizienz-Score
**Datenquelle:** Setup + R-Multiple + Win Rate

### Metrik:
```
Setup Efficiency = (Expectancy in R) × (Sample Size Weight)
```

**Visualisierung:**
Bubble Chart: X = Win Rate, Y = Avg R-Multiple, Size = Trade Count

**Nutzen:**
- Sofortige Identifikation profitabler Setups mit ausreichender Datenlage
- Vermeidung von Setups mit negativem Expectancy

## Prioritäts-Ranking für Implementation:

1. **Streak-Analyse** (Einfach, hoher psychologischer Wert)
2. **Durchschnittliche Haltedauer** (Einfach, enthüllt kritische Fehler)
3. **Symbol-Performance** (Mittel, direkter Handlungswert)
4. **Performance nach Tageszeit** (Mittel, hoher Optimierungswert)
5. **Wochentag-Performance prominent** (Bereits vorhanden, nur besser präsentieren)
6. **Recovery Factor** (Einfach, professionelle Metrik)
7. **Volatilität/Sharpe** (Komplex, für fortgeschrittene Trader)
8. **Setup-Effizienz-Score** (Komplex, aber sehr wertvoll)

## Visualisierungs-Empfehlungen:

### Dashboard-Layout-Vorschlag (neue Sektion):
```
┌─────────────────────────────────────┐
│  Trading Behavior Analytics          │
├─────────────┬─────────────┬─────────┤
│ Win Streak  │ Loss Streak │ Current │
│    12       │     5       │  +3 🟢  │
├─────────────┴─────────────┴─────────┤
│ Hold Period Ratio: 2.3x (Optimal ✓) │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Best Trading Times                  │
├─────────────────────────────────────┤
│ 🟢 09:30-11:00  | Win Rate: 65%     │
│ 🟡 13:00-14:00  | Win Rate: 45%     │
│ 🔴 14:30-16:00  | Win Rate: 32%     │
└─────────────────────────────────────┘
```

Diese Metriken würden das Dashboard erheblich aussagekräftiger machen und konkrete Handlungsempfehlungen für Trader liefern.
