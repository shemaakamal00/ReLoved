import { useState, type FormEvent } from "react";
import { fetchOpenIssues, reportIssue } from "../../api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../utils/messages";
import { formatDate } from "../../utils/format";
import PanelSection from "../../components/ui/PanelSection";

// Admin rapporterar ett fel som issues i shoppens repo och kan se de öppna
function IssuesPanel() {
  const { showToast } = useToast();
  const {
    data: issues,
    loading,
    error: listError,
    reload,
  } = useApi((signal) => fetchOpenIssues(signal), []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const issue = await reportIssue(title, description);
      setTitle("");
      setDescription("");
      showToast(`Felrapporten är skickad (#${issue.number}).`);
      reload(); // den nya issuen syns direkt i listan
    } catch (err) {
      setError(errorMessage(err, "Kunde inte skicka felrapporten."));
    } finally {
      setSending(false);
    }
  }

  return (
    <PanelSection variant="admin" eyebrow="Support" title="Rapportera fel">
      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-form__full">
          Rubrik
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="T.ex. Bilden saknas på produktsidan"
            minLength={3}
            maxLength={120}
            required
          />
        </label>

        <label className="admin-form__full">
          Beskrivning
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Vad hände, var hände det och hur kan man upprepa felet?"
            rows={5}
            minLength={10}
            maxLength={5000}
            required
          />
        </label>

        {error && <p className="form-error admin-form__full">{error}</p>}

        <button
          className="button button-primary"
          type="submit"
          disabled={sending}
        >
          {sending ? "Skickar..." : "Skicka felrapport"}
        </button>
      </form>

      <h3 className="issue-list__title">Öppna ärenden</h3>
      {loading && <p>Hämtar ärenden...</p>}
      {listError && <p className="form-error">{listError}</p>}
      {issues && issues.length === 0 && <p>Inga öppna ärenden just nu.</p>}
      {issues && issues.length > 0 && (
        <ul className="issue-list">
          {issues.map((issue) => (
            <li key={issue.number}>
              <a href={issue.url} target="_blank" rel="noopener noreferrer">
                #{issue.number} {issue.title}
              </a>
              <span>{formatDate(issue.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}

export default IssuesPanel;
