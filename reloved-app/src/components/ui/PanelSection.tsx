import { useEffect, useRef, type ReactNode } from "react";

interface PanelSectionProps {
  variant: "admin" | "seller";
  eyebrow: string;
  title: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: ReactNode;
}

function PanelSection({
  variant,
  eyebrow,
  title,
  defaultOpen,
  forceOpen,
  children,
}: PanelSectionProps) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (forceOpen && ref.current) ref.current.open = true;
  }, [forceOpen]);

  return (
    <details className={`${variant}-section`} ref={ref} open={defaultOpen}>
      <summary className={`${variant}-section__header`}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </summary>
      {children}
    </details>
  );
}

export default PanelSection;
