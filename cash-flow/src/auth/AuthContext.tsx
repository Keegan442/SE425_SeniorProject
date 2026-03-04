import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import * as AuthStore from './authStore';

export interface Session {
  userId: string;
  email: string;
}

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    birthday: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await AuthStore.getSession();
      if (mounted) setSession(s);
      if (mounted) setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const s = await AuthStore.signIn(email, password);
      setSession(s);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    birthday: string
  ) => {
    try {
      const s = await AuthStore.signUp(
        email,
        password,
        username,
        firstName,
        lastName,
        birthday
      );
      setSession(s);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }, []);

  const signOut = useCallback(async () => {
    await AuthStore.signOut();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, signIn, signUp, signOut }),
    [session, isLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
