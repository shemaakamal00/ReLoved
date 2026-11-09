// Produktens skick

export const CONDITIONS = ["Nyskick", "Mycket bra", "Bra", "Använt"] as const;

const CONDITION_CLASSES: Record<string, string> = {
  Nyskick: "cond-new",
  "Mycket bra": "cond-good",
  Bra: "cond-good",
  Använt: "cond-used",
};

// CSS klassen för skicket
export function conditionClass(condition: string): string {
  return CONDITION_CLASSES[condition] ?? "cond-good";
}
