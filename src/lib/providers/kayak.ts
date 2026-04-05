import { kayakConfig } from "@/lib/config";
import type {
  CarSearchBlueprint,
  SearchBlueprint,
  StaySearchBlueprint,
} from "@/types/travel";

type KayakVertical = "flights" | "hotels" | "cars";
type KayakTemplateValues = Record<string, string | undefined>;

const templates: Record<KayakVertical, string> = {
  flights: kayakConfig.flightsTemplate,
  hotels: kayakConfig.hotelsTemplate,
  cars: kayakConfig.carsTemplate,
};

function fillTemplate(template: string, values: KayakTemplateValues) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    const value = values[key];
    return encodeURIComponent(value ?? "");
  });
}

function buildKayakTemplateLink(
  vertical: KayakVertical,
  values: KayakTemplateValues,
) {
  const template = templates[vertical];

  if (!template) {
    return null;
  }

  return fillTemplate(template, {
    affiliateId: kayakConfig.affiliateId,
    ...values,
  });
}

export function buildKayakLink(
  vertical: KayakVertical,
  blueprint: SearchBlueprint,
) {
  return buildKayakTemplateLink(vertical, {
    origin: blueprint.origin,
    destination: blueprint.destination,
    departDate: blueprint.departDate,
    returnDate: blueprint.returnDate,
  });
}

export function buildKayakStayLink(blueprint: StaySearchBlueprint) {
  return buildKayakTemplateLink("hotels", {
    destination: blueprint.destination,
    location: blueprint.destination,
    city: blueprint.destination,
    query: blueprint.destination,
    checkIn: blueprint.checkIn,
    checkOut: blueprint.checkOut,
    adults: blueprint.adults,
    guests: blueprint.adults,
  });
}

export function buildKayakCarLink(blueprint: CarSearchBlueprint) {
  return buildKayakTemplateLink("cars", {
    pickupLocation: blueprint.pickupLocation,
    dropoffLocation: blueprint.dropoffLocation,
    location: blueprint.pickupLocation,
    pickupDate: blueprint.pickupDate,
    dropoffDate: blueprint.dropoffDate,
    pickupTime: blueprint.pickupTime,
    dropoffTime: blueprint.dropoffTime,
  });
}

export function getKayakSummary() {
  return {
    apiConfigured: Boolean(kayakConfig.apiBaseUrl && kayakConfig.apiKey),
    affiliateConfigured: Boolean(kayakConfig.affiliateId),
    sandboxEnabled: kayakConfig.sandboxEnabled,
    whitelabelUrl: kayakConfig.whitelabelUrl || null,
    templatesAvailable: {
      flights: Boolean(kayakConfig.flightsTemplate),
      hotels: Boolean(kayakConfig.hotelsTemplate),
      cars: Boolean(kayakConfig.carsTemplate),
    },
  };
}