import Link from "next/link";

import { SaveTripButton } from "@/components/save-trip-button";
import { getRouteLinks } from "@/lib/aviation-intelligence";
import { buildTrackedOutboundHref } from "@/lib/partner-links";
import { getCarSearchSnapshot, getStaySearchSnapshot } from "@/lib/travel-commerce";
import { getTravelSearchSnapshot } from "@/lib/travel-search";

type DestinationPageProps = {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickFirst(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function formatCityLabel(value: string) {
  const normalized = decodeURIComponent(value).replace(/-/g, " ").trim();

  if (!normalized) {
    return "Destination";
  }

  if (/^[a-z]{3}$/i.test(normalized)) {
    return normalized.toUpperCase();
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildQueryString(entries: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(entries).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export default async function DestinationPage({
  params,
  searchParams,
}: DestinationPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const cityName = formatCityLabel(resolvedParams.city);
  const airportCode = (
    pickFirst(resolvedSearchParams.airport) ??
    (/^[a-z]{3}$/i.test(resolvedParams.city) ? resolvedParams.city : undefined)
  )?.toUpperCase();
  const originCode = pickFirst(resolvedSearchParams.origin)?.toUpperCase();
  const departDate = pickFirst(resolvedSearchParams.departDate) ?? "2026-06-15";
  const returnDate = pickFirst(resolvedSearchParams.returnDate) ?? "2026-06-20";
  const checkIn = pickFirst(resolvedSearchParams.checkIn) ?? departDate;
  const checkOut = pickFirst(resolvedSearchParams.checkOut) ?? returnDate;
  const adults = pickFirst(resolvedSearchParams.adults) ?? "2";
  const pickupLocation = airportCode ?? cityName;
  const currentQueryString = buildQueryString({
    airport: airportCode,
    origin: originCode,
    departDate,
    returnDate,
    checkIn,
    checkOut,
    adults,
  });
  const currentPath = `/destinations/${resolvedParams.city}${currentQueryString}`;
  const flightSnapshot = await getTravelSearchSnapshot({
    origin: originCode,
    destination: airportCode,
    departDate,
    returnDate,
  });
  const staySnapshot = getStaySearchSnapshot({
    destination: cityName,
    checkIn,
    checkOut,
    adults,
  });
  const carSnapshot = getCarSearchSnapshot({
    pickupLocation,
    dropoffLocation: pickupLocation,
    pickupDate: departDate,
    dropoffDate: returnDate,
    pickupTime: pickFirst(resolvedSearchParams.pickupTime) ?? "10:00",
    dropoffTime: pickFirst(resolvedSearchParams.dropoffTime) ?? "10:00",
  });

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">Destination Hub</span>
              <div className="flex flex-wrap gap-3">
                <Link className="cta-secondary" href="/">
                  Home
                </Link>
                {airportCode ? (
                  <Link className="cta-secondary" href={`/airports/${airportCode}`}>
                    Airport page
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                {cityName}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                City-level planning page that combines aviationstack corridor context, airport entry points, stay planning, and car rental handoff in one workspace.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                {airportCode ? (
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Airport: {airportCode}
                  </span>
                ) : null}
                {originCode ? (
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Origin: {originCode}
                  </span>
                ) : null}
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Stay: {checkIn} to {checkOut}
                </span>
              </div>
              <SaveTripButton
                title={`${cityName} destination workspace`}
                summary="Destination page state"
                vertical="destination-hub"
                path={currentPath}
                searchState={{
                  city: cityName,
                  airport: airportCode,
                  origin: originCode,
                  departDate,
                  returnDate,
                  checkIn,
                  checkOut,
                  adults,
                }}
              />
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Quick paths</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="cta-primary"
                href={`/stays?destination=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`}
              >
                Stay planning
              </Link>
              <Link
                className="cta-secondary"
                href={`/cars?pickupLocation=${encodeURIComponent(pickupLocation)}&dropoffLocation=${encodeURIComponent(pickupLocation)}&pickupDate=${departDate}&dropoffDate=${returnDate}`}
              >
                Car planning
              </Link>
              {originCode && airportCode ? (
                <Link
                  className="cta-secondary"
                  href={`/search?origin=${originCode}&destination=${airportCode}&departDate=${departDate}&returnDate=${returnDate}`}
                >
                  Flight search
                </Link>
              ) : null}
              {originCode && airportCode ? (
                <Link
                  className="cta-secondary"
                  href={`/routes/${originCode}/${airportCode}?departDate=${departDate}&returnDate=${returnDate}`}
                >
                  Route detail
                </Link>
              ) : null}
            </div>
            <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
              Use this page when you want a city landing page that can pivot into airport intelligence, KAYAK handoff, and commerce planning without forcing the user to start over.
            </p>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sky)]">Flight corridor</p>
            <h2 className="section-title mt-5">aviationstack corridor context</h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
              When both origin and destination airport codes are available, this hub previews live corridor activity and future schedule coverage so the city page can lead into flight detail and airport operations pages.
            </p>

            {flightSnapshot.hasRouteQuery ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-white/80 bg-white/80 p-5">
                  <p className="text-sm leading-7 text-[color:var(--muted)]">
                    aviationstack returned {flightSnapshot.aviationstack.routeCount || flightSnapshot.aviationstack.routeHighlights.length} live corridor records for {originCode} to {airportCode}.
                  </p>
                  {flightSnapshot.aviationstack.futureLookupDate ? (
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      Future schedule support is also available for {flightSnapshot.aviationstack.futureLookupDate}, with {flightSnapshot.aviationstack.futureRouteCount} future departures matching this route.
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {flightSnapshot.kayak.links.flights ? (
                      <a
                        className="cta-primary"
                        href={buildTrackedOutboundHref({
                          destinationUrl: flightSnapshot.kayak.links.flights,
                          provider: "kayak",
                          vertical: "flights",
                          label: `${cityName} destination flight handoff`,
                          sourcePath: currentPath,
                          metadata: {
                            city: cityName,
                            origin: originCode ?? null,
                            airport: airportCode ?? null,
                          },
                        })}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open KAYAK flights
                      </a>
                    ) : (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                        Flight handoff needs config
                      </span>
                    )}
                    <a
                      className="cta-secondary"
                      href={flightSnapshot.aviationstack.directProxyExample}
                    >
                      Proxy example
                    </a>
                  </div>
                </div>

                {flightSnapshot.aviationstack.routeHighlights.length > 0 ? (
                  flightSnapshot.aviationstack.routeHighlights.slice(0, 3).map((route, index) => {
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
                        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                          {route.departureIata ?? originCode ?? "---"} to {route.arrivalIata ?? airportCode ?? "---"}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {links.routeDetail ? (
                            <Link className="cta-secondary" href={links.routeDetail}>
                              Route page
                            </Link>
                          ) : null}
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
                    Corridor preview is ready, but no live or future highlight records were returned for this city pair yet.
                  </div>
                )}
                {flightSnapshot.aviationstack.notices.length > 0 ? (
                  <div className="space-y-3">
                    {flightSnapshot.aviationstack.notices.map((notice) => (
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
                Add an origin code and destination airport code in the URL to turn this city page into a full live flight corridor workspace.
              </div>
            )}
          </article>

          <div className="space-y-6">
            <article className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-[color:var(--sun)]">Stay layer</p>
              <h2 className="section-title mt-5">Hotel planning for {cityName}</h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                Keep the city intent branded on-site, then pass hotel demand to KAYAK or expand into Expedia Rapid lodging work when credentials are live.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="cta-secondary"
                  href={`/stays?destination=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`}
                >
                  Open stay page
                </Link>
                {staySnapshot.kayak.hotelLink ? (
                  <a
                    className="cta-primary"
                    href={buildTrackedOutboundHref({
                      destinationUrl: staySnapshot.kayak.hotelLink,
                      provider: "kayak",
                      vertical: "hotels",
                      label: `${cityName} destination hotel handoff`,
                      sourcePath: currentPath,
                      metadata: {
                        city: cityName,
                        airport: airportCode ?? null,
                      },
                    })}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open KAYAK hotels
                  </a>
                ) : null}
              </div>
              <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
                {staySnapshot.kayak.nextStep}
              </p>
            </article>

            <article className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-cyan-700">Ground layer</p>
              <h2 className="section-title mt-5">Car rental planning</h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                Use the destination airport or city as the pickup anchor so the city hub can keep rental planning aligned to the flight and stay window.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="cta-secondary"
                  href={`/cars?pickupLocation=${encodeURIComponent(pickupLocation)}&dropoffLocation=${encodeURIComponent(pickupLocation)}&pickupDate=${departDate}&dropoffDate=${returnDate}`}
                >
                  Open car page
                </Link>
                {carSnapshot.kayak.carLink ? (
                  <a
                    className="cta-primary"
                    href={buildTrackedOutboundHref({
                      destinationUrl: carSnapshot.kayak.carLink,
                      provider: "kayak",
                      vertical: "cars",
                      label: `${cityName} destination car handoff`,
                      sourcePath: currentPath,
                      metadata: {
                        city: cityName,
                        pickupLocation,
                      },
                    })}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open KAYAK cars
                  </a>
                ) : null}
              </div>
              <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
                {carSnapshot.kayak.nextStep}
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
