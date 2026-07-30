import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  submitListing,
  updateMyListing,
  fetchCategories,
} from "../../api/client";
import type { Category, Product } from "../../types";

interface SellerFormProps {
  editingProduct?: Product | null;
  onSaved?: () => void;
}

function SellerForm({ editingProduct, onSaved }: SellerFormProps) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (editingProduct && detailsRef.current) {
      detailsRef.current.open = true;
    }
  }, [editingProduct]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) showToast(`Bild vald: ${file.name}`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!editingProduct) {
      const imageFile = formData.get("image") as File | null;
      if (!imageFile || imageFile.size === 0) {
        showToast(
          "Du måste ladda upp en bild för att skicka in annonsen.",
          "error",
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateMyListing(editingProduct.id, formData, token);
        showToast("Annonsen är uppdaterad!");
      } else {
        await submitListing(formData, token);
        showToast("Din annons är inskickad och väntar på granskning!");
        form.reset();
      }
      onSaved?.();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte spara annonsen.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <details className="seller-section" ref={detailsRef}>
      <summary className="seller-section__header">
        <div>
          <p className="eyebrow">Produkt</p>
          <h2>Lägg upp ny annons</h2>
        </div>
      </summary>

      <form
        className="seller-form"
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
            defaultValue={
              editingProduct ? String(editingProduct.category_id ?? "") : ""
            }
            required
          >
            <option value="" disabled>
              Välj kategori
            </option>
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
          <select
            name="condition"
            defaultValue={editingProduct?.condition ?? ""}
            required
          >
            <option value="" disabled>
              Välj skick
            </option>
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
            required
          />
        </label>

        <label>
          Färg
          <input
            name="color"
            type="text"
            defaultValue={editingProduct?.color ?? ""}
            placeholder="Svart"
            required
          />
        </label>

        <label>
          Material
          <input
            name="material"
            type="text"
            defaultValue={editingProduct?.material ?? ""}
            placeholder="Skinn"
            required
          />
        </label>

        <label className="upload-box">
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
          <span className="upload-icon">📷</span>
          <strong>
            {editingProduct
              ? "Byt produktbild (valfritt)"
              : "Ladda upp produktbild (obligatoriskt)"}
          </strong>
          <p>JPG, PNG eller WEBP</p>
        </label>

        <label className="seller-form__full">
          Beskrivning
          <textarea
            name="description"
            defaultValue={editingProduct?.description ?? ""}
            placeholder="Beskriv plagget..."
            required
          ></textarea>
        </label>

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
    </details>
  );
}

export default SellerForm;
