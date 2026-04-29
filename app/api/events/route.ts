import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/app/lib/churchtools";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ?? new Date().toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? from;
  try {
    const events = await getEvents(from, to);
    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
