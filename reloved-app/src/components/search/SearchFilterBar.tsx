import { useState, type FormEvent } from "react";
import type { FacetValue, SearchFilters } from "../../types";

interface SearchFilterBarProps {
  filters: SearchFilters;
  facets: { category: FacetValue[]; condition: FacetValue[] } | null;
  onChange: (changes: Record<string, string>) => void;
  onClear: () => void;
  sortOptions?: SearchFilters["sort"][];
  defaultSort?: SearchFilters["sort"];
}

// eslint-disable-next-line react-refresh/only-export-components
export const SORT_LABELS: Record<SearchFilters["sort"], string> = {
  relevance: "Mest relevant",
  price_asc: "Lägsta pris",
  price_desc: "Högsta pris",
  newest: "Nyast",
};

function facetOptions(values: FacetValue[] | undefined, selected: string) {
  const options = values ?? [];
  return selected && !options.some((option) => option.value === selected)
    ? [...options, { value: selected, count: 0 }]
    : options;
}

function SearchFilterBar({
  filters,
  facets,
  onChange,
  onClear,
  sortOptions = ["relevance", "price_asc", "price_desc", "newest"],
  defaultSort = "relevance",
}: SearchFilterBarProps) {
  function handlePriceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onChange({
      minPrice: String(data.get("minPrice") ?? "").trim(),
      maxPrice: String(data.get("maxPrice") ?? "").trim(),
    });
  }

  const hasFilters =
    filters.category ||
    filters.condition ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sort !== defaultSort;

  return (
    <>
      <div className="search-filters">
        <label>
          Sortera
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
          >
            {sortOptions.map((value) => (
              <option value={value} key={value}>
                {SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Kategori
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">Alla kategorier</option>
            {facetOptions(facets?.category, filters.category).map((option) => (
              <option value={option.value} key={option.value}>
                {option.value} ({option.count})
              </option>
            ))}
          </select>
        </label>

        <label>
          Skick
          <select
            value={filters.condition}
            onChange={(e) => onChange({ condition: e.target.value })}
          >
            <option value="">Alla</option>
            {facetOptions(facets?.condition, filters.condition).map(
              (option) => (
                <option value={option.value} key={option.value}>
                  {option.value} ({option.count})
                </option>
              ),
            )}
          </select>
        </label>

        <form
          className="search-filters__price"
          onSubmit={handlePriceSubmit}
          key={`${filters.minPrice}-${filters.maxPrice}`}
        >
          <label>
            Pris från
            <input
              name="minPrice"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={filters.minPrice}
              placeholder="0"
            />
          </label>
          <label>
            till
            <input
              name="maxPrice"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={filters.maxPrice}
              placeholder="5000"
            />
          </label>
          <button type="submit" className="button">
            Använd
          </button>
        </form>

        {hasFilters && (
          <button
            type="button"
            className="search-filters__clear"
            onClick={onClear}
          >
            Rensa filter
          </button>
        )}
      </div>

      <ActiveFilterChips filters={filters} onChange={onChange} />
    </>
  );
}

interface Chip {
  id: string;
  label: string;
  clear: Record<string, string>;
}

function activeChips(filters: SearchFilters): Chip[] {
  const chips: Chip[] = [];
  if (filters.category)
    chips.push({
      id: "category",
      label: filters.category,
      clear: { category: "" },
    });
  if (filters.condition)
    chips.push({
      id: "condition",
      label: filters.condition,
      clear: { condition: "" },
    });
  if (filters.minPrice || filters.maxPrice)
    chips.push({
      id: "price",
      label: `${filters.minPrice || 0}–${filters.maxPrice || "∞"} kr`,
      clear: { minPrice: "", maxPrice: "" },
    });
  return chips;
}

const CHIP_EXIT_MS = 200;

// Aktiva filter som små brickor. Ett kryss tar bort filtret efter en kort
// ut-animation.
function ActiveFilterChips({
  filters,
  onChange,
}: Pick<SearchFilterBarProps, "filters" | "onChange">) {
  const [removing, setRemoving] = useState<string | null>(null);
  const chips = activeChips(filters);
  if (chips.length === 0) return null;

  function remove(chip: Chip) {
    setRemoving(chip.id);
    setTimeout(() => {
      setRemoving(null);
      onChange(chip.clear);
    }, CHIP_EXIT_MS);
  }

  return (
    <ul className="filter-chips" aria-label="Aktiva filter">
      {chips.map((chip) => (
        <li
          className={`filter-chip ${removing === chip.id ? "is-removing" : ""}`}
          key={chip.id}
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Ta bort filtret ${chip.label}`}
            onClick={() => remove(chip)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7l10 10M17 7 7 17" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default SearchFilterBar;
