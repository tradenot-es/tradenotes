import { useState, useEffect } from "react";
import { db } from "@/lib/api";
import { getCurrencySymbol } from "@/lib/utils";

export function useCurrency() {
  const [currency, setCurrency] = useState('USD');
  const [symbol, setSymbol] = useState('$');

  useEffect(() => {
    const loadCurrency = async () => {
      const { data: settings } = await db
        .from('user_settings')
        .select('base_currency')
        .maybeSingle();
      
      if (settings?.base_currency) {
        setCurrency(settings.base_currency);
        setSymbol(getCurrencySymbol(settings.base_currency));
      }
    };
    
    loadCurrency();
  }, []);

  const formatCurrency = (value: number) => {
    return `${symbol}${value.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatCurrencyCompact = (value: number) => {
    return `${symbol}${value.toLocaleString()}`;
  };

  return { currency, symbol, formatCurrency, formatCurrencyCompact };
}
