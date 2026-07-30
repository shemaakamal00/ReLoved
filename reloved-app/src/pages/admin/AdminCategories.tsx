import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/client";
import type { Category } from "../../types";

function AdminCategories() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  function load() {
    fetchCategories().then(setCategories).catch(console.error);
  }

  useEffect(load, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!token || !name.trim()) return;

    try {
      await createCategory(
        name.trim(),
        parentId ? Number(parentId) : null,
        token,
      );
      showToast("Kategorin är skapad!");
      setName("");
      setParentId("");
      load();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte skapa kategorin.", "error");
    }
  }

  async function handleUpdate(id: number) {
    if (!token || !editingName.trim()) return;

    try {
      await updateCategory(id, editingName.trim(), token);
      showToast("Kategorin är uppdaterad!");
      setEditingId(null);
      load();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte uppdatera kategorin.", "error");
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Ta bort den här kategorin?")) return;

    try {
      await deleteCategory(id, token);
      showToast("Kategorin är borttagen.");
      load();
    } catch (err) {
      console.error(err);
      showToast("Kunde inte ta bort kategorin.", "error");
    }
  }

  const topLevel = categories.filter((c) => c.parent_id === null);

  return (
    <details className="admin-section">
      <summary className="admin-section__header">
        <div>
          <p className="eyebrow">Kategorier</p>
          <h2>Hantera kategorier</h2>
        </div>
      </summary>

      <form className="admin-form" onSubmit={handleCreate}>
        <label>
          Namn
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="T.ex. Kavajer"
            required
          />
        </label>

        <label>
          Huvudkategori (lämna tom för ny huvudkategori)
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">Ingen </option>
            {topLevel.map((cat) => (
              <option value={cat.id} key={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <button
          className="button button-primary admin-form__full"
          type="submit"
        >
          Lägg till kategori
        </button>
      </form>

      <div className="admin-table category-table">
        <div className="admin-table__row admin-table__row--head">
          <span>Namn</span>
          <span>Typ</span>
          <span>Åtgärd</span>
        </div>

        {topLevel.map((parent) => (
          <div key={parent.id}>
            <div className="admin-table__row">
              {editingId === parent.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
              ) : (
                <span>{parent.name}</span>
              )}
              <span>Huvudkategori</span>
              <div className="admin-actions">
                {editingId === parent.id ? (
                  <button type="button" onClick={() => handleUpdate(parent.id)}>
                    Spara
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(parent.id);
                      setEditingName(parent.name);
                    }}
                  >
                    Redigera
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(parent.id)}>
                  Ta bort
                </button>
              </div>
            </div>

            {categories
              .filter((c) => c.parent_id === parent.id)
              .map((child) => (
                <div className="admin-table__row" key={child.id}>
                  {editingId === child.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  ) : (
                    <span>— {child.name}</span>
                  )}
                  <span>Underkategori</span>
                  <div className="admin-actions">
                    {editingId === child.id ? (
                      <button
                        type="button"
                        onClick={() => handleUpdate(child.id)}
                      >
                        Spara
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(child.id);
                          setEditingName(child.name);
                        }}
                      >
                        Redigera
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(child.id)}
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </details>
  );
}

export default AdminCategories;
