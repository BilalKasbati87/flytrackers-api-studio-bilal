import Link from "next/link";

import {
  getAviationstackCapabilitySnapshot,
  type AviationCapabilityCard,
} from "@/lib/aviation-intelligence";

export const dynamic = "force-dynamic";

const statusStyles: Record<
  AviationCapabilityCard["status"],
  { chip: string; panel: string }
> = {
  available: {
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    panel: "border-emerald-100 bg-emerald-50/80",
  },
  restricted: {
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    panel: "border-amber-100 bg-amber-50/80",
  },
  warning: {
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    panel: "border-rose-100 bg-rose-50/80",
  },
};

const implementationIdeas = [
  {
    title: "Airport operations workspace",
    text: "Timetable, airport directory, city, country, and future departures now combine on the airport pages so they can act like an ops dashboard instead of a demo placeholder.",
    href: "/airports/JFK",
    action: "Open airport page",
  },
  {
    title: "Corridor intelligence",
    text: "Search and route views now use live flights plus flightsFuture as the route signal, which works around the current plan’s blocked routes endpoint.",
    href: "/routes/JFK/LHR?departDate=2026-06-15&returnDate=2026-06-22",
    action: "Open route page",
  },
  {
    title: "Carrier-enriched flight detail",
    text: "The flight page now layers airline directory metadata over live flight status so you can see what a more informative traveler-facing detail screen looks like.",
    href: "/flights/AA1004",
    action: "Open flight page",
  },
];

function CapabilitySection({
  title,
  description,
  cards,
}: {
  title: string;
  description: string;
  cards: AviationCapabilityCard[];
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="panel p-6 md:p-8">
      <h2 className="section-title">{title}</h2>
      <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
        {description}
      </p>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {cards.map((card) => {
          const styles = statusStyles[card.status];

          return (
            <article
              key={card.resource}
              className={`rounded-[28px] border p-5 ${styles.panel}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                    {card.resource.replace(/_/g, " ")}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-[color:var(--sea)]">
                    {card.headline}
                  </h3>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styles.chip}`}
                >
                  {card.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                {card.detail}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Query: {card.querySummary}
                </span>
                {card.count !== null ? (
                  <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                    Sample rows: {card.count}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a className="cta-secondary" href={card.proxyHref}>
                  Open proxy sample
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {card.useCases.map((useCase) => (
                  <span
                    key={useCase}
                    className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]"
                  >
                    {useCase}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {card.samples.map((sample) => (
                  <div
                    key={`${card.resource}-${sample.title}-${sample.detail}`}
                    className="rounded-[22px] border border-white/80 bg-white/80 p-4"
                  >
                    <p className="text-lg font-semibold text-[color:var(--sea)]">
                      {sample.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      {sample.detail}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sample.chips.map((chip) => (
                        <span
                          key={`${sample.title}-${chip}`}
                          className="rounded-full border border-[color:var(--line)] bg-[color:var(--mist)]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default async function AviationstackPage() {
  const snapshot = await getAviationstackCapabilitySnapshot();

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">
                AviationStack Review
              </span>
              <div className="flex flex-wrap gap-3">
                <Link className="cta-secondary" href="/providers/live-test">
                  Live diagnostics
                </Link>
                <Link className="cta-secondary" href="/">
                  Home
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                What this AviationStack key can really power on the site.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                This page is a live capability map for the attached AviationStack credential.
                It separates what is available right now from what is plan-restricted, and it
                points back to the pages already wired to use those working endpoints.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
              <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                Key source: {snapshot.keySource}
              </span>
              <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                Checked: {new Date(snapshot.checkedAt).toLocaleString()}
              </span>
              {snapshot.futureLookupDate ? (
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Future date: {snapshot.futureLookupDate}
                </span>
              ) : null}
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Working query patterns</p>
            <div className="mt-6 space-y-3">
              {[
                "`airports` prefers `iata_code=JFK`",
                "`airlines` works well with `iata_code=AA`",
                "`cities` works with `city_name=London` or metro IATA",
                "`countries` works with exact `country_name` filters",
                "`timetable` expects `iataCode` plus `type=departure|arrival`",
                "`flightsFuture` needs `iataCode`, `type`, and a sufficiently future `date`",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/80 bg-white/80 px-4 py-3 text-sm font-medium text-[color:var(--sea)]"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
              The native `routes` function is the main plan-limited gap on this key, so the site now
              derives corridor insight from `flights` and `flightsFuture` instead of pretending that
              every endpoint is equally available.
            </p>
          </aside>
        </section>

        <section className="panel p-6 md:p-8">
          <p className="chip bg-white/70 text-[color:var(--sun)]">What We Can Build</p>
          <h2 className="section-title mt-5">Best current uses across the website</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {implementationIdeas.map((item) => (
              <article key={item.title} className="explore-card">
                <h3 className="text-2xl font-semibold text-[color:var(--sea)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  {item.text}
                </p>
                <Link className="cta-secondary mt-5" href={item.href}>
                  {item.action}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <CapabilitySection
          title="Available Now"
          description="These endpoints responded successfully during the live check and are the best places to keep investing product work with this exact key."
          cards={snapshot.availableCards}
        />

        <CapabilitySection
          title="Restricted Or Needs Attention"
          description="These are the current subscription or integration boundaries. They are still useful to track because they affect how route and content features should be designed."
          cards={[...snapshot.restrictedCards, ...snapshot.warningCards]}
        />

        {snapshot.notices.length > 0 ? (
          <section className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-amber-700">Notes</p>
            <div className="mt-6 space-y-3">
              {snapshot.notices.map((notice) => (
                <div
                  key={notice.message}
                  className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900"
                >
                  {notice.message}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
