

# Feature-Visuals Generierung: Abstrakte Trading-Illustrationen

## Ziel

Erstellung von 12 kohärenten, abstrakten Visuals im dunklen Trading-Theme für die Features-Seite. Die Bilder ersetzen die aktuellen Kategorie-Illustrationen und erweitern die Abdeckung auf alle wichtigen Features.

---

## Design-Spezifikation

### Farbpalette
| Verwendung | Hex-Code | Beschreibung |
|------------|----------|--------------|
| Hintergrund | #020617 / #000 | Fast schwarz |
| Primär-Akzent | #10B981 | Neon-Grün |
| Sekundär 1 | #22C55E | Helleres Grün |
| Sekundär 2 | #38BDF8 | Cyan/Blau |
| Sekundär 3 | #FACC15 | Gold/Gelb |
| Verlust/Negativ | #EF4444 | Rot (sparsam) |

### Stilrichtlinien
- Minimalistisch, technisch, leicht futuristisch
- Klare Geometrie, dünne Linien (1-2px)
- Glow-Effekte auf Akzentelementen
- Leichtes Grain/Rauschen im Hintergrund
- Keine Fotos, keine Menschen, keine echten UI-Screenshots
- Nur kurze Labels ("PnL", "Winrate", "Setup A")

### Format
- Auflösung: 1920x1080 (16:9)
- Dateiformat: .webp (optimiert für Web)
- Speicherort: `src/assets/features/`

---

## Visual-Zuordnung zu Features

### Kategorie: Trading Tools (5 Features)

| # | Feature | Dateiname | Motiv-Beschreibung |
|---|---------|-----------|-------------------|
| 1 | Schnelle Trade-Eingabe | `easy-entry.webp` | Vereinfachtes Ticket-Panel: große Preis-Zahl mittig, Buy/Sell-Buttons als farbige Rechtecke (grün/rot), Slider für Positionsgröße. Abstrakte Formen, keine echten UI-Komponenten. |
| 2 | NinjaTrader Auto-Sync | `ninjatrader-sync.webp` | Zwei stilisierte Panels: links "NT" Chart-Panel mit abstraktem Logo-Icon, rechts "Journal" Dashboard-Panel, dazwischen leuchtende Sync-Pfeile mit Datenfluss-Linien. |
| 3 | Prop-Firm Erkennung | `prop-firm.webp` | Dashboard mit Account-Karten, jede mit Status-Badge und Performance-Balken. Verbindungslinien zwischen Accounts, zentrale Sync-Indikation. |
| 4 | Positionsrechner | `position-calculator.webp` | Abstraktes Rechner-Panel mit Eingabefeldern als Rechtecke, Risk%-Slider, Output-Box mit berechneter Lotgröße. Mathematische Symbole im Hintergrund. |
| 5 | CSV Import | `csv-import.webp` | Abstrakte Tabelle mit Spalten/Zeilen, Upload-Pfeil-Icon, "CSV"-Label. Datenfluss von Datei zu Dashboard-Widgets. |

### Kategorie: Analytics (5 Features)

| # | Feature | Dateiname | Motiv-Beschreibung |
|---|---------|-----------|-------------------|
| 1 | MFE/MAE Analyse | `mfe-mae.webp` | Dunkles Chart-Panel mit Kerzen, zwei halbtransparente leuchtende Zonen für MFE (grün) und MAE (rot). Markierungen für Entry, Stop, Take Profit. |
| 2 | Performance Analytics | `performance-analytics.webp` | Großes Equity-Chart, darunter Widgets: Winrate-Donut, Setup-Balkendiagramm, Wochentag-Heatmap. Grün für Gewinne, Rot für Verluste. |
| 3 | Equity Curve | `equity-curve.webp` | Smooth-Line-Chart mit Auf/Ab-Phasen, markierte Drawdown-Zonen. Darunter Consistency-Bars (grün/rot) pro Tag/Woche. |
| 4 | Konsistenz-Tracker | `consistency-tracker.webp` | Streak-Visualisierung mit verbundenen Tagen, Flammen-Icons für aktive Streaks, Fortschrittsbalken. Grid-Hintergrund. |
| 5 | Trading Kalender | `trading-calendar.webp` | Kalender-Heatmap-Grid mit Tagen in verschiedenen Grün-/Rot-Tönen. Kleine Icons (Kerze, Dollar) statt Zahlen. |

### Kategorie: AI & Automation (5 Features)

| # | Feature | Dateiname | Motiv-Beschreibung |
|---|---------|-----------|-------------------|
| 1 | AI Trading Assistant | `ai-assistant.webp` | Chat-Panel: stilisierte Bubbles (grün/grau) mit Linien als Platzhaltertext. KI-Brain/Chip-Symbol. Netzwerk-/Node-Muster im Hintergrund. |
| 2 | AI Chart-Analyse | `ai-charts.webp` | Chart mit Overlay von KI-generierten Annotations: Trendlinien, Support/Resistance-Zonen, Pattern-Markierungen. KI-Icon in Ecke. |
| 3 | Daily Summary | `daily-summary.webp` | E-Mail/Notification-Card mit abstrakten Zeilen für Statistiken, Mini-Chart, Highlight-Badges. Envelope-Icon mit Glow. |
| 4 | Goal Alerts | `goal-alerts.webp` | Zielscheibe mit Fortschrittsring, Notification-Bells mit Glow, Threshold-Linien. Progress-Bar und Alert-Icons. |
| 5 | Monte Carlo Simulator | `monte-carlo.webp` | Cluster halbtransparenter Linien von gemeinsamem Startpunkt divergierend. Parameter-Boxen (Risk%, Trades, Winrate) als Rechtecke. |

### Kategorie: Reports (5 Features)

| # | Feature | Dateiname | Motiv-Beschreibung |
|---|---------|-----------|-------------------|
| 1 | Symbol Reports | `symbol-reports.webp` | Abstrakte Tabelle mit Ticker-Symbolen, Performance-Balken pro Symbol, kleine Sparkline-Charts. Filter-Icons oben. |
| 2 | Setup Reports | `setup-reports.webp` | Setup-Karten mit Labels ("Setup A", "Setup B"), Winrate-Donuts, Vergleichs-Balkendiagramm. Tag-Badges. |
| 3 | Hour Analysis | `hour-analysis.webp` | 24-Stunden-Radialchart oder Balkendiagramm, Zeitachse, Highlighting der profitabelsten Stunden mit Glow. |
| 4 | Streak Analysis | `streak-analysis.webp` | Horizontale Streak-Bars (Win/Loss), Flammen-Icons, Rekord-Anzeige. Timeline-Visualisierung. |
| 5 | Holding Period | `holding-period.webp` | Histogramm/Distribution-Chart für Haltedauer, Zeitachse, Performance-Korrelation. Timer-Icons. |

### Kategorie: Market Intelligence (4 Features)

| # | Feature | Dateiname | Motiv-Beschreibung |
|---|---------|-----------|-------------------|
| 1 | Portfolio News | `portfolio-news.webp` | Radar-Kreis mit Symbol-Punkten, News-Cards mit Headline-Balken und Sentiment-Indikatoren (grün/rot). Stilisierte Weltkarte im Hintergrund. |
| 2 | Political Events | `political-events.webp` | Timeline mit Event-Markern, Impact-Levels (Glow für hohe Wichtigkeit). Flaggen-/Gebäude-Icons. |
| 3 | Sector Sentiment | `sector-sentiment.webp` | Treemap oder Heatmap mit Sektoren, Sentiment-Farben (grün/rot/neutral). Sektor-Labels. |
| 4 | Economic Calendar | `economic-calendar.webp` | Horizontale Zeitachse mit Event-Markern, Impact-Punkte mit Glow. Icons für News, Zentralbank, Reden. Weltkarten-Motiv. |

---

## Implementierungsplan

### Phase 1: Bild-Generierung (12 Visuals)

Für jedes Visual wird folgende Prompt-Struktur verwendet:

```
Abstract technical visualization for [FEATURE NAME]. 
Dark trading theme with black background (#020617). 
Neon green accent (#10B981) with secondary colors (#22C55E, #38BDF8, #FACC15).
[SPECIFIC MOTIF DESCRIPTION]
Style: Minimalist, techy, futuristic. Clean geometry, thin lines, glow effects, subtle grain texture.
No photos, no people, no real UI screenshots.
16:9 aspect ratio, 1920x1080.
```

Reihenfolge der Generierung:
1. MFE/MAE Analyse
2. Performance Analytics  
3. AI Trading Assistant
4. Monte Carlo Simulator
5. Portfolio News
6. Easy Entry
7. NinjaTrader Sync
8. Equity Curve
9. Trading Calendar
10. Symbol Reports
11. Economic Calendar
12. Prop-Firm (falls Zeit)

### Phase 2: Code-Anpassung

**Datei: `src/pages/Features.tsx`**

1. Neue Imports für alle Feature-Bilder hinzufügen
2. Jedes Feature-Objekt um `illustration`-Property erweitern
3. Rendering-Logik anpassen: Jedes Feature erhält sein eigenes Bild

```tsx
// Beispiel-Struktur nach Änderung
features: [
  {
    icon: <Crosshair className="h-6 w-6" />,
    title: t("features.items.mfeMAE.title"),
    description: t("features.items.mfeMAE.description"),
    benefits: [...],
    illustration: mfeMaeImg,  // NEU
  },
  // ...
]
```

**Datei: `src/components/features/FeatureRow.tsx`**

Die Komponente unterstützt bereits `screenshotUrl` - keine Änderung nötig.

**Rendering-Änderung in Features.tsx:**

```tsx
{category.features.map((feature, index) => (
  <FeatureRow
    key={index}
    feature={feature}
    imagePosition={index % 2 === 0 ? "right" : "left"}
    screenshotUrl={feature.illustration}  // Jedes Feature hat eigenes Bild
  />
))}
```

### Phase 3: Cleanup

- Alte Kategorie-Illustrationen entfernen (5 JPGs)
- Neue WebP-Dateien optimieren (falls nötig)
- Lazy Loading verifizieren

---

## Technische Details

### Dateistruktur nach Implementierung

```
src/assets/features/
├── mfe-mae.webp
├── performance-analytics.webp
├── ai-assistant.webp
├── monte-carlo.webp
├── portfolio-news.webp
├── easy-entry.webp
├── ninjatrader-sync.webp
├── equity-curve.webp
├── trading-calendar.webp
├── symbol-reports.webp
├── economic-calendar.webp
├── prop-firm.webp
├── csv-import.webp
├── position-calculator.webp
├── consistency-tracker.webp
├── ai-charts.webp
├── daily-summary.webp
├── goal-alerts.webp
├── setup-reports.webp
├── hour-analysis.webp
├── streak-analysis.webp
├── holding-period.webp
├── political-events.webp
└── sector-sentiment.webp
```

### Performance-Optimierung

- WebP-Format für bessere Kompression (~30% kleiner als JPG)
- `loading="lazy"` bereits implementiert
- Bilder werden erst geladen, wenn sie in den Viewport kommen

---

## Zusammenfassung

| Aspekt | Details |
|--------|---------|
| Anzahl Visuals | 24 (alle Features abgedeckt) |
| Priorität | 12 Kern-Features zuerst |
| Stil | Dark Trading Theme, abstrakt, technisch |
| Format | WebP, 1920x1080, 16:9 |
| Code-Änderungen | Features.tsx (Imports + Datenstruktur) |

