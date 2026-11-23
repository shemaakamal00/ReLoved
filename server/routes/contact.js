//api/contact kontaktformuläret som skickas till shoppens inkorg
import { Router } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import { HttpError, parseOr400 } from "../lib/http.js";
import { sendEmail, EmailError } from "../integrations/emailAdapter.ts";
import { contactMessageEmail } from "../emails/contactMessage.js";

const router = Router();

const CONTACT_TO = process.env.CONTACT_TO ?? "";
if (!CONTACT_TO)
  console.warn("[kontakt] CONTACT_TO saknas: kontaktformuläret fungerar inte.");

const ContactMessage = z.object({
  name: z.string().trim().min(2, "Skriv ditt namn").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Ange en giltig e-postadress")),
  subject: z
    .string()
    .trim()
    .min(3, "Skriv ett ämne")
    .max(120, "Ämnet får vara högst 120 tecken"),
  message: z
    .string()
    .trim()
    .min(10, "Skriv minst 10 tecken")
    .max(5000, "Meddelandet får vara högst 5000 tecken"),
  website: z.string().optional(),
});

router.post("/", async (req, res) => {
  const { website, ...form } = parseOr400(ContactMessage, req.body);

  // En bot fyllde i det dolda fältet. Svara som vanligt, men skicka inget.
  if (website)
    return res
      .status(202)
      .json({ message: "Tack! Vi hör av oss så snart vi kan." });

  if (!CONTACT_TO) {
    throw new HttpError(
      503,
      "Kontaktformuläret fungerar inte just nu. Försök igen senare.",
    );
  }

  // Samma meddelande två gånger, t.ex. ett dubbelklick, ger bara ett mejl
  const fingerprint = createHash("sha256")
    .update(`${form.email}|${form.subject}|${form.message}`)
    .digest("hex")
    .slice(0, 32);

  const { subject, html, text } = contactMessageEmail(form);
  try {
    await sendEmail({
      to: CONTACT_TO,
      replyTo: form.email,
      subject,
      html,
      text,
      idempotencyKey: `contact/${fingerprint}`,
    });
  } catch (err) {
    console.error(`[kontakt] ${err.message}`);
    if (err instanceof EmailError) {
      throw new HttpError(
        502,
        "Meddelandet kunde inte skickas just nu. Försök igen om en stund.",
      );
    }
    throw err;
  }

  console.log("[kontakt] Meddelande skickat");
  res.status(202).json({ message: "Tack! Vi hör av oss så snart vi kan." });
});

export default router;
