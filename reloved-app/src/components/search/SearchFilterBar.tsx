import type { FormEvent } from "react";
import type { FacetValue, SearchFilters } from "../../types";

interface SearchFilterBarProps {
  filters: SearchFilters;
  facets: { category: FacetValue[]; condition: FacetValue[] } | null;
  onChange: (changes: Record<string, string>) => void;
  onClear: () => void;
}

const SORT_LABELS: Record<SearchFilters["sort"], string> = {
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
    filters.sort !== "relevance";

  return (
    <div className="search-filters">
      <label>
        Sortera
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
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
          {facetOptions(facets?.condition, filters.condition).map((option) => (
            <option value={option.value} key={option.value}>
              {option.value} ({option.count})
            </option>
          ))}
        </select>
      </label>

      {}
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
  );
}

export default SearchFilterBar;
