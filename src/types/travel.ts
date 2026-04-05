export const aviationstackResources = [
  "flights",
  "routes",
  "airports",
  "airlines",
  "airplanes",
  "aircraft_types",
  "taxes",
  "cities",
  "countries",
  "timetable",
  "flightsFuture",
] as const;

export type AviationstackResource = (typeof aviationstackResources)[number];

export type QueryValue = string | number | boolean;

export type QueryParams = Record<
  string,
  QueryValue | QueryValue[] | null | undefined
>;

export type ProviderStatus = {
  aviationstack: {
    configured: boolean;
    supportedResources: readonly AviationstackResource[];
  };
  kayak: {
    affiliateConfigured: boolean;
    apiConfigured: boolean;
    sandboxEnabled: boolean;
    whitelabelConfigured: boolean;
  };
  expedia: {
    configured: boolean;
    environment: "test" | "production";
    supportsLodging: true;
    supportsCars: true;
    publicFlightApiStatus: "coming-soon";
  };
};

export type SearchBlueprint = {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
};

export type StaySearchBlueprint = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: string;
};

export type CarSearchBlueprint = {
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
};

export type ProviderReadinessState = "ready" | "partial" | "blocked";

export type ProviderReadiness = {
  provider: "aviationstack" | "kayak" | "expedia";
  state: ProviderReadinessState;
  headline: string;
  detail: string;
};

export type RouteHighlight = {
  airlineName: string | null;
  airlineIata: string | null;
  flightNumber: string | null;
  flightIata: string | null;
  departureIata: string | null;
  arrivalIata: string | null;
  departureAirport: string | null;
  arrivalAirport: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
};