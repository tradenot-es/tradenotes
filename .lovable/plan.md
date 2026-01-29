
# Umsetzung: Konsolidierung Daily Goals

## Übersicht
Entfernung der redundanten legacy "Daily Goal Progress" Komponente und Bereinigung der Reports.tsx. Der TradingGoalsTracker übernimmt alle Funktionen.

---

## Änderungen

### 1. Datei löschen
| Datei | Aktion |
|-------|--------|
| `src/components/DailyGoalProgress.tsx` | Löschen (119 Zeilen) |

### 2. Reports.tsx bereinigen

**Zeile 19 - Import entfernen:**
```typescript
// ENTFERNEN:
import { DailyGoalProgress } from "@/components/DailyGoalProgress";
```

**Zeilen 58-59 - Legacy State entfernen:**
```typescript
// ENTFERNEN:
const [dailyGoalAmount, setDailyGoalAmount] = useState(500);
const [dailyGoalMaxTrades, setDailyGoalMaxTrades] = useState(10);
```

**Zeilen 65-82 - loadSettings entfernen:**
```typescript
// VORHER:
useEffect(() => {
  if (user) {
    loadTrades();
    loadSettings();  // <-- entfernen
  }
}, [user]);

const loadSettings = async () => { ... }  // <-- ganze Funktion entfernen

// NACHHER:
useEffect(() => {
  if (user) {
    loadTrades();
  }
}, [user]);
```

**Zeilen 229-254 - dailyGoalTracking useMemo entfernen:**
```typescript
// ENTFERNEN - kompletter Block:
const dailyGoalTracking = useMemo(() => { ... }, [...]);
```

**Zeilen 540-659 - Goals Tab vereinfachen:**
```typescript
// VORHER: 3 KPI-Karten + Daily Goal History Card + TradingGoalsTracker

// NACHHER: Nur TradingGoalsTracker
<TabsContent value="goals" className="space-y-6">
  <TradingGoalsTracker
    dailyResults={dailyResults}
    enabledGoals={enabledGoals}
    goals={goals}
  />
</TabsContent>
```

---

## Entfernte UI-Elemente im Goals Tab

| Element | Ersetzt durch |
|---------|--------------|
| Goal Achievement Rate (RadialProgress) | Ø Score im Tracker |
| Current Goal Card | Aktive Goals Link → Settings |
| Best Day Card | - (nicht mehr benötigt) |
| Daily Goal History (10 DailyGoalProgress) | Matrix-Tabelle im Tracker |

---

## Resultat

| Aspekt | Vorher | Nachher |
|--------|--------|---------|
| Komponenten im Goals Tab | 5 | 1 |
| Code-Zeilen entfernt | ~200 | - |
| Dateien gelöscht | 1 | - |
| Verfügbare Ziele | 2 legacy | 15 konfigurierbar |
