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

    const mandatoryDocuments = scheme.documents.filter((d) => d.isMandatory);
    const optionalDocuments = scheme.documents.filter((d) => !d.isMandatory);

    return NextResponse.json({
      schemeId: scheme.id,
      officialCode: scheme.officialCode,
      titleEn: scheme.titleEn,
      titleHi: scheme.titleHi,
      applicationMode: scheme.applicationMode,
      officialPortalUrl: scheme.officialPortalUrl,
      mandatoryDocuments,
      optionalDocuments,
      sources: scheme.sources,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate checklist", message: error.message },
      { status: 500 }
    );
  }
}
