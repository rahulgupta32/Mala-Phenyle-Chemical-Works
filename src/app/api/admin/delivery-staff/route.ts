import { NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';
import { Role } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deliveryStaff = await db.user.findMany({
      where: { role: Role.DELIVERY },
      select: {
        id: true,
        name: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(deliveryStaff);
  } catch (error) {
    console.error('Fetch delivery staff error:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery staff' }, { status: 500 });
  }
}
