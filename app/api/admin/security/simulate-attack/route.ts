import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { systemLogger, LogModule } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession();
    
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || '192.168.1.104';

    // Log a critical security event to make the metrics light up
    await systemLogger.critical({
      module: LogModule.SECURITY,
      message: 'Simulated Brute Force Attack Detected (Admin triggered)',
      ipAddress: clientIP,
      meta: {
        attackType: 'Brute Force',
        target: '/api/auth/login',
        attempts: 145,
        simulated: true
      }
    });

    return NextResponse.json({ success: true, message: 'Simulation triggered' });
  } catch (error: any) {
    console.error('Error in security simulation:', error);
    if (error instanceof Response) return error;
    
    return NextResponse.json(
      { error: 'Failed to simulate attack' },
      { status: 500 }
    );
  }
}
