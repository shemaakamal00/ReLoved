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

export type SearchParams = { q: string; page: number; pageSize: number };

export type SearchResult = {
  data: SearchProduct[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

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
  await adminClient.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        "name",
        "brand",
        "category",
        "color",
        "material",
        "description",
      ],
    },
  });
  return products.length;
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
    indexName: INDEX_NAME,
    searchParams: {
      query: params.q,
      page: params.page - 1,
      hitsPerPage: params.pageSize,
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
  return {
    data,
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  };
}
