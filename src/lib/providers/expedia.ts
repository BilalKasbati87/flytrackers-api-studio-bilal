import { createHash } from "node:crypto";

import { expediaConfig } from "@/lib/config";
import { fetchJson, toQueryString } from "@/lib/http";
import type { QueryParams } from "@/types/travel";

export function createRapidAuthorizationHeader(timestamp = Math.floor(Date.now() / 1000)) {
  if (!expediaConfig.apiKey || !expediaConfig.sharedSecret) {
    return null;
  }

  const signature = createHash("sha512")
    .update(`${expediaConfig.sharedSecret}${expediaConfig.apiKey}${timestamp}`)
    .digest("hex");

  return `EAN APIKey=${expediaConfig.apiKey},Signature=${signature},timestamp=${timestamp}`;
}

export async function requestRapid<T>(
  path: string,
  query: QueryParams = {},
  init?: RequestInit,
): Promise<T> {
  const authorization = createRapidAuthorizationHeader();

  if (!authorization) {
    throw new Error("Expedia Rapid credentials are not configured.");
  }

  const baseUrl =
    expediaConfig.environment === "production"
      ? expediaConfig.productionBaseUrl
      : expediaConfig.testBaseUrl;

  const trimmedPath = path.startsWith("/") ? path.slice(1) : path;
  const queryString = toQueryString(query);
  const url = `${baseUrl}/${trimmedPath}${queryString ? `?${queryString}` : ""}`;

  return fetchJson<T>(url, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: authorization,
      ...(init?.headers ?? {}),
    },
  });
}

export function getExpediaSummary() {
  return {
    configured: Boolean(expediaConfig.apiKey && expediaConfig.sharedSecret),
    environment: expediaConfig.environment,
    baseUrl:
      expediaConfig.environment === "production"
        ? expediaConfig.productionBaseUrl
        : expediaConfig.testBaseUrl,
    bookingFlow: [
      "Static content refresh",
      "Geography lookup",
      "Shopping and rate discovery",
      "Price check",
      "Booking and itinerary retrieval",
    ],
    publicFlightApiStatus: "coming-soon",
  };
}