import { useEffect, useState, type CSSProperties } from "react";

const STAGGER_MS = 80;
const STAGGER_GROUP = 4;

const canObserve = () => typeof IntersectionObserver !== "undefined";

export function useReveal<T extends HTMLElement>(index = 0) {
  const [element, setElement] = useState<T | null>(null);
  const [visible, setVisible] = useState(() => !canObserve());

  useEffect(() => {
    if (!element || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, visible]);
  return {
    ref: setElement,
    "data-revealed": visible ? "true" : "false",
    style: {
      "--reveal-delay": `${(index % STAGGER_GROUP) * STAGGER_MS}ms`,
    } as CSSProperties,
  };
}
