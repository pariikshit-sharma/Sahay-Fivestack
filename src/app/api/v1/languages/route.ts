import { NextResponse } from "next/server";
import { SUPPORTED_LANGUAGES } from "@/core/languages/registry";

export async function GET() {
  return NextResponse.json({
    totalLanguages: SUPPORTED_LANGUAGES.length,
    defaultLanguage: "hi",
    fallbackLanguage: "en",
    languages: SUPPORTED_LANGUAGES,
    speechEngine: "Browser Native Web Speech API (100% Free, zero latency)",
  });
}
