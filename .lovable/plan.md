
# Trading Goals Widget: Layout-Optimierung

## Ziel
Das Widget größer und prominenter gestalten, ohne das Dashboard zu überladen.

---

## Änderungen in `TradingGoalsWidget.tsx`

### 1. Haupt-Radial-Chart vergrößern

| Element | Aktuell | Neu |
|---------|---------|-----|
| RadialProgress size | 72px | 100px |
| strokeWidth | 6 | 8 |
| Prozent-Text | text-2xl | text-3xl |

### 2. Tages-Indikatoren vergrößern

| Element | Aktuell | Neu |
|---------|---------|-----|
| Kreis-Größe | w-10 h-10 (40px) | w-14 h-14 (56px) |
| Score-Text | text-xs | text-sm font-bold |
| Wochentag-Label | text-[10px] | text-xs |
| Gap zwischen Tagen | gap-3 | gap-4 |

### 3. Card-Padding erhöhen

| Element | Aktuell | Neu |
|---------|---------|-----|
| CardContent | Standard | py-6 |
| Innerer Container gap | gap-8 | gap-12 |

### 4. Goals-Count prominenter

| Element | Aktuell | Neu |
|---------|---------|-----|
| Zahl | text-sm | text-2xl font-bold |
| Label | text-xs | text-sm |

---

## Visuelles Ergebnis

```text
+------------------------------------------------------------------------+
| 🎯 Trading Goals Tracker                                          →   |
+------------------------------------------------------------------------+
|                                                                        |
|   ┌──────────┐      ┌──────────────────────────────────────┐   ┌────┐ |
|   │          │      │                                      │   │    │ |
|   │   75%    │  ─   │  [72] [85] [--] [--] [92] [45] [88]  │   │ 2  │ |
|   │  ○○○○○   │      │  Mon  Tue  Wed  Thu  Fri  Sat  Sun   │   │Ziele│ |
|   │          │      │                                      │   │    │ |
|   └──────────┘      └──────────────────────────────────────┘   └────┘ |
|    Wochen-Ø                    Letzte 7 Tage                          |
|    5/7 erreicht                                                        |
|                                                                        |
+------------------------------------------------------------------------+
```

---

## Wochenende-Logik

**Keine Änderung erforderlich:**
- Aktuelle Implementierung zeigt alle 7 Kalendertage
- Tage ohne Trades werden als "-" (grau) angezeigt
- Dies funktioniert für alle Trader-Typen (Aktien, Forex, Crypto)

---

## Zusammenfassung

| Aspekt | Änderung |
|--------|----------|
| Dateien | 1 (TradingGoalsWidget.tsx) |
| Radial-Chart | +38% größer (72px → 100px) |
| Tages-Kreise | +40% größer (40px → 56px) |
| Lesbarkeit | Deutlich verbessert |
| Wochenende | Bleibt wie ist (sinnvoll für alle Trader-Typen) |
