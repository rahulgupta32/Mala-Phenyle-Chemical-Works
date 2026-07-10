import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';
import { WholesaleApplicationSchema } from 'src/lib/validation';
import { WholesaleAppStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = WholesaleApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid application details', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { companyName, panNumber, businessType, documentUrl } = parsed.data;

    // Check if application already exists for this user
    const existingApp = await db.wholesaleApplication.findFirst({
      where: {
        userId: session.userId,
        status: { in: [WholesaleAppStatus.PENDING, WholesaleAppStatus.APPROVED] },
      },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: 'You already have a pending or approved wholesale application' },
        { status: 400 }
      );
    }

    // Create profile if not exists
    await db.customerProfile.upsert({
      where: { userId: session.userId },
      update: {
        companyName,
        panNumber,
      },
      create: {
        userId: session.userId,
        companyName,
        panNumber,
      },
    });

    // Create the application
    const application = await db.wholesaleApplication.create({
      data: {
        userId: session.userId,
        companyName,
        panNumber,
        businessType,
        documentUrl: documentUrl || null,
        status: WholesaleAppStatus.PENDING,
      },
    });

    return NextResponse.json({
      message: 'Wholesale application submitted successfully. Awaiting admin review.',
      application,
    }, { status: 201 });

  } catch (error) {
    console.error('Submit wholesale application error:', error);
    return NextResponse.json({ error: 'Failed to submit wholesale application' }, { status: 500 });
  }
}
