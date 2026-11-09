import { useEffect, useEffectEvent, useState } from "react";
import { errorMessage } from "../utils/messages";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: (data: T) => void;
}

export function useApi<T>(
  load: (singal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
  { enabled = true }: { enabled?: boolean } = {},
): ApiState<T> {
  const [version, setVersion] = useState(0);
  const key = JSON.stringify([...deps, version, enabled]);
  const [result, setResult] = useState<{
    key: string | null;
    data: T | null;
    error: string | null;
  }>({ key: null, data: null, error: null });

  const run = useEffectEvent((signal: AbortSignal) => load(signal));

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    run(controller.signal)
      .then((data) => setResult({ key, data, error: null }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setResult({
          key,
          data: null,
          error: errorMessage(err, "Kunde inte hämta data."),
        });
      });
    return () => controller.abort();
  }, [key, enabled]);

  return {
    data: result.data,
    loading: enabled && result.key !== key,
    error: result.key === key ? result.error : null,
    reload: () => setVersion((v) => v + 1),
    setData: (data) => setResult((prev) => ({ ...prev, data })),
  };
}
