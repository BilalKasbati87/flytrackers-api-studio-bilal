# FlyTrackers API Studio

FlyTrackers API Studio is an API-first Next.js starter for building a travel site around three provider roles:

- aviationstack for aviation intelligence and operational flight data
- KAYAK Affiliate Network for travel search monetization, deeplinks, API, and whitelabel paths
- Expedia Rapid for lodging and car partner workflows with signed authentication

## What is included

- A branded landing page
- A search page with a real route-planning flow
- Airport, route, and flight detail pages backed by aviation intelligence
- Destination hub pages that connect flights, airport context, stays, and cars
- Stay and car planning pages for KAYAK and Expedia partner flows
- Saved trips plus tracked outbound partner clicks backed by Prisma and SQLite
- Editable trip workspaces with notes, dates, budget fields, and checklist tasks
- Provider live-test diagnostics page and JSON route
- Internal API routes for health checks, provider status, aviationstack access, and search orchestration
- Provider adapters for aviationstack, KAYAK, and Expedia Rapid
- Product, architecture, and database planning docs
- Environment variable templates for local development

## Project structure

- src/app contains pages and internal API routes
- src/lib contains provider configuration and adapter logic
- docs contains product planning and architecture notes
- src/components contains reusable UI such as the search form

## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env` and fill in the provider credentials you have.
3. Run `npm run db:generate` and `npm run db:push` to create the local SQLite database.
4. Start the development server.

`FLYTRACKERS_DEMO_MODE=true` is enabled by default in `.env.example`, so the aviation pages can render realistic local demo data until you add real provider keys.

## Vercel deployment

- The linked Vercel Hobby project is `flytrackers-api-studio-bilal`.
- Production expects at least `AVIATIONSTACK_API_KEY` and `SITE_URL` for a live aviation setup.
- If you want writable but still ephemeral SQLite storage on Vercel, set `DATABASE_URL=file:/tmp/flytrackers.db`.
- KAYAK and Expedia credentials remain optional until you have real partner access.

## GitHub auto deploy

- A GitHub Actions workflow now lives at `.github/workflows/vercel.yml`.
- Push the repo to GitHub on a `main` branch, then add the repository secret `VERCEL_TOKEN`.
- Pull requests will create Vercel preview deployments.
- Pushes to `main` will create production deployments for the linked Vercel project.

## Partner Preview

1. Start the site with `npm run dev`.
2. Run `npm run share:preview`.
3. Send your partner the printed public URL.

The preview script uses `PREVIEW_SUBDOMAIN` and `PREVIEW_PORT` from `.env` when present. If the tunnel provider shows an access interstitial, the script also prints the tunnel password so your partner can get through it.

## Search flow

- Use `/search?origin=JFK&destination=LHR&departDate=2026-06-15` to see the integrated planning flow.
- The page combines aviationstack route enrichment, KAYAK handoff status, and Expedia Rapid readiness in one place.
- Real partner output appears as soon as you provide actual env values.

## Detail pages

- Use `/airports/JFK` for airport-level activity.
- Use `/routes/JFK/LHR` for route detail and KAYAK handoff.
- Use `/flights/AA1004` for flight status lookup and airport links.
- Use `/destinations/london?airport=LHR&origin=JFK&departDate=2026-06-15&returnDate=2026-06-20` for a city-level hub page.
- Use `/stays?destination=London&checkIn=2026-06-15&checkOut=2026-06-20&adults=2` for hotel planning.
- Use `/cars?pickupLocation=LHR&dropoffLocation=LHR&pickupDate=2026-06-15&dropoffDate=2026-06-20` for car planning.
- Use `/saved-trips` to review saved planning states and recent partner clicks.
- Use `/saved-trips/<trip-id>` to manage trip notes, status, dates, and checklist tasks.
- Use `/providers/live-test` to inspect live-provider readiness without exposing secrets.

## Internal API examples

- `/api/health`
- `/api/providers/status`
- `/api/aviationstack?resource=flights&dep_iata=JFK&arr_iata=LHR&limit=10`
- `/api/travel/search?origin=JFK&destination=LHR&departDate=2026-06-15`
- `/api/travel/stays?destination=London&checkIn=2026-06-15&checkOut=2026-06-20&adults=2`
- `/api/travel/cars?pickupLocation=LHR&dropoffLocation=LHR&pickupDate=2026-06-15&dropoffDate=2026-06-20`
- `/api/saved-trips`
- `/api/outbound?provider=kayak&vertical=flights&destination=...`
- `/api/providers/live-test`

## Provider notes

### aviationstack

The project supports all major public aviationstack resource groups through a single internal proxy route and a typed provider wrapper.

### KAYAK

The project is built to support affiliate deeplinks immediately and sandbox or production API access once KAYAK approves the integration.

See `docs/provider-onboarding.md` for the env values and template placeholders expected by the app.

### Expedia Rapid

The project includes signed header generation for Rapid. Public setup information supports lodging and cars now; flight support should be confirmed directly with Expedia before product commitments are made.