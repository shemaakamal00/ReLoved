import { useState, type FormEvent } from "react";
import { createCategory, updateCategory, deleteCategory } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useCategories } from "../../hooks/useCategories";
import type { Category } from "../../types";
import PanelSection from "../../components/ui/PanelSection";

function AdminCategories() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const { categories, reload } = useCategories();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  async function change(
    action: () => Promise<unknown>,
    success: string,
    failure: string,
  ) {
    try {
      await action();
      showToast(success);
      reload();
      return true;
    } catch (err) {
      console.error(err);
      showToast(failure, "error");
      return false;
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!token || !name.trim()) return;

    const created = await change(
      () =>
        createCategory(token, name.trim(), parentId ? Number(parentId) : null),
      "Kategorin är skapad!",
      "Kunde inte skapa kategorin.",
    );
    if (created) {
      setName("");
      setParentId("");
    }
  }

  async function handleUpdate(id: number) {
    if (!token || !editingName.trim()) return;

    const updated = await change(
      () => updateCategory(token, id, editingName.trim()),
      "Kategorin är uppdaterad!",
      "Kunde inte uppdatera kategorin.",
    );
    if (updated) setEditingId(null);
  }

  async function handleDelete(id: number) {
    if (!token || !window.confirm("Ta bort den här kategorin?")) return;
    await change(
      () => deleteCategory(token, id),
      "Kategorin är borttagen.",
      "Kunde inte ta bort kategorin.",
    );
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  const topLevel = categories.filter((c) => c.parent_id === null);

  function renderRow(category: Category) {
    return (
      <CategoryRow
        key={category.id}
        category={category}
        editing={editingId === category.id}
        editingName={editingName}
        onEditingNameChange={setEditingName}
        onEdit={() => startEditing(category)}
        onSave={() => handleUpdate(category.id)}
        onDelete={() => handleDelete(category.id)}
      />
    );
  }

  return (
    <PanelSection
      variant="admin"
      eyebrow="Kategorier"
      title="Hantera kategorier"
    >
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
            <option value="">Ingen</option>
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
            {renderRow(parent)}
            {categories.filter((c) => c.parent_id === parent.id).map(renderRow)}
          </div>
        ))}
      </div>
    </PanelSection>
  );
}

interface CategoryRowProps {
  category: Category;
  editing: boolean;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
}

function CategoryRow({
  category,
  editing,
  editingName,
  onEditingNameChange,
  onEdit,
  onSave,
  onDelete,
}: CategoryRowProps) {
  const isChild = category.parent_id !== null;

  return (
    <div className="admin-table__row">
      {editing ? (
        <input
          type="text"
          value={editingName}
          onChange={(e) => onEditingNameChange(e.target.value)}
        />
      ) : (
        <span>{isChild ? `— ${category.name}` : category.name}</span>
      )}
      <span>{isChild ? "Underkategori" : "Huvudkategori"}</span>
      <div className="admin-actions">
        {editing ? (
          <button type="button" onClick={onSave}>
            Spara
          </button>
        ) : (
          <button type="button" onClick={onEdit}>
            Redigera
          </button>
        )}
        <button type="button" onClick={onDelete}>
          Ta bort
        </button>
      </div>
    </div>
  );
}

export default AdminCategories;
