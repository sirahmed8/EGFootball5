import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/serverAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  validateOriginAndCors,
  handleCorsPreflight,
  checkRateLimit,
  getClientIp,
} from '@/lib/security/apiSecurity';
import { sanitizeIdentifier } from '@/lib/security/sanitize';

export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflight(req);
}

export async function POST(req: NextRequest) {
  const { isAllowed, corsHeaders } = validateOriginAndCors(req);
  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden: Origin not allowed' }, { status: 403, headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIp = getClientIp(req);
    const ipLimit = checkRateLimit(`admin-role-ip:${clientIp}`, 15, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: corsHeaders }
      );
    }

    // Only platform Owners can promote users to Admin/Owner roles
    const authResult = await requireAuth(req, ['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    const { auth } = authResult;
    const userLimit = checkRateLimit(`admin-role-uid:${auth.uid}`, 10, 60 * 1000);
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit reached for role assignments. Please wait a minute.' },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawTargetUid = body?.targetUid;
    const rawRole = body?.role;

    const targetUid = sanitizeIdentifier(rawTargetUid, 128);
    const role = typeof rawRole === 'string' ? rawRole.trim() : '';

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing or invalid targetUid parameter' }, { status: 400, headers: corsHeaders });
    }

    if (!['player', 'admin', 'owner'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role parameter' }, { status: 400, headers: corsHeaders });
    }

    // Actually write role change to Firestore user document
    await updateDoc(doc(db, 'users', targetUid), {
      role,
      updatedAt: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `User ${targetUid} role successfully updated to ${role}.`,
        targetUid,
        role,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error processing role update';
    return NextResponse.json({ error: errMessage }, { status: 500, headers: corsHeaders });
  }
}

