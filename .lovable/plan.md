

# Konsolidierung: Entfernung redundanter Daily Goal Komponenten

## Übersicht

Die legacy "Daily Goal Progress" Komponente und die zugehörigen KPI-Karten werden entfernt. Der erweiterte **TradingGoalsTracker** übernimmt alle Funktionen mit seinen 15 konfigurierbaren Zielen.

---

## Änderungen

### 1. Datei löschen
| Datei | Aktion |
|-------|--------|
| `src/components/DailyGoalProgress.tsx` | Löschen |

### 2. Reports.tsx bereinigen

**Entfernte Elemente:**
- Import von `DailyGoalProgress`
- State-Variablen `dailyGoalAmount` und `dailyGoalMaxTrades`
- Funktion `loadSettings()` (nicht mehr benötigt)
- useMemo `dailyGoalTracking` (wird durch TradingGoalsTracker ersetzt)
- Die 3 KPI-Karten im Goals-Tab:
  - Goal Achievement Rate
  - Current Goal
  - Best Day
- Die "Daily Goal History" Card mit der DailyGoalProgress-Liste

**Ergebnis im "Daily Goals" Tab:**
```text
+----------------------------------------------------------+
| 🎯 Trading Goals (TradingGoalsTracker)                   |
|----------------------------------------------------------|
| [Ø Score] [Days Achieved] [Trading Days] [Active Goals]  |
|                                                          |
| Date  | PnL | Trades | WinRate | ... | Total Goal        |
|-------|-----|--------|---------|-----|-------------------|
| 28.01 | ✓   | ✓      | ✗       | ... | 75%               |
| 27.01 | ✓   | ✓      | ✓       | ... | 100%              |
| ...   |     |        |         |     |                   |
+----------------------------------------------------------+
```

Der TradingGoalsTracker bietet bereits:
- Durchschnittlicher Score (ersetzt Achievement Rate)
- Anzahl Tage mit 100% Zielerreichung (ersetzt Days Achieved)
- Aktive Ziele (verlinkt zu Settings)
- Zeitfilter (7d, 14d, 30d, 3m, all)
- Matrix mit allen 15 Zielen pro Tag

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/DailyGoalProgress.tsx` | Löschen |
| `src/pages/Reports.tsx` | Import, State, useMemo und UI-Elemente entfernen |

---

## Zusammenfassung

| Aspekt | Vorher | Nachher |
|--------|--------|---------|
| Daily Goals Tab Komponenten | 5 Cards + Tracker | 1 Tracker |
| Redundante Metriken | 2 (PnL + MaxTrades) | 0 |
| Verfügbare Ziele | 2 legacy + 15 neue | 15 konfigurierbar |
| Code-Zeilen entfernt | ~80 | - |
| Dateien gelöscht | 1 | - |

