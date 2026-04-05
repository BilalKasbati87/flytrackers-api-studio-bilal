import { getProviderStatus } from "@/lib/config";
import {
  buildFutureLookupWindow,
  captureRequest,
} from "@/lib/aviationstack-data";
import { aviationstackClient } from "@/lib/providers/aviationstack";
import { createRapidAuthorizationHeader, getExpediaSummary } from "@/lib/providers/expedia";
import {
  buildKayakCarLink,
  buildKayakLink,
  buildKayakStayLink,
  getKayakSummary,
} from "@/lib/providers/kayak";

type CheckState = "ready" | "partial" | "blocked";

type ProviderCheck = {
  label: string;
  state: CheckState;
  detail: string;
};

type ProviderProbe = {
  provider: string;
  state: CheckState;
  checks: ProviderCheck[];
};

function stateFromChecks(checks: ProviderCheck[]): CheckState {
  if (checks.some((check) => check.state === "ready")) {
    return "ready";
  }

  if (checks.some((check) => check.state === "partial")) {
    return "partial";
  }

  return "blocked";
}

function isRestrictedError(message: string | null) {
  return Boolean(
    message && /subscription plan does not support this api function/i.test(message),
  );
}

async function getAviationProbe(): Promise<ProviderProbe> {
  const providerStatus = getProviderStatus().aviationstack;
  const checks: ProviderCheck[] = [];

  if (!providerStatus.configured) {
    checks.push({
      label: "Credential check",
      state: "blocked",
      detail: "No live AviationStack credential source is available yet, so runtime probes cannot run.",
    });

    return {
      provider: "aviationstack",
      state: stateFromChecks(checks),
      checks,
    };
  }

  const futureWindow = buildFutureLookupWindow();
  const [flightsResult, airportResult, timetableResult, futureResult, routesResult] =
    await Promise.all([
      captureRequest(() =>
        aviationstackClient.getFlights({ dep_iata: "JFK", arr_iata: "LHR", limit: 1 }),
      ),
      captureRequest(() =>
        aviationstackClient.getAirports({ iata_code: "JFK", limit: 1 }),
      ),
      captureRequest(() =>
        aviationstackClient.getTimetable({
          iataCode: "JFK",
          type: "departure",
          limit: 1,
        }),
      ),
      captureRequest(() =>
        aviationstackClient.getFlightsFuture({
          iataCode: "JFK",
          date: futureWindow.lookupDate,
          type: "departure",
          limit: 1,
        }),
      ),
      captureRequest(() =>
        aviationstackClient.getRoutes({ dep_iata: "JFK", arr_iata: "LHR", limit: 1 }),
      ),
    ]);

  checks.push({
    label: "Live flights",
    state: flightsResult.error ? "partial" : "ready",
    detail: flightsResult.error
      ? flightsResult.error
      : "Live flight status queries are working for route-level lookups.",
  });

  checks.push({
    label: "Airport directory",
    state: airportResult.error ? "partial" : "ready",
    detail: airportResult.error
      ? airportResult.error
      : "Exact airport directory lookups by iata_code are working.",
  });

  checks.push({
    label: "Timetable boards",
    state: timetableResult.error ? "partial" : "ready",
    detail: timetableResult.error
      ? timetableResult.error
      : "Airport departure and arrival timetable probes are working.",
  });

  checks.push({
    label: "Future schedules",
    state: futureResult.error ? "partial" : "ready",
    detail: futureResult.error
      ? futureResult.error
      : `Future departures are available when queried with a future date like ${futureWindow.lookupDate}.`,
  });

  checks.push({
    label: "Native routes endpoint",
    state: routesResult.error
      ? isRestrictedError(routesResult.error)
        ? "partial"
        : "blocked"
      : "ready",
    detail: routesResult.error
      ? isRestrictedError(routesResult.error)
        ? "The current subscription does not expose the routes function, so the site falls back to flights plus flightsFuture for corridor intelligence."
        : routesResult.error
      : "Native route inventory calls are available on this key.",
  });

  checks.push({
    label: "Resource coverage",
    state: "ready",
    detail: `Configured resources in code: ${providerStatus.supportedResources.join(", ")}.`,
  });

  return {
    provider: "aviationstack",
    state: stateFromChecks(checks),
    checks,
  };
}

function getKayakProbe(): ProviderProbe {
  const summary = getKayakSummary();
  const checks: ProviderCheck[] = [];
  const sampleFlightLink = buildKayakLink("flights", {
    origin: "JFK",
    destination: "LHR",
    departDate: "2026-06-15",
    returnDate: "2026-06-22",
  });
  const sampleStayLink = buildKayakStayLink({
    destination: "London",
    checkIn: "2026-06-15",
    checkOut: "2026-06-20",
    adults: "2",
  });
  const sampleCarLink = buildKayakCarLink({
    pickupLocation: "LHR",
    dropoffLocation: "LHR",
    pickupDate: "2026-06-15",
    dropoffDate: "2026-06-20",
    pickupTime: "10:00",
    dropoffTime: "10:00",
  });

  if (sampleFlightLink || sampleStayLink || sampleCarLink) {
    checks.push({
      label: "Affiliate deeplink templates",
      state: "ready",
      detail: "At least one KAYAK deeplink template is active and can be used for outbound handoff.",
    });
  } else if (summary.affiliateConfigured) {
    checks.push({
      label: "Affiliate deeplink templates",
      state: "partial",
      detail: "Affiliate ID exists, but one or more official deeplink templates are still missing.",
    });
  } else {
    checks.push({
      label: "Affiliate deeplink templates",
      state: "blocked",
      detail: "KAYAK affiliate templates are not configured yet.",
    });
  }

  checks.push({
    label: "API access",
    state: summary.apiConfigured ? "partial" : "blocked",
    detail: summary.apiConfigured
      ? "API base URL and API key are configured. Live ping is skipped because the exact KAYAK endpoint set is partner-specific."
      : "KAYAK API mode is not configured.",
  });

  checks.push({
    label: "Whitelabel",
    state: summary.whitelabelUrl ? "partial" : "blocked",
    detail: summary.whitelabelUrl
      ? `Whitelabel target configured: ${summary.whitelabelUrl}`
      : "No KAYAK whitelabel URL is configured.",
  });

  return {
    provider: "kayak",
    state: stateFromChecks(checks),
    checks,
  };
}

function getExpediaProbe(): ProviderProbe {
  const summary = getExpediaSummary();
  const checks: ProviderCheck[] = [];
  const authHeader = createRapidAuthorizationHeader();

  checks.push({
    label: "Credential and signing",
    state: authHeader ? "ready" : "blocked",
    detail: authHeader
      ? `Rapid signing is working for the ${summary.environment} environment.`
      : "Expedia Rapid credentials are missing, so signed requests cannot run.",
  });

  checks.push({
    label: "Product availability",
    state: summary.configured ? "partial" : "blocked",
    detail: summary.configured
      ? "Lodging and car integration can progress. Live request probing is skipped because enabled Rapid modules vary by partner setup."
      : "Rapid product setup is blocked until the API key and shared secret are added.",
  });

  return {
    provider: "expedia",
    state: stateFromChecks(checks),
    checks,
  };
}

export async function getLiveProviderTestSnapshot() {
  const probes = await Promise.all([
    getAviationProbe(),
    Promise.resolve(getKayakProbe()),
    Promise.resolve(getExpediaProbe()),
  ]);

  return {
    checkedAt: new Date().toISOString(),
    probes,
  };
}
