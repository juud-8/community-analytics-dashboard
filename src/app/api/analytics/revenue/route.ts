import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import {
  calculateRevenueOverTime,
  calculateRevenueBreakdown,
  calculateTopProducts
} from '@/lib/analytics';
import { getDateRange } from '@/lib/utils';
import type { DateRange } from '@/types';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const dateRangeParam = searchParams.get('dateRange') as DateRange || '30d';

    console.log(`[Revenue Analytics] Request received - companyId: ${companyId}, dateRange: ${dateRangeParam}`);

    // Validation
    if (!companyId) {
      console.warn('[Revenue Analytics] Missing companyId parameter');
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Get date range
    const dateRange = getDateRange(dateRangeParam);
    console.log(`[Revenue Analytics] Date range: ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`);

    // Fetch purchases data
    console.log(`[Revenue Analytics] Fetching purchases for company: ${companyId}`);
    const purchases = await db.purchases.getAll(companyId);
    console.log(`[Revenue Analytics] Retrieved ${purchases.length} purchases`);

    // Filter purchases by date range
    const filteredPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.purchased_at);
      return purchaseDate >= dateRange.startDate && purchaseDate <= dateRange.endDate;
    });
    console.log(`[Revenue Analytics] Filtered to ${filteredPurchases.length} purchases in date range`);

    // Calculate revenue over time
    const revenueOverTime = calculateRevenueOverTime(purchases, dateRange);
    console.log(`[Revenue Analytics] Calculated revenue over time for ${revenueOverTime.length} days`);

    // Calculate revenue breakdown
    const breakdown = calculateRevenueBreakdown(filteredPurchases);
    console.log(`[Revenue Analytics] Revenue breakdown - Products: ${breakdown.byProduct.length}, Total: $${breakdown.totalRevenue.toFixed(2)}`);

    // Get top products
    const topProducts = calculateTopProducts(filteredPurchases, 5);
    console.log(`[Revenue Analytics] Top ${topProducts.length} products identified`);

    const response = {
      success: true,
      data: {
        byProduct: breakdown.byProduct,
        topProducts,
        totalRevenue: breakdown.totalRevenue,
        avgOrderValue: breakdown.avgOrderValue,
        revenueOverTime,
        purchaseCount: filteredPurchases.length,
      },
    };

    const duration = Date.now() - startTime;
    console.log(`[Revenue Analytics] Request completed in ${duration}ms`);

    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Revenue Analytics] Error after ${duration}ms:`, error);
    console.error('[Revenue Analytics] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch revenue analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
