import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

export interface Drill {
  /** the clicked chart segment label, e.g. "Riyadh" or "Overdue" */
  label: string;
  /** the chart the click came from, used for the filter chip */
  source: string;
}

interface Ctx {
  drill: Drill | null;
  setDrill: (d: Drill | null) => void;
}

const DrillContext = createContext<Ctx | null>(null);

export function DrillProvider({ children }: { children: ReactNode }) {
  const [drill, setDrill] = useState<Drill | null>(null);
  const { pathname } = useLocation();

  // A drill-down filter only belongs to the page it was started on.
  useEffect(() => {
    setDrill(null);
  }, [pathname]);

  const value = useMemo<Ctx>(() => ({ drill, setDrill }), [drill]);
  return <DrillContext.Provider value={value}>{children}</DrillContext.Provider>;
}

export function useDrill(): Ctx {
  return useContext(DrillContext) ?? { drill: null, setDrill: () => {} };
}
