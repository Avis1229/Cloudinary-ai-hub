import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteSettingsModel from '@/lib/models/SiteSettingsModel';

export const dynamic = 'force-dynamic';

// Public: returns contact settings for frontend use
export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSettingsModel.findOne({}).lean() as any;
    if (!settings) {
      // Create defaults if none exist
      settings = await SiteSettingsModel.create({});
      settings = settings.toObject();
    }
    return NextResponse.json({
      supportPhone: settings.supportPhone,
      whatsappNumber: settings.whatsappNumber || settings.supportPhone,
      supportEmail: settings.supportEmail,
      shopAddress: settings.shopAddress,
      // Pricing & Logistics
      shippingPrice: settings.shippingPrice ?? 200,
      freeShippingThreshold: settings.freeShippingThreshold ?? 2000,
      taxRate: settings.taxRate ?? 18,
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({
      supportPhone: '+91-XXXX-XXXXXX',
      whatsappNumber: '+91-XXXX-XXXXXX',
      supportEmail: 'aethravia@gmail.com',
      shopAddress: '',
      shippingPrice: 200,
      freeShippingThreshold: 2000,
      taxRate: 18,
    });
  }
}
