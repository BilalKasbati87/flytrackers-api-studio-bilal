import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { aviationstackResources, type ProviderStatus } from "@/types/travel";

function env(name: string, fallback = "") {
  return process.env[name]?.trim() ?? fallback;
}

function envFlag(name: string, fallback = false) {
  const value = env(name);

  if (!value) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readAttachedAviationstackApiKey() {
  try {
    const attachedFilePath = path.join(process.cwd(), "API", "API File.txt");

    if (!existsSync(attachedFilePath)) {
      return "";
    }

    const content = readFileSync(attachedFilePath, "utf8");
    const match = content.match(/AviationStack API:\s*([A-Za-z0-9]+)/i);

    return match?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

const attachedAviationstackApiKey = readAttachedAviationstackApiKey();

export const appConfig = {
  siteUrl: env("SITE_URL", "http://localhost:3000"),
  databaseUrl: env("DATABASE_URL"),
  demoMode: envFlag("FLYTRACKERS_DEMO_MODE", true),
};

export const aviationstackConfig = {
  apiKey: env("AVIATIONSTACK_API_KEY") || attachedAviationstackApiKey,
  keySource: env("AVIATIONSTACK_API_KEY")
    ? "env"
    : attachedAviationstackApiKey
      ? "attached-file"
      : "missing",
  baseUrl: env("AVIATIONSTACK_BASE_URL", "https://api.aviationstack.com/v1"),
};

export const kayakConfig = {
  apiBaseUrl: env("KAYAK_API_BASE_URL"),
  apiKey: env("KAYAK_API_KEY"),
  affiliateId: env("KAYAK_AFFILIATE_ID"),
  sandboxEnabled: envFlag("KAYAK_SANDBOX"),
  flightsTemplate: env("KAYAK_FLIGHTS_TEMPLATE"),
  hotelsTemplate: env("KAYAK_HOTELS_TEMPLATE"),
  carsTemplate: env("KAYAK_CARS_TEMPLATE"),
  whitelabelUrl: env("KAYAK_WHITELABEL_URL"),
};

const expediaEnvironment: "test" | "production" =
  env("EXPEDIA_RAPID_ENV", "test") === "production"
    ? "production"
    : "test";

export const expediaConfig = {
  apiKey: env("EXPEDIA_RAPID_API_KEY"),
  sharedSecret: env("EXPEDIA_RAPID_SHARED_SECRET"),
  environment: expediaEnvironment,
  testBaseUrl: env("EXPEDIA_RAPID_TEST_BASE_URL", "https://test.ean.com/v3"),
  productionBaseUrl: env(
    "EXPEDIA_RAPID_PROD_BASE_URL",
    "https://api.ean.com/v3",
  ),
};

export function getProviderStatus(): ProviderStatus {
  return {
    aviationstack: {
      configured: Boolean(aviationstackConfig.apiKey),
      supportedResources: aviationstackResources,
    },
    kayak: {
      affiliateConfigured: Boolean(kayakConfig.affiliateId),
      apiConfigured: Boolean(kayakConfig.apiBaseUrl && kayakConfig.apiKey),
      sandboxEnabled: kayakConfig.sandboxEnabled,
      whitelabelConfigured: Boolean(kayakConfig.whitelabelUrl),
    },
    expedia: {
      configured: Boolean(expediaConfig.apiKey && expediaConfig.sharedSecret),
      environment: expediaConfig.environment,
      supportsLodging: true,
      supportsCars: true,
      publicFlightApiStatus: "coming-soon",
    },
  };
}
