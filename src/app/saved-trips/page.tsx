import Link from "next/link";

import { DeleteSavedTripButton } from "@/components/delete-saved-trip-button";
import { listPartnerClicks, listSavedTrips } from "@/lib/saved-trips";

export const dynamic = "force-dynamic";

export default async function SavedTripsPage() {
  const [trips, partnerClicks] = await Promise.all([
    listSavedTrips(),
    listPartnerClicks(),
  ]);

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">Saved Trips</span>
              <div className="flex flex-wrap gap-3">
                <Link className="cta-secondary" href="/search?origin=JFK&destination=LHR&departDate=2026-06-15">
                  Add flight search
                </Link>
                <Link className="cta-secondary" href="/stays?destination=London&checkIn=2026-06-15&checkOut=2026-06-20&adults=2">
                  Add stay plan
                </Link>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                Persistent saved searches and trip plans.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                This page is backed by a local Prisma and SQLite database so the planning state survives page refreshes and server restarts.
              </p>
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Database status</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Saved trips
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--sea)]">{trips.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Logged partner clicks
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--sea)]">{partnerClicks.length}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sky)]">Trip library</p>
            <h2 className="section-title mt-5">Saved planning states</h2>
            <div className="mt-6 space-y-4">
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                          {trip.vertical} {trip.status ? `· ${trip.status}` : ""}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-[color:var(--sea)]">
                          {trip.title}
                        </p>
                        {trip.destinationLabel || trip.startDate ? (
                          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                            {trip.destinationLabel ?? "Destination not set"}
                            {trip.startDate ? ` · ${trip.startDate}` : ""}
                            {trip.endDate ? ` to ${trip.endDate}` : ""}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link className="cta-secondary" href={`/saved-trips/${trip.id}`}>
                          Manage
                        </Link>
                        <Link className="cta-primary" href={trip.path}>
                          Open
                        </Link>
                        <DeleteSavedTripButton tripId={trip.id} />
                      </div>
                    </div>
                    {trip.summary ? (
                      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                        {trip.summary}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                      Checklist progress: {trip.tasks.filter((task) => task.done).length}/{trip.tasks.length}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                  No saved trips yet. Use the save buttons on the flight, stay, car, destination, or route pages to persist a planning state.
                </div>
              )}
            </div>
          </article>

          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Partner clicks</p>
            <h2 className="section-title mt-5">Recent outbound activity</h2>
            <div className="mt-6 space-y-4">
              {partnerClicks.length > 0 ? (
                partnerClicks.map((click) => (
                  <div
                    key={click.id}
                    className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--sky)]">
                      {click.provider} {click.vertical}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                      {click.label ?? click.destinationUrl}
                    </p>
                    {click.sourcePath ? (
                      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                        Source: {click.sourcePath}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                  No partner clicks have been logged yet. Use the KAYAK handoff buttons after the tracking redirects are in place.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}