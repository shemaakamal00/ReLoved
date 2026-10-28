import { useState } from "react";
import { reindexSearch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function SearchIndexPanel() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReindex() {
    if (!token) return;
    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const { indexed } = await reindexSearch(token);
      setMessage(`${indexed} produkter finns nu i sökningen.`);
      showToast("Sökindexet är uppdaterat.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunde inte uppdatera sökindexet.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <details className="admin-section">
      <summary className="admin-section__header">
        <div>
          <p className="eyebrow">Sök</p>
          <h2>Sökindex</h2>
        </div>
      </summary>

      <p>
        Sökningen uppdateras automatiskt när produkter sparas. Om du har gjort
        ändringar i produkterna som inte syns i sökningen kan du bygga om
        sökindexet här.
      </p>

      <div className="import-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={handleReindex}
          disabled={running}
        >
          {running ? "Bygger om..." : "Bygg om sökindex"}
        </button>
      </div>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </details>
  );
}

export default SearchIndexPanel;
