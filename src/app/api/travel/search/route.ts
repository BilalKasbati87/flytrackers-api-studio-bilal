import { NextRequest, NextResponse } from "next/server";

import {
  getTravelSearchSnapshot,
  searchBlueprintFromSearchParams,
} from "@/lib/travel-search";

export async function GET(request: NextRequest) {
  const blueprint = searchBlueprintFromSearchParams(request.nextUrl.searchParams);
  const snapshot = await getTravelSearchSnapshot(blueprint);

  return NextResponse.json(snapshot);
}