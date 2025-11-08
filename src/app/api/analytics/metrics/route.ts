import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import {
  calculateAnalyticsMetrics,
  calculateMemberLifetimeValue
} from '@/lib/analytics';
import type { DateRange } from '@/types';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const dateRangeParam = searchParams.get('dateRange') as DateRange || '30d';

    console.log(`[Metrics Analytics] Request received - companyId: ${companyId}, dateRange: ${dateRangeParam}`);

    // Validation
    if (!companyId) {
      console.warn('[Metrics Analytics] Missing companyId parameter');
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Fetch members and purchases data in parallel
    console.log(`[Metrics Analytics] Fetching data for company: ${companyId}`);
    const [members, purchases] = await Promise.all([
      db.members.getAll(companyId),
      db.purchases.getAll(companyId),
    ]);
    console.log(`[Metrics Analytics] Retrieved ${members.length} members and ${purchases.length} purchases`);

    // Calculate analytics metrics
    const metrics = calculateAnalyticsMetrics(members, purchases);
    console.log(`[Metrics Analytics] Basic metrics calculated - Total Members: ${metrics.totalMembers}, Total Revenue: $${metrics.totalRevenue.toFixed(2)}`);

    // Calculate LTV statistics
    const ltvStats = calculateMemberLifetimeValue(members);
    console.log(`[Metrics Analytics] LTV Stats - Avg: $${ltvStats.average.toFixed(2)}, Median: $${ltvStats.median.toFixed(2)}, Max: $${ltvStats.max.toFixed(2)}`);

    const response = {
      success: true,
      data: {
        ...metrics,
        ltvStats,
      },
    };

    const duration = Date.now() - startTime;
    console.log(`[Metrics Analytics] Request completed in ${duration}ms`);

    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Metrics Analytics] Error after ${duration}ms:`, error);
    console.error('[Metrics Analytics] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
