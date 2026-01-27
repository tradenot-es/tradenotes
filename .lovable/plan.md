
# Vorname als Pflichtfeld - Optimale & rechtssichere Implementierung

## Zusammenfassung
Der Vorname bleibt Pflichtfeld bei der Registrierung und wird zusätzlich auf der Account-Seite validiert. Der Nachname bleibt optional (DSGVO-Datenminimierung). Ein Datenbank-Constraint stellt Konsistenz sicher.

## Rechtliche Grundlage

### Warum Vorname als Pflichtfeld legitim ist
- **Art. 6 DSGVO**: Vertragserfüllung (personalisierter Service) + berechtigtes Interesse
- **Verwendungszweck**: E-Mail-Anrede, Dashboard-Begrüßung, Support-Kommunikation
- **Transparenz**: Nutzer sehen bei Registrierung, dass der Name erfasst wird
- **Erforderlichkeit**: Name ist für professionelle Kommunikation üblich

### Warum Nachname optional bleiben sollte
- **Art. 5 DSGVO - Datenminimierung**: Für Personalisierung reicht der Vorname
- **Nutzerfreundlichkeit**: Weniger Pflichtfelder = bessere Conversion
- **Pseudonymität**: Manche Nutzer möchten nur Vornamen angeben

## Aktuelle Situation

| Bereich | Status | Problem |
|---------|--------|---------|
| SignupForm | Vorname Pflicht | Funktioniert korrekt |
| Account-Seite | Keine Validierung | Nutzer kann Vorname leeren |
| Datenbank | `first_name` nullable | Inkonsistenz möglich |
| Zod-Schema | Nur bei Signup | Fehlt auf Account-Seite |

## Geplante Änderungen

### 1. Account-Seite: Validierung hinzufügen

Die `handleUpdateProfile()` Funktion wird um Validierung erweitert:
- Vorname darf nicht leer sein
- Fehlermeldung mit Übersetzung
- Visueller Pflichtfeld-Indikator (Asterisk)

### 2. Zod-Schema für Account-Update

Neues Schema für Profile-Updates:
- Vorname: min 1 Zeichen, max 50 Zeichen
- Nachname: optional, max 50 Zeichen
- Trim-Whitespace vor Validierung

### 3. Datenbank-Migration

SQL-Migration um Datenkonsistenz zu gewährleisten:
- Bestehende NULL-Werte auf "Trader" setzen (Fallback)
- `NOT NULL` Constraint für `first_name`
- Maximale Länge von 100 Zeichen (für Sicherheit)

### 4. UI-Verbesserungen

- Asterisk (*) bei Pflichtfeldern
- Konsistente Fehlermeldungen
- Klarere Label-Texte

## Technische Details

### Datenbank-Migration
```text
1. UPDATE profiles SET first_name = 'Trader' WHERE first_name IS NULL
2. ALTER TABLE profiles ALTER COLUMN first_name SET NOT NULL
3. ALTER TABLE profiles ALTER COLUMN first_name SET DEFAULT 'Trader'
4. ADD CHECK constraint: char_length(first_name) >= 1
```

### Frontend-Validierung (Account.tsx)
```text
1. Import Zod
2. Erstelle profileUpdateSchema
3. Validiere vor upsert
4. Zeige Fehlermeldungen
5. Füge Pflichtfeld-Marker hinzu
```

### Übersetzungen
Neue Keys für alle 6 Sprachen:
- `validation.firstNameRequired`: "Vorname ist erforderlich"
- `validation.firstNameTooLong`: "Vorname darf maximal 50 Zeichen haben"

## Dateien die bearbeitet werden

| Datei | Änderung |
|-------|----------|
| `src/pages/Account.tsx` | Zod-Validierung, Pflichtfeld-Marker |
| `src/i18n/locales/*.json` | Neue Validierungs-Übersetzungen |
| Database Migration | NOT NULL Constraint für first_name |

## Vorteile

- **Rechtssicher**: DSGVO-konform durch transparente Datenerfassung
- **Konsistent**: Validierung an allen Stellen (Signup + Account)
- **Robust**: Datenbank-Constraint verhindert inkonsistente Daten
- **Nutzerfreundlich**: Nachname bleibt optional

## Hinweis zu bestehenden Nutzern

Die Migration setzt NULL-Werte auf "Trader" als Fallback. Diese Nutzer können ihren Namen auf der Account-Seite aktualisieren. Dies ist ein guter Kompromiss zwischen Datenkonsistenz und Nutzerfreundlichkeit.
