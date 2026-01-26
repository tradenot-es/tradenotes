

# E-Mail-Bestätigung für Wartelisten-Eintragung

## Zusammenfassung
Nach erfolgreicher Anmeldung zur Warteliste wird eine Bestätigungs-E-Mail über Lettermint versendet. Der Nutzer erhält somit eine persönliche Willkommens-Nachricht mit Branding statt nur eines Pop-ups.

## Aktuelle Situation
- Die `join-waitlist` Edge Function speichert die E-Mail in der Datenbank
- Das Frontend zeigt nach Erfolg nur eine In-Page-Meldung an
- Lettermint ist bereits für Auth-E-Mails konfiguriert und verifiziert

## Geplante Änderungen

### 1. Edge Function erweitern (`supabase/functions/join-waitlist/index.ts`)

Nach dem erfolgreichen Datenbank-Insert wird eine E-Mail über die Lettermint API gesendet:

**Neue Funktionalität:**
- E-Mail-Template im TradeNot.es Design (dunkel, grüne Akzente)
- Lokalisierte Inhalte basierend auf der Browser-Sprache (DE/EN)
- Inhalt: Dankesnachricht, Bestätigung der Wartelisten-Position
- Fallback: Bei E-Mail-Fehler wird trotzdem `success: true` zurückgegeben (Silent Fail), da der Nutzer bereits eingetragen ist

**Template-Inhalt (Deutsch):**
```text
Betreff: Willkommen auf der Warteliste!

Hallo,

Danke für dein Interesse an TradeNot.es - deinem professionellen Trading Journal.

Du bist jetzt auf unserer Warteliste und gehörst zu den Ersten, die zum Launch Zugang erhalten.

Was dich erwartet:
- Professionelles Trading-Journal
- KI-gestützter Trading-Assistent
- Detaillierte Performance-Analysen

Wir melden uns, sobald es losgeht!

Dein TradeNot.es Team
```

### 2. Frontend anpassen (`src/pages/PreLaunch.tsx`)

- Die `language` (Browsersprache) wird an die Edge Function übergeben
- Das Pop-up bleibt zusätzlich bestehen als visuelle Bestätigung

### 3. Übersetzungen hinzufügen (alle 6 Sprachen)

Neue Übersetzungsschlüssel für die E-Mail-Inhalte werden nicht benötigt, da die Templates direkt in der Edge Function definiert sind (wie bei `send-auth-email`).

## Architektur-Diagramm

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PreLaunch.tsx │────▶│  join-waitlist  │────▶│   Supabase DB   │
│   (Frontend)    │     │  Edge Function  │     │   (waitlist)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Lettermint API │
                        │  (E-Mail senden)│
                        └─────────────────┘
```

## Technische Details

### Edge Function Änderungen

```text
1. LETTERMINT_API_KEY aus Secrets laden
2. Nach erfolgreichem DB-Insert:
   - Sprache aus Request-Body ermitteln (fallback: "de")
   - E-Mail-Template generieren (lokalisiert)
   - POST an Lettermint API senden
3. Bei E-Mail-Fehler: Nur loggen, kein Fehler an Frontend
4. Erfolg zurückgeben
```

### E-Mail-Design
- Konsistent mit bestehendem Auth-E-Mail-Design
- Dunkelgrauer Hintergrund (#0a0a0a, #1a1a1a)
- Grüne Akzentfarbe (#10b981)
- TradeNot.es Logo/Branding im Header
- Mobile-optimiertes Layout

## Dateien die bearbeitet werden

| Datei | Änderung |
|-------|----------|
| `supabase/functions/join-waitlist/index.ts` | Lettermint E-Mail-Versand hinzufügen |
| `src/pages/PreLaunch.tsx` | Browser-Sprache an Edge Function übergeben |

## Vorteile

- **Professioneller Eindruck**: Gebrandete E-Mail statt nur Pop-up
- **Zustellbarkeit**: DNS-Records (SPF/DKIM) für tradenot.es bereits aktiv
- **Konsistenz**: Gleiches Design wie Auth-E-Mails
- **Robustheit**: Silent Fail bei E-Mail-Fehler - Nutzer ist trotzdem eingetragen

