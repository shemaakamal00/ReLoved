//api/admin/issues är där admin rapporterar felen och ser de öppna issues
import { Router } from "express";
import { z } from "zod";
import { adminOnly } from "../middleware/auth.js";
import { HttpError, parseOr400 } from "../lib/http.js";
import { listOpenIssues, GitHubError } from "../integrations/githubAdapter.ts";
import { reportIssue } from "../services/issues.js";

const router = Router();
router.use(adminOnly);

const NewIssue = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Rubriken behöver minst 3 tecken")
    .max(120, "Rubriken får vara högst 120 tecken"),
  description: z
    .string()
    .trim()
    .min(10, "Beskriv felet med minst 10 tecken")
    .max(5000, "Beskrivningen får vara högst 5000 tecken"),
});

// Felen från GitHib blir 502 med ett meddelande
function gitHubFailed(err) {
  return err instanceof GitHubError ? new HttpError(502, err.message) : err;
}

router.get("/", async (req, res) => {
  try {
    res.json(await listOpenIssues());
  } catch (err) {
    throw gitHubFailed(err);
  }
});

router.post("/", async (req, res) => {
  const input = parseOr400(NewIssue, req.body, "Ogiltig felrapport");
  try {
    const issue = await reportIssue(req.user.userId, input);
    console.log(
      `[github] Issue #${issue.number} skapad av admin ${req.user.userId}`,
    );
    res.status(201).json(issue);
  } catch (err) {
    throw gitHubFailed(err);
  }
});

export default router;
