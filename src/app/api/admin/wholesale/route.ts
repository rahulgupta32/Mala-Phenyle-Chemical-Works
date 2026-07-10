import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';
import { WholesaleAppStatus, Role } from '@prisma/client';

// 1. Get all wholesale applications
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status as WholesaleAppStatus;
    }

    const applications = await db.wholesaleApplication.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Fetch wholesale applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// 2. Approve/Reject Application
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, status, adminNotes, minOrderValue } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 });
    }

    const app = await db.wholesaleApplication.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updatedApp = await db.$transaction(async (tx) => {
      // Update wholesale application status
      const updated = await tx.wholesaleApplication.update({
        where: { id: applicationId },
        data: {
          status: status as WholesaleAppStatus,
          adminNotes: adminNotes || null,
        },
      });

      if (status === WholesaleAppStatus.APPROVED) {
        // Upgrade user role to WHOLESALE
        await tx.user.update({
          where: { id: app.userId },
          data: { role: Role.WHOLESALE },
        });

        // Set approved in CustomerProfile
        await tx.customerProfile.upsert({
          where: { userId: app.userId },
          update: {
            approvedForWholesale: true,
            minOrderValue: minOrderValue ? Number(minOrderValue) : 10000.00,
          },
          create: {
            userId: app.userId,
            approvedForWholesale: true,
            minOrderValue: minOrderValue ? Number(minOrderValue) : 10000.00,
          },
        });
      } else if (status === WholesaleAppStatus.REJECTED) {
        // Demote user role back to CUSTOMER if they were wholesale
        await tx.user.update({
          where: { id: app.userId },
          data: { role: Role.CUSTOMER },
        });

        // Revoke wholesale profile approval
        await tx.customerProfile.update({
          where: { userId: app.userId },
          data: { approvedForWholesale: false },
        });
      }

      return updated;
    });

    // Write Admin Activity Log
    await db.adminActivityLog.create({
      data: {
        adminId: session.userId,
        action: 'UPDATE_WHOLESALE_APPLICATION',
        details: `Updated wholesale application for User ID: ${app.userId} to status ${status}`,
      },
    });

    return NextResponse.json({
      message: `Application has been ${status.toLowerCase()} successfully`,
      application: updatedApp,
    });

  } catch (error) {
    console.error('Update wholesale application error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
