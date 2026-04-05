import type { SearchBlueprint, RouteHighlight } from "@/types/travel";

export type DemoAirportDirectoryRecord = {
  iata: string;
  icao?: string | null;
  name: string | null;
  cityCode: string | null;
  countryName: string | null;
  countryIso2: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
  phoneNumber?: string | null;
};

export type DemoFlightStatusEntry = {
  airlineName: string | null;
  airlineIata: string | null;
  airlineIcao?: string | null;
  flightIata: string | null;
  flightIcao?: string | null;
  flightNumber: string | null;
  status: string | null;
  departureAirport: string | null;
  departureIata: string | null;
  departureIcao?: string | null;
  departureScheduled: string | null;
  departureEstimated: string | null;
  departureActual?: string | null;
  departureTerminal: string | null;
  departureGate: string | null;
  arrivalAirport: string | null;
  arrivalIata: string | null;
  arrivalIcao?: string | null;
  arrivalScheduled: string | null;
  arrivalEstimated: string | null;
  arrivalActual?: string | null;
  arrivalTerminal: string | null;
  arrivalGate: string | null;
  arrivalBaggage: string | null;
  departureDelay: number | null;
  arrivalDelay: number | null;
  aircraftIata?: string | null;
  aircraftIcao?: string | null;
  aircraftIcao24?: string | null;
  aircraftRegistration?: string | null;
};

const DEMO_NOTICE =
  "Demo aviation data is active locally. Add AVIATIONSTACK_API_KEY later to switch these pages to live provider responses.";

const airports: Record<string, DemoAirportDirectoryRecord> = {
  JFK: {
    iata: "JFK",
    name: "John F. Kennedy International Airport",
    cityCode: "NYC",
    countryName: "United States",
    countryIso2: "US",
    timezone: "America/New_York",
    latitude: "40.6413",
    longitude: "-73.7781",
  },
  LHR: {
    iata: "LHR",
    name: "Heathrow Airport",
    cityCode: "LON",
    countryName: "United Kingdom",
    countryIso2: "GB",
    timezone: "Europe/London",
    latitude: "51.4700",
    longitude: "-0.4543",
  },
  CDG: {
    iata: "CDG",
    name: "Paris Charles de Gaulle Airport",
    cityCode: "PAR",
    countryName: "France",
    countryIso2: "FR",
    timezone: "Europe/Paris",
    latitude: "49.0097",
    longitude: "2.5479",
  },
  LAX: {
    iata: "LAX",
    name: "Los Angeles International Airport",
    cityCode: "LAX",
    countryName: "United States",
    countryIso2: "US",
    timezone: "America/Los_Angeles",
    latitude: "33.9416",
    longitude: "-118.4085",
  },
  HND: {
    iata: "HND",
    name: "Tokyo Haneda Airport",
    cityCode: "TYO",
    countryName: "Japan",
    countryIso2: "JP",
    timezone: "Asia/Tokyo",
    latitude: "35.5494",
    longitude: "139.7798",
  },
  DXB: {
    iata: "DXB",
    name: "Dubai International Airport",
    cityCode: "DXB",
    countryName: "United Arab Emirates",
    countryIso2: "AE",
    timezone: "Asia/Dubai",
    latitude: "25.2532",
    longitude: "55.3657",
  },
  SIN: {
    iata: "SIN",
    name: "Singapore Changi Airport",
    cityCode: "SIN",
    countryName: "Singapore",
    countryIso2: "SG",
    timezone: "Asia/Singapore",
    latitude: "1.3644",
    longitude: "103.9915",
  },
};

function isoAt(date: string, hours: number, minutes: number) {
  const timestamp = new Date(`${date}T00:00:00.000Z`);
  timestamp.setUTCHours(hours, minutes, 0, 0);
  return timestamp.toISOString();
}

function plusMinutes(value: string, minutes: number) {
  const timestamp = new Date(value);
  timestamp.setUTCMinutes(timestamp.getUTCMinutes() + minutes);
  return timestamp.toISOString();
}

function airportName(iata: string) {
  return airports[iata]?.name ?? `${iata} Demo Airport`;
}

function buildFlight(input: {
  airlineName: string;
  airlineIata: string;
  flightNumber: string;
  status: string;
  departureIata: string;
  arrivalIata: string;
  date: string;
  departureHour: number;
  departureMinute: number;
  durationMinutes: number;
  departureDelay: number;
  arrivalDelay: number;
  departureTerminal: string;
  arrivalTerminal: string;
  departureGate: string;
  arrivalGate: string;
  arrivalBaggage: string;
}): DemoFlightStatusEntry {
  const departureScheduled = isoAt(
    input.date,
    input.departureHour,
    input.departureMinute,
  );
  const arrivalScheduled = plusMinutes(departureScheduled, input.durationMinutes);

  return {
    airlineName: input.airlineName,
    airlineIata: input.airlineIata,
    flightIata: `${input.airlineIata}${input.flightNumber}`,
    flightNumber: input.flightNumber,
    status: input.status,
    departureAirport: airportName(input.departureIata),
    departureIata: input.departureIata,
    departureScheduled,
    departureEstimated: plusMinutes(departureScheduled, input.departureDelay),
    departureTerminal: input.departureTerminal,
    departureGate: input.departureGate,
    arrivalAirport: airportName(input.arrivalIata),
    arrivalIata: input.arrivalIata,
    arrivalScheduled,
    arrivalEstimated: plusMinutes(arrivalScheduled, input.arrivalDelay),
    arrivalTerminal: input.arrivalTerminal,
    arrivalGate: input.arrivalGate,
    arrivalBaggage: input.arrivalBaggage,
    departureDelay: input.departureDelay,
    arrivalDelay: input.arrivalDelay,
  };
}

const demoFlights: DemoFlightStatusEntry[] = [
  buildFlight({
    airlineName: "American Airlines",
    airlineIata: "AA",
    flightNumber: "1004",
    status: "active",
    departureIata: "JFK",
    arrivalIata: "LHR",
    date: "2026-06-15",
    departureHour: 22,
    departureMinute: 10,
    durationMinutes: 415,
    departureDelay: 10,
    arrivalDelay: 14,
    departureTerminal: "8",
    arrivalTerminal: "5",
    departureGate: "14",
    arrivalGate: "B42",
    arrivalBaggage: "7",
  }),
  buildFlight({
    airlineName: "British Airways",
    airlineIata: "BA",
    flightNumber: "178",
    status: "scheduled",
    departureIata: "JFK",
    arrivalIata: "LHR",
    date: "2026-06-15",
    departureHour: 23,
    departureMinute: 5,
    durationMinutes: 405,
    departureDelay: 0,
    arrivalDelay: 6,
    departureTerminal: "7",
    arrivalTerminal: "5",
    departureGate: "6",
    arrivalGate: "C53",
    arrivalBaggage: "5",
  }),
  buildFlight({
    airlineName: "Virgin Atlantic",
    airlineIata: "VS",
    flightNumber: "4",
    status: "landed",
    departureIata: "JFK",
    arrivalIata: "LHR",
    date: "2026-06-14",
    departureHour: 22,
    departureMinute: 45,
    durationMinutes: 400,
    departureDelay: 5,
    arrivalDelay: 2,
    departureTerminal: "4",
    arrivalTerminal: "3",
    departureGate: "A9",
    arrivalGate: "22",
    arrivalBaggage: "3",
  }),
  buildFlight({
    airlineName: "Air France",
    airlineIata: "AF",
    flightNumber: "11",
    status: "active",
    departureIata: "JFK",
    arrivalIata: "CDG",
    date: "2026-06-15",
    departureHour: 21,
    departureMinute: 40,
    durationMinutes: 435,
    departureDelay: 12,
    arrivalDelay: 18,
    departureTerminal: "1",
    arrivalTerminal: "2E",
    departureGate: "3",
    arrivalGate: "L31",
    arrivalBaggage: "11",
  }),
  buildFlight({
    airlineName: "Air France",
    airlineIata: "AF",
    flightNumber: "1681",
    status: "scheduled",
    departureIata: "LHR",
    arrivalIata: "CDG",
    date: "2026-06-15",
    departureHour: 9,
    departureMinute: 15,
    durationMinutes: 75,
    departureDelay: 0,
    arrivalDelay: 4,
    departureTerminal: "4",
    arrivalTerminal: "2F",
    departureGate: "14",
    arrivalGate: "F29",
    arrivalBaggage: "24",
  }),
  buildFlight({
    airlineName: "Japan Airlines",
    airlineIata: "JL",
    flightNumber: "61",
    status: "active",
    departureIata: "LAX",
    arrivalIata: "HND",
    date: "2026-06-15",
    departureHour: 17,
    departureMinute: 10,
    durationMinutes: 690,
    departureDelay: 7,
    arrivalDelay: 10,
    departureTerminal: "B",
    arrivalTerminal: "3",
    departureGate: "151",
    arrivalGate: "112",
    arrivalBaggage: "9",
  }),
  buildFlight({
    airlineName: "Emirates",
    airlineIata: "EK",
    flightNumber: "404",
    status: "scheduled",
    departureIata: "DXB",
    arrivalIata: "SIN",
    date: "2026-06-15",
    departureHour: 2,
    departureMinute: 55,
    durationMinutes: 440,
    departureDelay: 0,
    arrivalDelay: 8,
    departureTerminal: "3",
    arrivalTerminal: "1",
    departureGate: "A10",
    arrivalGate: "C18",
    arrivalBaggage: "31",
  }),
];

function getAirportRecord(code: string): DemoAirportDirectoryRecord {
  return airports[code] ?? {
    iata: code,
    name: `${code} Demo Airport`,
    cityCode: code,
    countryName: "Demo Country",
    countryIso2: "DM",
    timezone: "UTC",
    latitude: null,
    longitude: null,
  };
}

function asDateHint(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "2026-06-15";
}

function createSyntheticFlight(
  origin: string,
  destination: string,
  index: number,
  dateHint?: string,
): DemoFlightStatusEntry {
  const date = asDateHint(dateHint);

  return buildFlight({
    airlineName: "FlyTrackers Demo Air",
    airlineIata: "FT",
    flightNumber: `${410 + index}`,
    status: index % 2 === 0 ? "scheduled" : "active",
    departureIata: origin,
    arrivalIata: destination,
    date,
    departureHour: 8 + index * 5,
    departureMinute: index % 2 === 0 ? 10 : 35,
    durationMinutes: 140 + index * 35,
    departureDelay: index * 5,
    arrivalDelay: index * 7,
    departureTerminal: `${1 + index}`,
    arrivalTerminal: `${2 + index}`,
    departureGate: `${String.fromCharCode(65 + index)}${10 + index}`,
    arrivalGate: `${String.fromCharCode(66 + index)}${20 + index}`,
    arrivalBaggage: `${6 + index}`,
  });
}

function toRouteHighlight(flight: DemoFlightStatusEntry): RouteHighlight {
  return {
    airlineName: flight.airlineName,
    airlineIata: flight.airlineIata,
    flightNumber: flight.flightNumber,
    flightIata: flight.flightIata,
    departureIata: flight.departureIata,
    arrivalIata: flight.arrivalIata,
    departureAirport: flight.departureAirport,
    arrivalAirport: flight.arrivalAirport,
    departureTime: flight.departureScheduled,
    arrivalTime: flight.arrivalScheduled,
  };
}

export function getDemoRoutePreview(input: Partial<SearchBlueprint>) {
  const origin = input.origin?.toUpperCase();
  const destination = input.destination?.toUpperCase();

  if (!origin || !destination) {
    return {
      routeHighlights: [] as RouteHighlight[],
      routeCount: 0,
      notices: [DEMO_NOTICE],
    };
  }

  const matchingFlights = demoFlights.filter(
    (flight) =>
      flight.departureIata === origin && flight.arrivalIata === destination,
  );
  const previewFlights =
    matchingFlights.length > 0
      ? matchingFlights
      : [
          createSyntheticFlight(origin, destination, 0, input.departDate),
          createSyntheticFlight(origin, destination, 1, input.departDate),
        ];

  return {
    routeHighlights: previewFlights.map(toRouteHighlight),
    routeCount: previewFlights.length,
    notices: [DEMO_NOTICE],
  };
}

export function getDemoRouteLiveFlights(input: Partial<SearchBlueprint>) {
  const origin = input.origin?.toUpperCase();
  const destination = input.destination?.toUpperCase();

  if (!origin || !destination) {
    return {
      liveFlights: [] as DemoFlightStatusEntry[],
      notices: [DEMO_NOTICE],
    };
  }

  const matchingFlights = demoFlights.filter(
    (flight) =>
      flight.departureIata === origin && flight.arrivalIata === destination,
  );

  return {
    liveFlights:
      matchingFlights.length > 0
        ? matchingFlights
        : [
            createSyntheticFlight(origin, destination, 0, input.departDate),
            createSyntheticFlight(origin, destination, 1, input.departDate),
          ],
    notices: [DEMO_NOTICE],
  };
}

export function getDemoAirportSnapshot(iata: string) {
  const airportCode = iata.trim().toUpperCase();
  const departures = demoFlights.filter(
    (flight) => flight.departureIata === airportCode,
  );
  const arrivals = demoFlights.filter(
    (flight) => flight.arrivalIata === airportCode,
  );
  const fallbackDestination = airportCode === "JFK" ? "LHR" : "JFK";
  const fallbackOrigin = airportCode === "LHR" ? "JFK" : "LHR";

  return {
    airportCode,
    airport: getAirportRecord(airportCode),
    departures:
      departures.length > 0
        ? departures.slice(0, 8)
        : [createSyntheticFlight(airportCode, fallbackDestination, 0)],
    arrivals:
      arrivals.length > 0
        ? arrivals.slice(0, 8)
        : [createSyntheticFlight(fallbackOrigin, airportCode, 1)],
    notices: [DEMO_NOTICE],
  };
}

export function getDemoFlightSnapshot(flightIata: string, date?: string) {
  const normalizedFlightIata = flightIata.trim().toUpperCase();
  const matches = demoFlights.filter(
    (flight) => flight.flightIata === normalizedFlightIata,
  );

  return {
    flightIata: normalizedFlightIata,
    requestedDate: date ?? null,
    matches,
    notices: [
      DEMO_NOTICE,
      ...(matches.length === 0
        ? [
            "No exact demo record matched this flight code yet. Add the real provider key later for live historical lookup depth.",
          ]
        : []),
    ],
  };
}
