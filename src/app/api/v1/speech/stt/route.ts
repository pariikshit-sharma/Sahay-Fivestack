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

    const promptText = `Listen carefully to this audio in ${lang} or Hindi or English or any Indian language.
Transcribe exactly what the citizen is saying regarding their occupation, location, income, or welfare scheme needs.
Return a clean JSON object with this exact key:
{
  "transcript": "the full transcribed text"
}`;

    const modelsToTry = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];
    let transcribedText = "";
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`,
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
          lastError = await geminiRes.text();
          console.warn(`[Gemini STT ${model} Error]:`, lastError);
          continue;
        }

        const json = await geminiRes.json();
        const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawContent) continue;

        const cleanJson = rawContent.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        transcribedText = parsed.transcript || cleanJson;
        if (transcribedText) break;
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[Gemini STT ${model} Exception]:`, err);
      }
    }

    if (!transcribedText) {
      return NextResponse.json(
        { success: false, error: lastError || "Failed to transcribe audio" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      transcript: transcribedText,
    });
  } catch (err: any) {
    console.error("[Audio STT Exception]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
