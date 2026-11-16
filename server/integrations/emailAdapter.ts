// Enda stället i ReLoved som vet hur Resend fungerar
import { z } from "zod";

const API_URL = "https://api.resend.com/emails";
const API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = process.env.EMAIL_FROM ?? "ReLoved <onboarding@resend.dev>";
const TIMEOUT_MS = Number(process.env.EMAIL_TIMEOUT_MS ?? 5000);

if (!API_KEY) {
  console.warn(
    "[e-post] RESEND_API_KEY saknas: orderbekräftelser skickas inte.",
  );
}

export class EmailError extends Error {}

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idemptencyKey: string;
};

// Resends felkoder för att loggen ska berätta vad som ska åtgärdas
const REASONS: Record<number, string> = {
  401: "fel eller saknad RESEND_API_kEY",
  403: "avsändaren får inte skicka till adressen. onboarding@resend.dev skickar bara till Resend kontots egen e-postadress.",
  409: "ett fält saknas eller är fel",
  429: "för många mejl, eller så är dagens gräns nådd",
};

const SentAnswer = z.object({ id: z.string().min(1) });
const ErrorAnswer = z.object({ message: z.string().optional() });

// Skickar ett mejl och returnerar Resends id mejlat
// https://resend.com/docs/api-reference/emails/send-email
export async function sendEmail(email: Email): Promise<string> {
  if (!API_KEY) throw new EmailError("RESEND_API_KEY saknas på servern");

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.idemptencyKey,
      },
      body: JSON.stringify({
        from: FROM,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "TimeoutError"
        ? "timeout"
        : "nätverksfel";
    throw new EmailError(`Resend svarade inte (${reason})`);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const failure = ErrorAnswer.safeParse(data);
    const detail =
      failure.success && failure.data.message
        ? `: ${failure.data.message}`
        : "";
    const reason = REASONS[response.status] ?? "oväntat fel";
    throw new EmailError(
      `Resend svarade ${response.status}, ${reason}${detail}`,
    );
  }

  const parsed = SentAnswer.safeParse(data);
  if (!parsed.success) throw new EmailError("Resend skickade ett oväntat svar");
  return parsed.data.id;
}
