import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/serverAuth";
import {
  validateOriginAndCors,
  handleCorsPreflight,
  checkRateLimit,
  getClientIp,
} from "@/lib/security/apiSecurity";
import { sanitizeText } from "@/lib/security/sanitize";

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req);
}

export async function POST(req: NextRequest) {
  const { isAllowed, corsHeaders } = validateOriginAndCors(req);
  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden: Origin not allowed" }, { status: 403, headers: corsHeaders });
  }

  const clientIp = getClientIp(req);
  const ipLimit = checkRateLimit(`tts-ip:${clientIp}`, 15, 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    // Enforce authentic Firebase ID token verification
    const auth = await verifyAuthToken(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing token" },
        { status: 401, headers: corsHeaders }
      );
    }

    const userLimit = checkRateLimit(`tts-uid:${auth.uid}`, 10, 60 * 1000);
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit reached for text-to-speech. Please wait a moment." },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawText = body?.text;
    const locale = body?.locale;

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid text parameter" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanitize input text
    const sanitizedText = sanitizeText(rawText, 500);

    return NextResponse.json(
      {
        success: true,
        text: sanitizedText,
        locale: locale || "en",
        audioUrl: null, // Signals client to use browser speech synthesis for audio playback
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to process TTS";
    return NextResponse.json({ error: errMessage }, { status: 500, headers: corsHeaders });
  }
}


