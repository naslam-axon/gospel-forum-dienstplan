import { NextRequest, NextResponse } from "next/server";
import { getEvent } from "@/app/lib/churchtools";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const event = await getEvent(id);
    return NextResponse.json(event);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
