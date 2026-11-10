import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createProduct, updateProduct } from "../../api";
import type { Product } from "../../types";
import { useCategories } from "../../hooks/useCategories";
import { useImageCheck } from "../../hooks/useImageCheck";
import { errorMessage, SEARCH_INDEX_WARNING } from "../../utils/messages";
import ProductFormFields from "../../components/product/ProductFormFields";

interface ProductFormProps {
  editingProduct?: Product | null;
  onSaved?: () => void;
}

function ProductForm({ editingProduct, onSaved }: ProductFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { categories } = useCategories();
  const handleImageChange = useImageCheck();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);

    try {
      const saved = editingProduct
        ? await updateProduct(editingProduct.id, formData)
        : await createProduct(formData);

      if (saved.searchIndexed === false) {
        showToast(SEARCH_INDEX_WARNING, "error");
      } else {
        showToast(
          editingProduct ? "Produkten är uppdaterad!" : "Produkten är sparad!",
        );
      }
      if (!editingProduct) form.reset();
      onSaved?.();
    } catch (err) {
      console.error(err);
      showToast(errorMessage(err, "Kunde inte spara produkten."), "error");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="eyebrow">Produkt</p>
          <h2>
            {editingProduct
              ? `Redigera: ${editingProduct.name}`
              : "Lägg upp eller redigera produkt"}
          </h2>
        </div>
      </div>
      {}
      <form
        className="admin-form"
        onSubmit={handleSubmit}
        key={editingProduct?.id ?? "new"}
      >
        <ProductFormFields
          variant="admin"
          product={editingProduct}
          categories={categories}
          onImageChange={handleImageChange}
        />

        <button
          className="button button-primary admin-form__full"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Sparar..."
            : editingProduct
              ? "Spara ändringar"
              : "Spara produkt"}
        </button>

        {editingProduct && (
          <button
            type="button"
            className="button button-secondary admin-form__full"
            onClick={onSaved}
          >
            Avbryt
          </button>
        )}
      </form>
    </section>
  );
}

export default ProductForm;
