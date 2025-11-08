import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { calculateEngagementOverTime } from '@/lib/analytics';
import { getDateRange } from '@/lib/utils';
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

    // Get date range
    const dateRange = getDateRange(dateRangeParam);

    // Fetch engagement data
    const engagement = await db.engagement.getAll(companyId);

    // Calculate engagement over time
    const engagementData = calculateEngagementOverTime(engagement, dateRange);

    return NextResponse.json({
      success: true,
      data: engagementData,
    });
  } catch (error) {
    console.error('Engagement analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagement analytics' },
      { status: 500 }
    );
  }
}
