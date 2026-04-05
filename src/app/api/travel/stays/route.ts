import { NextRequest, NextResponse } from "next/server";

import {
  getStaySearchSnapshot,
  staySearchFromSearchParams,
} from "@/lib/travel-commerce";

export async function GET(request: NextRequest) {
  const query = staySearchFromSearchParams(request.nextUrl.searchParams);
  const snapshot = getStaySearchSnapshot(query);

  return NextResponse.json(snapshot);
}