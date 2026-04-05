import { NextRequest, NextResponse } from "next/server";

import {
  createSavedTrip,
  deleteSavedTrip,
  listSavedTrips,
} from "@/lib/saved-trips";

export const dynamic = "force-dynamic";

export async function GET() {
  const trips = await listSavedTrips();
  return NextResponse.json({ trips });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    title?: string;
    summary?: string;
    vertical?: string;
    path?: string;
    searchState?: Record<string, unknown>;
  };

  if (!body.title || !body.vertical || !body.path || !body.searchState) {
    return NextResponse.json(
      { error: "title, vertical, path, and searchState are required." },
      { status: 400 },
    );
  }

  const trip = await createSavedTrip({
    title: body.title,
    summary: body.summary,
    vertical: body.vertical,
    path: body.path,
    searchState: body.searchState,
  });

  return NextResponse.json({ trip }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  await deleteSavedTrip(id);
  return NextResponse.json({ ok: true });
}