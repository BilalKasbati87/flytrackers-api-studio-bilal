import { getProviderStatus } from "@/lib/config";
import { getExpediaSummary } from "@/lib/providers/expedia";
import {
  buildKayakCarLink,
  buildKayakStayLink,
  getKayakSummary,
} from "@/lib/providers/kayak";
import type {
  CarSearchBlueprint,
  ProviderReadiness,
  StaySearchBlueprint,
} from "@/types/travel";

function cleanValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function pickFirst(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function toDateHint(value?: string) {
  return value ?? "not set";
}

function buildHotelReadiness(query: StaySearchBlueprint): ProviderReadiness[] {
  const providerStatus = getProviderStatus();
  const kayakSummary = getKayakSummary();
  const hotelLink = buildKayakStayLink(query);

  return [
    {
      provider: "kayak",
      state: hotelLink || kayakSummary.apiConfigured
        ? "ready"
        : kayakSummary.whitelabelUrl || kayakSummary.affiliateConfigured
          ? "partial"
          : "blocked",
      headline: hotelLink || kayakSummary.apiConfigured
        ? "KAYAK hotel handoff is available."
        : kayakSummary.whitelabelUrl || kayakSummary.affiliateConfigured
          ? "KAYAK hotel flow is partially configured."
          : "KAYAK hotel handoff needs partner values.",
      detail: hotelLink
        ? "You can send hotel intent into KAYAK immediately from this planning page."
        : "Add the official hotels template from the KAYAK partner portal, or switch to whitelabel or API access once approved.",
    },
    {
      provider: "expedia",
      state: providerStatus.expedia.configured ? "partial" : "blocked",
      headline: providerStatus.expedia.configured
        ? "Expedia Rapid lodging credentials are configured."
        : "Expedia Rapid lodging setup is waiting on credentials.",
      detail: providerStatus.expedia.configured
        ? `Use geography and shopping endpoints to resolve destination inventory for ${query.destination ?? "the selected destination"}, then progress into price check and booking.`
        : "Add the Rapid API key and shared secret to move from planning into signed lodging requests.",
    },
  ];
}

function buildCarReadiness(query: CarSearchBlueprint): ProviderReadiness[] {
  const providerStatus = getProviderStatus();
  const kayakSummary = getKayakSummary();
  const carLink = buildKayakCarLink(query);

  return [
    {
      provider: "kayak",
      state: carLink || kayakSummary.apiConfigured
        ? "ready"
        : kayakSummary.whitelabelUrl || kayakSummary.affiliateConfigured
          ? "partial"
          : "blocked",
      headline: carLink || kayakSummary.apiConfigured
        ? "KAYAK car handoff is available."
        : kayakSummary.whitelabelUrl || kayakSummary.affiliateConfigured
          ? "KAYAK car flow is partially configured."
          : "KAYAK car handoff needs partner values.",
      detail: carLink
        ? "You can pass pickup and dropoff intent into KAYAK from this page right now."
        : "Add the official cars template from the KAYAK partner portal, or promote whitelabel or API access for production search.",
    },
    {
      provider: "expedia",
      state: providerStatus.expedia.configured ? "partial" : "blocked",
      headline: providerStatus.expedia.configured
        ? "Expedia Rapid car credentials are configured."
        : "Expedia Rapid car setup is waiting on credentials.",
      detail: providerStatus.expedia.configured
        ? `Use the Rapid car launch path to support pickup at ${query.pickupLocation ?? "the requested location"} and align the UX to Rapid launch requirements before production approval.`
        : "Add the Rapid API key and shared secret so the car planning flow can move into signed partner requests.",
    },
  ];
}

export function normalizeStaySearchBlueprint(
  blueprint: Partial<StaySearchBlueprint>,
): StaySearchBlueprint {
  return {
    destination: cleanValue(blueprint.destination),
    checkIn: cleanValue(blueprint.checkIn),
    checkOut: cleanValue(blueprint.checkOut),
    adults: cleanValue(blueprint.adults),
  };
}

export function normalizeCarSearchBlueprint(
  blueprint: Partial<CarSearchBlueprint>,
): CarSearchBlueprint {
  return {
    pickupLocation: cleanValue(blueprint.pickupLocation),
    dropoffLocation:
      cleanValue(blueprint.dropoffLocation) ?? cleanValue(blueprint.pickupLocation),
    pickupDate: cleanValue(blueprint.pickupDate),
    dropoffDate: cleanValue(blueprint.dropoffDate),
    pickupTime: cleanValue(blueprint.pickupTime),
    dropoffTime: cleanValue(blueprint.dropoffTime),
  };
}

export function staySearchFromRecord(
  record: Record<string, string | string[] | undefined>,
) {
  return normalizeStaySearchBlueprint({
    destination: pickFirst(record.destination),
    checkIn: pickFirst(record.checkIn),
    checkOut: pickFirst(record.checkOut),
    adults: pickFirst(record.adults),
  });
}

export function carSearchFromRecord(
  record: Record<string, string | string[] | undefined>,
) {
  return normalizeCarSearchBlueprint({
    pickupLocation: pickFirst(record.pickupLocation),
    dropoffLocation: pickFirst(record.dropoffLocation),
    pickupDate: pickFirst(record.pickupDate),
    dropoffDate: pickFirst(record.dropoffDate),
    pickupTime: pickFirst(record.pickupTime),
    dropoffTime: pickFirst(record.dropoffTime),
  });
}

export function staySearchFromSearchParams(searchParams: URLSearchParams) {
  return normalizeStaySearchBlueprint({
    destination: searchParams.get("destination") ?? undefined,
    checkIn: searchParams.get("checkIn") ?? undefined,
    checkOut: searchParams.get("checkOut") ?? undefined,
    adults: searchParams.get("adults") ?? undefined,
  });
}

export function carSearchFromSearchParams(searchParams: URLSearchParams) {
  return normalizeCarSearchBlueprint({
    pickupLocation: searchParams.get("pickupLocation") ?? undefined,
    dropoffLocation: searchParams.get("dropoffLocation") ?? undefined,
    pickupDate: searchParams.get("pickupDate") ?? undefined,
    dropoffDate: searchParams.get("dropoffDate") ?? undefined,
    pickupTime: searchParams.get("pickupTime") ?? undefined,
    dropoffTime: searchParams.get("dropoffTime") ?? undefined,
  });
}

export function getStaySearchSnapshot(input: Partial<StaySearchBlueprint>) {
  const query = normalizeStaySearchBlueprint(input);
  const providerStatus = getProviderStatus();
  const kayakSummary = getKayakSummary();
  const expediaSummary = getExpediaSummary();
  const hotelLink = buildKayakStayLink(query);

  return {
    query,
    providerStatus,
    readiness: buildHotelReadiness(query),
    kayak: {
      summary: kayakSummary,
      hotelLink,
      nextStep: hotelLink
        ? "The hotel planning flow can hand users into KAYAK now. Replace this with live API or whitelabel behaviour once your partner access is approved."
        : "Add the official KAYAK hotels template or switch to whitelabel or API mode for a richer hotel flow.",
    },
    expedia: {
      ...expediaSummary,
      lodgingPlan: [
        `Resolve destination geography for ${query.destination ?? "the destination"}`,
        "Search lodging availability and rates",
        "Run price check before checkout",
        "Complete booking or itinerary retrieval through signed server calls",
      ],
      nextStep: providerStatus.expedia.configured
        ? `The Rapid lodging path is ready for geography and shopping work. Current search dates: ${toDateHint(query.checkIn)} to ${toDateHint(query.checkOut)}.`
        : "Rapid credentials are still missing, so the stay flow remains planning-only until you add them.",
    },
    apiExample: `/api/travel/stays?destination=${encodeURIComponent(query.destination ?? "London")}&checkIn=${query.checkIn ?? "2026-06-15"}&checkOut=${query.checkOut ?? "2026-06-20"}&adults=${query.adults ?? "2"}`,
  };
}

export function getCarSearchSnapshot(input: Partial<CarSearchBlueprint>) {
  const query = normalizeCarSearchBlueprint(input);
  const providerStatus = getProviderStatus();
  const kayakSummary = getKayakSummary();
  const expediaSummary = getExpediaSummary();
  const carLink = buildKayakCarLink(query);

  return {
    query,
    providerStatus,
    readiness: buildCarReadiness(query),
    kayak: {
      summary: kayakSummary,
      carLink,
      nextStep: carLink
        ? "The car planning flow can hand users into KAYAK now. Replace this with live API or whitelabel behaviour after approval if you want a deeper branded experience."
        : "Add the official KAYAK cars template or switch to whitelabel or API mode for a richer car rental flow.",
    },
    expedia: {
      ...expediaSummary,
      carPlan: [
        `Validate pickup location at ${query.pickupLocation ?? "the pickup location"}`,
        `Confirm dropoff at ${query.dropoffLocation ?? query.pickupLocation ?? "the dropoff location"}`,
        "Align the UI to Rapid car launch requirements",
        "Move into signed availability and booking flows once credentials are live",
      ],
      nextStep: providerStatus.expedia.configured
        ? `Rapid car work can start as soon as you map your product UX to the signed partner flow for ${toDateHint(query.pickupDate)} to ${toDateHint(query.dropoffDate)}.`
        : "Rapid credentials are still missing, so the car flow remains planning-only until you add them.",
    },
    apiExample: `/api/travel/cars?pickupLocation=${encodeURIComponent(query.pickupLocation ?? "LHR")}&dropoffLocation=${encodeURIComponent(query.dropoffLocation ?? query.pickupLocation ?? "LHR")}&pickupDate=${query.pickupDate ?? "2026-06-15"}&dropoffDate=${query.dropoffDate ?? "2026-06-20"}`,
  };
}