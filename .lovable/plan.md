

# Animierte Hero-Section für die Features-Seite

## Ziel

Erstellung einer modernen, animierten Full-Width Hero-Section mit Parallax-Effekten, die oben auf der Features-Seite eingefügt wird. Die Section ersetzt die aktuelle einfache Hero-Section und bietet ein immersives Erlebnis mit Kategorie-Filter, Teaser-Cards und einem visuellen Hero-Collage.

---

## Design-Spezifikation

### Layout-Struktur

```text
+------------------------------------------------------------------+
|  Navigation (bereits vorhanden)                                   |
+------------------------------------------------------------------+
|                                                                   |
|  [Badge: "20+ Features" mit grünem Glow]                          |
|                                                                   |
|  H1: "Alle Features im Überblick" (4xl bold, gradient optional)   |
|                                                                   |
|  P: "Entdecke die komplette Funktionspalette..." (xl muted)       |
|                                                                   |
|  [Search Input] [Kategorie-Buttons: Tools | Analytics | AI | ...]  |
|                                                                   |
|  +--------------------+  +--------------------+                    |
|  | Trading Tools Card |  | Analytics Card     |   (Hero Visual)   |
|  | Icon + Title       |  | Icon + Title       |   Collage aus     |
|  +--------------------+  +--------------------+   Feature-Images   |
|  +--------------------+  +--------------------+   50% width        |
|  | AI & Automation    |  | Market Intelligence|   responsive      |
|  | Icon + Title       |  | Icon + Title       |                   |
|  +--------------------+  +--------------------+                    |
|                                                                   |
|  [CTA Button: "14 Tage kostenlos testen" -> /auth]                |
|                                                                   |
+------------------------------------------------------------------+
```

### Styling-Details

| Element | Spezifikation |
|---------|---------------|
| Container | `min-h-[60vh]`, `bg-gradient-to-br from-black to-slate-900` |
| Badge | Pill-Style, `glow-effect`, primäres Grün |
| Headline | `text-4xl md:text-5xl font-bold`, optional `gradient-text` |
| Subheadline | `text-xl text-muted-foreground`, max-width begrenzt |
| Search Input | Standard Input-Komponente, `bg-muted/50`, Suchen-Icon |
| Kategorie-Buttons | Toggle-Group oder Button-Reihe, aktive Kategorie hervorgehoben |
| Teaser-Cards | `glossy-card`, `hover:glow-effect`, Icon + Title, 2x2 Grid |
| CTA Button | `variant="premium"`, `size="lg"`, Arrow-Icon |
| Hero Visual | Collage aus 4-6 Feature-Bildern, responsive 50% Breite auf Desktop |

### Animationen

| Animation | Beschreibung |
|-----------|--------------|
| Parallax-Hintergrund | Dezenter vertikaler Parallax-Effekt beim Scrollen (CSS `transform: translateY`) |
| Fade-In bei Laden | Elemente erscheinen sequenziell mit `animate-fade-in` |
| Hover-Glow | Cards leuchten beim Hover auf (`hover:shadow-glow`) |
| Search-Focus | Suchfeld erweitert sich leicht bei Fokus |
| CTA Servo-Pulse | Optionale Wiederverwendung der `servo-pulse` Animation |

---

## Implementierungsplan

### Phase 1: Neue Komponente erstellen

**Datei: `src/components/features/FeaturesHero.tsx`**

Neue Komponente mit folgender Struktur:

```tsx
interface FeaturesHeroProps {
  onCategoryClick: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
}

export function FeaturesHero({ onCategoryClick, onSearchChange }: FeaturesHeroProps) {
  // State für Suche und Parallax
  // Kategorie-Daten (Icons, Titles, IDs)
  // Render Hero mit allen Elementen
}
```

Inhalte der Komponente:
1. Container mit Gradient-Hintergrund und Parallax-Hook
2. Badge "20+ Features" mit Glow
3. H1 und P aus i18n
4. Search-Input mit Icon
5. Kategorie-Button-Reihe (5 Kategorien)
6. 4 Teaser-Cards im 2x2 Grid (nur 4 wichtigste Kategorien)
7. Hero-Visual Collage (responsive)
8. Primärer CTA-Button

### Phase 2: Parallax-Hook erstellen

**Datei: `src/hooks/useParallax.tsx`**

Einfacher Hook für dezenten Parallax-Effekt:

```tsx
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return offset;
}
```

### Phase 3: Hero-Visual Collage

**Option A: CSS Grid Collage**
- Verwendet 4-6 bestehende Feature-Bilder
- Asymmetrisches Grid-Layout
- Dezente Rotation und Schatten

**Option B: Animierte Floating Cards**
- Feature-Bilder als schwebende Karten
- Subtile Auf-Ab-Animation
- Gestaffelte Delays

Gewählte Option: **Option A** (CSS Grid Collage) - performanter und einfacher zu implementieren.

### Phase 4: Features.tsx anpassen

**Datei: `src/pages/Features.tsx`**

1. Import der neuen `FeaturesHero` Komponente
2. State für Suchfilter hinzufügen (optional für spätere Implementierung)
3. Alte Hero-Section durch `<FeaturesHero />` ersetzen
4. Handler-Funktionen für Kategorie-Klick und Suche übergeben

Änderungen im Detail:

```tsx
// Neuer Import
import { FeaturesHero } from "@/components/features/FeaturesHero";

// In der Komponente
const [searchQuery, setSearchQuery] = useState("");

// Render
<FeaturesHero 
  onCategoryClick={(id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }}
  onSearchChange={setSearchQuery}
/>
```

### Phase 5: i18n-Erweiterungen

**Dateien: `src/i18n/locales/{de,en,fr,es,nl,it}.json`**

Neue Übersetzungsschlüssel hinzufügen:

```json
"features": {
  "heroTitle": "Alle Features im Überblick",
  "heroDescription": "Entdecke die komplette Funktionspalette...",
  "featureCount": "20+ Features",
  "searchPlaceholder": "Features durchsuchen...",
  "ctaPrimary": "14 Tage kostenlos testen",
  "teaserCards": {
    "tradingTools": "Schnelle Trade-Erfassung & Import",
    "analytics": "Performance tracken & analysieren",
    "ai": "KI-gestützte Insights",
    "marketIntel": "Marktdaten & News"
  }
}
```

### Phase 6: CSS-Erweiterungen

**Datei: `src/index.css`**

Neue Utility-Klassen für Parallax und Collage:

```css
.parallax-container {
  overflow: hidden;
  position: relative;
}

.parallax-bg {
  will-change: transform;
  transition: transform 0.1s linear;
}

.feature-collage {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
}

.feature-collage-item {
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-collage-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-glow);
}
```

### Phase 7: Tailwind-Konfiguration

**Datei: `tailwind.config.ts`**

Neue Keyframes für zusätzliche Animationen (falls nötig):

```ts
keyframes: {
  "float": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-10px)" },
  },
  "fade-in-up": {
    "0%": { opacity: "0", transform: "translateY(20px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
},
animation: {
  "float": "float 3s ease-in-out infinite",
  "fade-in-up": "fade-in-up 0.5s ease-out forwards",
},
```

---

## Dateistruktur nach Implementierung

```text
src/
├── components/
│   └── features/
│       ├── CategoryNav.tsx (unverändert)
│       ├── FeatureRow.tsx (unverändert)
│       └── FeaturesHero.tsx (NEU)
├── hooks/
│   ├── useScrollSpy.tsx (unverändert)
│   └── useParallax.tsx (NEU)
├── pages/
│   └── Features.tsx (angepasst)
├── i18n/locales/
│   ├── de.json (erweitert)
│   ├── en.json (erweitert)
│   └── ... (weitere Sprachen)
├── index.css (erweitert)
└── tailwind.config.ts (optional erweitert)
```

---

## Technische Details

### Responsive Verhalten

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Vertikal gestapelt, Hero-Visual versteckt oder kleiner, volle Breite für alle Elemente |
| Tablet (768-1024px) | 2-Spalten für Teaser-Cards, Hero-Visual 40% Breite |
| Desktop (>1024px) | Volles Layout wie Spezifikation, Hero-Visual 50% Breite |

### Performance-Optimierungen

1. **Parallax mit `will-change`**: Verhindert Layout-Thrashing
2. **Lazy Loading für Bilder**: Feature-Bilder erst laden wenn sichtbar
3. **Reduced Motion Support**: Parallax und Animationen deaktivieren bei `prefers-reduced-motion`
4. **CSS-basierter Parallax bevorzugt**: Kein JavaScript-Recalculation bei jedem Scroll

### Barrierefreiheit

1. Search-Input mit korrektem `aria-label`
2. Kategorie-Buttons als echte Buttons mit Fokus-States
3. CTA-Link mit klarer Beschreibung
4. Alle Animationen respektieren `prefers-reduced-motion`

---

## Zusammenfassung

| Aspekt | Details |
|--------|---------|
| Neue Dateien | 2 (FeaturesHero.tsx, useParallax.tsx) |
| Geänderte Dateien | 3 (Features.tsx, index.css, de.json + weitere Sprachen) |
| Animationen | Parallax, Fade-In, Hover-Glow |
| Responsive | Vollständig responsiv (Mobile-First) |
| i18n | Vollständig übersetzt in 6 Sprachen |
| Performance | Optimiert mit will-change, lazy loading |

