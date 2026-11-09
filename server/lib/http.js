// Hjälpmedel för HHTP lagret: fel med statuskod, validering och felhanteraren

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

// Validerar input mot ett Zod schema
export function parseOr400(
  schema,
  input,
  fallback = "Ogiltig förfrågan",
  { withDetails = false } = {},
) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const { issues } = result.error;
    const extra = withDetails
      ? { details: issues.map((issue) => issue.message) }
      : {};
    throw new HttpError(400, issues[0]?.message ?? fallback, extra);
  }
  return result.data;
}

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(`${req.method} ${req.originalUrl} misslyckades: ${message}`);
  res.status(500).json({
    error: "Något gick fel hos oss. Försök igen om en stund.",
  });
}
