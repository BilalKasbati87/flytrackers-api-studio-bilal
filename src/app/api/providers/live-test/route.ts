import { NextResponse } from "next/server";

import { getLiveProviderTestSnapshot } from "@/lib/provider-live-test";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getLiveProviderTestSnapshot();
  return NextResponse.json(snapshot);
}