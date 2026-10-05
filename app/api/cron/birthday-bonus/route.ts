import { NextRequest, NextResponse } from 'next/server';
import { awardBirthdayBonuses } from '@/lib/services/birthdayBonus';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/birthday-bonus
 * Triggers birthday bonus point awards for all eligible users.
 * Can be called by:
 *   - An admin from the admin panel (authenticated via session)
 *   - A cron job using the CRON_SECRET header
 */
export async function POST(req: NextRequest) {
  try {
    // Allow access via cron secret OR admin session
    const cronSecret = req.headers.get('x-cron-secret');
    if (cronSecret && cronSecret === process.env.CRON_SECRET) {
      // Authenticated via cron secret
    } else {
      // Fall back to admin session check
      await requireAdminSession();
    }

    const result = await awardBirthdayBonuses();
    return NextResponse.json({
      success: true,
      message: `Birthday bonuses processed. Awarded: ${result.awarded}, Skipped: ${result.skipped}`,
      ...result,
    });
  } catch (err: any) {
    console.error('Birthday bonus cron error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
