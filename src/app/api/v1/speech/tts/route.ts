import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "hi";

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Google Translate TTS endpoint: returns real MPEG audio stream, totally free and reliable
    const targetLang = lang.split("-")[0]; // e.g. "hi", "en", "ta", "bn", "mr", "te"
    const encodedText = encodeURIComponent(text.slice(0, 200)); // chunk first 200 chars for instant delivery
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${targetLang}&client=tw-ob`;

    const audioRes = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!audioRes.ok) {
      return NextResponse.json({ error: "Failed to fetch speech audio" }, { status: 502 });
    }

    const audioBuffer = await audioRes.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "TTS generation failed", message: err.message }, { status: 500 });
  }
}
