// Felkoder som servern skickar tillbaka istället för en kraschad sida
const GOOGLE_LOGIN_ERRORS: Record<string, string> = {
  google_cancelled:
    "Du avbröt inloggningen med Google. Försök igen när du vill.",
  google_expired:
    "Inloggningen tog för lång tid eller kunde inte kontrolleras. Försök igen.",
  google_failed:
    "Google kunde inte logga in dig just nu. Försök igen om en stund.",
  email_taken:
    "Det finns redan ett ReLoved-konto med den e-postadressen. Logga in med e-post och lösenord i stället.",
  server: "Något gick fel hos oss. Försök igen om en stund.",
};

export function loginErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return GOOGLE_LOGIN_ERRORS[code] ?? GOOGLE_LOGIN_ERRORS.google_failed;
}
