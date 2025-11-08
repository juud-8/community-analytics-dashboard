import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { calculateAnalyticsMetrics } from '@/lib/analytics';
import type { DateRange } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const dateRangeParam = searchParams.get('dateRange') as DateRange || '30d';

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Fetch members and purchases data
    const [members, purchases] = await Promise.all([
      db.members.getAll(companyId),
      db.purchases.getAll(companyId),
    ]);

    // Calculate analytics metrics
    const metrics = calculateAnalyticsMetrics(members, purchases);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Metrics analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics metrics' },
      { status: 500 }
    );
  }
}
