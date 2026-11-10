import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { useReveal } from "../../hooks/useReveal";

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "article" | "section" | "li";
  index?: number;
  children: ReactNode;
}

function Reveal({ as = "div", index = 0, children, ...rest }: RevealProps) {
  const revealProps = useReveal<HTMLElement>(index);
  return createElement(as, { ...rest, ...revealProps }, children);
}

export default Reveal;
