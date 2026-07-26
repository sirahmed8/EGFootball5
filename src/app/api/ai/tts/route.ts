import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, locale } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text parameter" }, { status: 400 });
    }

    // Server-side response payload supporting browser fallback and audio streaming
    return NextResponse.json({
      success: true,
      text: text.slice(0, 500),
      locale: locale || "en",
      audioUrl: null, // Signals client to use browser speech synthesis for audio playback
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process TTS" }, { status: 500 });
  }
}
