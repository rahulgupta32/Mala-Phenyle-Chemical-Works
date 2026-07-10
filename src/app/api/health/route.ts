import { NextResponse } from 'next/server';
import { db } from 'src/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Confirm connectivity with a lightweight query
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed: unable to connect to database.', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
