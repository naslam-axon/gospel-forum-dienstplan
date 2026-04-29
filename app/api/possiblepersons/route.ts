import { NextRequest, NextResponse } from "next/server";
import { getPossiblePersons } from "@/app/lib/churchtools";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const eventId = searchParams.get("eventId");
  const serviceId = searchParams.get("serviceId");
  if (!eventId || !serviceId) {
    return NextResponse.json({ error: "eventId and serviceId required" }, { status: 400 });
  }
  try {
    const persons = await getPossiblePersons(eventId, serviceId);
    return NextResponse.json(persons);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
