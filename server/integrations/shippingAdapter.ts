import { z } from "zod";

const API_KEY = process.env.POSTNORD_API_KEY ?? "";
const BASE_URL = process.env.POSTNORD_API_URL ?? "https://atapi2.postnord.com";
const TIMEOUT_MS = Number(process.env.POSTNORD_TIMEOUT_MS ?? 5000);
const SHOP_POSTAL_CODE = process.env.SHOP_POSTAL_CODE ?? "11152";
const SHOP_CITY = process.env.SHOP_CITY ?? "Stockholm";
const SHOP_STREET = process.env.SHOP_STREET ?? "Vasagatan 10";
const SHOP_ORDER_CUTOFF = process.env.SHOP_ORDER_CUTOFF ?? "15:00";
const CUSTOMER_KEY = process.env.POSTNORD_CUSTOMER_KEY ?? "ReLoved";

if (!API_KEY) {
  console.warn(
    "[postnord] POSTNORD_API_KEY saknas: ombud och leveranstid fungerar inte, hemleverans gör det.",
  );
}

export class PostNordInputError extends Error {}

async function callPostNord(
  path: string,
  { params = {}, body }: { params?: Record<string, string>; body?: unknown },
  label: string,
) {
  if (!API_KEY)
    throw new Error("PostNord är inte konfigurerat (POSTNORD_API_KEY saknas)");

  const query = new URLSearchParams({ ...params, apikey: API_KEY });
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}?${query}`, {
      method: body ? "POST" : "GET",
      headers: body
        ? { "Content-Type": "application/json", Accept: "application/json" }
        : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "TimeoutError"
        ? `timeout efter ${TIMEOUT_MS} ms`
        : "nätverksfel";
    throw new Error(`PostNord ${label}: ${reason}`);
  }
  if (!response.ok) {
    const explanation = (await response.text().catch(() => "")).slice(0, 300);
    const ErrorType = response.status === 400 ? PostNordInputError : Error;
    throw new ErrorType(
      `PostNord ${label}: status ${response.status} ${explanation}`,
    );
  }
  return response.json();
}

const ServicePointsAnswer = z.object({
  servicePointInformationResponse: z.object({
    servicePoints: z
      .array(
        z.object({
          servicePointId: z.string().min(1),
          name: z.string().min(1),
          routeDistance: z.number().optional(),
          visitingAddress: z.object({
            streetName: z.string(),
            streetNumber: z.string().optional(),
            postalCode: z.string(),
            city: z.string(),
          }),
        }),
      )
      .default([]),
  }),
});

export type ServicePoint = {
  id: string;
  name: string;
  address: string;
  distanceMeters: number | null;
};

function titleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[\s-])(\p{L})/gu,
      (_, sep, letter) => sep + letter.toUpperCase(),
    );
}

export async function findServicePoints(
  postalCode: string,
): Promise<ServicePoint[]> {
  const data = await callPostNord(
    "/rest/businesslocation/v5/servicepoints/nearest/byaddress",
    {
      params: {
        returnType: "json",
        countryCode: "SE",
        postalCode,
        numberOfServicePoints: "5",
      },
    },
    "ombud",
  );

  const parsed = ServicePointsAnswer.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `PostNord ombud: oväntat svar\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data.servicePointInformationResponse.servicePoints.map(
    (point) => {
      const street = [
        point.visitingAddress.streetName,
        point.visitingAddress.streetNumber,
      ]
        .filter(Boolean)
        .join(" ");
      return {
        id: point.servicePointId,
        name: titleCase(point.name),
        address: `${titleCase(street)}, ${point.visitingAddress.postalCode} ${titleCase(point.visitingAddress.city)}`,
        distanceMeters: point.routeDistance ?? null,
      };
    },
  );
}

const DeliveryTime = z.object({
  date: z.object({ latest: z.string().min(10) }).optional(),
  dayRange: z.object({ days: z.string() }).optional(),
});

const DeliveryOptionsAnswer = z.object({
  warehouseToDeliveryOptions: z
    .array(
      z.object({
        deliveryOptions: z.array(
          z.object({
            type: z.string(),
            defaultOption: z.object({ deliveryTime: DeliveryTime }).optional(),
          }),
        ),
      }),
    )
    .min(1),
});

export type ShippingMethod = "service_point" | "home";
const POSTNORD_TYPES: Record<ShippingMethod, string> = {
  service_point: "service-point",
  home: "home",
};

export type DeliveryEstimates = Record<ShippingMethod, string | null>;

function swedishDateAndOffset(date = new Date()) {
  const day = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
  }).format(date);
  const zone = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Stockholm",
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;
  return { day, offset: zone?.replace("GMT", "") || "+01:00" };
}

function addBusinessDays(from: string, days: number): string {
  const date = new Date(`${from}T12:00:00Z`);
  let left = days;
  while (left > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) left--;
  }
  return date.toISOString().slice(0, 10);
}

function toDate(
  time: z.infer<typeof DeliveryTime>,
  today: string,
): string | null {
  if (time.date) return time.date.latest.slice(0, 10);
  const maxDays = Number(time.dayRange?.days.split("-").pop());
  return Number.isInteger(maxDays) ? addBusinessDays(today, maxDays) : null;
}

export async function estimateDelivery(
  toPostalCode: string,
): Promise<DeliveryEstimates> {
  const { day, offset } = swedishDateAndOffset();

  const data = await callPostNord(
    "/rest/shipment/v1/deliveryoptions/bywarehouse",
    {
      body: {
        warehouses: [
          {
            id: "reloved",
            address: {
              street: SHOP_STREET,
              postCode: SHOP_POSTAL_CODE,
              city: SHOP_CITY,
              countryCode: "SE",
            },
            orderHandling: {
              timeOfLatestOrder: `${day}T${SHOP_ORDER_CUTOFF}:00${offset}`,
            },
          },
        ],
        customer: { customerKey: CUSTOMER_KEY },
        recipient: { address: { postCode: toPostalCode, countryCode: "SE" } },
        filter: { deliveryTypes: Object.values(POSTNORD_TYPES) },
      },
    },
    "leveranstid",
  );

  const parsed = DeliveryOptionsAnswer.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `PostNord leveranstid: oväntat svar\n${z.prettifyError(parsed.error)}`,
    );
  }

  const options = parsed.data.warehouseToDeliveryOptions[0].deliveryOptions;
  const find = (method: ShippingMethod) => {
    const time = options.find(
      (option) => option.type === POSTNORD_TYPES[method],
    )?.defaultOption?.deliveryTime;
    return time ? toDate(time, day) : null;
  };
  return { service_point: find("service_point"), home: find("home") };
}
