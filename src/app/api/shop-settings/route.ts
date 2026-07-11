import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 1. Fetch current settings
export async function GET() {
  try {
    let settings = await db.shopSettings.findUnique({
      where: { id: 'default' },
    });

    // Fallback if not seeded yet
    if (!settings) {
      settings = await db.shopSettings.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch shop settings' }, { status: 500 });
  }
}

// 2. Update settings (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Whitelist and format settings update payload
    const updatedSettings = await db.shopSettings.upsert({
      where: { id: 'default' },
      update: {
        businessName: body.businessName,
        businessAddress: body.businessAddress,
        supportEmail: body.supportEmail,
        supportPhone: body.supportPhone,
        supportPhoneAlternative: body.supportPhoneAlternative,
        whatsappViber: body.whatsappViber,
        freeDeliveryThreshold: body.freeDeliveryThreshold !== undefined ? Number(body.freeDeliveryThreshold) : undefined,
        minWholesaleOrderAmount: body.minWholesaleOrderAmount !== undefined ? Number(body.minWholesaleOrderAmount) : undefined,
        announcementText: body.announcementText,
        codEnabled: body.codEnabled,
        esewaEnabled: body.esewaEnabled,
        khaltiEnabled: body.khaltiEnabled,
        fonepayEnabled: body.fonepayEnabled,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
      },
      create: {
        id: 'default',
        businessName: body.businessName || 'Mala Phenyle Chemical Works',
        businessAddress: body.businessAddress || 'Birgunj, Nepal',
        supportEmail: body.supportEmail || 'Sunilgupta335566@gmail.com',
        supportPhone: body.supportPhone || '+977 9855033186',
        supportPhoneAlternative: body.supportPhoneAlternative,
        whatsappViber: body.whatsappViber || '+977 9855033186',
        freeDeliveryThreshold: body.freeDeliveryThreshold !== undefined ? Number(body.freeDeliveryThreshold) : 2000.00,
        minWholesaleOrderAmount: body.minWholesaleOrderAmount !== undefined ? Number(body.minWholesaleOrderAmount) : 10000.00,
        announcementText: body.announcementText || 'Welcome to Mala Phenyle Chemical Works!',
        codEnabled: body.codEnabled !== undefined ? body.codEnabled : true,
        esewaEnabled: body.esewaEnabled !== undefined ? body.esewaEnabled : false,
        khaltiEnabled: body.khaltiEnabled !== undefined ? body.khaltiEnabled : false,
        fonepayEnabled: body.fonepayEnabled !== undefined ? body.fonepayEnabled : false,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
      },
    });

    // Log admin action
    await db.adminActivityLog.create({
      data: {
        adminId: session.userId,
        action: 'UPDATE_SHOP_SETTINGS',
        details: 'Updated shop settings properties',
      },
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings: updatedSettings });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update shop settings' }, { status: 500 });
  }
}
