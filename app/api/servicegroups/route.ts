import { NextResponse } from "next/server";
import { getServiceGroups } from "@/app/lib/churchtools";

export async function GET() {
  try {
    const groups = await getServiceGroups();
    return NextResponse.json(groups, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
