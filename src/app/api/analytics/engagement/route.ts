import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { calculateEngagementMetrics } from '@/lib/analytics';
import { getDateRange } from '@/lib/utils';
import type { DateRange } from '@/types';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const dateRangeParam = searchParams.get('dateRange') as DateRange || '30d';

    console.log(`[Engagement Analytics] Request received - companyId: ${companyId}, dateRange: ${dateRangeParam}`);

    // Validation
    if (!companyId) {
      console.warn('[Engagement Analytics] Missing companyId parameter');
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get date range
    const dateRange = getDateRange(dateRangeParam);
    console.log(`[Engagement Analytics] Date range: ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`);

    // Fetch engagement data
    console.log(`[Engagement Analytics] Fetching engagement for company: ${companyId}`);
    const engagement = await db.engagement.getAll(companyId);
    console.log(`[Engagement Analytics] Retrieved ${engagement.length} engagement records`);

    // Filter engagement by date range
    const filteredEngagement = engagement.filter(e => {
      const engagementDate = new Date(e.date);
      return engagementDate >= dateRange.startDate && engagementDate <= dateRange.endDate;
    });
    console.log(`[Engagement Analytics] Filtered to ${filteredEngagement.length} records in date range`);

    // Handle empty data gracefully
    if (filteredEngagement.length === 0) {
      console.log('[Engagement Analytics] No engagement data found for the specified period');
      return NextResponse.json({
        success: true,
        data: {
          heatmapData: [],
          engagementScore: 0,
          trend: 'flat' as const,
          totalMessages: 0,
          totalInteractions: 0,
          activeUsers: 0,
        },
      });
    }

    // Calculate engagement metrics
    const metrics = calculateEngagementMetrics(filteredEngagement, dateRange);
    console.log(`[Engagement Analytics] Engagement score: ${metrics.engagementScore}, Trend: ${metrics.trend}`);
    console.log(`[Engagement Analytics] Active users: ${metrics.activeUsers}, Messages: ${metrics.totalMessages}, Interactions: ${metrics.totalInteractions}`);

    const response = {
      success: true,
      data: {
        heatmapData: metrics.heatmapData,
        engagementScore: metrics.engagementScore,
        trend: metrics.trend,
        totalMessages: metrics.totalMessages,
        totalInteractions: metrics.totalInteractions,
        activeUsers: metrics.activeUsers,
      },
    };

    const duration = Date.now() - startTime;
    console.log(`[Engagement Analytics] Request completed in ${duration}ms`);

    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Engagement Analytics] Error after ${duration}ms:`, error);
    console.error('[Engagement Analytics] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch engagement analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
