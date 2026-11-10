import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { submitListing, updateMyListing } from "../../api";
import type { Product } from "../../types";
import { useCategories } from "../../hooks/useCategories";
import { useImageCheck } from "../../hooks/useImageCheck";
import { errorMessage } from "../../utils/messages";
import PanelSection from "../../components/ui/PanelSection";
import ProductFormFields from "../../components/product/ProductFormFields";
import FormMessage from "../../components/ui/FormMessage";
import Spinner from "../../components/ui/Spinner";

interface SellerFormProps {
  editingProduct?: Product | null;
  onSaved?: () => void;
}

function hasImage(formData: FormData) {
  const file = formData.get("image") as File | null;
  return Boolean(file && file.size > 0);
}

function SellerForm({ editingProduct, onSaved }: SellerFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { categories } = useCategories();
  const handleImageChange = useImageCheck();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSuccess(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!editingProduct && !hasImage(formData)) {
      showToast("Lägg till en bild innan du skickar in.", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateMyListing(editingProduct.id, formData);
        showToast("Sparat.");
      } else {
        await submitListing(formData);
        setSuccess(
          "Annonsen är skickad! Vi granskar den, oftast inom ett dygn, och sedan syns den i butiken.",
        );
        setFormKey((key) => key + 1);
      }
      onSaved?.();
    } catch (err) {
      console.error(err);
      showToast(errorMessage(err, "Kunde inte spara produkten."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PanelSection
      variant="seller"
      eyebrow="Produkt"
      title="Ny annons"
      forceOpen={Boolean(editingProduct)}
    >
      {}
      <form
        className="seller-form"
        onSubmit={handleSubmit}
        key={editingProduct?.id ?? `new-${formKey}`}
      >
        <ProductFormFields
          variant="seller"
          product={editingProduct}
          categories={categories}
          onImageChange={handleImageChange}
        />

        <div className="seller-form__full form-actions">
          <FormMessage message={success} type="success" />
          {/* Rörlig rand medan bilden laddas upp */}
          {submitting && (
            <div
              className="upload-progress"
              role="progressbar"
              aria-label="Laddar upp"
            >
              <span />
            </div>
          )}
          <button
            className="button button-primary"
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting && <Spinner />}
            {submitting
              ? "Sparar..."
              : editingProduct
                ? "Spara ändringar"
                : "Skicka för granskning"}
          </button>
        </div>

        {editingProduct && (
          <button
            type="button"
            className="button button-secondary seller-form__full"
            onClick={onSaved}
          >
            Avbryt
          </button>
        )}
      </form>
    </PanelSection>
  );
}

export default SellerForm;
