import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { calculateMemberGrowth, calculateChurnRate } from '@/lib/analytics';
import { getDateRange } from '@/lib/utils';
import type { DateRange } from '@/types';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const dateRangeParam = searchParams.get('dateRange') as DateRange || '30d';

    console.log(`[Members Analytics] Request received - companyId: ${companyId}, dateRange: ${dateRangeParam}`);

    // Validation
    if (!companyId) {
      console.warn('[Members Analytics] Missing companyId parameter');
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get date range
    const dateRange = getDateRange(dateRangeParam);
    console.log(`[Members Analytics] Date range: ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`);

    // Fetch members data
    console.log(`[Members Analytics] Fetching members for company: ${companyId}`);
    const members = await db.members.getAll(companyId);
    console.log(`[Members Analytics] Retrieved ${members.length} members`);

    // Calculate member growth
    const growth = calculateMemberGrowth(members, dateRange);
    console.log(`[Members Analytics] Calculated growth data for ${growth.length} days`);

    // Calculate churn
    const churnData = calculateChurnRate(members, dateRange);
    console.log(`[Members Analytics] Churn rate: ${churnData.churnRate.toFixed(2)}%`);

    // Calculate summary stats
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const churnedMembers = members.filter(m => m.status === 'churned').length;

    const response = {
      success: true,
      data: {
        growth,
        churn: churnData.trend,
        totalMembers,
        activeMembers,
        churnedMembers,
        churnRate: churnData.churnRate,
      },
    };

    const duration = Date.now() - startTime;
    console.log(`[Members Analytics] Request completed in ${duration}ms`);

    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Members Analytics] Error after ${duration}ms:`, error);
    console.error('[Members Analytics] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch member analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
