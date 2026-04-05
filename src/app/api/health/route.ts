import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "flytrackers-api-studio",
    timestamp: new Date().toISOString(),
  });
}