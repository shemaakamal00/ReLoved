// Texter och felmeddelanden som används

export const SEARCH_INDEX_WARNING =
  "Sparat, men sökningen kunde inte uppdateras. Bygg om sökindexet på adminsidan.";

export function errorMessage(
  err: unknown,
  fallback = "Något gick fel.",
): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
