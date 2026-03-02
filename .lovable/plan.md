

## Pre-Launch-Seite deaktivieren

Die Änderung ist minimal: In `src/config/featureFlags.ts` wird `PRELAUNCH_MODE` von `true` auf `false` gesetzt. Dadurch wird direkt die Landing-Seite angezeigt statt der Beta/Waitlist-Seite.

### Änderung

**`src/config/featureFlags.ts`**
- `PRELAUNCH_MODE: true` wird zu `PRELAUNCH_MODE: false`

Das ist alles -- eine einzige Zeile.

