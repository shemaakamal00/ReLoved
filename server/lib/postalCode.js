import { z } from "zod";

export const PostalCode = z
  .string()
  .transform((value) => value.replace(/\s/g, ""))
  .pipe(
    z
      .string()
      .regex(/^\d{5}$/, "Ange ett postnummer med 5 siffror, t.ex. 111 52"),
  );
