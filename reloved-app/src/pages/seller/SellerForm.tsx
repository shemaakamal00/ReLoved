import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { submitListing, fetchCategories } from "../../api/client";
import type { Category } from "../../types";

function SellerForm() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      showToast(`Bild vald: ${file.name}`);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      await submitListing(formData, token);
      showToast("Din annons är inskickad och väntar på granskning! ");
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte skicka in annonsen.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="seller-section">
      <div className="seller-section__header">
        <div>
          <p className="eyebrow">Produkt</p>
          <h2>Lägg upp ny annons</h2>
        </div>
      </div>

      <form className="seller-form" onSubmit={handleSubmit}>
        <label>
          Produktnamn
          <input
            name="title"
            type="text"
            placeholder="Svart skinnjacka"
            required
          />
        </label>

        <label>
          Pris
          <input name="price" type="number" placeholder="350" required />
        </label>

        <label>
          Kategori
          <select name="category">
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
          <select name="condition">
            <option>Nyskick</option>
            <option>Mycket bra</option>
            <option>Bra</option>
            <option>Använt</option>
          </select>
        </label>

        <label>
          Storlek
          <input name="size" type="text" placeholder="M" />
        </label>

        <label>
          Färg
          <input name="color" type="text" placeholder="Svart" />
        </label>

        <label>
          Material
          <input name="material" type="text" placeholder="Skinn" />
        </label>

        <label className="upload-box">
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <span className="upload-icon">📷</span>
          <strong>Ladda upp produktbild</strong>
          <p>JPG, PNG eller WEBP</p>
        </label>

        <label className="seller-form__full">
          Beskrivning
          <textarea
            name="description"
            placeholder="Beskriv plagget..."
          ></textarea>
        </label>

        <button
          className="button button-primary seller-form__full"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Skickar in..." : "Skicka för granskning"}
        </button>
      </form>
    </section>
  );
}

export default SellerForm;
