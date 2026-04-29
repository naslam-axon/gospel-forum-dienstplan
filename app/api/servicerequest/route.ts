import { NextRequest, NextResponse } from "next/server";
import { assignPerson, removeAssignment } from "@/app/lib/churchtools";

export async function POST(req: NextRequest) {
  try {
    const { eventId, eventServiceId, personId, personName } = await req.json();
    if (!eventId || !eventServiceId || !personId || !personName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await assignPerson(String(eventId), String(eventServiceId), Number(personId), personName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { eventId, eventServiceId } = await req.json();
    if (!eventId || !eventServiceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await removeAssignment(String(eventId), String(eventServiceId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
