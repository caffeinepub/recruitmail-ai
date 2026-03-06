import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_KEY = "recruitmail_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 600));
      const newUser: User = { id: `user_${Date.now()}`, name, email };
      localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (name: string, email: string) => {
      if (!user) return;
      const updated = { ...user, name, email };
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      setUser(updated);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
