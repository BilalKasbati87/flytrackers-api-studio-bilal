import { NextRequest, NextResponse } from "next/server";

import { logPartnerClick } from "@/lib/saved-trips";

export const dynamic = "force-dynamic";

function parseMetadata(value: string | null) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function validateDestination(destination: string) {
  const parsed = new URL(destination);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https destinations are allowed.");
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  const destination = request.nextUrl.searchParams.get("destination");
  const provider = request.nextUrl.searchParams.get("provider");
  const vertical = request.nextUrl.searchParams.get("vertical");
  const label = request.nextUrl.searchParams.get("label") ?? undefined;
  const sourcePath = request.nextUrl.searchParams.get("sourcePath") ?? undefined;
  const metadata = parseMetadata(request.nextUrl.searchParams.get("metadata"));

  if (!destination || !provider || !vertical) {
    return NextResponse.json(
      { error: "destination, provider, and vertical are required." },
      { status: 400 },
    );
  }

  let redirectTarget: URL;

  try {
    redirectTarget = validateDestination(destination);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid destination." },
      { status: 400 },
    );
  }

  await logPartnerClick({
    provider,
    vertical,
    label,
    sourcePath,
    destinationUrl: redirectTarget.toString(),
    metadata,
  });

  return NextResponse.redirect(redirectTarget, 307);
}