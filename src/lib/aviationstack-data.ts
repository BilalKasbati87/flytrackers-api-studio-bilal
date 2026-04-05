import type { RouteHighlight } from "@/types/travel";

export type AviationNotice = {
  tone: "info" | "warning";
  message: string;
};

export type AirportDirectoryRecord = {
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

export type AirlineDirectoryRecord = {
  name: string | null;
  iataCode: string | null;
  icaoCode: string | null;
  callsign: string | null;
  hubCode: string | null;
  countryName: string | null;
  countryIso2: string | null;
  fleetSize: string | null;
  fleetAverageAge: string | null;
  dateFounded: string | null;
  status: string | null;
  type: string | null;
};

export type CityDirectoryRecord = {
  name: string | null;
  iataCode: string | null;
  countryIso2: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
};

export type CountryDirectoryRecord = {
  name: string | null;
  iso2: string | null;
  iso3: string | null;
  capital: string | null;
  continent: string | null;
  currencyCode: string | null;
  currencyName: string | null;
  phonePrefix: string | null;
  population: string | null;
};

export type AirplaneDirectoryRecord = {
  registrationNumber: string | null;
  iataType: string | null;
  modelCode: string | null;
  modelName: string | null;
  planeOwner: string | null;
  planeAge: string | null;
  planeStatus: string | null;
  productionLine: string | null;
  enginesCount: string | null;
  enginesType: string | null;
  airlineIataCode: string | null;
};

export type AircraftTypeRecord = {
  iataCode: string | null;
  name: string | null;
};

export type TaxDirectoryRecord = {
  name: string | null;
  iataCode: string | null;
};

export type AirportBoardEntry = {
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
};

export type FlightStatusEntry = AirportBoardEntry & {
  departureDelay: number | null;
  arrivalDelay: number | null;
  aircraftIata?: string | null;
  aircraftIcao?: string | null;
  aircraftIcao24?: string | null;
  aircraftRegistration?: string | null;
};

export type FutureFlightEntry = {
  airlineName: string | null;
  airlineIata: string | null;
  airlineIcao: string | null;
  flightIata: string | null;
  flightIcao: string | null;
  flightNumber: string | null;
  departureIata: string | null;
  departureIcao: string | null;
  departureScheduled: string | null;
  departureTerminal: string | null;
  departureGate: string | null;
  arrivalIata: string | null;
  arrivalIcao: string | null;
  arrivalScheduled: string | null;
  arrivalTerminal: string | null;
  arrivalGate: string | null;
  aircraftModelCode: string | null;
  aircraftModelText: string | null;
  codesharedAirlineName: string | null;
  codesharedAirlineIata: string | null;
  codesharedFlightIata: string | null;
  weekday: string | null;
};

function parseEmbeddedJsonMessage(message: string) {
  const jsonStart = message.indexOf("{");

  if (jsonStart === -1) {
    return null;
  }

  try {
    const payload = JSON.parse(message.slice(jsonStart)) as Record<string, unknown>;
    const error = asObject(payload.error);
    const context = asObject(error?.context);
    const firstContextValue = context ? Object.values(context)[0] : null;
    const firstContextItem = Array.isArray(firstContextValue)
      ? asObject(firstContextValue[0])
      : null;

    return (
      asString(error?.message) ??
      asString(firstContextItem?.message) ??
      asString(firstContextValue)
    );
  } catch {
    return null;
  }
}

function normalizeCode(value: unknown) {
  const parsed = asString(value);
  return parsed ? parsed.toUpperCase() : null;
}

export function asObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function asString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asNumberLike(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return parseEmbeddedJsonMessage(error.message) ?? error.message;
  }

  return "Request failed.";
}

export function payloadError(value: unknown) {
  const objectValue = asObject(value);
  const errorValue = asObject(objectValue?.error);
  const context = asObject(errorValue?.context);
  const firstContextValue = context ? Object.values(context)[0] : null;
  const firstContextItem = Array.isArray(firstContextValue)
    ? asObject(firstContextValue[0])
    : null;

  return (
    asString(errorValue?.message) ??
    asString(firstContextItem?.message) ??
    asString(firstContextValue)
  );
}

export async function captureRequest(task: () => Promise<unknown>) {
  try {
    const data = await task();
    const error = payloadError(data);

    return {
      data,
      error,
    };
  } catch (error) {
    return {
      data: null,
      error: toErrorMessage(error),
    };
  }
}

export function getFirstDataItem(value: unknown) {
  const objectValue = asObject(value);
  return asObject(asArray(objectValue?.data)[0]);
}

export function getDataItems(value: unknown) {
  const objectValue = asObject(value);
  return asArray(objectValue?.data)
    .map((entry) => asObject(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry));
}

export function getDataCount(value: unknown) {
  return getDataItems(value).length;
}

export function toAirportDirectoryRecord(
  value: unknown,
  iata: string,
): AirportDirectoryRecord | null {
  const airport = getFirstDataItem(value);

  if (!airport) {
    return null;
  }

  return {
    iata,
    icao: normalizeCode(airport.icao_code),
    name: asString(airport.airport_name),
    cityCode: normalizeCode(airport.city_iata_code),
    countryName: asString(airport.country_name),
    countryIso2: normalizeCode(airport.country_iso2),
    timezone: asString(airport.timezone),
    latitude: asString(airport.latitude),
    longitude: asString(airport.longitude),
    phoneNumber: asString(airport.phone_number),
  };
}

export function toAirlineDirectoryRecord(value: unknown): AirlineDirectoryRecord | null {
  const airline = getFirstDataItem(value);

  if (!airline) {
    return null;
  }

  return {
    name: asString(airline.airline_name),
    iataCode: normalizeCode(airline.iata_code),
    icaoCode: normalizeCode(airline.icao_code),
    callsign: asString(airline.callsign),
    hubCode: normalizeCode(airline.hub_code),
    countryName: asString(airline.country_name),
    countryIso2: normalizeCode(airline.country_iso2),
    fleetSize: asString(airline.fleet_size),
    fleetAverageAge: asString(airline.fleet_average_age),
    dateFounded: asString(airline.date_founded),
    status: asString(airline.status),
    type: asString(airline.type),
  };
}

export function toCityDirectoryRecord(value: unknown): CityDirectoryRecord | null {
  const city = getFirstDataItem(value);

  if (!city) {
    return null;
  }

  return {
    name: asString(city.city_name),
    iataCode: normalizeCode(city.iata_code),
    countryIso2: normalizeCode(city.country_iso2),
    timezone: asString(city.timezone),
    latitude: asString(city.latitude),
    longitude: asString(city.longitude),
  };
}

export function toCountryDirectoryRecord(value: unknown): CountryDirectoryRecord | null {
  const country = getFirstDataItem(value);

  if (!country) {
    return null;
  }

  return {
    name: asString(country.country_name),
    iso2: normalizeCode(country.country_iso2),
    iso3: normalizeCode(country.country_iso3),
    capital: asString(country.capital),
    continent: asString(country.continent),
    currencyCode: normalizeCode(country.currency_code),
    currencyName: asString(country.currency_name),
    phonePrefix: asString(country.phone_prefix),
    population: asString(country.population),
  };
}

export function toAirplaneDirectoryRecords(
  value: unknown,
  limit = 4,
): AirplaneDirectoryRecord[] {
  return getDataItems(value).slice(0, limit).map((item) => ({
    registrationNumber: asString(item.registration_number),
    iataType: asString(item.iata_type),
    modelCode: asString(item.model_code),
    modelName: asString(item.model_name),
    planeOwner: asString(item.plane_owner),
    planeAge: asString(item.plane_age),
    planeStatus: asString(item.plane_status),
    productionLine: asString(item.production_line),
    enginesCount: asString(item.engines_count),
    enginesType: asString(item.engines_type),
    airlineIataCode: normalizeCode(item.airline_iata_code),
  }));
}

export function toAircraftTypeRecords(
  value: unknown,
  limit = 4,
): AircraftTypeRecord[] {
  return getDataItems(value).slice(0, limit).map((item) => ({
    iataCode: normalizeCode(item.iata_code),
    name: asString(item.aircraft_name),
  }));
}

export function toTaxRecords(value: unknown, limit = 6): TaxDirectoryRecord[] {
  return getDataItems(value).slice(0, limit).map((item) => ({
    name: asString(item.tax_name),
    iataCode: normalizeCode(item.iata_code),
  }));
}

export function toFlightStatusEntries(value: unknown): FlightStatusEntry[] {
  return getDataItems(value).map((item) => {
    const airline = asObject(item.airline);
    const departure = asObject(item.departure);
    const arrival = asObject(item.arrival);
    const flight = asObject(item.flight);
    const aircraft = asObject(item.aircraft);
    const airlineIata = normalizeCode(airline?.iata) ?? normalizeCode(airline?.iataCode);
    const flightNumber = asString(flight?.number);

    return {
      airlineName: asString(airline?.name),
      airlineIata,
      airlineIcao: normalizeCode(airline?.icao) ?? normalizeCode(airline?.icaoCode),
      flightIata:
        normalizeCode(flight?.iata) ??
        normalizeCode(flight?.iataNumber) ??
        (airlineIata && flightNumber ? `${airlineIata}${flightNumber}` : null),
      flightIcao: normalizeCode(flight?.icao) ?? normalizeCode(flight?.icaoNumber),
      flightNumber,
      status: asString(item.flight_status) ?? asString(item.status),
      departureAirport: asString(departure?.airport),
      departureIata: normalizeCode(departure?.iata) ?? normalizeCode(departure?.iataCode),
      departureIcao: normalizeCode(departure?.icao) ?? normalizeCode(departure?.icaoCode),
      departureScheduled:
        asString(departure?.scheduled) ?? asString(departure?.scheduledTime),
      departureEstimated:
        asString(departure?.estimated) ?? asString(departure?.estimatedTime),
      departureActual:
        asString(departure?.actual) ?? asString(departure?.actualTime),
      departureTerminal:
        asString(departure?.terminal) ?? asString(departure?.dep_terminal),
      departureGate: asString(departure?.gate),
      arrivalAirport: asString(arrival?.airport),
      arrivalIata: normalizeCode(arrival?.iata) ?? normalizeCode(arrival?.iataCode),
      arrivalIcao: normalizeCode(arrival?.icao) ?? normalizeCode(arrival?.icaoCode),
      arrivalScheduled:
        asString(arrival?.scheduled) ?? asString(arrival?.scheduledTime),
      arrivalEstimated:
        asString(arrival?.estimated) ?? asString(arrival?.estimatedTime),
      arrivalActual: asString(arrival?.actual) ?? asString(arrival?.actualTime),
      arrivalTerminal:
        asString(arrival?.terminal) ?? asString(arrival?.arr_terminal),
      arrivalGate: asString(arrival?.gate),
      arrivalBaggage: asString(arrival?.baggage),
      departureDelay: asNumberLike(departure?.delay),
      arrivalDelay: asNumberLike(arrival?.delay),
      aircraftIata: normalizeCode(aircraft?.iata) ?? normalizeCode(aircraft?.iataCode),
      aircraftIcao: normalizeCode(aircraft?.icao) ?? normalizeCode(aircraft?.icaoCode),
      aircraftIcao24: normalizeCode(aircraft?.icao24),
      aircraftRegistration:
        asString(aircraft?.registration) ?? asString(aircraft?.regNumber),
    } satisfies FlightStatusEntry;
  });
}

export function toTimetableEntries(value: unknown): FlightStatusEntry[] {
  return getDataItems(value).map((item) => {
    const airline = asObject(item.airline);
    const departure = asObject(item.departure);
    const arrival = asObject(item.arrival);
    const flight = asObject(item.flight);
    const aircraft = asObject(item.aircraft);
    const airlineIata =
      normalizeCode(airline?.iataCode) ?? normalizeCode(airline?.iata);
    const flightNumber = asString(flight?.number);

    return {
      airlineName: asString(airline?.name),
      airlineIata,
      airlineIcao: normalizeCode(airline?.icaoCode) ?? normalizeCode(airline?.icao),
      flightIata:
        normalizeCode(flight?.iataNumber) ??
        normalizeCode(flight?.iata) ??
        (airlineIata && flightNumber ? `${airlineIata}${flightNumber}` : null),
      flightIcao: normalizeCode(flight?.icaoNumber) ?? normalizeCode(flight?.icao),
      flightNumber,
      status: asString(item.status),
      departureAirport: null,
      departureIata: normalizeCode(departure?.iataCode) ?? normalizeCode(departure?.iata),
      departureIcao: normalizeCode(departure?.icaoCode) ?? normalizeCode(departure?.icao),
      departureScheduled:
        asString(departure?.scheduledTime) ?? asString(departure?.scheduled),
      departureEstimated:
        asString(departure?.estimatedTime) ?? asString(departure?.estimated),
      departureActual: asString(departure?.actualTime) ?? asString(departure?.actual),
      departureTerminal: asString(departure?.terminal),
      departureGate: asString(departure?.gate),
      arrivalAirport: null,
      arrivalIata: normalizeCode(arrival?.iataCode) ?? normalizeCode(arrival?.iata),
      arrivalIcao: normalizeCode(arrival?.icaoCode) ?? normalizeCode(arrival?.icao),
      arrivalScheduled:
        asString(arrival?.scheduledTime) ?? asString(arrival?.scheduled),
      arrivalEstimated:
        asString(arrival?.estimatedTime) ?? asString(arrival?.estimated),
      arrivalActual: asString(arrival?.actualTime) ?? asString(arrival?.actual),
      arrivalTerminal: asString(arrival?.terminal),
      arrivalGate: asString(arrival?.gate),
      arrivalBaggage: asString(arrival?.baggage),
      departureDelay: asNumberLike(departure?.delay),
      arrivalDelay: asNumberLike(arrival?.delay),
      aircraftIata: normalizeCode(aircraft?.iataCode) ?? normalizeCode(aircraft?.iata),
      aircraftIcao: normalizeCode(aircraft?.icaoCode) ?? normalizeCode(aircraft?.icao),
      aircraftIcao24: normalizeCode(aircraft?.icao24),
      aircraftRegistration:
        asString(aircraft?.registration) ?? asString(aircraft?.regNumber),
    } satisfies FlightStatusEntry;
  });
}

export function toRouteHighlightsFromFlights(entries: FlightStatusEntry[]): RouteHighlight[] {
  return entries.map((entry) => ({
    airlineName: entry.airlineName,
    airlineIata: entry.airlineIata,
    flightNumber: entry.flightNumber,
    flightIata: entry.flightIata,
    departureIata: entry.departureIata,
    arrivalIata: entry.arrivalIata,
    departureAirport: entry.departureAirport,
    arrivalAirport: entry.arrivalAirport,
    departureTime: entry.departureEstimated ?? entry.departureScheduled,
    arrivalTime: entry.arrivalEstimated ?? entry.arrivalScheduled,
  }));
}

export function toFutureFlightEntries(value: unknown): FutureFlightEntry[] {
  return getDataItems(value).map((item) => {
    const airline = asObject(item.airline);
    const departure = asObject(item.departure);
    const arrival = asObject(item.arrival);
    const flight = asObject(item.flight);
    const aircraft = asObject(item.aircraft);
    const codeshared = asObject(item.codeshared);
    const codesharedAirline = asObject(codeshared?.airline);
    const codesharedFlight = asObject(codeshared?.flight);
    const airlineIata =
      normalizeCode(airline?.iataCode) ?? normalizeCode(airline?.iata);
    const flightNumber = asString(flight?.number);
    const codesharedAirlineIata =
      normalizeCode(codesharedAirline?.iataCode) ??
      normalizeCode(codesharedAirline?.iata);
    const codesharedFlightNumber = asString(codesharedFlight?.number);

    return {
      airlineName: asString(airline?.name),
      airlineIata,
      airlineIcao: normalizeCode(airline?.icaoCode) ?? normalizeCode(airline?.icao),
      flightIata:
        normalizeCode(flight?.iataNumber) ??
        normalizeCode(flight?.iata) ??
        (airlineIata && flightNumber ? `${airlineIata}${flightNumber}` : null),
      flightIcao: normalizeCode(flight?.icaoNumber) ?? normalizeCode(flight?.icao),
      flightNumber,
      departureIata: normalizeCode(departure?.iataCode) ?? normalizeCode(departure?.iata),
      departureIcao: normalizeCode(departure?.icaoCode) ?? normalizeCode(departure?.icao),
      departureScheduled:
        asString(departure?.scheduledTime) ?? asString(departure?.scheduled),
      departureTerminal: asString(departure?.terminal),
      departureGate: asString(departure?.gate),
      arrivalIata: normalizeCode(arrival?.iataCode) ?? normalizeCode(arrival?.iata),
      arrivalIcao: normalizeCode(arrival?.icaoCode) ?? normalizeCode(arrival?.icao),
      arrivalScheduled:
        asString(arrival?.scheduledTime) ?? asString(arrival?.scheduled),
      arrivalTerminal: asString(arrival?.terminal),
      arrivalGate: asString(arrival?.gate),
      aircraftModelCode:
        normalizeCode(aircraft?.modelCode) ?? normalizeCode(aircraft?.model_code),
      aircraftModelText:
        asString(aircraft?.modelText) ?? asString(aircraft?.model_text),
      codesharedAirlineName: asString(codesharedAirline?.name),
      codesharedAirlineIata,
      codesharedFlightIata:
        normalizeCode(codesharedFlight?.iataNumber) ??
        normalizeCode(codesharedFlight?.iata) ??
        (codesharedAirlineIata && codesharedFlightNumber
          ? `${codesharedAirlineIata}${codesharedFlightNumber}`
          : null),
      weekday: asString(item.weekday),
    } satisfies FutureFlightEntry;
  });
}

export function filterFutureFlightsByRoute(
  entries: FutureFlightEntry[],
  origin?: string | null,
  destination?: string | null,
) {
  return entries.filter((entry) => {
    const matchesOrigin = origin ? entry.departureIata === origin.toUpperCase() : true;
    const matchesDestination = destination
      ? entry.arrivalIata === destination.toUpperCase()
      : true;

    return matchesOrigin && matchesDestination;
  });
}

export function uniqueNotices(messages: Array<string | null | undefined>) {
  return [...new Set(messages.filter((entry): entry is string => Boolean(entry)))].map(
    (message) => ({
      tone: "warning" as const,
      message,
    }),
  );
}

export function baseBlockedNotice() {
  return [
    {
      tone: "warning" as const,
      message:
        "Set AVIATIONSTACK_API_KEY or keep the attached AviationStack file in place to unlock airport intelligence, flight status, and future schedule lookups.",
    },
  ];
}

export function infoNotices(messages: string[]) {
  return messages.map((message) => ({
    tone: "info" as const,
    message,
  }));
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function buildFutureLookupWindow(preferredDate?: string | null) {
  const minimumDate = new Date();
  minimumDate.setUTCHours(0, 0, 0, 0);
  minimumDate.setUTCDate(minimumDate.getUTCDate() + 10);
  const minimumDateValue = formatDateInput(minimumDate);
  const normalizedPreferred = asString(preferredDate);

  if (normalizedPreferred && normalizedPreferred >= minimumDateValue) {
    return {
      lookupDate: normalizedPreferred,
      adjusted: false,
      minimumDate: minimumDateValue,
    };
  }

  return {
    lookupDate: minimumDateValue,
    adjusted: Boolean(normalizedPreferred),
    minimumDate: minimumDateValue,
  };
}

export function formatAviationDateTime(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}
