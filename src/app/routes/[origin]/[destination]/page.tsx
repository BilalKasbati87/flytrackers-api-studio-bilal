import Link from "next/link";

import { SaveTripButton } from "@/components/save-trip-button";
import {
  formatAviationDateTime,
  getRouteDetailSnapshot,
  getRouteLinks,
} from "@/lib/aviation-intelligence";
import { buildTrackedOutboundHref } from "@/lib/partner-links";
import { searchBlueprintFromRecord } from "@/lib/travel-search";

type RouteDetailPageProps = {
  params: Promise<{ origin: string; destination: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RouteDetailPage({
  params,
  searchParams,
}: RouteDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const query = searchBlueprintFromRecord({
    ...resolvedSearchParams,
    origin: resolvedParams.origin,
    destination: resolvedParams.destination,
  });
  const snapshot = await getRouteDetailSnapshot(query);
  const currentPath = `/routes/${snapshot.query.origin ?? resolvedParams.origin}/${snapshot.query.destination ?? resolvedParams.destination}?departDate=${snapshot.query.departDate ?? ""}&returnDate=${snapshot.query.returnDate ?? ""}`;

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">
                Route Detail
              </span>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="cta-secondary"
                  href={`/search?origin=${snapshot.query.origin ?? ""}&destination=${snapshot.query.destination ?? ""}&departDate=${snapshot.query.departDate ?? ""}&returnDate=${snapshot.query.returnDate ?? ""}`}
                >
                  Search workspace
                </Link>
                <Link className="cta-secondary" href="/">
                  Home
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                {snapshot.query.origin ?? "---"} to {snapshot.query.destination ?? "---"}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                Route-level planning page for live aviation activity, forward-looking schedule coverage, and partner handoff decisions.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Depart date: {snapshot.query.departDate ?? "not set"}
                </span>
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Return date: {snapshot.query.returnDate ?? "one-way"}
                </span>
              </div>
              <SaveTripButton
                title={`${snapshot.query.origin ?? "Origin"} to ${snapshot.query.destination ?? "Destination"}`}
                summary="Route detail planning state"
                vertical="route-plan"
                path={currentPath}
                searchState={snapshot.query}
              />
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Quick actions</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {snapshot.query.origin ? (
                <Link className="cta-secondary" href={`/airports/${snapshot.query.origin}`}>
                  Origin airport
                </Link>
              ) : null}
              {snapshot.query.destination ? (
                <Link className="cta-secondary" href={`/airports/${snapshot.query.destination}`}>
                  Destination airport
                </Link>
              ) : null}
              {snapshot.query.destination ? (
                <Link
                  className="cta-secondary"
                  href={`/destinations/${snapshot.query.destination.toLowerCase()}?airport=${snapshot.query.destination ?? ""}&origin=${snapshot.query.origin ?? ""}&departDate=${snapshot.query.departDate ?? "2026-06-15"}&returnDate=${snapshot.query.returnDate ?? snapshot.query.departDate ?? "2026-06-20"}`}
                >
                  Destination hub
                </Link>
              ) : null}
              {snapshot.kayakRouteLinks.flights ? (
                <a
                  className="cta-primary"
                  href={buildTrackedOutboundHref({
                    destinationUrl: snapshot.kayakRouteLinks.flights,
                    provider: "kayak",
                    vertical: "flights",
                    label: `Route handoff ${snapshot.query.origin ?? ""} to ${snapshot.query.destination ?? ""}`,
                    sourcePath: currentPath,
                    metadata: {
                      origin: snapshot.query.origin ?? null,
                      destination: snapshot.query.destination ?? null,
                    },
                  })}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open KAYAK flights
                </a>
              ) : null}
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

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sky)]">Live corridor feed</p>
            <h2 className="section-title mt-5">Current route activity</h2>
            <div className="mt-6 space-y-4">
              {snapshot.aviationstack.routeHighlights.length > 0 ? (
                snapshot.aviationstack.routeHighlights.map((route, index) => {
                  const links = getRouteLinks(route);

                  return (
                    <div
                      key={`${route.flightIata ?? route.flightNumber ?? "route"}-${index}`}
                      className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                            {route.airlineName ?? "Airline unavailable"}
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-[color:var(--sea)]">
                            {route.flightIata ?? route.flightNumber ?? "Route record"}
                          </p>
                        </div>
                        {links.flightDetail ? (
                          <Link className="cta-primary" href={links.flightDetail}>
                            Flight page
                          </Link>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                            Departure
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[color:var(--sea)]">
                            {route.departureIata ?? "---"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            {route.departureAirport ?? "Airport unavailable"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Time {route.departureTime ?? "Unavailable"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                            Arrival
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[color:var(--sea)]">
                            {route.arrivalIata ?? "---"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            {route.arrivalAirport ?? "Airport unavailable"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Time {route.arrivalTime ?? "Unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {links.departureAirport ? (
                          <Link className="cta-secondary" href={links.departureAirport}>
                            Departure airport
                          </Link>
                        ) : null}
                        {links.arrivalAirport ? (
                          <Link className="cta-secondary" href={links.arrivalAirport}>
                            Arrival airport
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                  No route records are available yet for this city pair.
                </div>
              )}
            </div>
          </article>

          <div className="space-y-6">
            <article className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-[color:var(--sun)]">Flights endpoint</p>
              <h2 className="section-title mt-5">Current flight activity</h2>
              <div className="mt-6 space-y-4">
                {snapshot.liveFlights.length > 0 ? (
                  snapshot.liveFlights.map((flight, index) => (
                    <div
                      key={`${flight.flightIata ?? flight.flightNumber ?? "flight"}-${index}`}
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
                        {flight.flightIata ? (
                          <Link className="cta-primary" href={`/flights/${flight.flightIata}`}>
                            Open flight page
                          </Link>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                            Departure
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            {flight.departureAirport ?? snapshot.query.origin ?? "Airport unavailable"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Scheduled {formatAviationDateTime(flight.departureScheduled)}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Delay {flight.departureDelay ?? 0} min
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                            Arrival
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            {flight.arrivalAirport ?? snapshot.query.destination ?? "Airport unavailable"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Estimated {formatAviationDateTime(flight.arrivalEstimated)}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Delay {flight.arrivalDelay ?? 0} min
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                    No live or current flight matches were returned for this route.
                  </div>
                )}
              </div>
            </article>

            <article className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-cyan-700">Future schedule</p>
              <h2 className="section-title mt-5">
                Upcoming corridor flights
                {snapshot.futureLookupDate ? ` on ${snapshot.futureLookupDate}` : ""}
              </h2>
              <div className="mt-6 space-y-4">
                {snapshot.futureFlights.length > 0 ? (
                  snapshot.futureFlights.map((flight, index) => (
                    <div
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
                            {flight.departureIata ?? snapshot.query.origin ?? "---"}
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
                            {flight.arrivalIata ?? snapshot.query.destination ?? "---"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Scheduled {flight.arrivalScheduled ?? "Unavailable"}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--muted)]">
                            Terminal {flight.arrivalTerminal ?? "TBD"} Gate {flight.arrivalGate ?? "TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                    No future schedule rows were returned for this route yet.
                  </div>
                )}
              </div>
            </article>

            <article className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-cyan-700">Travel handoff</p>
              <h2 className="section-title mt-5">Monetization and booking next step</h2>
              <div className="mt-6 grid gap-3">
                {Object.entries(snapshot.kayakRouteLinks).map(([vertical, link]) => (
                  <div
                    key={vertical}
                    className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold capitalize text-[color:var(--sea)]">
                        KAYAK {vertical}
                      </p>
                      {link ? (
                        <a
                          className="cta-primary"
                          href={buildTrackedOutboundHref({
                            destinationUrl: link,
                            provider: "kayak",
                            vertical,
                            label: `Route ${vertical} handoff`,
                            sourcePath: currentPath,
                            metadata: {
                              origin: snapshot.query.origin ?? null,
                              destination: snapshot.query.destination ?? null,
                            },
                          })}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open {vertical}
                        </a>
                      ) : (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                          Needs config
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
                Expedia Rapid remains the lodging and car follow-on layer after signed partner setup. Public flight commitments should still be treated as separate approval work.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
