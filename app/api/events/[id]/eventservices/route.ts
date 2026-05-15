import { NextRequest, NextResponse } from "next/server";
import { updateEventServices } from "@/app/lib/churchtools";

type Params = Promise<{ id: string }>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const services: Array<{ serviceId: number; count: number }> = body.services;
    if (!Array.isArray(services)) {
      return NextResponse.json({ error: "services must be an array" }, { status: 400 });
    }
    await updateEventServices(id, services);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
