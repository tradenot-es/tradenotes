import { useState, useEffect, useCallback } from 'react';
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
  const [state, setState] = useState<WidgetState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const fetchChallenge = async (): Promise<Challenge> => {
    const response = await fetch(`${supabaseUrl}/functions/v1/altcha-challenge?action=create`);
    if (!response.ok) {
      throw new Error('Failed to fetch challenge');
    }
    return response.json();
  };

  const solveChallenge = async (challenge: Challenge): Promise<string> => {
    const { salt, algorithm, maxnumber } = challenge;
    
    // Proof of Work: Find a number that produces a hash starting with challenge prefix
    for (let i = 0; i <= maxnumber; i++) {
      // Update progress every 1000 iterations
      if (i % 1000 === 0) {
        setProgress(Math.round((i / maxnumber) * 100));
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const data = `${salt}${i}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (hashHex.startsWith(challenge.challenge.substring(0, 8))) {
        // Found solution
        const payload = {
          challenge: challenge.challenge,
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
      const message = error instanceof Error ? error.message : 'Verification failed';
      setErrorMessage(message);
      onError?.(message);
    }
  }, [state, onVerified, onError, supabaseUrl]);

  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return 'Klicken zum Verifizieren';
      case 'loading':
        return 'Challenge wird geladen...';
      case 'solving':
        return `Verifizierung läuft... ${progress}%`;
      case 'verified':
        return 'Verifiziert!';
      case 'error':
        return errorMessage || 'Fehler aufgetreten';
    }
  };

  return (
    <button
      type="button"
      onClick={startVerification}
      disabled={state === 'loading' || state === 'solving' || state === 'verified'}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200',
        state === 'idle' && 'border-border bg-muted/50 hover:bg-muted cursor-pointer',
        state === 'loading' && 'border-border bg-muted/50 cursor-wait',
        state === 'solving' && 'border-primary/50 bg-primary/5 cursor-wait',
        state === 'verified' && 'border-green-500 bg-green-500/10 cursor-default',
        state === 'error' && 'border-destructive bg-destructive/10 cursor-pointer',
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
