import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteSavedTripButton } from "@/components/delete-saved-trip-button";
import { getSavedTripById } from "@/lib/saved-trips";

import {
  addSavedTripTaskAction,
  deleteSavedTripTaskAction,
  toggleSavedTripTaskAction,
  updateSavedTripWorkspaceAction,
} from "./actions";

type SavedTripWorkspacePageProps = {
  params: Promise<{ id: string }>;
};

function formatJsonValue(value: unknown) {
  if (value === null || value === undefined) {
    return "Not set";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function getSearchStateEntries(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [] as Array<[string, unknown]>;
  }

  return Object.entries(value as Record<string, unknown>);
}

export const dynamic = "force-dynamic";

export default async function SavedTripWorkspacePage({
  params,
}: SavedTripWorkspacePageProps) {
  const resolvedParams = await params;
  const trip = await getSavedTripById(resolvedParams.id);

  if (!trip) {
    notFound();
  }

  const completedTasks = trip.tasks.filter((task) => task.done).length;
  const searchStateEntries = getSearchStateEntries(trip.searchState);

  return (
    <main className="relative overflow-hidden px-5 pb-20 pt-8 text-slate-900 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="chip bg-white/70 text-[color:var(--sky)]">Trip Workspace</span>
              <div className="flex flex-wrap gap-3">
                <Link className="cta-secondary" href="/saved-trips">
                  Back to library
                </Link>
                <Link className="cta-primary" href={trip.path}>
                  Open saved path
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <h1 className="text-5xl font-semibold leading-[0.96] text-[color:var(--sea)] md:text-6xl">
                {trip.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">
                Local planning workspace for notes, checklist tasks, and travel metadata while provider access is still being prepared.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Vertical: {trip.vertical}
                </span>
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Status: {trip.status}
                </span>
                <span className="rounded-full border border-white/80 bg-white/80 px-4 py-2">
                  Tasks: {completedTasks}/{trip.tasks.length}
                </span>
              </div>
            </div>
          </article>

          <aside className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Workspace snapshot</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Destination
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {trip.destinationLabel ?? "Not set"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Travel window
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {trip.startDate ?? "Not set"} to {trip.endDate ?? "Open"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Updated
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--sea)]">
                  {new Date(trip.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <DeleteSavedTripButton tripId={trip.id} />
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sky)]">Planning details</p>
            <h2 className="section-title mt-5">Notes, dates, and budgeting</h2>

            <form action={updateSavedTripWorkspaceAction} className="mt-6 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="tripId" value={trip.id} />
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Status
                </span>
                <select name="status" defaultValue={trip.status} className="field-shell">
                  <option value="planning">Planning</option>
                  <option value="watching">Watching</option>
                  <option value="ready-to-book">Ready to book</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Destination label
                </span>
                <input
                  name="destinationLabel"
                  defaultValue={trip.destinationLabel ?? ""}
                  className="field-shell"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Start date
                </span>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={trip.startDate ?? ""}
                  className="field-shell"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  End date
                </span>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={trip.endDate ?? ""}
                  className="field-shell"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Travelers
                </span>
                <input
                  name="travelers"
                  defaultValue={trip.travelers ?? ""}
                  className="field-shell"
                  placeholder="2 adults"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Budget
                </span>
                <input
                  name="budget"
                  defaultValue={trip.budget ?? ""}
                  className="field-shell"
                  placeholder="$4,500 target"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Summary
                </span>
                <textarea
                  name="summary"
                  defaultValue={trip.summary ?? ""}
                  className="field-shell min-h-28"
                  placeholder="Short overview of this trip"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
                  Notes
                </span>
                <textarea
                  name="notes"
                  defaultValue={trip.notes ?? ""}
                  className="field-shell min-h-40"
                  placeholder="Visa reminders, fare watch notes, hotel ideas, and manual planning details"
                />
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button className="cta-primary" type="submit">
                  Save workspace details
                </button>
                <Link className="cta-secondary" href={trip.path}>
                  Re-open search path
                </Link>
              </div>
            </form>
          </article>

          <article className="panel p-6 md:p-8">
            <p className="chip bg-white/70 text-[color:var(--sun)]">Checklist</p>
            <h2 className="section-title mt-5">Manual next actions</h2>

            <form action={addSavedTripTaskAction} className="mt-6 flex flex-wrap gap-3">
              <input type="hidden" name="tripId" value={trip.id} />
              <input
                name="title"
                className="field-shell min-w-[16rem] flex-1"
                placeholder="Add a trip task"
              />
              <button className="cta-primary" type="submit">
                Add task
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {trip.tasks.length > 0 ? (
                trip.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[24px] border border-white/80 bg-white/80 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-[color:var(--sea)]">
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">
                          {task.done ? "Completed" : "Open"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <form action={toggleSavedTripTaskAction}>
                          <input type="hidden" name="tripId" value={trip.id} />
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="done" value={task.done ? "false" : "true"} />
                          <button className="cta-primary" type="submit">
                            {task.done ? "Mark open" : "Mark done"}
                          </button>
                        </form>
                        <form action={deleteSavedTripTaskAction}>
                          <input type="hidden" name="tripId" value={trip.id} />
                          <input type="hidden" name="taskId" value={task.id} />
                          <button className="cta-secondary" type="submit">
                            Remove task
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                  No tasks yet. Add steps like fare check, visa review, hotel shortlist, or airport transfer planning.
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="panel p-6 md:p-8">
          <p className="chip bg-white/70 text-[color:var(--sky)]">Stored search state</p>
          <h2 className="section-title mt-5">Original saved values</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {searchStateEntries.length > 0 ? (
              searchStateEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-[22px] border border-white/80 bg-white/80 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {key}
                  </p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--sea)]">
                    {formatJsonValue(value)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 text-sm leading-7 text-[color:var(--muted)]">
                No structured search state was stored with this trip.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}