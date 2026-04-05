# FlyTrackers Database Schema

This document originally described the long-term production model. The current local implementation uses a smaller SQLite schema so the product can support saved searches, trip workspaces, and outbound partner tracking before external APIs are fully configured.

## Current Local Schema

### SavedTrip

- id
- title
- summary
- vertical
- status
- path
- destinationLabel
- startDate
- endDate
- travelers
- budget
- notes
- searchState json
- createdAt
- updatedAt

### TripTask

- id
- tripId
- title
- done
- createdAt

### PartnerClick

- id
- provider
- vertical
- label
- sourcePath
- destinationUrl
- metadata json
- createdAt

## Core Tables

### users

- id
- email
- name
- created_at
- updated_at

### saved_searches

- id
- user_id
- vertical
- origin_iata
- destination_iata
- depart_date
- return_date
- passengers_json
- cabin_class
- created_at

### search_events

- id
- session_id
- user_id
- source_page
- vertical
- provider_target
- origin_iata
- destination_iata
- depart_date
- return_date
- query_json
- created_at

### partner_clicks

- id
- search_event_id
- provider
- vertical
- outbound_url
- tracking_payload_json
- created_at

### flight_watchlists

- id
- user_id
- flight_iata
- flight_date
- alert_rules_json
- created_at

### airport_reference

- iata_code
- icao_code
- airport_name
- city_iata_code
- country_iso2
- timezone
- latitude
- longitude
- payload_json
- refreshed_at

### airline_reference

- iata_code
- icao_code
- airline_name
- status
- country_iso2
- payload_json
- refreshed_at

### route_reference

- id
- airline_iata
- dep_iata
- arr_iata
- flight_number
- payload_json
- refreshed_at

### hotel_regions

- id
- provider_region_id
- provider
- name
- country_code
- payload_json
- refreshed_at

### property_reference

- id
- provider_property_id
- provider
- region_id
- name
- star_rating
- payload_json
- refreshed_at

## Why This Schema

- Operational aviation data stays queryable for SEO and alerts.
- Partner click tracking stays separate from user identity and search logs.
- Expedia lodging content can be refreshed on its own cadence.
- The schema supports affiliate monetization now and deeper booking flows later.