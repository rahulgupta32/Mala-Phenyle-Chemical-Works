import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';
import { OrderStatus } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    const isAdmin = session.role === 'ADMIN' || session.role === 'SUPERADMIN';
    const isDelivery = session.role === 'DELIVERY';

    const where: any = {};

    // Filter by role
    if (isAdmin) {
      // Admins see all orders.
      if (status && status !== 'ALL') {
        where.orderStatus = status as OrderStatus;
      }
    } else if (isDelivery) {
      // Delivery staff see orders assigned to them.
      where.deliveryAssignments = {
        some: {
          deliveryStaffId: session.userId,
        },
      };
      if (status && status !== 'ALL') {
        where.orderStatus = status as OrderStatus;
      }
    } else {
      // Registered customers see only their own orders.
      where.userId = session.userId;
    }

    // Fetch total and list
    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        include: {
          address: true,
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
