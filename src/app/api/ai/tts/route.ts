import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/serverAuth";

// Simple in-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    // Enforce authentic Firebase ID token verification
    const auth = await verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || auth.uid;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10; // max 10 requests per minute

    const userRateData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > userRateData.resetTime) {
      userRateData.count = 1;
      userRateData.resetTime = now + windowMs;
    } else {
      userRateData.count++;
      if (userRateData.count > maxRequests) {
        return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
      }
    }
    rateLimitMap.set(ip, userRateData);

    const body = await req.json().catch(() => ({}));
    const { text, locale } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text parameter" }, { status: 400 });
    }

    // Sanitize input text length
    const sanitizedText = text.trim().slice(0, 500);

    return NextResponse.json({
      success: true,
      text: sanitizedText,
      locale: locale || "en",
      audioUrl: null, // Signals client to use browser speech synthesis for audio playback
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to process TTS";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

