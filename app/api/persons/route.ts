import { NextRequest, NextResponse } from "next/server";
import { searchPersons } from "@/app/lib/churchtools";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);
  try {
    const persons = await searchPersons(q);
    return NextResponse.json(persons);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
