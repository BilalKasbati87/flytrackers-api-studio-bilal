import Link from "next/link";

import {
  formatAviationDateTime,
  getAirportSnapshot,
} from "@/lib/aviation-intelligence";

type AirportPageProps = {
  params: Promise<{ iata: string }>;
};

function FlightBoard({
  title,
  airportCode,
  flights,
  type,
}: {
  title: string;
  airportCode: string;
  flights: Awaited<ReturnType<typeof getAirportSnapshot>>["departures"];
  type: "departure" | "arrival";
}) {
  return (
    <article className="panel p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="chip bg-white/70 text-[color:var(--sky)]">{title}</p>
          <h2 className="section-title mt-4">{airportCode} activity board</h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {flights.length > 0 ? (
          flights.map((flight, index) => {
            const routeHref =
              flight.departureIata && flight.arrivalIata
                ? `/routes/${flight.departureIata}/${flight.arrivalIata}`
                : null;

            return (
              <div
                key={`${flight.flightIata ?? flight.flightNumber ?? title}-${index}`}
                className="rounded-[24px] border border-white/80 bg-white/80 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                      {flight.airlineName ?? "Airline unavailable"}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[color:var(--sea)]">
                      {flight.flightIata ?? flight.flightNumber ?? "Flight unavailable"}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/80 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    {flight.status ?? "Status unavailable"}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      Departure
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[color:var(--sea)]">
                      {flight.departureIata ?? "---"}
                    </p>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">
                      {flight.departureAirport ??
                        (flight.departureIata
                          ? `Airport code ${flight.departureIata}`
                          : "Airport unavailable")}
                    </p>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">
                      Scheduled {formatAviationDateTime(flight.departureScheduled)}
                    </p>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">
                      Estimated {formatAviationDateTime(flight.departureEstimated)}
                    </p>
                    {"departureActual" in flight && flight.departureActual ? (
                      <p className="text-sm leading-7 text-[color:var(--muted)]">
                        Actual {formatAviationDateTime(flight.departureActual)}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      Arrival
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[color:var(--sea)]">
                      {flight.arrivalIata ?? "---"}
                    </p>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">
                      {flight.arrivalAirport ??
                        (flight.arrivalIata
                          ? `Airport code ${flight.arrivalIata}`
                          : "Airport unavailable")}
                    </p>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">
                      Scheduled {formatAviationDateTime(flight.arrivalScheduled)}
                    </p>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">
                      Estimated {formatAviationDateTime(flight.arrivalEstimated)}
                    </p>
                    {"arrivalActual" in flight && flight.arrivalActual ? (
                      <p className="text-sm leading-7 text-[color:var(--muted)]">
                        Actual {formatAviationDateTime(flight.arrivalActual)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {flight.flightIata ? (
                    <Link className="cta-primary" href={`/flights/${flight.flightIata}`}>
                      Flight page
                    </Link>
                  ) : null}
                  {routeHref ? (
                    <Link className="cta-secondary" href={routeHref}>
                      Route page
                    </Link>
                  ) : null}
                  {type === "departure" && flight.arrivalIata ? (
                    <Link className="cta-secondary" href={`/airports/${flight.arrivalIata}`}>
                      Destination airport
                    </Link>
                  ) : null}
                  {type === "arrival" && flight.departureIata ? (
                    <Link className="cta-secondary" href={`/airports/${flight.departureIata}`}>
                      Origin airport
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
            No {title.toLowerCase()} were returned for this airport yet.
          </div>
        )}
      </div>
    </article>
  );
}

export default async function AirportPage({ params }: AirportPageProps) {
  const resolvedParams = await params;
  const snapshot = await getAirportSnapshot(resolvedParams.iata);

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">
                Airport Intelligence
              </span>
              <div className="flex flex-wrap gap-3">
                <Link className="cta-secondary" href="/search">
                  Search workspace
                </Link>
                <Link className="cta-secondary" href="/">
                  Home
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                {snapshot.airport?.name ?? `${snapshot.airportCode} airport`}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                Airport-level monitoring for departures, arrivals, future schedules, and linked route or flight pages. This page uses aviationstack timetable, directory, city, and country data where available.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  IATA: {snapshot.airportCode}
                </span>
                {snapshot.airport?.icao ? (
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    ICAO: {snapshot.airport.icao}
                  </span>
                ) : null}
                {snapshot.city?.name ? (
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    City: {snapshot.city.name}
                  </span>
                ) : null}
                {snapshot.airport?.timezone ? (
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Timezone: {snapshot.airport.timezone}
                  </span>
                ) : null}
                {snapshot.airport?.countryName ? (
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Country: {snapshot.airport.countryName}
                  </span>
                ) : null}
              </div>
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Directory facts</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  City
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {snapshot.city?.name ?? snapshot.airport?.cityCode ?? "Unavailable"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  City code
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {snapshot.airport?.cityCode ?? "Unavailable"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Country ISO2
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {snapshot.country?.iso2 ?? snapshot.airport?.countryIso2 ?? "Unavailable"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Capital and currency
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {snapshot.country?.capital && snapshot.country?.currencyCode
                    ? `${snapshot.country.capital} / ${snapshot.country.currencyCode}`
                    : "Unavailable"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Coordinates
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {snapshot.airport?.latitude && snapshot.airport?.longitude
                    ? `${snapshot.airport.latitude}, ${snapshot.airport.longitude}`
                    : "Unavailable"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Airport phone
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {snapshot.airport?.phoneNumber ?? "Unavailable"}
                </p>
              </div>
            </div>

            {snapshot.notices.length > 0 ? (
              <div className="mt-6 space-y-3">
                {snapshot.notices.map((notice) => (
                  <div
                    key={notice.message}
                    className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900"
                  >
                    {notice.message}
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <FlightBoard
            title="Departures"
            airportCode={snapshot.airportCode}
            flights={snapshot.departures}
            type="departure"
          />
          <FlightBoard
            title="Arrivals"
            airportCode={snapshot.airportCode}
            flights={snapshot.arrivals}
            type="arrival"
          />
        </section>

        <section className="panel p-6 md:p-8">
          <p className="chip bg-white/70 text-[color:var(--sun)]">Future schedule</p>
          <h2 className="section-title mt-5">
            Upcoming departures{snapshot.futureLookupDate ? ` for ${snapshot.futureLookupDate}` : ""}
          </h2>
          <div className="mt-6 space-y-4">
            {snapshot.futureDepartures.length > 0 ? (
              snapshot.futureDepartures.map((flight, index) => (
                <article
                  key={`${flight.codesharedFlightIata ?? flight.flightIata ?? "future"}-${index}`}
                  className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                        {flight.codesharedAirlineName ?? flight.airlineName ?? "Airline unavailable"}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[color:var(--sea)]">
                        {flight.codesharedFlightIata ?? flight.flightIata ?? flight.flightNumber ?? "Future flight"}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/80 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                      {flight.aircraftModelText ?? "Aircraft unavailable"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                        Departure
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[color:var(--sea)]">
                        {flight.departureIata ?? snapshot.airportCode}
                      </p>
                      <p className="text-sm leading-7 text-[color:var(--muted)]">
                        Scheduled {flight.departureScheduled ?? "Unavailable"}
                      </p>
                      <p className="text-sm leading-7 text-[color:var(--muted)]">
                        Terminal {flight.departureTerminal ?? "TBD"} Gate {flight.departureGate ?? "TBD"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                        Arrival
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[color:var(--sea)]">
                        {flight.arrivalIata ?? "---"}
                      </p>
                      <p className="text-sm leading-7 text-[color:var(--muted)]">
                        Scheduled {flight.arrivalScheduled ?? "Unavailable"}
                      </p>
                      <p className="text-sm leading-7 text-[color:var(--muted)]">
                        Terminal {flight.arrivalTerminal ?? "TBD"} Gate {flight.arrivalGate ?? "TBD"}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                No future departures were returned for the next AviationStack future schedule window yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
