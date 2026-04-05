import { appConfig, aviationstackConfig, getProviderStatus } from "@/lib/config";
import {
  buildFutureLookupWindow,
  captureRequest,
  filterFutureFlightsByRoute,
  formatAviationDateTime,
  infoNotices,
  toAircraftTypeRecords,
  toAirlineDirectoryRecord,
  toAirplaneDirectoryRecords,
  toAirportDirectoryRecord,
  toCityDirectoryRecord,
  toCountryDirectoryRecord,
  toFlightStatusEntries,
  toFutureFlightEntries,
  toTaxRecords,
  toTimetableEntries,
  uniqueNotices,
  baseBlockedNotice,
  getDataCount,
  type AirlineDirectoryRecord,
  type AirportDirectoryRecord,
  type AviationNotice,
  type CityDirectoryRecord,
  type CountryDirectoryRecord,
  type FlightStatusEntry,
  type FutureFlightEntry,
} from "@/lib/aviationstack-data";
import {
  getDemoAirportSnapshot,
  getDemoFlightSnapshot,
  getDemoRouteLiveFlights,
} from "@/lib/demo-data";
import { buildKayakLink } from "@/lib/providers/kayak";
import { aviationstackClient } from "@/lib/providers/aviationstack";
import {
  getTravelSearchSnapshot,
  normalizeSearchBlueprint,
} from "@/lib/travel-search";
import type {
  AviationstackResource,
  RouteHighlight,
  SearchBlueprint,
} from "@/types/travel";

export { formatAviationDateTime };
export type {
  AirlineDirectoryRecord,
  AirportDirectoryRecord,
  AviationNotice,
  CityDirectoryRecord,
  CountryDirectoryRecord,
  FlightStatusEntry,
  FutureFlightEntry,
};

export type AviationCapabilitySample = {
  title: string;
  detail: string;
  chips: string[];
};

export type AviationCapabilityCard = {
  resource: AviationstackResource;
  status: "available" | "restricted" | "warning";
  headline: string;
  detail: string;
  querySummary: string;
  proxyHref: string;
  useCases: string[];
  count: number | null;
  samples: AviationCapabilitySample[];
};

function buildProxyHref(
  resource: AviationstackResource,
  params: Record<string, string>,
) {
  const searchParams = new URLSearchParams({
    resource,
    ...params,
  });

  return `/api/aviationstack?${searchParams.toString()}`;
}

function isRestrictedError(message: string | null) {
  return Boolean(
    message && /subscription plan does not support this api function/i.test(message),
  );
}

async function getAirportGeoContext(airport: AirportDirectoryRecord | null) {
  if (!airport) {
    return {
      city: null as CityDirectoryRecord | null,
      country: null as CountryDirectoryRecord | null,
      notices: [] as AviationNotice[],
    };
  }

  const [cityResult, countryResult] = await Promise.all([
    airport.cityCode
      ? captureRequest(() =>
          aviationstackClient.getCities({
            iata_code: airport.cityCode,
            limit: 1,
          }),
        )
      : Promise.resolve({ data: null, error: null }),
    airport.countryName
      ? captureRequest(() =>
          aviationstackClient.getCountries({
            country_name: airport.countryName,
            limit: 1,
          }),
        )
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    city: toCityDirectoryRecord(cityResult.data),
    country: toCountryDirectoryRecord(countryResult.data),
    notices: uniqueNotices([cityResult.error, countryResult.error]),
  };
}

export async function getAirportSnapshot(iata: string) {
  const airportCode = iata.trim().toUpperCase();
  const providerReady = getProviderStatus().aviationstack.configured;

  if (!providerReady) {
    if (appConfig.demoMode) {
      const demoSnapshot = getDemoAirportSnapshot(airportCode);

      return {
        airportCode,
        airport: demoSnapshot.airport,
        city: null as CityDirectoryRecord | null,
        country: null as CountryDirectoryRecord | null,
        departures: demoSnapshot.departures,
        arrivals: demoSnapshot.arrivals,
        futureDepartures: [] as FutureFlightEntry[],
        futureLookupDate: null as string | null,
        notices: infoNotices(demoSnapshot.notices),
      };
    }

    return {
      airportCode,
      airport: null as AirportDirectoryRecord | null,
      city: null as CityDirectoryRecord | null,
      country: null as CountryDirectoryRecord | null,
      departures: [] as FlightStatusEntry[],
      arrivals: [] as FlightStatusEntry[],
      futureDepartures: [] as FutureFlightEntry[],
      futureLookupDate: null as string | null,
      notices: baseBlockedNotice(),
    };
  }

  const futureWindow = buildFutureLookupWindow();
  const [airportResult, departuresResult, arrivalsResult, futureResult] =
    await Promise.all([
      captureRequest(() =>
        aviationstackClient.getAirports({
          iata_code: airportCode,
          limit: 1,
        }),
      ),
      captureRequest(() =>
        aviationstackClient.getTimetable({
          iataCode: airportCode,
          type: "departure",
          limit: 8,
        }),
      ),
      captureRequest(() =>
        aviationstackClient.getTimetable({
          iataCode: airportCode,
          type: "arrival",
          limit: 8,
        }),
      ),
      captureRequest(() =>
        aviationstackClient.getFlightsFuture({
          iataCode: airportCode,
          date: futureWindow.lookupDate,
          type: "departure",
          limit: 8,
        }),
      ),
    ]);

  const airport = toAirportDirectoryRecord(airportResult.data, airportCode);
  const locationContext = await getAirportGeoContext(airport);

  return {
    airportCode,
    airport,
    city: locationContext.city,
    country: locationContext.country,
    departures: toTimetableEntries(departuresResult.data),
    arrivals: toTimetableEntries(arrivalsResult.data),
    futureDepartures: toFutureFlightEntries(futureResult.data),
    futureLookupDate: futureWindow.lookupDate,
    notices: [
      ...uniqueNotices([
        airportResult.error,
        departuresResult.error,
        arrivalsResult.error,
        futureResult.error,
      ]),
      ...locationContext.notices,
    ],
  };
}

export async function getRouteDetailSnapshot(input: Partial<SearchBlueprint>) {
  const baseSnapshot = await getTravelSearchSnapshot(input);
  const kayakRouteLinks = {
    flights: buildKayakLink("flights", baseSnapshot.query),
    hotels: buildKayakLink("hotels", baseSnapshot.query),
    cars: buildKayakLink("cars", baseSnapshot.query),
  };

  if (!baseSnapshot.providerStatus.aviationstack.configured) {
    if (appConfig.demoMode) {
      const demoSnapshot = getDemoRouteLiveFlights(baseSnapshot.query);

      return {
        ...baseSnapshot,
        liveFlights: demoSnapshot.liveFlights,
        liveFlightCount: demoSnapshot.liveFlights.length,
        futureFlights: [] as FutureFlightEntry[],
        futureFlightCount: 0,
        futureLookupDate: null as string | null,
        futureLookupAdjusted: false,
        kayakRouteLinks,
        notices: infoNotices(demoSnapshot.notices),
      };
    }

    return {
      ...baseSnapshot,
      liveFlights: [] as FlightStatusEntry[],
      liveFlightCount: 0,
      futureFlights: [] as FutureFlightEntry[],
      futureFlightCount: 0,
      futureLookupDate: null as string | null,
      futureLookupAdjusted: false,
      kayakRouteLinks,
      notices: baseBlockedNotice(),
    };
  }

  const query = normalizeSearchBlueprint(baseSnapshot.query);

  if (!query.origin || !query.destination) {
    return {
      ...baseSnapshot,
      liveFlights: [] as FlightStatusEntry[],
      liveFlightCount: 0,
      futureFlights: [] as FutureFlightEntry[],
      futureFlightCount: 0,
      futureLookupDate: null as string | null,
      futureLookupAdjusted: false,
      kayakRouteLinks,
      notices: [
        {
          tone: "info" as const,
          message: "Add both route endpoints to inspect current flights on this city pair.",
        },
      ],
    };
  }

  const futureWindow = buildFutureLookupWindow(query.departDate);
  const [flightsResult, futureResult] = await Promise.all([
    captureRequest(() =>
      aviationstackClient.getFlights({
        dep_iata: query.origin,
        arr_iata: query.destination,
        limit: 8,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getFlightsFuture({
        iataCode: query.origin,
        date: futureWindow.lookupDate,
        type: "departure",
        limit: 30,
      }),
    ),
  ]);

  const futureFlights = filterFutureFlightsByRoute(
    toFutureFlightEntries(futureResult.data),
    query.origin,
    query.destination,
  ).slice(0, 8);

  return {
    ...baseSnapshot,
    liveFlights: toFlightStatusEntries(flightsResult.data),
    liveFlightCount: getDataCount(flightsResult.data),
    futureFlights,
    futureFlightCount: futureFlights.length,
    futureLookupDate: futureWindow.lookupDate,
    futureLookupAdjusted: futureWindow.adjusted,
    notices: uniqueNotices([
      ...baseSnapshot.aviationstack.notices,
      flightsResult.error,
      futureResult.error,
      futureWindow.adjusted
        ? `Future schedule preview uses ${futureWindow.lookupDate} because flightsFuture only accepts dates after ${futureWindow.minimumDate}.`
        : null,
      futureFlights.length === 0 && !futureResult.error
        ? `No future schedule rows were returned for ${query.origin} to ${query.destination} on ${futureWindow.lookupDate}.`
        : null,
    ]),
    kayakRouteLinks,
  };
}

export async function getFlightSnapshot(flightIata: string, date?: string) {
  const normalizedFlightIata = flightIata.trim().toUpperCase();
  const providerReady = getProviderStatus().aviationstack.configured;

  if (!providerReady) {
    if (appConfig.demoMode) {
      const demoSnapshot = getDemoFlightSnapshot(normalizedFlightIata, date);

      return {
        flightIata: normalizedFlightIata,
        requestedDate: demoSnapshot.requestedDate,
        matches: demoSnapshot.matches,
        airline: null as AirlineDirectoryRecord | null,
        notices: infoNotices(demoSnapshot.notices),
      };
    }

    return {
      flightIata: normalizedFlightIata,
      requestedDate: date ?? null,
      matches: [] as FlightStatusEntry[],
      airline: null as AirlineDirectoryRecord | null,
      notices: baseBlockedNotice(),
    };
  }

  const flightResult = await captureRequest(() =>
    aviationstackClient.getFlights({
      flight_iata: normalizedFlightIata,
      ...(date ? { flight_date: date } : {}),
      limit: 10,
    }),
  );

  const matches = toFlightStatusEntries(flightResult.data);
  const primaryMatch = matches[0];
  const airlineResult =
    primaryMatch?.airlineIata
      ? await captureRequest(() =>
          aviationstackClient.getAirlines({
            iata_code: primaryMatch.airlineIata,
            limit: 1,
          }),
        )
      : { data: null, error: null };

  const notices = uniqueNotices([
    flightResult.error,
    airlineResult.error,
    matches.length === 0
      ? "No matching flight records were returned. Try adding a recent flight_date for historical lookups, or verify the airline code in the flight IATA value."
      : null,
  ]);

  return {
    flightIata: normalizedFlightIata,
    requestedDate: date ?? null,
    matches,
    airline: toAirlineDirectoryRecord(airlineResult.data),
    notices,
  };
}

function toCapabilityStatus(error: string | null) {
  if (!error) {
    return "available" as const;
  }

  return isRestrictedError(error) ? ("restricted" as const) : ("warning" as const);
}

function buildFlightSamples(entries: FlightStatusEntry[]): AviationCapabilitySample[] {
  return entries.slice(0, 3).map((entry) => ({
    title: entry.flightIata ?? entry.flightNumber ?? "Flight",
    detail: `${entry.departureIata ?? "---"} to ${entry.arrivalIata ?? "---"}`,
    chips: [
      entry.airlineName ?? "Airline unavailable",
      entry.status ?? "Status unavailable",
      `Dep ${formatAviationDateTime(entry.departureEstimated ?? entry.departureScheduled)}`,
    ],
  }));
}

function buildFutureFlightSamples(entries: FutureFlightEntry[]): AviationCapabilitySample[] {
  return entries.slice(0, 3).map((entry) => ({
    title: entry.codesharedFlightIata ?? entry.flightIata ?? entry.flightNumber ?? "Future flight",
    detail: `${entry.departureIata ?? "---"} to ${entry.arrivalIata ?? "---"} on ${entry.departureScheduled ?? "schedule unavailable"}`,
    chips: [
      entry.codesharedAirlineName ?? entry.airlineName ?? "Airline unavailable",
      entry.aircraftModelText ?? "Aircraft model unavailable",
      `Arr ${entry.arrivalScheduled ?? "Unavailable"}`,
    ],
  }));
}

function buildAirportSamples(airport: AirportDirectoryRecord | null): AviationCapabilitySample[] {
  if (!airport) {
    return [];
  }

  return [
    {
      title: airport.name ?? airport.iata,
      detail: `${airport.iata} ${airport.icao ? `(${airport.icao})` : ""}`.trim(),
      chips: [
        airport.cityCode ?? "City unavailable",
        airport.countryName ?? "Country unavailable",
        airport.timezone ?? "Timezone unavailable",
      ],
    },
  ];
}

function buildAirlineSamples(airline: AirlineDirectoryRecord | null): AviationCapabilitySample[] {
  if (!airline) {
    return [];
  }

  return [
    {
      title: airline.name ?? "Airline profile",
      detail: `${airline.iataCode ?? "--"} / ${airline.icaoCode ?? "--"}`,
      chips: [
        airline.hubCode ? `Hub ${airline.hubCode}` : "Hub unavailable",
        airline.fleetSize ? `Fleet ${airline.fleetSize}` : "Fleet unavailable",
        airline.countryName ?? "Country unavailable",
      ],
    },
  ];
}

function buildCitySamples(city: CityDirectoryRecord | null): AviationCapabilitySample[] {
  if (!city) {
    return [];
  }

  return [
    {
      title: city.name ?? "City record",
      detail: `Metro code ${city.iataCode ?? "--"}`,
      chips: [
        city.countryIso2 ?? "Country unavailable",
        city.timezone ?? "Timezone unavailable",
        city.latitude && city.longitude
          ? `${city.latitude}, ${city.longitude}`
          : "Coordinates unavailable",
      ],
    },
  ];
}

function buildCountrySamples(country: CountryDirectoryRecord | null): AviationCapabilitySample[] {
  if (!country) {
    return [];
  }

  return [
    {
      title: country.name ?? "Country record",
      detail: `${country.iso2 ?? "--"} / ${country.iso3 ?? "--"}`,
      chips: [
        country.capital ? `Capital ${country.capital}` : "Capital unavailable",
        country.currencyCode ? `Currency ${country.currencyCode}` : "Currency unavailable",
        country.phonePrefix ? `Dial +${country.phonePrefix}` : "Prefix unavailable",
      ],
    },
  ];
}

export async function getAviationstackCapabilitySnapshot() {
  const providerReady = getProviderStatus().aviationstack.configured;

  if (!providerReady) {
    return {
      checkedAt: new Date().toISOString(),
      keySource: aviationstackConfig.keySource,
      futureLookupDate: null as string | null,
      availableCards: [] as AviationCapabilityCard[],
      restrictedCards: [] as AviationCapabilityCard[],
      warningCards: [] as AviationCapabilityCard[],
      notices: baseBlockedNotice(),
    };
  }

  const futureWindow = buildFutureLookupWindow();
  const [
    flightsResult,
    airportsResult,
    airlinesResult,
    airplanesResult,
    aircraftTypesResult,
    taxesResult,
    citiesResult,
    countriesResult,
    timetableResult,
    futureFlightsResult,
    routesResult,
  ] = await Promise.all([
    captureRequest(() =>
      aviationstackClient.getFlights({
        dep_iata: "JFK",
        arr_iata: "LHR",
        limit: 3,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getAirports({
        iata_code: "JFK",
        limit: 1,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getAirlines({
        iata_code: "AA",
        limit: 1,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getAirplanes({
        limit: 3,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getAircraftTypes({
        limit: 3,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getTaxes({
        limit: 4,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getCities({
        city_name: "London",
        limit: 1,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getCountries({
        country_name: "United States",
        limit: 1,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getTimetable({
        iataCode: "JFK",
        type: "departure",
        limit: 4,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getFlightsFuture({
        iataCode: "JFK",
        date: futureWindow.lookupDate,
        type: "departure",
        limit: 4,
      }),
    ),
    captureRequest(() =>
      aviationstackClient.getRoutes({
        dep_iata: "JFK",
        arr_iata: "LHR",
        limit: 1,
      }),
    ),
  ]);

  const flights = toFlightStatusEntries(flightsResult.data);
  const timetable = toTimetableEntries(timetableResult.data);
  const futureFlights = toFutureFlightEntries(futureFlightsResult.data);
  const availableCards: AviationCapabilityCard[] = [
    {
      resource: "flights",
      status: toCapabilityStatus(flightsResult.error),
      headline: "Live flight status, delays, gates, and airport pairs.",
      detail:
        flightsResult.error ??
        "This is the strongest real-time operational dataset on the current key, and it now powers route search previews and flight detail pages across the site.",
      querySummary: "JFK to LHR live flight query",
      proxyHref: buildProxyHref("flights", {
        dep_iata: "JFK",
        arr_iata: "LHR",
        limit: "10",
      }),
      useCases: [
        "Flight status pages",
        "Route activity previews",
        "Delay and gate monitoring",
      ],
      count: getDataCount(flightsResult.data),
      samples: buildFlightSamples(flights),
    },
    {
      resource: "airports",
      status: toCapabilityStatus(airportsResult.error),
      headline: "Airport directory facts with timezone, geography, and contact fields.",
      detail:
        airportsResult.error ??
        "Exact filters such as iata_code work reliably on this key and are now used in the airport pages instead of the older search-based lookup.",
      querySummary: "JFK airport profile",
      proxyHref: buildProxyHref("airports", {
        iata_code: "JFK",
      }),
      useCases: [
        "Airport landing pages",
        "Timezone-aware planning",
        "City and country enrichment",
      ],
      count: getDataCount(airportsResult.data),
      samples: buildAirportSamples(toAirportDirectoryRecord(airportsResult.data, "JFK")),
    },
    {
      resource: "airlines",
      status: toCapabilityStatus(airlinesResult.error),
      headline: "Airline profiles with hub, fleet size, age, and operating status.",
      detail:
        airlinesResult.error ??
        "The flight detail page now enriches live flight records with airline directory data whenever an airline IATA code is available.",
      querySummary: "American Airlines profile",
      proxyHref: buildProxyHref("airlines", {
        iata_code: "AA",
      }),
      useCases: [
        "Airline profile sidebars",
        "Carrier comparison pages",
        "Hub-based route exploration",
      ],
      count: getDataCount(airlinesResult.data),
      samples: buildAirlineSamples(toAirlineDirectoryRecord(airlinesResult.data)),
    },
    {
      resource: "airplanes",
      status: toCapabilityStatus(airplanesResult.error),
      headline: "Individual aircraft registry and ownership records.",
      detail:
        airplanesResult.error ??
        "This is useful for future plane detail pages, fleet libraries, and equipment reference layers linked from flights or airlines.",
      querySummary: "Airplane registry sample",
      proxyHref: buildProxyHref("airplanes", {
        limit: "3",
      }),
      useCases: [
        "Aircraft registry pages",
        "Fleet reference content",
        "Owner and age insights",
      ],
      count: getDataCount(airplanesResult.data),
      samples: toAirplaneDirectoryRecords(airplanesResult.data, 3).map((plane) => ({
        title: plane.registrationNumber ?? plane.modelCode ?? "Airplane record",
        detail: plane.modelName ?? plane.iataType ?? "Aircraft model unavailable",
        chips: [
          plane.planeOwner ?? "Owner unavailable",
          plane.planeAge ? `${plane.planeAge} years` : "Age unavailable",
          plane.planeStatus ?? "Status unavailable",
        ],
      })),
    },
    {
      resource: "aircraft_types",
      status: toCapabilityStatus(aircraftTypesResult.error),
      headline: "Aircraft code translation from short model code to readable type name.",
      detail:
        aircraftTypesResult.error ??
        "This helps decode model codes coming from flightsFuture and timetable data into human-readable equipment labels.",
      querySummary: "Aircraft type dictionary sample",
      proxyHref: buildProxyHref("aircraft_types", {
        limit: "3",
      }),
      useCases: [
        "Readable aircraft badges",
        "Equipment filters",
        "Route equipment summaries",
      ],
      count: getDataCount(aircraftTypesResult.data),
      samples: toAircraftTypeRecords(aircraftTypesResult.data, 3).map((type) => ({
        title: type.name ?? "Aircraft type",
        detail: `Code ${type.iataCode ?? "--"}`,
        chips: ["Equipment dictionary", "Route planning", "Fleet enrichment"],
      })),
    },
    {
      resource: "taxes",
      status: toCapabilityStatus(taxesResult.error),
      headline: "Tax code reference data for fare explanations and glossary content.",
      detail:
        taxesResult.error ??
        "This is not a pricing engine by itself, but it can support fee explainers, airline tax glossaries, and content around fare breakdowns.",
      querySummary: "Tax dictionary sample",
      proxyHref: buildProxyHref("taxes", {
        limit: "4",
      }),
      useCases: [
        "Fare glossary content",
        "Tax code reference tables",
        "Fee explanation pages",
      ],
      count: getDataCount(taxesResult.data),
      samples: toTaxRecords(taxesResult.data, 4).map((tax) => ({
        title: tax.name ?? "Tax record",
        detail: `IATA code ${tax.iataCode ?? "--"}`,
        chips: ["Reference data", "Fare education", "Content support"],
      })),
    },
    {
      resource: "cities",
      status: toCapabilityStatus(citiesResult.error),
      headline: "Metro-level city directory with timezone and coordinates.",
      detail:
        citiesResult.error ??
        "This can power destination hubs, metro airport grouping, and route discovery pages that work at city level instead of airport level.",
      querySummary: "London city profile",
      proxyHref: buildProxyHref("cities", {
        city_name: "London",
      }),
      useCases: [
        "Destination hubs",
        "Metro airport grouping",
        "City-to-city planning",
      ],
      count: getDataCount(citiesResult.data),
      samples: buildCitySamples(toCityDirectoryRecord(citiesResult.data)),
    },
    {
      resource: "countries",
      status: toCapabilityStatus(countriesResult.error),
      headline: "Country metadata including currency, continent, and phone prefix.",
      detail:
        countriesResult.error ??
        "This can support market pages, geography filters, and travel content that needs country-level metadata around airports and cities.",
      querySummary: "United States country profile",
      proxyHref: buildProxyHref("countries", {
        country_name: "United States",
      }),
      useCases: [
        "Country landing pages",
        "Region filters",
        "Travel metadata enrichment",
      ],
      count: getDataCount(countriesResult.data),
      samples: buildCountrySamples(toCountryDirectoryRecord(countriesResult.data)),
    },
    {
      resource: "timetable",
      status: toCapabilityStatus(timetableResult.error),
      headline: "Airport departures and arrivals board for the current operating day.",
      detail:
        timetableResult.error ??
        "The airport page now uses timetable-based boards for departures and arrivals so the site can show scheduled, estimated, and actual movement times from a dedicated schedule endpoint.",
      querySummary: "JFK departures board",
      proxyHref: buildProxyHref("timetable", {
        iataCode: "JFK",
        type: "departure",
        limit: "10",
      }),
      useCases: [
        "Airport departure boards",
        "Arrival boards",
        "Schedule monitoring",
      ],
      count: getDataCount(timetableResult.data),
      samples: buildFlightSamples(timetable),
    },
    {
      resource: "flightsFuture",
      status: toCapabilityStatus(futureFlightsResult.error),
      headline: "Forward-looking schedule inventory for future departure dates.",
      detail:
        futureFlightsResult.error ??
        `This is now used for future route and airport previews. The current key accepts it when a future date like ${futureWindow.lookupDate} is supplied.`,
      querySummary: `JFK departures on ${futureWindow.lookupDate}`,
      proxyHref: buildProxyHref("flightsFuture", {
        iataCode: "JFK",
        date: futureWindow.lookupDate,
        type: "departure",
        limit: "10",
      }),
      useCases: [
        "Future route calendars",
        "Upcoming airport schedules",
        "Advance route planning",
      ],
      count: getDataCount(futureFlightsResult.data),
      samples: buildFutureFlightSamples(futureFlights),
    },
  ];

  const restrictedCards: AviationCapabilityCard[] = [
    {
      resource: "routes",
      status: toCapabilityStatus(routesResult.error),
      headline: "Native routes endpoint is restricted on the current subscription.",
      detail:
        routesResult.error ??
        "This endpoint is reachable in code but not enabled on the current plan, so the site now derives route intelligence from flights plus flightsFuture instead.",
      querySummary: "JFK to LHR route inventory",
      proxyHref: buildProxyHref("routes", {
        dep_iata: "JFK",
        arr_iata: "LHR",
        limit: "10",
      }),
      useCases: [
        "Route network inventory",
        "Published corridor pages",
        "Direct route catalog",
      ],
      count: null,
      samples: [
        {
          title: "Fallback already applied",
          detail:
            "Search and route pages now use live flights and future schedules instead of relying on this restricted function.",
          chips: ["Plan-restricted", "Handled in UI", "No hard failure"],
        },
      ],
    },
  ];

  return {
    checkedAt: new Date().toISOString(),
    keySource: aviationstackConfig.keySource,
    futureLookupDate: futureWindow.lookupDate,
    availableCards: availableCards.filter((card) => card.status === "available"),
    restrictedCards: restrictedCards.filter((card) => card.status === "restricted"),
    warningCards: [
      ...availableCards.filter((card) => card.status === "warning"),
      ...restrictedCards.filter((card) => card.status === "warning"),
    ],
    notices: uniqueNotices([
      routesResult.error && !isRestrictedError(routesResult.error)
        ? routesResult.error
        : null,
    ]),
  };
}

export function getRouteLinks(route: RouteHighlight) {
  return {
    departureAirport: route.departureIata
      ? `/airports/${route.departureIata}`
      : null,
    arrivalAirport: route.arrivalIata ? `/airports/${route.arrivalIata}` : null,
    routeDetail:
      route.departureIata && route.arrivalIata
        ? `/routes/${route.departureIata}/${route.arrivalIata}`
        : null,
    flightDetail: route.flightIata ? `/flights/${route.flightIata}` : null,
  };
}
