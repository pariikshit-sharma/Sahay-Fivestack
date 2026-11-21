import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CitizenProfileSchema } from "@/types/citizen";
import { VERIFIED_NATIONAL_SCHEMES } from "@/core/schemes/verified-seeds";
import { evaluateScheme } from "@/core/eligibility/evaluator";

const MatchRequestSchema = z.object({
  profile: CitizenProfileSchema,
  filters: z
    .object({
      state: z.string().optional(),
      categories: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = MatchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { profile, filters } = parsed.data;

    // Filter schemes by category if requested
    let targetSchemes = VERIFIED_NATIONAL_SCHEMES;
    if (filters?.categories && filters.categories.length > 0) {
      targetSchemes = targetSchemes.filter(
        (s) =>
          filters.categories!.includes(s.benefitType) ||
          filters.categories!.includes(s.department)
      );
    }

    // Evaluate deterministically
    const matches = targetSchemes.map((scheme) => evaluateScheme(profile, scheme));

    // Sort order: likely_eligible -> needs_information -> not_eligible -> manual_verification
    const priority = {
      likely_eligible: 1,
      needs_information: 2,
      manual_verification: 3,
      not_eligible: 4,
    };

    matches.sort((a, b) => priority[a.status] - priority[b.status]);

    const likelyEligibleCount = matches.filter((m) => m.status === "likely_eligible").length;
    const needsInformationCount = matches.filter((m) => m.status === "needs_information").length;

    return NextResponse.json({
      matches,
      summary: {
        likelyEligibleCount,
        needsInformationCount,
        totalEvaluated: matches.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal matching error", message: error.message },
      { status: 500 }
    );
  }
}
