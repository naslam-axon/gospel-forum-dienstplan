import { NextResponse } from "next/server";
import { getServices } from "@/app/lib/churchtools";

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json(services, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
