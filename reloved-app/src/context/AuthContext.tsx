import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchCurrentUser, loginUser, logoutUser, registerUser } from "../api";
import { UNAUTHORIZED_EVENT } from "../api/http";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

//Inloggningen är en httpOnly cookie, eftersom JS inte kan läsa den så frågar React servern vem som är inloggad
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchCurrentUser(controller.signal)
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => !controller.signal.aborted && setLoading(false));

    // Om cookien går ut och servern svarar 401, logga ut React också
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      controller.abort();
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, []);

  async function login(email: string, password: string) {
    const { user } = await loginUser(email, password);
    setUser(user);
  }

  async function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const { user } = await registerUser(firstName, lastName, email, password);
    setUser(user);
  }

  async function logout() {
    // Servern tar bort cookien. Även om det misslyckas
    await logoutUser().catch((err) => console.error("Utloggning:", err));
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
