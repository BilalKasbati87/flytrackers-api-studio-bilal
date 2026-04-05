import Link from "next/link";

import { SaveTripButton } from "@/components/save-trip-button";
import { buildTrackedOutboundHref } from "@/lib/partner-links";
import { getStaySearchSnapshot, staySearchFromRecord } from "@/lib/travel-commerce";
import type { ProviderReadinessState } from "@/types/travel";

type StaysPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const readinessStyles: Record<ProviderReadinessState, string> = {
  ready: "border-emerald-100 bg-emerald-50/80",
  partial: "border-amber-100 bg-amber-50/80",
  blocked: "border-rose-100 bg-rose-50/80",
};

export default async function StaysPage({ searchParams }: StaysPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = staySearchFromRecord(resolvedSearchParams);
  const snapshot = getStaySearchSnapshot(query);
  const currentPath = `/stays?destination=${encodeURIComponent(snapshot.query.destination ?? "")}&checkIn=${snapshot.query.checkIn ?? ""}&checkOut=${snapshot.query.checkOut ?? ""}&adults=${snapshot.query.adults ?? ""}`;

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">Stay Planning</span>
              <div className="flex flex-wrap gap-3">
                <Link className="cta-secondary" href="/">
                  Home
                </Link>
                <a className="cta-secondary" href={snapshot.apiExample}>
                  Stay API JSON
                </a>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                Hotel and lodging planning for KAYAK and Expedia.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                Use this page to shape the stay flow before moving users into KAYAK hotel handoff or signed Expedia Rapid lodging requests.
              </p>
            </div>

            <form action="/stays" className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Destination
                </span>
                <input
                  name="destination"
                  defaultValue={snapshot.query.destination ?? "London"}
                  placeholder="London"
                  className="field-shell"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Check in
                </span>
                <input
                  type="date"
                  name="checkIn"
                  defaultValue={snapshot.query.checkIn ?? "2026-06-15"}
                  className="field-shell"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Check out
                </span>
                <input
                  type="date"
                  name="checkOut"
                  defaultValue={snapshot.query.checkOut ?? "2026-06-20"}
                  className="field-shell"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Adults
                </span>
                <input
                  type="number"
                  min="1"
                  name="adults"
                  defaultValue={snapshot.query.adults ?? "2"}
                  className="field-shell"
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button className="cta-primary" type="submit">
                  Refresh stay plan
                </button>
                <SaveTripButton
                  title={`Stay in ${snapshot.query.destination ?? "destination"}`}
                  summary="Hotel planning state"
                  vertical="stay-plan"
                  path={currentPath}
                  searchState={snapshot.query}
                />
                {snapshot.kayak.hotelLink ? (
                  <a
                    className="cta-secondary"
                    href={buildTrackedOutboundHref({
                      destinationUrl: snapshot.kayak.hotelLink,
                      provider: "kayak",
                      vertical: "hotels",
                      label: `Hotel handoff for ${snapshot.query.destination ?? "destination"}`,
                      sourcePath: currentPath,
                      metadata: {
                        destination: snapshot.query.destination ?? null,
                        checkIn: snapshot.query.checkIn ?? null,
                        checkOut: snapshot.query.checkOut ?? null,
                      },
                    })}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open KAYAK hotels
                  </a>
                ) : null}
              </div>
            </form>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Provider readiness</p>
            <div className="mt-6 space-y-4">
              {snapshot.readiness.map((item) => (
                <div
                  key={item.provider}
                  className={`rounded-[24px] border p-5 ${readinessStyles[item.state]}`}
                >
                  <p className="text-xl font-semibold capitalize text-[color:var(--sea)]">
                    {item.provider}
                  </p>
                  <p className="mt-3 text-base font-medium text-[color:var(--foreground)]">
                    {item.headline}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">KAYAK lodging</p>
            <h2 className="section-title mt-5">Hotel handoff readiness</h2>
            <div className="mt-6 rounded-[24px] border border-white/80 bg-white/80 p-5">
              <p className="text-base leading-8 text-[color:var(--muted)]">
                {snapshot.kayak.nextStep}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                <span className="rounded-full border border-white/80 bg-slate-950 px-4 py-2 text-slate-100">
                  Destination: {snapshot.query.destination ?? "not set"}
                </span>
                <span className="rounded-full border border-white/80 bg-slate-950 px-4 py-2 text-slate-100">
                  Dates: {snapshot.query.checkIn ?? "not set"} to {snapshot.query.checkOut ?? "not set"}
                </span>
              </div>
            </div>
          </article>

          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-cyan-700">Expedia Rapid lodging</p>
            <h2 className="section-title mt-5">Implementation steps</h2>
            <div className="mt-6 space-y-3">
              {snapshot.expedia.lodgingPlan.map((step) => (
                <div
                  key={step}
                  className="rounded-[22px] border border-white/80 bg-white/80 px-4 py-3 text-sm font-medium text-[color:var(--sea)]"
                >
                  {step}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
              {snapshot.expedia.nextStep}
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}