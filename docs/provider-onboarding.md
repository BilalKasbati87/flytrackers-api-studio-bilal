# Provider Onboarding

## aviationstack

Set these values in your local env file:

- AVIATIONSTACK_API_KEY
- AVIATIONSTACK_BASE_URL

Use aviationstack for operational data, not booking. In this project it is the intelligence layer for routes, airport metadata, timetables, and future schedules.

If you are still waiting on a key, keep `FLYTRACKERS_DEMO_MODE=true` so the aviation pages continue rendering realistic local demo data.

## KAYAK

There are three practical KAYAK integration modes in this starter.

### Affiliate deeplink mode

Set:

- KAYAK_AFFILIATE_ID
- KAYAK_FLIGHTS_TEMPLATE
- KAYAK_HOTELS_TEMPLATE
- KAYAK_CARS_TEMPLATE

Use the official templates from the KAYAK Affiliate Network portal. Keep these placeholders so the app can inject route values:

- Flights: {affiliateId} {origin} {destination} {departDate} {returnDate}
- Hotels: {affiliateId} {destination} {checkIn} {checkOut} {adults}
- Cars: {affiliateId} {pickupLocation} {dropoffLocation} {pickupDate} {dropoffDate} {pickupTime} {dropoffTime}

### API mode

Set:

- KAYAK_API_BASE_URL
- KAYAK_API_KEY
- KAYAK_SANDBOX

Use this after KAYAK approves sandbox or production API access.

### Whitelabel mode

Set:

- KAYAK_WHITELABEL_URL

Use this if you want the fastest path to a richer search experience while deeper API work is still in progress.

## Expedia Rapid

Set:

- EXPEDIA_RAPID_API_KEY
- EXPEDIA_RAPID_SHARED_SECRET
- EXPEDIA_RAPID_ENV
- EXPEDIA_RAPID_TEST_BASE_URL
- EXPEDIA_RAPID_PROD_BASE_URL

The project already generates the Rapid authorization header on the server side. Public Rapid guidance currently supports lodging and car flows immediately. Treat flights as a separate approval track until Expedia confirms availability for your integration.

## What to do next

1. Copy .env.example to .env.
2. Paste the real provider values from each partner portal.
3. Restart the dev server.
4. Open /search with a route query and verify provider readiness cards.
5. Open /providers/live-test to verify which providers are truly configured.
6. Open /stays and /cars to verify the hotel and car planning flows.
7. Use /saved-trips after a few searches to confirm persistence, trip workspaces, and outbound click tracking are working.