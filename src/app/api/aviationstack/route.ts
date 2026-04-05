import { NextRequest, NextResponse } from "next/server";

import { aviationstackClient } from "@/lib/providers/aviationstack";
import {
  aviationstackResources,
  type AviationstackResource,
  type QueryParams,
} from "@/types/travel";

function isSupportedResource(value: string): value is AviationstackResource {
  return aviationstackResources.includes(value as AviationstackResource);
}

export async function GET(request: NextRequest) {
  const resource = request.nextUrl.searchParams.get("resource");

  if (!resource || !isSupportedResource(resource)) {
    return NextResponse.json(
      {
        error:
          "Add a supported ?resource= query. Example: flights, routes, airports, timetable, or flightsFuture.",
      },
      { status: 400 },
    );
  }

  if (!aviationstackClient.isConfigured()) {
    return NextResponse.json(
      { error: "AVIATIONSTACK_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const params: QueryParams = {};

  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "resource") {
      params[key] = value;
    }
  });

  try {
    const response = await aviationstackClient.request(resource, params);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to query aviationstack.",
      },
      { status: 502 },
    );
  }
}