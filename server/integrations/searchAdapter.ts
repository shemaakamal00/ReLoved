import { algoliasearch } from "algoliasearch";
import { z } from "zod";

const APP_ID = process.env.ALGOLIA_APP_ID ?? "";
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY ?? "";
const SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY ?? "";
const INDEX_NAME = process.env.ALGOLIA_INDEX ?? "reloved_products";

const TIMEOUTS = { connect: 2000, read: 5000, write: 10000 };

const adminClient = algoliasearch(APP_ID, ADMIN_KEY, { timeouts: TIMEOUTS });
const searchClient = algoliasearch(APP_ID, SEARCH_KEY, { timeouts: TIMEOUTS });

export type ProductRow = {
  id: number;
  sku: string | null;
  name: string;
  brand: string;
  description: string | null;
  price: number;
  size: string | null;
  condition: string;
  color: string | null;
  material: string | null;
  image_url: string | null;
  alt_text: string | null;
  seller_name: string | null;
  stock: number | null;
  variants: string[] | null;
  category_id: number | null;
  created_at: string;
  categories?: { name: string } | null;
};

export type SearchProduct = {
  id: number;
  sku: string | null;
  name: string;
  brand: string;
  description: string | null;
  price: number;
  size: string | null;
  condition: string;
  color: string | null;
  material: string | null;
  image_url: string | null;
  alt_text: string | null;
  seller_name: string | null;
  stock: number | null;
  variants: string[];
  category_id: number | null;
  category: string | null;
  created_at: string;
};

export type SearchSort = "relevance" | "price_asc" | "price_desc" | "newest";

export type SearchParams = {
  q: string;
  page: number;
  pageSize: number;
  sort: SearchSort;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type FacetValue = { value: string; count: number };

export type SearchResult = {
  data: SearchProduct[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
  facets: { category: FacetValue[]; condition: FacetValue[] };
};

const SORT_INDEX: Record<SearchSort, string> = {
  relevance: INDEX_NAME,
  price_asc: `${INDEX_NAME}_price_asc`,
  price_desc: `${INDEX_NAME}_price_desc`,
  newest: `${INDEX_NAME}_newest`,
};

const SORT_RANKING: Record<Exclude<SearchSort, "relevance">, string> = {
  price_asc: "asc(price)",
  price_desc: "desc(price)",
  newest: "desc(id)",
};
const DEFAULT_RANKING = [
  "typo",
  "geo",
  "words",
  "filters",
  "proximity",
  "attribute",
  "exact",
  "custom",
];
const SEARCHABLE = [
  "name",
  "brand",
  "category",
  "color",
  "material",
  "description",
];
const FACETS = ["category", "condition"];

export function toObjectId(product: {
  id: number;
  sku: string | null;
}): string {
  return product.sku ?? `RL-${product.id}`;
}

function toRecord(product: ProductRow) {
  return {
    objectID: toObjectId(product),
    id: product.id,
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    category: product.categories?.name ?? null,
    category_id: product.category_id,
    description: product.description,
    price: product.price,
    size: product.size,
    condition: product.condition,
    color: product.color,
    material: product.material,
    image_url: product.image_url,
    alt_text: product.alt_text,
    seller_name: product.seller_name,
    stock: product.stock,
    variants: product.variants ?? [],
    created_at: product.created_at,
  };
}

export async function indexProducts(products: ProductRow[]): Promise<number> {
  if (products.length === 0) return 0;
  await adminClient.saveObjects({
    indexName: INDEX_NAME,
    objects: products.map(toRecord),
    waitForTasks: true,
  });
  return products.length;
}

export async function removeProducts(
  products: { id: number; sku: string | null }[],
): Promise<number> {
  if (products.length === 0) return 0;
  await adminClient.deleteObjects({
    indexName: INDEX_NAME,
    objectIDs: products.map(toObjectId),
    waitForTasks: true,
  });
  return products.length;
}

export async function replaceAllProducts(
  products: ProductRow[],
): Promise<number> {
  await adminClient.replaceAllObjects({
    indexName: INDEX_NAME,
    objects: products.map(toRecord),
  });
  await configureIndex();
  return products.length;
}

export async function configureIndex(): Promise<void> {
  const { taskID } = await adminClient.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: SEARCHABLE,
      attributesForFaceting: FACETS,
      replicas: Object.keys(SORT_RANKING).map(
        (sort) => SORT_INDEX[sort as SearchSort],
      ),
    },
  });
  await adminClient.waitForTask({ indexName: INDEX_NAME, taskID });

  for (const [sort, ranking] of Object.entries(SORT_RANKING)) {
    const indexName = SORT_INDEX[sort as SearchSort];
    const task = await adminClient.setSettings({
      indexName,
      indexSettings: {
        searchableAttributes: SEARCHABLE,
        attributesForFaceting: FACETS,
        ranking: [ranking, ...DEFAULT_RANKING],
      },
    });
    await adminClient.waitForTask({ indexName, taskID: task.taskID });
  }
}

function quoted(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function buildFilters(params: SearchParams): string {
  const filters: string[] = [];
  if (params.category) filters.push(`category:${quoted(params.category)}`);
  if (params.condition) filters.push(`condition:${quoted(params.condition)}`);
  if (params.minPrice !== undefined)
    filters.push(`price >= ${params.minPrice}`);
  if (params.maxPrice !== undefined)
    filters.push(`price <= ${params.maxPrice}`);
  return filters.join(" AND ");
}

const FacetCounts = z.record(z.string(), z.number().int()).default({});

function toFacetValues(counts: Record<string, number>): FacetValue[] {
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, "sv"));
}

const AlgoliaHit = z.object({
  objectID: z.string(),
  id: z.number().int(),
  sku: z.string().nullable().default(null),
  name: z.string(),
  brand: z.string(),
  category: z.string().nullable().default(null),
  category_id: z.number().int().nullable().default(null),
  description: z.string().nullable().default(null),
  price: z.number().nonnegative(),
  size: z.string().nullable().default(null),
  condition: z.string(),
  color: z.string().nullable().default(null),
  material: z.string().nullable().default(null),
  image_url: z.string().nullable().default(null),
  alt_text: z.string().nullable().default(null),
  seller_name: z.string().nullable().default(null),
  stock: z.number().int().nullable().default(null),
  variants: z.array(z.string()).default([]),
  created_at: z.string(),
});

export async function searchProducts(
  params: SearchParams,
): Promise<SearchResult> {
  const response = await searchClient.searchSingleIndex({
    indexName: SORT_INDEX[params.sort],
    searchParams: {
      query: params.q,
      page: params.page - 1,
      hitsPerPage: params.pageSize,
      filters: buildFilters(params),
      facets: ["category", "condition"],
    },
  });

  const data: SearchProduct[] = [];
  for (const hit of response.hits) {
    const parsed = AlgoliaHit.safeParse(hit);
    if (!parsed.success) {
      console.warn(
        `Hoppar över sökträff ${hit.objectID}: ${z.prettifyError(parsed.error)}`,
      );
      continue;
    }
    const { objectID, ...product } = parsed.data;
    data.push(product);
  }
  const total = response.nbHits ?? 0;
  const facets = response.facets ?? {};
  return {
    data,
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    },
    facets: {
      category: toFacetValues(
        FacetCounts.safeParse(facets.category).data ?? {},
      ),
      condition: toFacetValues(
        FacetCounts.safeParse(facets.condition).data ?? {},
      ),
    },
  };
}
