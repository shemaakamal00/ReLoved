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

interface SellerFormProps {
  editingProduct?: Product | null;
  onSaved?: () => void;
}

function hasImage(formData: FormData) {
  const file = formData.get("image") as File | null;
  return Boolean(file && file.size > 0);
}

function SellerForm({ editingProduct, onSaved }: SellerFormProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const { categories } = useCategories();
  const handleImageChange = useImageCheck();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!editingProduct && !hasImage(formData)) {
      showToast("Lägg till en bild innan du skickar in.", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateMyListing(token, editingProduct.id, formData);
        showToast("Sparat.");
      } else {
        await submitListing(token, formData);
        showToast("Skickad. Vi granskar annonsen innan den syns.");
        form.reset();
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
        key={editingProduct?.id ?? "new"}
      >
        <ProductFormFields
          variant="seller"
          product={editingProduct}
          categories={categories}
          onImageChange={handleImageChange}
        />

        <button
          className="button button-primary seller-form__full"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Sparar..."
            : editingProduct
              ? "Spara ändringar"
              : "Skicka för granskning"}
        </button>

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
