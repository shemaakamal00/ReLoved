import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../api/client";
import ProductCard from "../components/ProductCard";
import type { SearchResult } from "../types";

const PAGE_SIZE = 12;

type SearchState = {
  key: string;
  result: SearchResult | null;
  error: string | null;
};

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const key = `${q}|${page}`;

  const [state, setState] = useState<SearchState>({
    key: "",
    result: null,
    error: null,
  });
  const loading = state.key !== key;

  useEffect(() => {
    const controller = new AbortController();

    searchProducts({ q, page, pageSize: PAGE_SIZE }, controller.signal)
      .then((result) => setState({ key, result, error: null }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Sökningen misslyckades:", err);
        setState({
          key,
          result: null,
          error:
            "Sökningen kunde inte genomföras just nu. Försök igen om en stund.",
        });
      });
    return () => controller.abort();
  }, [q, page, key]);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = String(
      new FormData(event.currentTarget).get("q") ?? "",
    ).trim();
    setSearchParams(text ? { q: text } : {});
  }

  function goToPage(newPage: number) {
    setSearchParams({ ...(q ? { q } : {}), page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const result = state.result;
  const meta = result?.meta;

  return (
    <main>
      <section className="products-page search-page section">
        <div className="container">
          <div className="products-page__header">
            <p className="eyebrow">Sök</p>
            <h1>{q ? `”${q}”` : "Sök bland produkter"}</h1>
          </div>
          <form className="search-page__form" onSubmit={handleSubmit} key={q}>
            <label className="sr-only" htmlFor="search-page-input">
              Sök på ReLoved
            </label>
            <input
              id="search-page-input"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Sök plagg, märken, kategorier..."
              maxLength={100}
            />
            <button type="submit" className="button button-primary">
              Sök
            </button>
          </form>
          {loading && <p className="search-page__status">Söker...</p>}

          {!loading && state.error && (
            <p className="form-error">{state.error}</p>
          )}

          {!loading && meta && (
            <p className="search-page__status">
              {meta.total === 0
                ? `Inga produkter matchade ${q ? `”${q}”` : "sökningen"}. Kontrollera stavningen eller prova ett annat ord.`
                : `${meta.total} ${meta.total === 1 ? "träff" : "träffar"} · sida ${meta.page} av ${Math.max(meta.totalPages, 1)}`}
            </p>
          )}

          {!loading && result && result.data.length > 0 && (
            <div className="product-grid">
              {result.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {!loading && meta && meta.totalPages > 1 && (
            <nav className="pagination" aria-label="Sidor i sökresultatet">
              <button
                type="button"
                className="button"
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page <= 1}
              >
                ← Föregående
              </button>
              <span>
                Sida {meta.page} av {meta.totalPages}
              </span>
              <button
                type="button"
                className="button"
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
              >
                Nästa →
              </button>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}

export default Search;
