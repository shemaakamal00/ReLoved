import { parse } from "csv-parse/sync";
import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";
import { fetchWithRetry } from "../lib/fetchJson.ts";

const BASE_URL =
  process.env.SUPPLIER_API_URL ?? "https://leverantor-api.vercel.app/v1";
const API_KEY = process.env.SUPPLIER_API_KEY ?? "";
const TIMEOUT_MS = Number(process.env.SUPPLIER_API_TIMEOUT_MS ?? 10000);
const BRANSCH = process.env.SUPPLIER_BRANSCH ?? "klader";

const CSV_ENCODING = "windows-1252"; 
const XML_ENCODING = "utf-8";

export type CatalogFormat = "csv" | "xml";

export type ProductCandidate = {
  sku: string;
  ean: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  variants: string[];
};

function parseDecimal(value: unknown): number {
  const text = String(value ?? "")
    .replace(/\s/g, "")
    .replace(",", ".");
  return text === "" ? NaN : Number(text);
}

function parseStock(value: unknown): number {
  const text = String(value ?? "").trim();
  return text === "" ? 0 : Number(text);
}

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

type CsvRow = {
  artNr?: string;
  ean?: string;
  benamning?: string;
  kategori?: string;
  pris?: string;
  lagersaldo?: string;
  varianter?: string;
};

function parseCsvCatalog(bytes: ArrayBuffer): ProductCandidate[] {
  const text = new TextDecoder(CSV_ENCODING).decode(bytes);

  const rows: CsvRow[] = parse(text, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    trim: true,
  });

  return rows.map((row) => ({
    sku: toText(row.artNr),
    ean: toText(row.ean),
    name: toText(row.benamning),
    category: toText(row.kategori),
    price: parseDecimal(row.pris),
    stock: parseStock(row.lagersaldo),
    variants: row.varianter
      ? row.varianter
          .split("|")
          .map((v) => v.trim())
          .filter(Boolean)
      : [],
  }));
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  isArray: (name) => name === "produkt" || name === "variant",
});

type XmlProduct = {
  "@_artNr"?: string;
  ean?: string;
  benamning?: string;
  kategori?: string;
  pris?: string | { "#text"?: string; "@_valuta"?: string };
  lagersaldo?: string;
  varianter?: string | { variant?: string[] };
};

function parseXmlCatalog(bytes: ArrayBuffer): ProductCandidate[] {
  const text = new TextDecoder(XML_ENCODING).decode(bytes);

  try {
    SyntaxValidator.validate(text);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Leverantörens XML-fil är trasig: ${reason}`);
  }

  const doc = xmlParser.parse(text);
  const products: unknown = doc?.katalog?.produkt;
  if (!Array.isArray(products)) {
    throw new Error(
      "Leverantörens XML-fil saknar <katalog> med <produkt>-element",
    );
  }

  return (products as XmlProduct[]).map((p) => {
    const pris = typeof p.pris === "object" ? p.pris["#text"] : p.pris;
    const varianter =
      typeof p.varianter === "object" ? p.varianter.variant : [];

    return {
      sku: toText(p["@_artNr"]),
      ean: toText(p.ean),
      name: toText(p.benamning),
      category: toText(p.kategori),
      price: parseDecimal(pris),
      stock: parseStock(p.lagersaldo),
      variants: (varianter ?? []).map((v) => toText(v)).filter(Boolean),
    };
  });
}

export async function getSupplierCatalog(
  format: CatalogFormat,
): Promise<ProductCandidate[]> {
  const url = `${BASE_URL}/export/products.${format}?bransch=${encodeURIComponent(BRANSCH)}`;

  const response = await fetchWithRetry(url, {
    headers: { "X-Api-Key": API_KEY },
    timeoutMs: TIMEOUT_MS,
  });

  const bytes = await response.arrayBuffer();

  return format === "csv" ? parseCsvCatalog(bytes) : parseXmlCatalog(bytes);
}
