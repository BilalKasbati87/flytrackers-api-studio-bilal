import { normalizeSearchBlueprint } from "@/lib/travel-search";
import type { SearchBlueprint } from "@/types/travel";

type SearchFormProps = {
  defaults?: Partial<SearchBlueprint>;
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
};

export function SearchForm({
  defaults,
  title = "Plan a route",
  description = "Enter IATA airport codes to preview the API-backed planning flow and partner handoff options.",
  submitLabel = "Search routes",
  className = "",
}: SearchFormProps) {
  const values = normalizeSearchBlueprint(defaults ?? {});

  return (
    <section className={`panel p-6 md:p-7 ${className}`.trim()}>
      <div className="space-y-2">
        <p className="chip bg-white/70 text-[color:var(--sky)]">Live Search Flow</p>
        <h2 className="text-3xl font-semibold text-[color:var(--sea)]">{title}</h2>
        <p className="max-w-2xl text-base leading-8 text-[color:var(--muted)]">
          {description}
        </p>
      </div>

      <form action="/search" className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
            Origin
          </span>
          <input
            required
            name="origin"
            defaultValue={values.origin ?? ""}
            placeholder="JFK"
            maxLength={3}
            className="field-shell"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
            Destination
          </span>
          <input
            required
            name="destination"
            defaultValue={values.destination ?? ""}
            placeholder="LHR"
            maxLength={3}
            className="field-shell"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
            Depart date
          </span>
          <input
            type="date"
            name="departDate"
            defaultValue={values.departDate ?? ""}
            className="field-shell"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--sea)]">
            Return date
          </span>
          <input
            type="date"
            name="returnDate"
            defaultValue={values.returnDate ?? ""}
            className="field-shell"
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" className="cta-primary">
            {submitLabel}
          </button>
          <p className="text-sm leading-7 text-[color:var(--muted)]">
            Leave the return date blank for a one-way planning flow. Provider keys stay on the server.
          </p>
        </div>
      </form>
    </section>
  );
}