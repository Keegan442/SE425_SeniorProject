import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getUserProfile } from '../data/profileStore';
import { formatAmount as formatAmountUtil } from '../utils/currency';

interface CurrencyContextType {
  currency: string;
  formatAmount: (amount: number) => string;
  refreshCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { session } = useAuth();
  const [currency, setCurrency] = useState<string>('USD');

  const refreshCurrency = useCallback(async () => {
    if (!session?.userId) return;
    try {
      const profile = await getUserProfile(session.userId);
      setCurrency(profile.currency ?? 'USD');
    } catch {
      setCurrency('USD');
    }
  }, [session?.userId]);

  useEffect(() => {
    refreshCurrency();
  }, [refreshCurrency]);

  const formatAmount = useCallback(
    (amount: number) => formatAmountUtil(amount, currency),
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, formatAmount, refreshCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
