import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import SiteSettingsModel from '@/lib/models/SiteSettingsModel';

export const dynamic = 'force-dynamic';

// GET: Admin fetches full settings
export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }
  await dbConnect();
  let settings = await SiteSettingsModel.findOne({}).lean() as any;
  if (!settings) {
    const created = await SiteSettingsModel.create({});
    settings = created.toObject();
  }
  return NextResponse.json(settings);
}) as any;

// POST: Admin updates settings
export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const body = await req.json();

  let settings = await SiteSettingsModel.findOne({});
  if (!settings) {
    settings = new SiteSettingsModel({});
  }

  if (typeof body.supportPhone === 'string') settings.supportPhone = body.supportPhone.trim();
  if (typeof body.whatsappNumber === 'string') settings.whatsappNumber = body.whatsappNumber.trim();
  if (typeof body.supportEmail === 'string') settings.supportEmail = body.supportEmail.trim();
  if (typeof body.shopAddress === 'string') settings.shopAddress = body.shopAddress.trim();

  // Pricing & Logistics
  if (body.shippingPrice !== undefined) settings.shippingPrice = Number(body.shippingPrice);
  if (body.freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(body.freeShippingThreshold);
  if (body.taxRate !== undefined) settings.taxRate = Number(body.taxRate);

  // Loyalty
  if (body.birthdayBonusPoints !== undefined) settings.birthdayBonusPoints = Number(body.birthdayBonusPoints);

  await settings.save();
  return NextResponse.json({ message: 'Settings updated', settings });
}) as any;
