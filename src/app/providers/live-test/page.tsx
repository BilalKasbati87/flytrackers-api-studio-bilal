import Link from "next/link";

import { getLiveProviderTestSnapshot } from "@/lib/provider-live-test";

export const dynamic = "force-dynamic";

export default async function ProviderLiveTestPage() {
  const snapshot = await getLiveProviderTestSnapshot();

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">Live Provider Test</span>
              <div className="flex flex-wrap gap-3">
                <a className="cta-secondary" href="/api/providers/live-test">
                  JSON output
                </a>
                <Link className="cta-secondary" href="/aviationstack">
                  AviationStack review
                </Link>
                <Link className="cta-secondary" href="/saved-trips">
                  Saved trips
                </Link>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                Safe live diagnostics for aviationstack, KAYAK, and Expedia.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                This page performs the provider checks that can be run truthfully with the current integration level. aviationstack now probes live flights, airport directory, timetable, future schedules, and the plan-limited routes endpoint so you can see exactly where the key is strong and where the subscription draws a line.
              </p>
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Checked at</p>
            <p className="mt-5 text-lg font-semibold text-[color:var(--sea)]">
              {new Date(snapshot.checkedAt).toLocaleString()}
            </p>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {snapshot.probes.map((probe) => (
            <article key={probe.provider} className="panel p-6 md:p-8">
              <p className="chip bg-white/70 text-[color:var(--sky)]">{probe.provider}</p>
              <p className="mt-4 text-xl font-semibold capitalize text-[color:var(--sea)]">
                State: {probe.state}
              </p>
              <div className="mt-6 space-y-3">
                {probe.checks.map((check) => (
                  <div
                    key={`${probe.provider}-${check.label}`}
                    className="rounded-[22px] border border-white/80 bg-white/80 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                      {check.label}
                    </p>
                    <p className="mt-2 text-base font-semibold text-[color:var(--sea)]">
                      {check.state}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      {check.detail}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
