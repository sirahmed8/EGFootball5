import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/serverAuth';

export async function POST(req: NextRequest) {
  try {
    // Only platform Owners can promote users to Admin/Manager roles
    const authResult = await requireAuth(req, ['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    const body = await req.json().catch(() => ({}));
    const { targetEmail, role } = body;

    if (!targetEmail || typeof targetEmail !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid targetEmail parameter' }, { status: 400 });
    }

    if (!role || !['player', 'admin', 'owner'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role parameter' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Role promotion request for ${targetEmail} to ${role} validated server-side.`,
      targetEmail,
      role,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error processing role update';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

