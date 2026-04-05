import Link from "next/link";

import { SaveTripButton } from "@/components/save-trip-button";
import { SearchForm } from "@/components/search-form";
import { getRouteLinks } from "@/lib/aviation-intelligence";
import { buildTrackedOutboundHref } from "@/lib/partner-links";
import {
  getTravelSearchSnapshot,
  searchBlueprintFromRecord,
} from "@/lib/travel-search";
import type { ProviderReadinessState } from "@/types/travel";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const readinessStyles: Record<
  ProviderReadinessState,
  { chip: string; panel: string }
> = {
  ready: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    panel: "border-emerald-100 bg-emerald-50/80",
  },
  partial: {
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    panel: "border-amber-100 bg-amber-50/80",
  },
  blocked: {
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    panel: "border-rose-100 bg-rose-50/80",
  },
};

const verticalLabels = {
  flights: "Flight handoff",
  hotels: "Hotel handoff",
  cars: "Car handoff",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = searchBlueprintFromRecord(resolvedSearchParams);
  const snapshot = await getTravelSearchSnapshot(query);
  const currentPath = `/search?origin=${snapshot.query.origin ?? ""}&destination=${snapshot.query.destination ?? ""}&departDate=${snapshot.query.departDate ?? ""}&returnDate=${snapshot.query.returnDate ?? ""}`;
  const destinationHubHref = `/destinations/${encodeURIComponent((snapshot.query.destination ?? "destination").toLowerCase())}?airport=${snapshot.query.destination ?? ""}&origin=${snapshot.query.origin ?? ""}&departDate=${snapshot.query.departDate ?? "2026-06-15"}&returnDate=${snapshot.query.returnDate ?? snapshot.query.departDate ?? "2026-06-20"}`;
  const stayPlanningHref = `/stays?destination=${encodeURIComponent(snapshot.query.destination ?? "London")}&checkIn=${snapshot.query.departDate ?? "2026-06-15"}&checkOut=${snapshot.query.returnDate ?? snapshot.query.departDate ?? "2026-06-20"}&adults=2`;
  const carPlanningLocation = snapshot.query.destination ?? snapshot.query.origin ?? "LHR";
  const carPlanningHref = `/cars?pickupLocation=${encodeURIComponent(carPlanningLocation)}&dropoffLocation=${encodeURIComponent(carPlanningLocation)}&pickupDate=${snapshot.query.departDate ?? "2026-06-15"}&dropoffDate=${snapshot.query.returnDate ?? snapshot.query.departDate ?? "2026-06-20"}`;

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="panel p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="chip bg-white/70 text-[color:var(--sky)]">
                  Search Results Workspace
                </span>
                <Link className="cta-secondary" href="/">
                  Back home
                </Link>
              </div>
              <div className="mt-5 space-y-4">
                <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                  Search orchestration for aviationstack, KAYAK, and Expedia.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                  This page turns a route query into three outputs: operational aviation intelligence,
                  monetization handoff options, and partner readiness guidance.
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Origin: {snapshot.query.origin ?? "not set"}
                  </span>
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Destination: {snapshot.query.destination ?? "not set"}
                  </span>
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Depart: {snapshot.query.departDate ?? "not set"}
                  </span>
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Return: {snapshot.query.returnDate ?? "one-way"}
                  </span>
                </div>
                <SaveTripButton
                  title={`${snapshot.query.origin ?? "Origin"} to ${snapshot.query.destination ?? "Destination"}`}
                  summary="Flight search workspace state"
                  vertical="flight-search"
                  path={currentPath}
                  searchState={snapshot.query}
                />
              </div>
            </div>

            <SearchForm
              defaults={snapshot.query}
              title="Adjust the route"
              description="Run the planning flow again with a different city pair or travel window. The search stays server-side and reuses the same provider orchestration." 
              submitLabel="Refresh search"
            />
          </div>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Provider readiness</p>
            <div className="mt-6 space-y-4">
              {snapshot.readiness.map((item) => {
                const styles = readinessStyles[item.state];

                return (
                  <article
                    key={item.provider}
                    className={`rounded-[24px] border p-5 ${styles.panel}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xl font-semibold capitalize text-[color:var(--sea)]">
                        {item.provider}
                      </p>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styles.chip}`}>
                        {item.state}
                      </span>
                    </div>
                    <p className="mt-3 text-base font-medium text-[color:var(--foreground)]">
                      {item.headline}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      {item.detail}
                    </p>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="chip bg-white/70 text-[color:var(--sky)]">aviationstack</p>
                <h2 className="section-title mt-4">Current corridor intelligence</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {snapshot.query.origin && snapshot.query.destination ? (
                  <Link
                    href={`/routes/${snapshot.query.origin}/${snapshot.query.destination}?departDate=${snapshot.query.departDate ?? ""}&returnDate=${snapshot.query.returnDate ?? ""}`}
                    className="cta-primary"
                  >
                    Route detail page
                  </Link>
                ) : null}
                <a
                  href={snapshot.aviationstack.directProxyExample}
                  className="cta-secondary"
                >
                  Open proxy example
                </a>
              </div>
            </div>

            {snapshot.query.origin || snapshot.query.destination ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {snapshot.query.origin ? (
                  <Link className="cta-secondary" href={`/airports/${snapshot.query.origin}`}>
                    Origin airport page
                  </Link>
                ) : null}
                {snapshot.query.destination ? (
                  <Link
                    className="cta-secondary"
                    href={`/airports/${snapshot.query.destination}`}
                  >
                    Destination airport page
                  </Link>
                ) : null}
              </div>
            ) : null}

            {snapshot.hasRouteQuery ? (
              <div className="mt-6 space-y-4">
                {snapshot.aviationstack.usesDemoData ? (
                  <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5 text-sm leading-7 text-sky-950">
                    Demo route intelligence is active for this search. You can keep building the UX now and replace it with live aviationstack responses later.
                  </div>
                ) : null}
                {snapshot.aviationstack.routeHighlights.length > 0 ? (
                  <>
                    <p className="text-sm leading-7 text-[color:var(--muted)]">
                      aviationstack returned {snapshot.aviationstack.routeCount || snapshot.aviationstack.routeHighlights.length} live or near-term corridor records for this city pair.
                    </p>
                    {snapshot.aviationstack.futureLookupDate ? (
                      <p className="text-sm leading-7 text-[color:var(--muted)]">
                        Future schedule support is also available for {snapshot.aviationstack.futureLookupDate}, with {snapshot.aviationstack.futureRouteCount} matching future departures found for this route.
                      </p>
                    ) : null}
                    {snapshot.aviationstack.routeHighlights.map((route, index) => {
                      const routeLinks = getRouteLinks(route);

                      return (
                        <div
                          key={`${route.flightIata ?? route.flightNumber ?? "route"}-${index}`}
                          className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                        >
                          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                            <span>{route.airlineName ?? "Airline unavailable"}</span>
                            <span>{route.flightIata ?? route.flightNumber ?? "Flight number unavailable"}</span>
                          </div>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                                Departure
                              </p>
                              <p className="mt-1 text-xl font-semibold text-[color:var(--sea)]">
                                {route.departureIata ?? "---"}
                              </p>
                              <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">
                                {route.departureAirport ?? "Airport unavailable"}
                              </p>
                              <p className="text-sm leading-7 text-[color:var(--muted)]">
                                {route.departureTime ?? "Time unavailable"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                                Arrival
                              </p>
                              <p className="mt-1 text-xl font-semibold text-[color:var(--sea)]">
                                {route.arrivalIata ?? "---"}
                              </p>
                              <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">
                                {route.arrivalAirport ?? "Airport unavailable"}
                              </p>
                              <p className="text-sm leading-7 text-[color:var(--muted)]">
                                {route.arrivalTime ?? "Time unavailable"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            {routeLinks.routeDetail ? (
                              <Link className="cta-primary" href={routeLinks.routeDetail}>
                                Route page
                              </Link>
                            ) : null}
                            {routeLinks.flightDetail ? (
                              <Link className="cta-secondary" href={routeLinks.flightDetail}>
                                Flight page
                              </Link>
                            ) : null}
                            {routeLinks.departureAirport ? (
                              <Link className="cta-secondary" href={routeLinks.departureAirport}>
                                Departure airport
                              </Link>
                            ) : null}
                            {routeLinks.arrivalAirport ? (
                              <Link className="cta-secondary" href={routeLinks.arrivalAirport}>
                                Arrival airport
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                    No corridor preview is available yet for this query. That usually means there were no current or future AviationStack matches for this pair.
                  </div>
                )}
                {snapshot.aviationstack.notices.length > 0 ? (
                  <div className="space-y-3">
                    {snapshot.aviationstack.notices.map((notice) => (
                      <div
                        key={notice}
                        className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900"
                      >
                        {notice}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                Add both origin and destination airport codes to generate an aviationstack corridor preview.
              </div>
            )}
          </article>

          <div className="space-y-6">
            <article className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-[color:var(--sun)]">KAYAK handoff</p>
              <h2 className="section-title mt-5">Monetized search actions</h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                Keep the search UI on your site, then pass commercial intent into KAYAK using deeplinks, whitelabel, or API mode after partner approval.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="cta-secondary" href={destinationHubHref}>
                  Destination hub
                </Link>
                <Link className="cta-secondary" href={stayPlanningHref}>
                  Hotel planning page
                </Link>
                <Link className="cta-secondary" href={carPlanningHref}>
                  Car planning page
                </Link>
              </div>

              <div className="mt-6 grid gap-3">
                {Object.entries(snapshot.kayak.links).map(([vertical, link]) => (
                  <div
                    key={vertical}
                    className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-[color:var(--sea)]">
                        {verticalLabels[vertical as keyof typeof verticalLabels]}
                      </p>
                      {link ? (
                        <a
                          className="cta-primary"
                          href={buildTrackedOutboundHref({
                            destinationUrl: link,
                            provider: "kayak",
                            vertical,
                            label: `${verticalLabels[vertical as keyof typeof verticalLabels]} from search workspace`,
                            sourcePath: currentPath,
                            metadata: {
                              origin: snapshot.query.origin ?? null,
                              destination: snapshot.query.destination ?? null,
                            },
                          })}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open KAYAK
                        </a>
                      ) : (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                          Needs config
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                      {link
                        ? "This handoff is available with the current environment setup."
                        : "Paste the official KAYAK portal template for this vertical into your env file to activate this handoff."}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
                {snapshot.kayak.nextStep}
              </p>
            </article>

            <article className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-cyan-700">Expedia Rapid</p>
              <h2 className="section-title mt-5">Lodging and car partner path</h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                Expedia Rapid should be treated as a signed server-side partner integration for lodging and car flows. Public flight support still requires direct confirmation.
              </p>
              <div className="mt-6 rounded-[24px] border border-white/80 bg-white/80 p-5">
                <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                  <span className="rounded-full border border-white/80 bg-slate-950 px-4 py-2 text-slate-100">
                    Environment: {snapshot.expedia.environment}
                  </span>
                  <span className="rounded-full border border-white/80 bg-slate-950 px-4 py-2 text-slate-100">
                    Flight API: {snapshot.expedia.publicFlightApiStatus}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {snapshot.expedia.bookingFlow.map((step) => (
                    <div
                      key={step}
                      className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--mist)]/70 px-4 py-3 text-sm font-medium text-[color:var(--sea)]"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
                {snapshot.expedia.nextStep}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="cta-secondary" href={stayPlanningHref}>
                  Lodging flow
                </Link>
                <Link className="cta-secondary" href={carPlanningHref}>
                  Car flow
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
