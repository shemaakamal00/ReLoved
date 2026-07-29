import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  createProduct,
  updateProduct,
  fetchCategories,
} from "../../api/client";
import type { Category, Product } from "../../types";

interface ProductFormProps {
  editingProduct?: Product | null;
  onSaved?: () => void;
}

function ProductForm({ editingProduct, onSaved }: ProductFormProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) showToast(`Bild vald: ${file.name}`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    setSubmitting(true);
    const formData = new FormData(form);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData, token);
        showToast("Produkten är uppdaterad!");
      } else {
        await createProduct(formData, token);
        showToast("Produkten är sparad!");
        form.reset();
      }
      onSaved?.();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte spara produkten.", "error");
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

      <form
        className="admin-form"
        onSubmit={handleSubmit}
        key={editingProduct?.id ?? "new"}
      >
        <label>
          Produktnamn
          <input
            name="title"
            type="text"
            defaultValue={editingProduct?.name}
            placeholder="Svart skinnjacka"
            required
          />
        </label>

        <label>
          Varumärke
          <input
            name="brand"
            type="text"
            defaultValue={editingProduct?.brand}
            placeholder="Zara"
            required
          />
        </label>

        <label>
          Pris
          <input
            name="price"
            type="number"
            defaultValue={editingProduct?.price}
            placeholder="350"
            required
          />
        </label>

        <label>
          Kategori
          <select
            name="category"
            defaultValue={editingProduct?.category_id ?? undefined}
          >
            {categories
              .filter((cat) => cat.parent_id === null)
              .map((parent) => (
                <optgroup label={parent.name} key={parent.id}>
                  <option value={parent.id}>{parent.name} (alla)</option>
                  {categories
                    .filter((cat) => cat.parent_id === parent.id)
                    .map((child) => (
                      <option value={child.id} key={child.id}>
                        {child.name}
                      </option>
                    ))}
                </optgroup>
              ))}
          </select>
        </label>

        <label>
          Skick
          <select name="condition" defaultValue={editingProduct?.condition}>
            <option>Nyskick</option>
            <option>Mycket bra</option>
            <option>Bra</option>
            <option>Använt</option>
          </select>
        </label>

        <label>
          Storlek
          <input
            name="size"
            type="text"
            defaultValue={editingProduct?.size ?? ""}
            placeholder="M"
          />
        </label>

        <label>
          Färg
          <input
            name="color"
            type="text"
            defaultValue={editingProduct?.color ?? ""}
            placeholder="Svart"
          />
        </label>

        <label className="admin-form__full">
          Material
          <input
            name="material"
            type="text"
            defaultValue={editingProduct?.material ?? ""}
            placeholder="Skinn"
          />
        </label>

        <label className="admin-form__full">
          Produktbild{" "}
          {editingProduct && "(lämna tom för att behålla nuvarande bild)"}
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        <label className="admin-form__full">
          Beskrivning
          <textarea
            name="description"
            defaultValue={editingProduct?.description ?? ""}
            placeholder="Beskriv produkten..."
          ></textarea>
        </label>

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
