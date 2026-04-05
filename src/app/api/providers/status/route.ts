import { NextResponse } from "next/server";

import { getProviderStatus } from "@/lib/config";
import { getExpediaSummary } from "@/lib/providers/expedia";
import { getKayakSummary } from "@/lib/providers/kayak";

export function GET() {
  return NextResponse.json({
    providers: getProviderStatus(),
    details: {
      kayak: getKayakSummary(),
      expedia: getExpediaSummary(),
    },
  });
}