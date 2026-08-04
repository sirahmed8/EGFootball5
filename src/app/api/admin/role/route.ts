import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/serverAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    // Only platform Owners can promote users to Admin/Owner roles
    const authResult = await requireAuth(req, ['owner']);
    if ('response' in authResult) {
      return authResult.response;
    }

    const body = await req.json().catch(() => ({}));
    const { targetUid, role } = body;

    if (!targetUid || typeof targetUid !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid targetUid parameter' }, { status: 400 });
    }

    if (!role || !['player', 'admin', 'owner'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role parameter' }, { status: 400 });
    }

    // Fix #2: Actually write role change to Firestore user document
    await updateDoc(doc(db, 'users', targetUid), {
      role,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUid} role successfully updated to ${role}.`,
      targetUid,
      role,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error processing role update';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
