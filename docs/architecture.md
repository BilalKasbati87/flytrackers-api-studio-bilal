# FlyTrackers Architecture

## Application Shape

This project is structured as a Next.js full-stack app.

- UI pages live in the app router.
- External provider calls go through internal server routes.
- Provider adapters keep credential logic and partner-specific behavior out of the UI.

## Request Flow

1. Browser requests search or flight-intelligence data from internal API routes.
2. Internal route validates inputs and checks provider readiness.
3. aviationstack requests enrich search intent with operational aviation data.
4. KAYAK deeplinks, whitelabel, or API responses provide monetized travel search paths.
5. Expedia Rapid supports lodging and car workflows with signed server-side requests.

## Integration Notes

### aviationstack

- Treat as the intelligence backbone, not the booking engine.
- Cache airports, airlines, cities, countries, and route metadata aggressively.
- Keep live flight and timetable calls uncached or short-lived.

### KAYAK

- Use official affiliate approval before attempting production access.
- Template-based links let you start with deeplinks while preserving room for sandbox or production API keys later.
- Whitelabel is the fastest path to a richer booking-like search experience.

### Expedia Rapid

- Use signature authentication on the server only.
- Separate test and production base URLs.
- Model the booking path as content, geography, shop, price check, booking, retrieve.

## Recommended Next Layers

- Postgres for search logs, users, saved trips, partner events, and cached reference data.
- Background jobs for airport, airline, and property-content refreshes.
- Observability around provider latency, error rate, and partner conversion.