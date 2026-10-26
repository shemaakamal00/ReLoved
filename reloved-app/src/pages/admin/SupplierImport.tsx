import { importSupplierCatalog } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import type { ImportFormat, ImportReport } from "../../types";

interface SupplierImportProps {
  onImported: () => void;
}

function SupplierImport({ onImported }: SupplierImportProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [running, setRunning] = useState<ImportFormat | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(format: ImportFormat) {
    if (!token) return;
    setRunning(format);
    setError(null);
    setReport(null);
    try {
      const result = await importSupplierCatalog(format, token);
      setReport(result);
      showToast(`Importen (${format.toUpperCase()}) är klar.`);
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Importen misslyckades");
    } finally {
      setRunning(null);
    }
  }

  return (
    <details className="admin-section" open>
      <summary className="admin-section__header">
        <div>
          <p className="eyebrow">Leverantör</p>
          <h2>Importera produkter</h2>
        </div>
      </summary>

      <p>
        Här hämtar du leverantörens katalog. Nya artikelnummer skapas, befintliga
        uppdateras och trasiga produkter hoppas över.
      </p>

      <div className="import_action">
        {(["csv", "xml"] as const).map((format) => (
          <button
            key={format}
            type="button"
            className="button button-primary"
            onClick={() => handleImport(format)}
            disabled={running !== null}
          >
            {running === format
              ? "Importerar..."
              : `Importera ${format.toUpperCase()}`}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      {report && (
        <div className="import-report">
          <p className="import-report__summary">
            {report.format.toUpperCase()}: {report.total} produkter i filen
          </p>

          <div className="admin-stats">
            <article className="admin-stat-card">
              <span>Nya</span>
              <strong>{report.created}</strong>
            </article>
            <article className="admin-stat-card">
              <span>Uppdaterade</span>
              <strong>{report.updated}</strong>
            </article>
            <article className="admin-stat-card">
              <span>Överhoppade</span>
              <strong>{report.skipped.length}</strong>
            </article>
          </div>

          {report.skipped.length > 0 && (
            <div className="admin-table import-skipped">
              <div className="admin-table__row admin-table__row--head">
                <span>Artikelnr</span>
                <span>Produkt</span>
                <span>Orsak</span>
              </div>
              {report.skipped.map((item, index) => (
                <div className="admin-table__row" key={`${item.sku}-${index}`}>
                  <span>{item.sku ?? "–"}</span>
                  <span>{item.name || "–"}</span>
                  <span className="import-skipped__reason">{item.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </details>
  );
}

export default SupplierImport;
