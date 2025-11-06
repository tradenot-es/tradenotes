import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Server, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

const Datenschutz = () => {
  const certifications = [
    {
      name: "SOC 2 Type 2",
      description: "Unabhängig geprüfte Sicherheitskontrollen für Verfügbarkeit, Vertraulichkeit und Datenschutz",
      icon: Shield
    },
    {
      name: "ISO 27001:2022",
      description: "Internationaler Standard für Informationssicherheits-Managementsysteme",
      icon: CheckCircle2
    },
    {
      name: "DSGVO-konform",
      description: "Vollständige Einhaltung der EU-Datenschutz-Grundverordnung",
      icon: Lock
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Datenschutzerklärung</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ihre Daten sind bei uns sicher. Wir nehmen Datenschutz ernst und setzen auf höchste Sicherheitsstandards.
            </p>
          </div>

          {/* Zertifizierungen */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Unsere Zertifizierungen
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <cert.icon className="h-12 w-12 text-primary mb-2" />
                    <CardTitle className="text-lg">{cert.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{cert.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Datenspeicherung */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-6 w-6 text-primary" />
                Wo werden Ihre Daten gespeichert?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">EU-Region</Badge>
                <div>
                  <p className="font-medium mb-2">Datenspeicherung in der Europäischen Union</p>
                  <p className="text-sm text-muted-foreground">
                    Alle Ihre Daten werden ausschließlich in europäischen Rechenzentren gespeichert (Frankfurt, Deutschland). 
                    Dies gewährleistet die Einhaltung der DSGVO und bietet Ihnen maximalen Datenschutz nach EU-Standards.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Verschlüsselt</Badge>
                <div>
                  <p className="font-medium mb-2">Ende-zu-Ende Verschlüsselung</p>
                  <p className="text-sm text-muted-foreground">
                    Ihre Daten werden sowohl bei der Übertragung (TLS 1.3) als auch im Ruhezustand (AES-256) verschlüsselt. 
                    Nur Sie haben Zugriff auf Ihre Trading-Daten.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datenschutz-Inhalt */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Verantwortlicher</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-2">Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
                  <p className="text-sm text-muted-foreground">
                    TradeNotes GmbH<br />
                    Musterstraße 123<br />
                    10115 Berlin, Deutschland<br />
                    E-Mail: datenschutz@tradenotes.io
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">2.1 Beim Besuch der Website</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Beim Aufrufen unserer Website werden automatisch Informationen erfasst:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li>IP-Adresse (anonymisiert nach 24 Stunden)</li>
                      <li>Datum und Uhrzeit des Zugriffs</li>
                      <li>Browsertyp und -version</li>
                      <li>Verwendetes Betriebssystem</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">2.2 Bei der Registrierung</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Für die Nutzung unseres Services erheben wir:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li>E-Mail-Adresse</li>
                      <li>Passwort (verschlüsselt gespeichert)</li>
                      <li>Optionale Profildaten (Name, Währung, Zeitzone)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">2.3 Trading-Daten</h3>
                    <p className="text-sm text-muted-foreground">
                      Ihre Trading-Daten (Trades, Journal-Einträge, Analysen) werden ausschließlich für Sie gespeichert 
                      und niemals mit Dritten geteilt oder für andere Zwecke verwendet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Rechtsgrundlage der Verarbeitung</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf folgenden Rechtsgrundlagen:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung und vorvertragliche Maßnahmen</li>
                    <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen (z.B. Websiteanalyse, Sicherheit)</li>
                    <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Ihre ausdrückliche Einwilligung (z.B. Newsletter)</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Weitergabe von Daten</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Wir geben Ihre Daten nur in folgenden Fällen weiter:
                  </p>
                  <div>
                    <h3 className="font-semibold mb-2">4.1 Service-Provider</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Wir nutzen zuverlässige Dienstleister für den Betrieb unserer Plattform:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                      <li><strong>Lovable Cloud:</strong> Hosting und Backend-Infrastruktur (SOC 2 Type 2, ISO 27001:2022)</li>
                      <li><strong>EU-Rechenzentren:</strong> Datenspeicherung in Frankfurt, Deutschland</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Alle Dienstleister sind vertraglich zur Einhaltung der DSGVO verpflichtet und verarbeiten 
                      Daten ausschließlich nach unseren Weisungen.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">4.2 Rechtliche Verpflichtungen</h3>
                    <p className="text-sm text-muted-foreground">
                      Datenoffenlegung nur bei gesetzlicher Verpflichtung oder behördlicher Anordnung.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                5. Ihre Rechte
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Recht auf Auskunft (Art. 15 DSGVO):</strong> Sie können jederzeit Auskunft über 
                        Ihre gespeicherten Daten verlangen.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Unrichtige Daten werden 
                        unverzüglich korrigiert.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer Daten 
                        verlangen, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Recht auf Einschränkung (Art. 18 DSGVO):</strong> Sie können die Einschränkung 
                        der Verarbeitung verlangen.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie erhalten Ihre Daten 
                        in einem strukturierten, gängigen Format (CSV-Export).
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der Verarbeitung 
                        Ihrer Daten widersprechen.
                      </div>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: <strong>datenschutz@tradenotes.io</strong>
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Datensicherheit</h2>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Wir setzen modernste Sicherheitsmaßnahmen ein:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>TLS 1.3 Verschlüsselung für alle Datenübertragungen</li>
                    <li>AES-256 Verschlüsselung für gespeicherte Daten</li>
                    <li>Regelmäßige Sicherheitsaudits durch unabhängige Prüfer (SOC 2)</li>
                    <li>Automatische Backups und Disaster Recovery Pläne</li>
                    <li>Strenge Zugriffskontrollen und Authentifizierung</li>
                    <li>Monitoring und Logging aller sicherheitsrelevanten Ereignisse</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Cookies und Tracking</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Wir verwenden ausschließlich technisch notwendige Cookies für die Funktionalität der Website:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>Session-Cookies für die Authentifizierung</li>
                    <li>Präferenz-Cookies (Theme, Sprache)</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    Wir verwenden <strong>keine</strong> Marketing-Cookies oder Third-Party-Tracking.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Speicherdauer</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Wir speichern Ihre Daten nur so lange wie nötig:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2 ml-4">
                    <li>Account-Daten: Bis zur Löschung Ihres Accounts</li>
                    <li>Trading-Daten: Bis zur Löschung Ihres Accounts</li>
                    <li>Log-Daten: Maximal 90 Tage</li>
                    <li>Backup-Daten: Maximal 30 Tage</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    Nach Account-Löschung werden alle Ihre Daten innerhalb von 30 Tagen vollständig entfernt.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Änderungen dieser Datenschutzerklärung</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen 
                    oder Änderungen unseres Services anzupassen. Die aktuelle Fassung finden Sie stets auf dieser Seite.
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Letzte Aktualisierung:</strong> {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                10. Beschwerderecht
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Die Bundesbeauftragte für den Datenschutz und die Informationsfreiheit</strong><br />
                    Graurheindorfer Str. 153<br />
                    53117 Bonn<br />
                    Telefon: +49 (0)228 997799-0<br />
                    E-Mail: poststelle@bfdi.bund.de
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Datenschutz;
