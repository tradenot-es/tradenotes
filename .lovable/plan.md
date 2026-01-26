
# Einfachstes Konzept: Lettermint für alle Transaktions-E-Mails

## Aktuelle Situation

| Komponente | Status |
|------------|--------|
| `send-auth-email` Edge Function | ✅ Vorhanden, mit Lettermint integriert |
| `send-trial-reminder` Edge Function | ✅ Vorhanden, mit Lettermint integriert |
| `LETTERMINT_API_KEY` | ✅ Konfiguriert |
| Lettermint Domain (tradenot.es) | ✅ Verifiziert |

## Das Problem

Aktuell ruft `Auth.tsx` bei "Passwort vergessen" die Supabase-Methode `resetPasswordForEmail()` auf:

```text
Auth.tsx → supabase.auth.resetPasswordForEmail() → Supabase sendet E-Mail (SMTP)
```

Supabase sendet dann selbst eine E-Mail über seinen internen SMTP. Da Lovable Cloud keinen Zugang zum Supabase Dashboard bietet, können wir dort keine SMTP-Einstellungen oder Auth Hooks konfigurieren.

## Die Lösung: Frontend-Trigger + Edge Function

Statt Supabase die E-Mail senden zu lassen, triggern wir die `send-auth-email` Edge Function direkt aus dem Frontend:

```text
Auth.tsx → send-auth-email Edge Function → Lettermint API → E-Mail an User
```

### Ablauf für Passwort-Reset

1. User gibt E-Mail ein und löst ALTCHA
2. Frontend ruft `send-auth-email` mit `type: 'recovery'` auf
3. Edge Function generiert einen sicheren Reset-Token
4. E-Mail wird über Lettermint mit gebrandetem Template versendet
5. User klickt Link → landet auf `/auth?reset=true`
6. User setzt neues Passwort

## Implementierungsschritte

### Schritt 1: Edge Function erweitern

Die `send-auth-email` Edge Function muss:
- Supabase Admin-Client nutzen um `generateLink()` aufzurufen
- Den generierten Recovery-Link in die E-Mail einbetten
- ALTCHA-Token für Spam-Schutz validieren

### Schritt 2: Auth.tsx anpassen

Die `handleForgotPassword` Funktion ändern:
- Statt `supabase.auth.resetPasswordForEmail()` 
- → `supabase.functions.invoke('send-auth-email', { body: { email, type: 'recovery' } })`

### Schritt 3: Account.tsx anpassen (E-Mail-Änderung)

Falls E-Mail-Änderungen auch über Lettermint laufen sollen:
- Bei `handleUpdateEmail` → Edge Function mit `type: 'email_change'` aufrufen

## Vorteile dieser Lösung

| Aspekt | Vorteil |
|--------|---------|
| **Einfachheit** | Keine Dashboard-Konfiguration nötig |
| **Kontrolle** | Volle Kontrolle über E-Mail-Design und -Inhalt |
| **Stabilität** | Kein Konflikt mit Supabase-internem SMTP |
| **Zustellbarkeit** | DNS-Records (SPF/DKIM) für tradenot.es bereits aktiv |
| **Wartbarkeit** | Alle E-Mails an einem Ort (Lettermint) |

## Technische Details

### Edge Function: Token-Generierung

```text
// Pseudocode für send-auth-email
1. Empfange { email, type, altcha_payload }
2. Validiere ALTCHA (optional aber empfohlen)
3. Rufe supabaseAdmin.auth.admin.generateLink() auf
4. Erhalte recovery_link mit eingebettetem Token
5. Sende E-Mail über Lettermint mit diesem Link
```

### Supabase `generateLink()` API

Diese Admin-Methode generiert sichere Auth-Links ohne selbst eine E-Mail zu senden – perfekt für unseren Use Case.

## E-Mail-Typen im Überblick

| Typ | Trigger | Status nach Implementierung |
|-----|---------|----------------------------|
| Password Recovery | "Passwort vergessen" | ✅ Über Lettermint |
| Email Change | Account-Einstellungen | ✅ Über Lettermint |
| Trial Reminder | Cronjob/Webhook | ✅ Bereits implementiert |

## Zusammenfassung

Diese Lösung:
- Ist **einfach** – nur 2-3 Dateien müssen angepasst werden
- Ist **stabil** – keine Abhängigkeit von Supabase SMTP
- Ist **tragfähig** – zentrale E-Mail-Logik in Edge Functions
- Benötigt **keine Dashboard-Konfiguration**
