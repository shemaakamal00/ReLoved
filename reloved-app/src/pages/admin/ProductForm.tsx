import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { createProduct, fetchCategories } from "../../api/client";
import type { Category } from "../../types";

function ProductForm() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      await createProduct(formData, token);
      setMessage("Produkten är sparad!");
      setIsError(false);
      event.currentTarget.reset();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Kunde inte spara produkten. ",
      );
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div>
          <p className="eyebrow"> Produkt </p>
          <h2> Lägg upp eller redigera produkt </h2>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
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
          Varumärke
          <input name="brand" type="text" placeholder="Zara" required />
        </label>

        <label>
          Pris
          <input name="price" type="number" placeholder="350" required />
        </label>

        <label>
          Kategori
          <select name="category">
            {categories.map((cat) => (
              <option value={cat.id} key={cat.id}>
                {cat.name}
              </option>
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

        <label className="admin-form__full">
          Material
          <input name="material" type="text" placeholder="Skinn" />
        </label>

        <label className="admin-form__full">
          Produktbild
          <input name="image" type="file" accept="image/*" />
        </label>

        <label className="admin-form__full">
          Beskrivning
          <textarea
            name="description"
            placeholder="Beskriv produkten..."
          ></textarea>
        </label>

        {message && (
          <p className={isError ? "form-error" : "form-success"}>{message}</p>
        )}

        <button
          className="button button-primary admin-form__full"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Sparar..." : "Spara produkt"}
        </button>
      </form>
    </section>
  );
}
export default ProductForm;
