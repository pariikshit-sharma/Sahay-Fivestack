import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const lang = (formData.get("language") as string) || "hi";

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      // If no Gemini key is provided, return guidance
      return NextResponse.json({
        success: false,
        error: "NO_GEMINI_KEY",
        message: "GEMINI_API_KEY is not set in .env.local. Please provide your free Gemini API key to transcribe audio on localhost.",
      });
    }

    // Convert Blob to Base64
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString("base64");
    const mimeType = audioFile.type || "audio/webm";

    const promptText = `Listen carefully to this audio in ${lang} or Hindi or English. Transcribe exactly what the person is saying.
Return a clean JSON object in this exact schema:
{
  "transcript": "the transcribed text"
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType: mimeType.split(";")[0],
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn("[Gemini Audio STT Error]:", errText);
      return NextResponse.json({ success: false, error: errText }, { status: 502 });
    }

    const json = await geminiRes.json();
    const resultText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      return NextResponse.json({ success: false, error: "Empty model response" }, { status: 500 });
    }

    const parsed = JSON.parse(resultText);
    return NextResponse.json({
      success: true,
      transcript: parsed.transcript || "",
    });
  } catch (err: any) {
    console.error("[Audio STT Exception]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
