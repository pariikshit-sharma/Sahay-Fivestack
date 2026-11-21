import { NextRequest, NextResponse } from "next/server";
import { VERIFIED_NATIONAL_SCHEMES } from "@/core/schemes/verified-seeds";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const query = searchParams.get("q")?.toLowerCase();

    let schemes = VERIFIED_NATIONAL_SCHEMES;

    if (state && state !== "ALL") {
      schemes = schemes.filter(
        (s) => s.applicableStates.includes("ALL") || s.applicableStates.includes(state)
      );
    }

    if (category && category !== "ALL") {
      schemes = schemes.filter(
        (s) => s.benefitType === category || s.department.toLowerCase().includes(category)
      );
    }

    if (level && level !== "ALL") {
      schemes = schemes.filter((s) => s.level === level);
    }

    if (query) {
      schemes = schemes.filter(
        (s) =>
          s.titleEn.toLowerCase().includes(query) ||
          s.titleHi.includes(query) ||
          s.officialCode?.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      schemes,
      total: schemes.length,
      verifiedOnly: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch schemes", message: error.message },
      { status: 500 }
    );
  }
}
