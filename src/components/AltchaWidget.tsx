import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AltchaWidgetProps {
  onVerified: (payload: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface Challenge {
  challenge: string;
  salt: string;
  algorithm: string;
  maxnumber: number;
  signature: string;
}

type WidgetState = 'idle' | 'loading' | 'solving' | 'verified' | 'error';

export const AltchaWidget = ({ onVerified, onError, className }: AltchaWidgetProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<WidgetState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchChallenge = async (): Promise<Challenge> => {
    const response = await fetch(`/api/altcha/challenge`);
    if (!response.ok) {
      throw new Error('Failed to fetch challenge');
    }
    return response.json();
  };

  const solveChallenge = async (challenge: Challenge): Promise<string> => {
    const { salt, algorithm, maxnumber } = challenge;
    const targetHash = challenge.challenge;
    
    // ALTCHA v2 PoW: Find number n where SHA-256(salt + n) === challenge
    for (let i = 0; i <= maxnumber; i++) {
      // Update progress every 2000 iterations for smoother UI
      if (i % 2000 === 0) {
        setProgress(Math.round((i / maxnumber) * 100));
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const data = `${salt}${i}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Check if hash matches the challenge exactly
      if (hashHex === targetHash) {
        // Found solution
        const payload = {
          challenge: targetHash,
          salt,
          number: i,
          algorithm,
        };
        return btoa(JSON.stringify(payload));
      }
    }
    
    throw new Error('Could not solve challenge');
  };

  const startVerification = useCallback(async () => {
    if (state === 'loading' || state === 'solving' || state === 'verified') return;

    setState('loading');
    setProgress(0);
    setErrorMessage(null);

    try {
      const challenge = await fetchChallenge();
      setState('solving');
      
      const payload = await solveChallenge(challenge);
      
      setState('verified');
      setProgress(100);
      onVerified(payload);
    } catch (error) {
      setState('error');
      const message = error instanceof Error ? error.message : t('auth.captchaError');
      setErrorMessage(message);
      onError?.(message);
    }
  }, [state, onVerified, onError, t]);

  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return t('captcha.clickToVerify', 'Klicken zum Verifizieren');
      case 'loading':
        return t('captcha.loading', 'Challenge wird geladen...');
      case 'solving':
        return t('captcha.verifying', 'Verifizierung läuft...') + ` ${progress}%`;
      case 'verified':
        return t('captcha.verified', 'Verifiziert!');
      case 'error':
        return errorMessage || t('captcha.error', 'Fehler aufgetreten');
    }
  };

  const handleRetry = () => {
    if (state === 'error') {
      setState('idle');
      setErrorMessage(null);
    }
  };

  return (
    <button
      type="button"
      onClick={state === 'error' ? handleRetry : startVerification}
      disabled={state === 'loading' || state === 'solving' || state === 'verified'}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200',
        state === 'idle' && 'border-border bg-muted/50 hover:bg-muted cursor-pointer',
        state === 'loading' && 'border-border bg-muted/50 cursor-wait',
        state === 'solving' && 'border-primary/50 bg-primary/5 cursor-wait',
        state === 'verified' && 'border-green-500 bg-green-500/10 cursor-default',
        state === 'error' && 'border-destructive bg-destructive/10 cursor-pointer hover:bg-destructive/20',
        className
      )}
    >
      <div className="flex-shrink-0">
        {state === 'idle' && (
          <div className="w-6 h-6 rounded border-2 border-muted-foreground/50" />
        )}
        {(state === 'loading' || state === 'solving') && (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        )}
        {state === 'verified' && (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        )}
        {state === 'error' && (
          <Shield className="w-6 h-6 text-destructive" />
        )}
      </div>
      
      <div className="flex-1 text-left">
        <p className={cn(
          'text-sm font-medium',
          state === 'verified' && 'text-green-600 dark:text-green-400',
          state === 'error' && 'text-destructive'
        )}>
          {getStatusText()}
        </p>
        {state === 'solving' && (
          <div className="mt-1 w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {state === 'error' && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('captcha.clickToRetry', 'Klicken zum erneuten Versuch')}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          ALTCHA
        </span>
      </div>
    </button>
  );
};
