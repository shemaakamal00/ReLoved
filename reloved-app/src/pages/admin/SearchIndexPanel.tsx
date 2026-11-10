import { useState } from "react";
import { reindexSearch } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../utils/messages";
import PanelSection from "../../components/ui/PanelSection";

function SearchIndexPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReindex() {
    if (!user) return;
    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const { indexed } = await reindexSearch();
      setMessage(`${indexed} produkter finns nu i sökningen.`);
      showToast("Sökindexet är uppdaterat.");
    } catch (err) {
      setError(errorMessage(err, "Kunde inte uppdatera sökindexet."));
    } finally {
      setRunning(false);
    }
  }

  return (
    <PanelSection variant="admin" eyebrow="Sök" title="Sökindex">
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
    </PanelSection>
  );
}

export default SearchIndexPanel;
