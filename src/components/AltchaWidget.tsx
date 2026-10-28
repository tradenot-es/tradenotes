import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sha256Hex } from '@/lib/sha256';

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

  const fetchChallenge = async (): Promise<Challenge> => {
    const response = await fetch(`/api/altcha/challenge`);
    if (!response.ok) {
      throw new Error('Failed to fetch challenge');
    }
    return response.json();
  };

  // proof of work: find n with SHA-256(salt + n) === challenge. Plain-JS hashing works in every
  // context (crypto.subtle only exists over HTTPS/localhost) and, being synchronous, is faster
  // than awaiting crypto.subtle for each of up to 100 000 tries.
  const solveChallenge = async (challenge: Challenge): Promise<string> => {
    const { salt, algorithm, maxnumber } = challenge;
    if (algorithm !== 'SHA-256') throw new Error(`unsupported algorithm ${algorithm}`);
    for (let i = 0; i <= maxnumber; i++) {
      // yield every 5000 tries so the page stays responsive
      if (i % 5000 === 0) {
        setProgress(Math.round((i / maxnumber) * 100));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (sha256Hex(`${salt}${i}`) === challenge.challenge) {
        return btoa(JSON.stringify({ challenge: challenge.challenge, salt, number: i, algorithm }));
      }
    }
    throw new Error('Could not solve challenge');
  };

  const startVerification = useCallback(async () => {
    if (state === 'loading' || state === 'solving' || state === 'verified') return;

    setState('loading');
    setProgress(0);

    try {
      const challenge = await fetchChallenge();
      setState('solving');
      
      const payload = await solveChallenge(challenge);
      
      setState('verified');
      setProgress(100);
      onVerified(payload);
    } catch (error) {
      setState('error');
      onError?.(error instanceof Error ? error.message : t('auth.captchaError'));
    }
  }, [state, onVerified, onError, t]);

  // runs by itself as soon as the form is shown; a click is only needed to retry after an error
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startVerification();
  }, [startVerification]);

  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return t('captcha.loading');
      case 'loading':
        return t('captcha.loading');
      case 'solving':
        return `${t('captcha.verifying')} ${progress}%`;
      case 'verified':
        return t('captcha.verified');
      case 'error':
        return t('captcha.clickToRetry');
    }
  };

  const handleRetry = () => {
    if (state === 'error') startVerification();
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
