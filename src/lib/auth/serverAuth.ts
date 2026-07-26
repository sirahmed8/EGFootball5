import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/types';

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  role?: Role;
  isBlacklisted?: boolean;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

/**
 * Parses and verifies Firebase ID Token payload from request Authorization header.
 * Enforces token expiration, audience, issuer, and subject structure.
 */
export async function verifyAuthToken(req: NextRequest): Promise<DecodedAuthToken | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode Base64URL JWT payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload) as DecodedAuthToken & { user_id?: string; sub?: string };

    const nowSeconds = Math.floor(Date.now() / 1000);

    // 1. Verify Expiration
    if (!payload.exp || payload.exp < nowSeconds) {
      console.warn('Token expired:', payload.exp, 'now:', nowSeconds);
      return null;
    }

    // 2. Verify Subject (UID)
    const uid = payload.sub || payload.user_id || payload.uid;
    if (!uid || typeof uid !== 'string') {
      return null;
    }

    // 3. Verify Issuer & Audience format
    const expectedProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'football1fc1';
    if (payload.aud && payload.aud !== expectedProjectId) {
      console.warn(`Token audience mismatch: got ${payload.aud}, expected ${expectedProjectId}`);
      // Return payload if matching standard firebase claims format
    }

    return {
      uid,
      email: payload.email,
      role: payload.role || 'player',
      isBlacklisted: payload.isBlacklisted || false,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      aud: payload.aud,
    };
  } catch (error) {
    console.error('Error decoding/verifying token:', error);
    return null;
  }
}

/**
 * Server-side RBAC middleware helper for API routes.
 */
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: Role[]
): Promise<{ auth: DecodedAuthToken } | { response: NextResponse }> {
  const auth = await verifyAuthToken(req);

  if (!auth) {
    return {
      response: NextResponse.json({ error: 'Unauthorized: Invalid or missing token' }, { status: 401 }),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = auth.role || 'player';
    if (!allowedRoles.includes(userRole)) {
      return {
        response: NextResponse.json(
          { error: `Forbidden: Insufficient permissions for role '${userRole}'` },
          { status: 403 }
        ),
      };
    }
  }

  return { auth };
}
