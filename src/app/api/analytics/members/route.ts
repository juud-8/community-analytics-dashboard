import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { calculateMemberGrowth } from '@/lib/analytics';
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

    // Fetch members data
    const members = await db.members.getAll(companyId);

    // Calculate member growth
    const memberGrowthData = calculateMemberGrowth(members, dateRange);

    return NextResponse.json({
      success: true,
      data: memberGrowthData,
    });
  } catch (error) {
    console.error('Members analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member analytics' },
      { status: 500 }
    );
  }
}
