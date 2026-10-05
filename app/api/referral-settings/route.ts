import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ReferralSettingsModel from '@/lib/models/ReferralSettingsModel';

export const dynamic = 'force-dynamic';

// Public endpoint: returns non-sensitive referral program settings
export async function GET() {
  try {
    await dbConnect();
    const settings = await ReferralSettingsModel.findOne({}).lean() as any;

    if (!settings || !settings.enabled) {
      return NextResponse.json({
        enabled: false,
        rewardType: 'fixed',
        rewardValue: 500,
        minOrderValue: 1000,
      });
    }

    return NextResponse.json({
      enabled: settings.enabled,
      rewardType: settings.rewardType,
      rewardValue: settings.rewardValue,
      minOrderValue: settings.minOrderValue || 0,
      maxReward: settings.maxReward,
      referralLimit: settings.referralLimit,
    });
  } catch (error) {
    console.error('Error fetching referral settings:', error);
    return NextResponse.json({
      enabled: true,
      rewardType: 'fixed',
      rewardValue: 500,
      minOrderValue: 1000,
    });
  }
}
