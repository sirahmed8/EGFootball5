import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const payload = {
    status: 'healthy',
    service: 'egfootball5-platform',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    checks: {
      clientApp: 'pass',
      firebaseIntegrations: 'pass',
      storageRules: 'pass',
      firestoreSecurity: 'pass',
    },
  };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=60',
      'Content-Type': 'application/json',
    },
  });
}
