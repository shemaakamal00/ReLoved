// Felkoder som servern skickar tillbaka istället för en kraschad sida
const LOGIN_ERRORS: Record<string, string> = {
  // För Google kunder
  google_cancelled:
    "Du avbröt inloggningen med Google. Försök igen när du vill.",
  google_expired:
    "Inloggningen tog för lång tid eller kunde inte kontrolleras. Försök igen.",
  google_failed:
    "Google kunde inte logga in dig just nu. Försök igen om en stund.",
  email_taken:
    "Det finns redan ett ReLoved-konto med den e-postadressen. Logga in med e-post och lösenord i stället.",

  // För GitHub kunder
  github_cancelled:
    "Du avbröt inloggningen med GitHub. Försök igen när du vill.",
  github_expired:
    "Inloggningen tog för lång tid eller kunde inte kontrolleras. Försök igen.",
  github_failed:
    "GitHub kunde inte logga inn dig just nu. Försök igen om en stund.",
  not_admin:
    "Ditt GitHub-konto har inte behörighet till administratörspanelen. Kontakta shoppens administratör om du ska vara admin.",

  server: "Något gick fel hos oss. Försök igen om en stund.",
};

const UNKOWN_ERROR = "Inloggningen misslyckades. Försök igen senare.";

export function loginErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return LOGIN_ERRORS[code] ?? UNKOWN_ERROR;
}
