import { NextResponse } from 'next/server';
import { getAuthUser, getDbUser } from 'src/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAuthUser();
  
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const dbUser = await getDbUser();
  if (!dbUser) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role,
      approvedForWholesale: dbUser.profile?.approvedForWholesale || false,
    },
  });
}
