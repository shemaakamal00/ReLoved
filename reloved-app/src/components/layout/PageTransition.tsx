import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// Tonar in varje sida. När adressen byts får wrappern en ny key för att React ska kunna bygga om den

function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="page-transition" key={pathname}>
      {children}
    </div>
  );
}

export default PageTransition;
