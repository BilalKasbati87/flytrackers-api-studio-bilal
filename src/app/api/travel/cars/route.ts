import { NextRequest, NextResponse } from "next/server";

import {
  carSearchFromSearchParams,
  getCarSearchSnapshot,
} from "@/lib/travel-commerce";

export async function GET(request: NextRequest) {
  const query = carSearchFromSearchParams(request.nextUrl.searchParams);
  const snapshot = getCarSearchSnapshot(query);

  return NextResponse.json(snapshot);
}