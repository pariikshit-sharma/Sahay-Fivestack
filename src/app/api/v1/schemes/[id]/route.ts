import { NextRequest, NextResponse } from "next/server";
import { VERIFIED_NATIONAL_SCHEMES } from "@/core/schemes/verified-seeds";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheme = VERIFIED_NATIONAL_SCHEMES.find(
      (s) => s.id === id || s.slug === id || s.officialCode?.toLowerCase() === id.toLowerCase()
    );

    if (!scheme) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }

    return NextResponse.json({ scheme });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch scheme", message: error.message },
      { status: 500 }
    );
  }
}
