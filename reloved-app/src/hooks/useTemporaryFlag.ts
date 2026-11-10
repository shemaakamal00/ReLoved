import { useEffect, useState } from "react";

export function useTemporaryFlag(durationMs = 1600) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const timer = setTimeout(() => setOn(false), durationMs);
    return () => clearTimeout(timer);
  }, [on, durationMs]);

  return [on, () => setOn(true)] as const;
}
