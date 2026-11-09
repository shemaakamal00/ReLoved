import { fetchCategories } from "../api";
import { useApi } from "./useApi";

export function useCategories() {
  const { data, reload } = useApi((signal) => fetchCategories(signal), []);
  return { categories: data ?? [], reload };
}
