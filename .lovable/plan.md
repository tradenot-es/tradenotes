
# SEO-Optimierte Integration der 4 neuen Features auf der Landing Page

## Übersicht
Die heute implementierten Features müssen SEO-optimiert auf der Landing Page integriert werden:
- **Goal Alerts & Notifications** - Ziel-Tracking mit Benachrichtigungen
- **AI Daily Summary** - Automatische tägliche KI-Zusammenfassung
- **AI Chat with Inline Charts** - Interaktive Visualisierungen im AI Chat
- **What-If Risk Simulator** - Monte Carlo Risiko-Simulation

---

## Implementierungsschritte

### 1. Landing Page Feature Grid erweitern
**Datei:** `src/pages/Landing.tsx`

Drei neue Feature-Karten im Grid hinzufügen (Risk Simulator, Daily Summary, AI Charts). Das bestehende `aiAlerts` deckt Goal Alerts bereits ab, aber wird umbenannt für Klarheit.

**Neue Einträge:**
```
- dailySummary (Mail Icon) → AI Daily Summary  
- aiCharts (PieChart Icon) → AI Chat mit Inline-Charts
- riskSimulator (Calculator/Gauge Icon) → What-If Risk Simulator
```

**Position:** Nach dem AI Trading Assistant, vor Reports - gruppiert als "AI Features Block"

---

### 2. Pricing "All Features" Liste erweitern
**Datei:** `src/pages/Landing.tsx` (allFeatures Array)

Neue Einträge in der Premium-Feature-Liste:
```
- dailySummary: "Automatische tägliche KI-Zusammenfassung per E-Mail"
- aiCharts: "AI Chat mit interaktiven Charts & Tabellen"  
- riskSimulator: "What-If Risiko-Simulator (Monte Carlo)"
- goalAlerts: "Ziel-Alerts & Echtzeit-Benachrichtigungen"
```

---

### 3. Übersetzungen (alle 6 Sprachen)
**Dateien:** `src/i18n/locales/{de,en,fr,es,nl,it}.json`

**Neue Keys in `landing.features`:**
```json
"dailySummary": {
  "title": "KI Tagesreport",
  "description": "Automatische E-Mail-Zusammenfassung deiner Trading-Performance mit Stärken, Schwächen und personalisierten Verbesserungsvorschlägen."
},
"aiCharts": {
  "title": "AI Chat mit Charts",
  "description": "Stelle Fragen und erhalte interaktive Visualisierungen—Balken-, Linien- und Kreisdiagramme direkt im Chat."
},
"riskSimulator": {
  "title": "What-If Risiko-Simulator",
  "description": "Teste alternative Strategien mit Monte Carlo Simulation. Wie hätte dein Kapital mit 2R-Exits oder 1% Risiko performt?"
}
```

**Neue Keys in `landing.allFeatures`:**
```json
"dailySummary": "Automatische KI Tagesreports per E-Mail",
"aiCharts": "AI Chat mit interaktiven Charts & Tabellen",
"riskSimulator": "What-If Risiko-Simulator (Monte Carlo)",
"goalAlerts": "Ziel-Alerts & Echtzeit-Benachrichtigungen"
```

---

### 4. Schema.org Structured Data aktualisieren
**Datei:** `index.html`

Die `featureList` im SoftwareApplication Schema erweitern:
```json
"featureList": [
  // Bestehende Einträge...
  "AI Daily Summary Reports",
  "What-If Risk Simulator (Monte Carlo)",
  "AI Chat with Inline Visualizations",
  "Goal Tracking & Smart Alerts"
]
```

---

### 5. Icon-Auswahl für neue Features
Passende Lucide Icons für visuelle Konsistenz:
- **Daily Summary:** `Mail` oder `FileText` 
- **AI Charts:** `PieChart` oder `BarChart3`
- **Risk Simulator:** `Calculator` oder `Gauge`
- **Goal Alerts:** `Bell` (bereits vorhanden für aiAlerts)

---

## Technische Details

### Feature-Reihenfolge im Grid
Aktuelle Reihenfolge reorganisieren für logische Gruppierung:

**AI Features Block (zusammen positioniert):**
1. KI Trading Assistant (bestehend)
2. AI Chat mit Charts (NEU)
3. KI Tagesreport (NEU)  
4. Proaktive KI-Warnungen (bestehend, umfasst Goal Alerts)
5. What-If Risiko-Simulator (NEU)

### SEO-Keywords in Beschreibungen
Relevante Keywords integrieren:
- "Monte Carlo Simulation"
- "Trading Performance Report"
- "Interaktive Charts"
- "Echtzeit-Benachrichtigungen"
- "Risiko-Analyse"
- "KI-gestützte Analyse"

---

## Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `Landing.tsx` | 3 neue Feature-Karten + 4 neue allFeatures Einträge |
| `de.json` | 7 neue Übersetzungs-Keys |
| `en.json` | 7 neue Übersetzungs-Keys |
| `fr.json` | 7 neue Übersetzungs-Keys |
| `es.json` | 7 neue Übersetzungs-Keys |
| `nl.json` | 7 neue Übersetzungs-Keys |
| `it.json` | 7 neue Übersetzungs-Keys |
| `index.html` | 4 neue Schema.org featureList Einträge |

**Geschätzter Aufwand:** ~15-20 Minuten für vollständige Implementierung mit allen Sprachen.
