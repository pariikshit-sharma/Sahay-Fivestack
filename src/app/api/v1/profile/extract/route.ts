import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractCitizenProfile } from "@/core/profile/extractor";
import { CitizenProfileSchema } from "@/types/citizen";

const ExtractRequestSchema = z.object({
  transcript: z.string().min(1),
  currentProfile: CitizenProfileSchema.optional(),
  language: z.string().optional().default("hi"),
  engine: z.enum(["auto", "ollama", "gemini"]).optional().default("auto"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExtractRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { transcript, currentProfile, engine, language } = parsed.data;
    const result = await extractCitizenProfile(transcript, currentProfile, engine, language);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal processing error", message: error.message },
      { status: 500 }
    );
  }
}
