import type { Category } from "../../types";

function CategoryOptions({ categories }: { categories: Category[] }) {
  const parents = categories.filter((cat) => cat.parent_id === null);

  return parents.map((parent) => (
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
  ));
}

export default CategoryOptions;
