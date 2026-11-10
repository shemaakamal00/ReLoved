import { useState } from "react";
import { importSupplierCatalog } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { ImportFormat, ImportReport } from "../../types";
import { errorMessage } from "../../utils/messages";
import PanelSection from "../../components/ui/PanelSection";
import StatCards from "../../components/ui/StatCards";

const FORMATS: ImportFormat[] = ["csv", "xml"];

interface SupplierImportProps {
  onImported: () => void;
}

function SupplierImport({ onImported }: SupplierImportProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [running, setRunning] = useState<ImportFormat | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(format: ImportFormat) {
    if (!user) return;
    setRunning(format);
    setError(null);
    setReport(null);
    try {
      const result = await importSupplierCatalog(format);
      setReport(result);
      showToast(`Importen (${format.toUpperCase()}) är klar.`);
      onImported();
    } catch (err) {
      setError(errorMessage(err, "Importen misslyckades"));
    } finally {
      setRunning(null);
    }
  }

  return (
    <PanelSection
      variant="admin"
      eyebrow="Leverantör"
      title="Importera produkter"
      defaultOpen
    >
      <p>
        Här hämtar du leverantörens katalog. Nya artikelnummer skapas,
        befintliga uppdateras och trasiga produkter hoppas över.
      </p>

      <div className="import-actions">
        {FORMATS.map((format) => (
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

          {!report.searchIndexed && (
            <p className="form-error">
              Produkterna sparades, men sökningen kunde inte uppdateras. Bygg om
              sökindexet nedan.
            </p>
          )}

          <StatCards
            variant="admin"
            stats={[
              { label: "Nya", value: report.created },
              { label: "Uppdaterade", value: report.updated },
              { label: "Överhoppade", value: report.skipped.length },
            ]}
          />

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
    </PanelSection>
  );
}

export default SupplierImport;
