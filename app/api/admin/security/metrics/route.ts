import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SystemLogModel, { LogLevel, LogModule } from '@/lib/models/SystemLogModel';
import UserModel from '@/lib/models/UserModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();
    await dbConnect();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Threat Detection (Warnings & Criticals in last 24h)
    const activeThreats = await SystemLogModel.countDocuments({
      level: { $in: [LogLevel.WARN, LogLevel.CRITICAL] },
      createdAt: { $gte: twentyFourHoursAgo }
    });

    // 2. Auth Events in last 24h (Registrations, Failed Logins if tracked)
    const recentAuthEvents = await SystemLogModel.countDocuments({
      module: LogModule.AUTH,
      createdAt: { $gte: twentyFourHoursAgo }
    });

    // 3. Admin Accounts Audit
    const adminUsers = await UserModel.find({ isAdmin: true })
      .select('name email lastPasswordChange securityScore createdAt')
      .lean();

    // 4. Recent Security Alerts (Last 10)
    const securityAlerts = await SystemLogModel.find({
      $or: [
        { module: LogModule.SECURITY },
        { level: { $in: [LogLevel.WARN, LogLevel.CRITICAL] } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .lean();

    // 5. Total system logs count
    const totalLogs = await SystemLogModel.countDocuments();

    return NextResponse.json({
      activeThreats,
      recentAuthEvents,
      adminUsers,
      securityAlerts,
      totalLogs,
      systemHealth: activeThreats > 10 ? 'Warning' : activeThreats > 0 ? 'Elevated' : 'Optimal'
    });

  } catch (error: any) {
    console.error('Error fetching security metrics:', error);
    if (error instanceof Response) return error;
    
    return NextResponse.json(
      { error: 'Failed to fetch security metrics' },
      { status: 500 }
    );
  }
}
