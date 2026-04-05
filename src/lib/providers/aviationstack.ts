import { aviationstackConfig } from "@/lib/config";
import { fetchJson, toQueryString } from "@/lib/http";
import type { AviationstackResource, QueryParams } from "@/types/travel";

type AviationstackResponse = {
  pagination?: Record<string, unknown>;
  data?: unknown[];
  error?: {
    code?: string;
    message?: string;
  };
};

class AviationstackClient {
  isConfigured() {
    return Boolean(aviationstackConfig.apiKey);
  }

  async request(
    resource: AviationstackResource,
    params: QueryParams = {},
  ): Promise<AviationstackResponse> {
    if (!this.isConfigured()) {
      throw new Error("AVIATIONSTACK_API_KEY is not configured.");
    }

    const query = toQueryString({
      ...params,
      access_key: aviationstackConfig.apiKey,
    });

    return fetchJson<AviationstackResponse>(
      `${aviationstackConfig.baseUrl}/${resource}?${query}`,
    );
  }

  getFlights(params: QueryParams = {}) {
    return this.request("flights", params);
  }

  getRoutes(params: QueryParams = {}) {
    return this.request("routes", params);
  }

  getAirports(params: QueryParams = {}) {
    return this.request("airports", params);
  }

  getAirlines(params: QueryParams = {}) {
    return this.request("airlines", params);
  }

  getAirplanes(params: QueryParams = {}) {
    return this.request("airplanes", params);
  }

  getAircraftTypes(params: QueryParams = {}) {
    return this.request("aircraft_types", params);
  }

  getTaxes(params: QueryParams = {}) {
    return this.request("taxes", params);
  }

  getCities(params: QueryParams = {}) {
    return this.request("cities", params);
  }

  getCountries(params: QueryParams = {}) {
    return this.request("countries", params);
  }

  getTimetable(params: QueryParams = {}) {
    return this.request("timetable", params);
  }

  getFlightsFuture(params: QueryParams = {}) {
    return this.request("flightsFuture", params);
  }
}

export const aviationstackClient = new AviationstackClient();