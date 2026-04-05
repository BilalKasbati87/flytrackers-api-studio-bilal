import { appConfig, getProviderStatus } from "@/lib/config";
import {
  buildFutureLookupWindow,
  captureRequest,
  filterFutureFlightsByRoute,
  toFlightStatusEntries,
  toFutureFlightEntries,
  toRouteHighlightsFromFlights,
  uniqueNotices,
  type FutureFlightEntry,
} from "@/lib/aviationstack-data";
import { getDemoRoutePreview } from "@/lib/demo-data";
import { getExpediaSummary } from "@/lib/providers/expedia";
import { buildKayakLink, getKayakSummary } from "@/lib/providers/kayak";
import { aviationstackClient } from "@/lib/providers/aviationstack";
import type {
  ProviderReadiness,
  RouteHighlight,
  SearchBlueprint,
} from "@/types/travel";

function cleanValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function cleanAirportCode(value?: string | null) {
  const normalized = cleanValue(value);
  return normalized ? normalized.toUpperCase() : undefined;
}

function pickFirst(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function futureFlightsToRouteHighlights(entries: FutureFlightEntry[]): RouteHighlight[] {
  return entries.map((entry) => ({
    airlineName: entry.codesharedAirlineName ?? entry.airlineName,
    airlineIata: entry.codesharedAirlineIata ?? entry.airlineIata,
    flightNumber: entry.flightNumber,
    flightIata: entry.codesharedFlightIata ?? entry.flightIata,
    departureIata: entry.departureIata,
    arrivalIata: entry.arrivalIata,
    departureAirport: entry.departureIata,
    arrivalAirport: entry.arrivalIata,
    departureTime: entry.departureScheduled,
    arrivalTime: entry.arrivalScheduled,
  }));
}

function getKayakNextStep() {
  const summary = getKayakSummary();

  if (summary.apiConfigured) {
    return "KAYAK API mode is configured. The next step is swapping any deeplink-first UX into live partner search responses after sandbox approval.";
  }

  if (summary.affiliateConfigured && summary.templatesAvailable.flights) {
    return "KAYAK deeplink mode is close. Keep the current search handoff and replace placeholders with the official partner templates from the affiliate portal.";
  }

  if (summary.whitelabelUrl) {
    return "KAYAK Whitelabel is configured. You can expose a richer search experience immediately while API approval is pending.";
  }

  return "Add your KAYAK affiliate ID plus official deeplink templates, or request sandbox API access from the KAYAK Affiliate Network portal.";
}

function getExpediaNextStep(configured: boolean) {
  if (configured) {
    return "Rapid signing is ready. The next step is implementing lodging geography, shopping, and price-check flows against the Rapid test environment.";
  }

  return "Add the Expedia Rapid API key and shared secret from the partner portal, then keep testing against the Rapid test endpoint before requesting production review.";
}

function buildReadiness(query: SearchBlueprint): ProviderReadiness[] {
  const providerStatus = getProviderStatus();
  const kayakSummary = getKayakSummary();
  const demoModeActive = appConfig.demoMode && !providerStatus.aviationstack.configured;

  return [
    {
      provider: "aviationstack",
      state: providerStatus.aviationstack.configured
        ? "ready"
        : demoModeActive
          ? "partial"
          : "blocked",
      headline: providerStatus.aviationstack.configured
        ? "Operational flight intelligence is available."
        : demoModeActive
          ? "Live aviationstack credentials are missing, but demo aviation data is active."
        : "aviationstack is not configured yet.",
      detail: providerStatus.aviationstack.configured
        ? query.origin && query.destination
          ? "Live flights, airport directory records, timetable boards, airline data, and future schedules can enrich this route right now."
          : "Add origin and destination codes to preview live flight activity and future schedule coverage."
        : demoModeActive
          ? "You can keep building locally with realistic route, airport, and flight fixtures. Add AVIATIONSTACK_API_KEY later to switch to live responses."
          : "Set AVIATIONSTACK_API_KEY to activate live flights, airport data, timetables, and future schedule enrichment.",
    },
    {
      provider: "kayak",
      state: kayakSummary.apiConfigured ||
        (kayakSummary.affiliateConfigured && kayakSummary.templatesAvailable.flights)
        ? "ready"
        : kayakSummary.affiliateConfigured || kayakSummary.whitelabelUrl
          ? "partial"
          : "blocked",
      headline: kayakSummary.apiConfigured
        ? "KAYAK API access is wired for partner search."
        : kayakSummary.affiliateConfigured
          ? "KAYAK affiliate mode is partially wired."
          : "KAYAK is waiting on partner credentials.",
      detail: getKayakNextStep(),
    },
    {
      provider: "expedia",
      state: providerStatus.expedia.configured ? "partial" : "blocked",
      headline: providerStatus.expedia.configured
        ? "Expedia Rapid is configured for lodging and cars."
        : "Expedia Rapid credentials are not configured yet.",
      detail: providerStatus.expedia.configured
        ? "Public Rapid setup supports lodging and car flows today. Treat flights as a separate partner approval track."
        : getExpediaNextStep(false),
    },
  ];
}

export function normalizeSearchBlueprint(
  blueprint: Partial<SearchBlueprint>,
): SearchBlueprint {
  return {
    origin: cleanAirportCode(blueprint.origin),
    destination: cleanAirportCode(blueprint.destination),
    departDate: cleanValue(blueprint.departDate),
    returnDate: cleanValue(blueprint.returnDate),
  };
}

export function searchBlueprintFromRecord(
  record: Record<string, string | string[] | undefined>,
) {
  return normalizeSearchBlueprint({
    origin: pickFirst(record.origin),
    destination: pickFirst(record.destination),
    departDate: pickFirst(record.departDate),
    returnDate: pickFirst(record.returnDate),
  });
}

export function searchBlueprintFromSearchParams(searchParams: URLSearchParams) {
  return normalizeSearchBlueprint({
    origin: searchParams.get("origin") ?? undefined,
    destination: searchParams.get("destination") ?? undefined,
    departDate: searchParams.get("departDate") ?? undefined,
    returnDate: searchParams.get("returnDate") ?? undefined,
  });
}

export async function getTravelSearchSnapshot(
  input: Partial<SearchBlueprint>,
) {
  const query = normalizeSearchBlueprint(input);
  const providerStatus = getProviderStatus();
  const kayakSummary = getKayakSummary();
  const expediaSummary = getExpediaSummary();

  let routePreview: unknown = null;
  let routeHighlights: RouteHighlight[] = [];
  let routeCount = 0;
  let usesDemoData = false;
  let notices: string[] = [];
  let futureLookupDate: string | null = null;
  let futureLookupAdjusted = false;
  let futureRouteCount = 0;

  if (providerStatus.aviationstack.configured && query.origin && query.destination) {
    const futureWindow = buildFutureLookupWindow(query.departDate);
    futureLookupDate = futureWindow.lookupDate;
    futureLookupAdjusted = futureWindow.adjusted;

    const [liveFlightsResult, futureFlightsResult] = await Promise.all([
      captureRequest(() =>
        aviationstackClient.getFlights({
          dep_iata: query.origin,
          arr_iata: query.destination,
          limit: 5,
        }),
      ),
      captureRequest(() =>
        aviationstackClient.getFlightsFuture({
          iataCode: query.origin,
          date: futureWindow.lookupDate,
          type: "departure",
          limit: 24,
        }),
      ),
    ]);

    const liveFlights = toFlightStatusEntries(liveFlightsResult.data);
    const futureMatches = filterFutureFlightsByRoute(
      toFutureFlightEntries(futureFlightsResult.data),
      query.origin,
      query.destination,
    );

    routePreview = liveFlightsResult.data;
    routeHighlights = toRouteHighlightsFromFlights(liveFlights);
    routeCount = liveFlights.length;
    futureRouteCount = futureMatches.length;

    if (routeHighlights.length === 0 && futureMatches.length > 0) {
      routeHighlights = futureFlightsToRouteHighlights(futureMatches.slice(0, 5));
      routeCount = futureMatches.length;
    }

    notices = uniqueNotices([
      liveFlightsResult.error,
      futureFlightsResult.error,
      futureWindow.adjusted
        ? `Future schedule preview uses ${futureWindow.lookupDate} because flightsFuture only accepts dates after ${futureWindow.minimumDate}.`
        : null,
      routeHighlights.length === 0 &&
      !liveFlightsResult.error &&
      futureMatches.length === 0 &&
      !futureFlightsResult.error
        ? "No live or future schedule matches were returned for this city pair yet."
        : null,
    ]).map((notice) => notice.message);
  } else if (appConfig.demoMode && query.origin && query.destination) {
    const demoPreview = getDemoRoutePreview(query);

    routeHighlights = demoPreview.routeHighlights;
    routeCount = demoPreview.routeCount;
    usesDemoData = true;
    notices = demoPreview.notices;
  }

  return {
    query,
    hasRouteQuery: Boolean(query.origin && query.destination),
    providerStatus,
    readiness: buildReadiness(query),
    aviationstack: {
      routePreview,
      routeHighlights,
      routeCount,
      futureLookupDate,
      futureLookupAdjusted,
      futureRouteCount,
      directProxyExample: `/api/aviationstack?resource=flights&dep_iata=${query.origin ?? "JFK"}&arr_iata=${query.destination ?? "LHR"}&limit=10`,
      usesDemoData,
      notices,
    },
    kayak: {
      summary: kayakSummary,
      links: {
        flights: buildKayakLink("flights", query),
        hotels: buildKayakLink("hotels", query),
        cars: buildKayakLink("cars", query),
      },
      nextStep: getKayakNextStep(),
    },
    expedia: {
      ...expediaSummary,
      nextStep: getExpediaNextStep(expediaSummary.configured),
    },
  };
}
