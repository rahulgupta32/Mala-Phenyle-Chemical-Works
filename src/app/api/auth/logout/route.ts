import { NextResponse } from 'next/server';
import { removeAuthCookie } from 'src/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  await removeAuthCookie();
  return NextResponse.json({ message: 'Logged out successfully' });
}

export async function GET() {
  await removeAuthCookie();
  return NextResponse.json({ message: 'Logged out successfully' });
}
