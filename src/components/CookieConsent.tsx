import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie-consent';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always required
  functional: false,
  analytics: false,
};

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    handleClose();
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    savePreferences(defaultPreferences);
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 transition-all duration-300',
        isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      )}
    >
      <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
            <Cookie className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cookie-Einstellungen</h3>
              <p className="text-sm text-muted-foreground">
                Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Notwendige Cookies sind für die 
                Grundfunktionen der Website erforderlich. Sie können Ihre Einstellungen jederzeit anpassen.
                Mehr Informationen finden Sie in unserer{' '}
                <Link to="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>.
              </p>
            </div>

            {showDetails && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="necessary" className="font-medium">Notwendige Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Erforderlich für grundlegende Funktionen wie Login und Navigation.
                    </p>
                  </div>
                  <Switch id="necessary" checked={true} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="functional" className="font-medium">Funktionale Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Speichern Ihre Präferenzen wie Sprache und Theme.
                    </p>
                  </div>
                  <Switch 
                    id="functional" 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => setPreferences(p => ({ ...p, functional: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics" className="font-medium">Analyse-Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Helfen uns zu verstehen, wie Besucher die Website nutzen.
                    </p>
                  </div>
                  <Switch 
                    id="analytics" 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => setPreferences(p => ({ ...p, analytics: checked }))}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!showDetails ? (
                <>
                  <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                    Alle akzeptieren
                  </Button>
                  <Button variant="outline" onClick={acceptNecessary} className="flex-1 sm:flex-none">
                    Nur notwendige
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDetails(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Einstellungen
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={saveCustom} className="flex-1 sm:flex-none">
                    Auswahl speichern
                  </Button>
                  <Button variant="outline" onClick={acceptAll} className="flex-1 sm:flex-none">
                    Alle akzeptieren
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDetails(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Zurück
                  </Button>
                </>
              )}
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={acceptNecessary}
            className="flex-shrink-0 -mt-2 -mr-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Hook to check cookie preferences
export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        setPreferences(null);
      }
    }
  }, []);

  return preferences;
};
