import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const TOKEN_KEY = "noteflow.access_token";

type AuthContextValue = {
  ready: boolean;
  token: string | null;
  sessionExpired: boolean;
  signIn: (accessToken: string) => void;
  signOut: (expired?: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setToken(window.sessionStorage.getItem(TOKEN_KEY));
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      token,
      sessionExpired,
      signIn: (accessToken) => {
        window.sessionStorage.setItem(TOKEN_KEY, accessToken);
        setToken(accessToken);
        setSessionExpired(false);
      },
      signOut: (expired = false) => {
        window.sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setSessionExpired(expired);
      },
    }),
    [ready, token, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is required");
  return context;
}
