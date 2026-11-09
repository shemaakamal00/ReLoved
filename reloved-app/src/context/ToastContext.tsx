import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
  leaving?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
let idCounter = 0;

const SHOW_MS = 3000;
const LEAVE_MS = 350;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = idCounter++;
      setToasts((prev) => [...prev, { id, message, type }]);

      // Först glider den ut, sedan tas den bort
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
        );
      }, SHOW_MS - LEAVE_MS);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, SHOW_MS);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div
            className={`toast toast--${toast.type} ${toast.leaving ? "is-leaving" : ""}`}
            key={toast.id}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast måste användas inuti en ToastProvider");
  return context;
}
