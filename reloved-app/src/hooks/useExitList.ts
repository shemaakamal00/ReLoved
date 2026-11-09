import { useEffect, useState } from "react";

const EXIT_MS = 300;

interface Entry<T> {
  item: T;
  leaving: boolean;
}

// Håller kvar rader som just tagits bort en kort stund
export function useExitList<T>(
  items: T[],
  getKey: (item: T) => string | number,
): Entry<T>[] {
  const [previous, setPrevious] = useState(items);
  const [leaving, setLeaving] = useState<{ item: T; index: number }[]>([]);

  if (items !== previous) {
    const keys = new Set(items.map(getKey));
    const removed = previous
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !keys.has(getKey(item)));
    setPrevious(items);
    setLeaving((current) => [
      ...current.filter(({ item }) => !keys.has(getKey(item))),
      ...removed,
    ]);
  }

  useEffect(() => {
    if (leaving.length === 0) return;
    const timer = setTimeout(() => setLeaving([]), EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  const result: Entry<T>[] = items.map((item) => ({ item, leaving: false }));
  for (const { item, index } of [...leaving].sort((a, b) => a.index - b.index)) {
    result.splice(Math.min(index, result.length), 0, { item, leaving: true });
  }
  return result;
}
