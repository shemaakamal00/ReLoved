import { createContext, useContext, useState, type ReactNode } from "react";
import { loginUser, registerUser } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_KEY = "reloved-auth";

function loadStoredAuth(): { user: User; token: string } | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    () => loadStoredAuth()?.user ?? null,
  );
  const [token, setToken] = useState<string | null>(
    () => loadStoredAuth()?.token ?? null,
  );

  function persist(newUser: User, newToken: string) {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ user: newUser, token: newToken }),
    );
    setUser(newUser);
    setToken(newToken);
  }

  async function login(email: string, password: string) {
    const { user, token } = await loginUser(email, password);
    persist(user, token);
  }

  async function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const { user, token } = await registerUser(
      firstName,
      lastName,
      email,
      password,
    );
    persist(user, token);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth måste användas inuti en AuthProvider");
  }
  return context;
}
