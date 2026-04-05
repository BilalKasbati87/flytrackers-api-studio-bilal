import Link from "next/link";

import { SearchForm } from "@/components/search-form";

const providerCards = [
  {
    name: "aviationstack",
    accent: "text-sky-700",
    summary:
      "Operational intelligence layer for live flights, routes, airports, airlines, timetables, and future schedules.",
    bullets: [
      "Live-verified on the attached key: flights, airports, airlines, cities, countries, timetable, flightsFuture, airplanes, aircraft types, and taxes.",
      "The native routes endpoint is plan-restricted, so route pages now derive corridor insight from live flights plus future schedules instead.",
    ],
  },
  {
    name: "KAYAK Affiliate Network",
    accent: "text-amber-600",
    summary:
      "Revenue and search layer for flights, hotels, cars, whitelabel, deeplinks, and API handoff after partner approval.",
    bullets: [
      "Template-based deeplink support is wired for flights, hotels, and cars.",
      "Whitelabel and API readiness are exposed through provider status endpoints.",
    ],
  },
  {
    name: "Expedia Rapid",
    accent: "text-cyan-700",
    summary:
      "Lodging and car partner layer with signed authentication and a modular booking-flow model.",
    bullets: [
      "Authorization header generation follows Rapid signature authentication.",
      "Public developer hub still positions flights as coming soon, so lodging and cars are the immediate path.",
    ],
  },
];

const phases = [
  {
    title: "Phase 1: API foundation",
    text: "Wire provider credentials, confirm KAYAK approval path, and validate aviationstack and Expedia test-mode requests through the internal API routes.",
  },
  {
    title: "Phase 2: Search and intelligence",
    text: "Add traveler search forms, airport and route pages, and combine aviationstack intelligence with KAYAK handoff and Expedia lodging options.",
  },
  {
    title: "Phase 3: Conversion and retention",
    text: "Layer saved trips, alerts, analytics, content pages, and whitelabel or API monetization once partner access is approved.",
  },
];

const internalApis = [
  "/api/health",
  "/api/providers/status",
  "/api/aviationstack?resource=flights&dep_iata=JFK&arr_iata=LHR&limit=10",
  "/api/travel/search?origin=JFK&destination=LHR&departDate=2026-06-15",
];

const exploreCards = [
  {
    title: "AviationStack review",
    summary: "See the live capability map for this exact key, with supported endpoints, restricted functions, and sample outputs.",
    href: "/aviationstack",
    action: "Review API potential",
  },
  {
    title: "Airport boards",
    summary: "Jump into airport-level departures and arrivals powered by aviationstack.",
    href: "/airports/JFK",
    action: "Open JFK",
  },
  {
    title: "Route detail",
    summary: "Inspect a city pair, live flight activity, and travel handoff options.",
    href: "/routes/JFK/LHR?departDate=2026-06-15&returnDate=2026-06-22",
    action: "Open JFK to LHR",
  },
  {
    title: "Flight status",
    summary: "Look up a specific flight and pivot into airports or route pages.",
    href: "/flights/AA1004",
    action: "Open AA1004",
  },
  {
    title: "Destination hub",
    summary: "Open a city page that blends route context, airport links, stay planning, and car planning.",
    href: "/destinations/london?airport=LHR&origin=JFK&departDate=2026-06-15&returnDate=2026-06-20",
    action: "Open London hub",
  },
  {
    title: "Stay planning",
    summary: "Shape hotel search intent for KAYAK handoff and Expedia Rapid lodging work.",
    href: "/stays?destination=London&checkIn=2026-06-15&checkOut=2026-06-20&adults=2",
    action: "Plan London stay",
  },
  {
    title: "Car planning",
    summary: "Plan rental intent for KAYAK cars and Expedia Rapid car integration.",
    href: "/cars?pickupLocation=LHR&dropoffLocation=LHR&pickupDate=2026-06-15&dropoffDate=2026-06-20",
    action: "Plan car pickup",
  },
  {
    title: "Trip workspace",
    summary: "Manage saved plans, local notes, and checklist tasks without needing any provider keys yet.",
    href: "/saved-trips",
    action: "Open trip library",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-6">
              <span className="chip bg-white/70 text-[color:var(--sea)]">
                API-First Travel Platform
              </span>
              <div className="space-y-4">
                <p className="max-w-xl text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--sky)]">
                  Aviation intelligence plus monetized search
                </p>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] md:text-7xl">
                  Build a travel site that uses aviationstack deeply and routes demand through KAYAK and Expedia.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted)] md:text-xl">
                  This starter is structured for live flight data, partner handoff,
                  search orchestration, and future monetization without pretending
                  that public travel APIs all expose the same capabilities.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="cta-primary"
                  href="/search?origin=JFK&destination=LHR&departDate=2026-06-15&returnDate=2026-06-22"
                >
                  Preview search flow
                </Link>
                <Link className="cta-secondary" href="/saved-trips">
                  Open trip library
                </Link>
                <a className="cta-secondary" href="/api/providers/status">
                  Provider status JSON
                </a>
              </div>
              <div className="rounded-[24px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-sky-950">
                The attached AviationStack key is now used directly on the server, so the flight, airport, route, and review pages can switch from demo assumptions into live-supported endpoint behavior.
              </div>
              <div className="flex flex-wrap gap-3">
                {internalApis.slice(0, 2).map((endpoint) => (
                  <span
                    key={endpoint}
                    className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[color:var(--sea)] shadow-[0_10px_30px_rgba(15,61,94,0.08)]"
                  >
                    {endpoint}
                  </span>
                ))}
              </div>
            </div>
            <SearchForm
              defaults={{
                origin: "JFK",
                destination: "LHR",
                departDate: "2026-06-15",
                returnDate: "2026-06-22",
              }}
              title="Run the planning flow"
              description="Start with a real route query. The results page will combine aviationstack intelligence, KAYAK handoff readiness, and Expedia Rapid planning guidance in one place."
              submitLabel="Plan this route"
              className="bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(228,241,252,0.88))]"
            />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {providerCards.map((card) => (
            <article key={card.name} className="panel p-6">
              <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${card.accent}`}>
                {card.name}
              </p>
              <p className="mt-4 text-lg leading-8 text-[color:var(--foreground)]">
                {card.summary}
              </p>
              <div className="mt-6 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
                {card.bullets.map((bullet) => (
                  <p key={bullet}>{bullet}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="panel p-6 md:p-8">
          <p className="chip bg-white/70 text-[color:var(--sun)]">Explore Pages</p>
          <h2 className="section-title mt-5">Direct entry points across flights, stays, cars, and trip planning</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exploreCards.map((card) => (
              <article key={card.href} className="explore-card">
                <h3 className="text-2xl font-semibold text-[color:var(--sea)]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  {card.summary}
                </p>
                <Link className="cta-secondary mt-5" href={card.href}>
                  {card.action}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sky)]">Roadmap</p>
            <h2 className="section-title mt-5">Practical delivery sequence</h2>
            <div className="mt-6 space-y-5">
              {phases.map((phase) => (
                <div
                  key={phase.title}
                  className="rounded-[24px] border border-white/80 bg-white/70 p-5"
                >
                  <h3 className="text-2xl font-semibold text-[color:var(--sea)]">
                    {phase.title}
                  </h3>
                  <p className="mt-2 text-base leading-8 text-[color:var(--muted)]">
                    {phase.text}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Internal API</p>
            <h2 className="section-title mt-5">Starter endpoints</h2>
            <div className="mt-6 space-y-3">
              {internalApis.map((endpoint) => (
                <div
                  key={endpoint}
                  className="rounded-[22px] border border-white/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-[0_16px_40px_rgba(18,38,58,0.12)]"
                >
                  <code>{endpoint}</code>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-[color:var(--muted)]">
              These routes are designed for server-side provider calls so API keys stay off the client.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
