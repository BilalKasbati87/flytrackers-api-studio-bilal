import Link from "next/link";

const primaryLinks = [
  { href: "/", label: "Home" },
  {
    href: "/search?origin=JFK&destination=LHR&departDate=2026-06-15&returnDate=2026-06-22",
    label: "Flights",
  },
  { href: "/airports/JFK", label: "Airports" },
  { href: "/routes/JFK/LHR", label: "Routes" },
  { href: "/flights/AA1004", label: "Flight Status" },
  {
    href: "/destinations/london?airport=LHR&origin=JFK&departDate=2026-06-15&returnDate=2026-06-20",
    label: "Destinations",
  },
  {
    href: "/stays?destination=London&checkIn=2026-06-15&checkOut=2026-06-20&adults=2",
    label: "Stays",
  },
  {
    href: "/cars?pickupLocation=LHR&dropoffLocation=LHR&pickupDate=2026-06-15&dropoffDate=2026-06-20",
    label: "Cars",
  },
  { href: "/aviationstack", label: "AviationStack" },
  { href: "/saved-trips", label: "Saved Trips" },
  { href: "/providers/live-test", label: "Live Tests" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-5 pt-4 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/70 px-5 py-4 backdrop-blur-xl shadow-[0_14px_40px_rgba(15,61,94,0.08)]">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--sea)] text-sm font-bold uppercase tracking-[0.2em] text-white">
            FT
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--sky)]">
              FlyTrackers
            </span>
            <span className="block text-base font-semibold text-[color:var(--sea)]">
              Aviation and travel API studio
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="shell-link">
              {link.label}
            </Link>
          ))}
          <a href="/api/providers/status" className="shell-link">
            API Status
          </a>
        </nav>
      </div>
    </header>
  );
}
