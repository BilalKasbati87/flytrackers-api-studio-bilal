import Link from "next/link";

import { SaveTripButton } from "@/components/save-trip-button";
import {
  formatAviationDateTime,
  getFlightSnapshot,
} from "@/lib/aviation-intelligence";

type FlightPageProps = {
  params: Promise<{ flightIata: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getDateValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FlightPage({
  params,
  searchParams,
}: FlightPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const requestedDate = getDateValue(resolvedSearchParams.date);
  const snapshot = await getFlightSnapshot(resolvedParams.flightIata, requestedDate);
  const currentPath = `/flights/${snapshot.flightIata}${snapshot.requestedDate ? `?date=${snapshot.requestedDate}` : ""}`;

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">
                Flight Status
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
                {snapshot.flightIata}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                Direct flight status page backed by aviationstack live and historical flight records, with airline profile enrichment when the carrier code is available.
              </p>
              <SaveTripButton
                title={`Flight ${snapshot.flightIata}`}
                summary="Flight status lookup"
                vertical="flight-status"
                path={currentPath}
                searchState={{
                  flightIata: snapshot.flightIata,
                  date: snapshot.requestedDate,
                }}
              />
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Lookup controls</p>
            <form className="mt-6 space-y-4" action={`/flights/${snapshot.flightIata}`}>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Flight IATA
                </span>
                <input
                  name="flight"
                  defaultValue={snapshot.flightIata}
                  className="field-shell"
                  disabled
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Historical date
                </span>
                <input
                  type="date"
                  name="date"
                  defaultValue={snapshot.requestedDate ?? ""}
                  className="field-shell"
                />
              </label>
              <button className="cta-primary" type="submit">
                Refresh flight lookup
              </button>
            </form>

            {snapshot.airline ? (
              <div className="mt-6 rounded-[24px] border border-white/80 bg-white/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Airline profile
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[color:var(--sea)]">
                  {snapshot.airline.name ?? "Airline unavailable"}
                </h2>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                  <span className="rounded-full border border-white/80 bg-slate-950 px-4 py-2 text-slate-100">
                    {snapshot.airline.iataCode ?? "--"} / {snapshot.airline.icaoCode ?? "--"}
                  </span>
                  {snapshot.airline.hubCode ? (
                    <span className="rounded-full border border-white/80 bg-white px-4 py-2">
                      Hub: {snapshot.airline.hubCode}
                    </span>
                  ) : null}
                  {snapshot.airline.fleetSize ? (
                    <span className="rounded-full border border-white/80 bg-white px-4 py-2">
                      Fleet: {snapshot.airline.fleetSize}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                  {snapshot.airline.countryName ?? "Country unavailable"}{snapshot.airline.dateFounded ? `, founded ${snapshot.airline.dateFounded}` : ""}{snapshot.airline.fleetAverageAge ? `, fleet age ${snapshot.airline.fleetAverageAge} years.` : "."}
                </p>
              </div>
            ) : null}

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

        <section className="panel p-6 md:p-8">
          <p className="chip bg-white/70 text-[color:var(--sky)]">Matches</p>
          <h2 className="section-title mt-5">Flight records</h2>

          <div className="mt-6 space-y-4">
            {snapshot.matches.length > 0 ? (
              snapshot.matches.map((flight, index) => {
                const routeHref =
                  flight.departureIata && flight.arrivalIata
                    ? `/routes/${flight.departureIata}/${flight.arrivalIata}`
                    : null;

                return (
                  <article
                    key={`${flight.flightIata ?? flight.flightNumber ?? "flight"}-${index}`}
                    className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                          {flight.airlineName ?? "Airline unavailable"}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-[color:var(--sea)]">
                          {flight.flightIata ?? flight.flightNumber ?? snapshot.flightIata}
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
                          {flight.departureAirport ?? "Airport unavailable"}
                        </p>
                        <p className="text-sm leading-7 text-[color:var(--muted)]">
                          Scheduled {formatAviationDateTime(flight.departureScheduled)}
                        </p>
                        <p className="text-sm leading-7 text-[color:var(--muted)]">
                          Estimated {formatAviationDateTime(flight.departureEstimated)}
                        </p>
                        <p className="text-sm leading-7 text-[color:var(--muted)]">
                          Delay {flight.departureDelay ?? 0} min
                        </p>
                        {(flight.aircraftRegistration || flight.aircraftIcao24) ? (
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Aircraft {flight.aircraftRegistration ?? flight.aircraftIcao24}
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
                          {flight.arrivalAirport ?? "Airport unavailable"}
                        </p>
                        <p className="text-sm leading-7 text-[color:var(--muted)]">
                          Scheduled {formatAviationDateTime(flight.arrivalScheduled)}
                        </p>
                        <p className="text-sm leading-7 text-[color:var(--muted)]">
                          Estimated {formatAviationDateTime(flight.arrivalEstimated)}
                        </p>
                        <p className="text-sm leading-7 text-[color:var(--muted)]">
                          Delay {flight.arrivalDelay ?? 0} min
                        </p>
                        {(flight.aircraftIata || flight.aircraftIcao) ? (
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Equipment {flight.aircraftIata ?? flight.aircraftIcao}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {flight.departureIata ? (
                        <Link className="cta-secondary" href={`/airports/${flight.departureIata}`}>
                          Departure airport
                        </Link>
                      ) : null}
                      {flight.arrivalIata ? (
                        <Link className="cta-secondary" href={`/airports/${flight.arrivalIata}`}>
                          Arrival airport
                        </Link>
                      ) : null}
                      {routeHref ? (
                        <Link className="cta-primary" href={routeHref}>
                          Route detail
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                No flight records are available for this lookup yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
