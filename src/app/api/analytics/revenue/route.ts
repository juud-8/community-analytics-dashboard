import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { calculateRevenueOverTime } from '@/lib/analytics';
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

    // Fetch purchases data
    const purchases = await db.purchases.getAll(companyId);

    // Calculate revenue over time
    const revenueData = calculateRevenueOverTime(purchases, dateRange);

    return NextResponse.json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}
