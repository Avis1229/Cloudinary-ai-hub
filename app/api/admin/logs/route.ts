import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SystemLogModel from '@/lib/models/SystemLogModel';
import { requireAdminSession } from '@/lib/requireAdminSession';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();
    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const level = url.searchParams.get('level');
    const module = url.searchParams.get('module');

    const query: any = {};
    if (level && level !== 'All') {
      query.level = level;
    }
    if (module && module !== 'All') {
      query.module = module;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      SystemLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .lean(),
      SystemLogModel.countDocuments(query)
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching system logs:', error);
    if (error instanceof Response) return error;
    
    return NextResponse.json(
      { error: 'Failed to fetch system logs' },
      { status: 500 }
    );
  }
}
