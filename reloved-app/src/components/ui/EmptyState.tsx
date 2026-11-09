import type { ReactNode } from "react";

// Tomt läge (inga träffar, tom varukorg, inga favoriter) som tonas in
interface EmptyStateProps {
  icon?: "search" | "heart" | "bag" | "hanger";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  heart: (
    <path d="M12 20s-6.5-4.2-8.5-7.5C1.7 9.6 3 6 6.6 6c2.1 0 3.2 1.2 4 2.3.8-1.1 1.9-2.3 4-2.3C18.2 6 19.5 9.6 17.7 12.5 15.7 15.8 12 20 12 20z" />
  ),
  bag: (
    <>
      <path d="M6 7h12l-1 9H7L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </>
  ),
  hanger: (
    <>
      <path d="M12 8a2 2 0 1 1 2-2c0 1-2 1.5-2 3" />
      <path d="M12 9 3 16h18z" />
    </>
  ),
};

function EmptyState({
  icon = "hanger",
  title,
  children,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state slide-up">
      <span className="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">{ICONS[icon]}</svg>
      </span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
