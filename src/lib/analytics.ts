import { format, parseISO, eachDayOfInterval, eachMonthOfInterval, startOfMonth } from 'date-fns';
import type {
  Member,
  Purchase,
  MemberEngagement,
  RevenueTracking,
  AnalyticsMetrics,
  MemberGrowthData,
  RevenueData,
  EngagementData,
  ProductPerformance,
  ChurnAnalysis,
  DateRangeFilter,
} from '@/types';
import { groupBy, sum, average, safeParseFloat } from './utils';

/**
 * Calculate overall analytics metrics
 */
export function calculateAnalyticsMetrics(
  members: Member[],
  purchases: Purchase[]
): AnalyticsMetrics {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const churnedMembers = members.filter(m => m.status === 'churned').length;

  const totalRevenue = purchases.reduce(
    (sum, p) => sum + safeParseFloat(p.amount),
    0
  );

  const averageLifetimeValue = totalMembers > 0
    ? members.reduce((sum, m) => sum + safeParseFloat(m.lifetime_value), 0) / totalMembers
    : 0;

  // Calculate MRR (last 30 days revenue)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentPurchases = purchases.filter(
    p => new Date(p.purchased_at) >= thirtyDaysAgo
  );
  const monthlyRecurringRevenue = recentPurchases.reduce(
    (sum, p) => sum + safeParseFloat(p.amount),
    0
  );

  const churnRate = totalMembers > 0 ? (churnedMembers / totalMembers) * 100 : 0;

  // Calculate growth rate (comparing last 30 days to previous 30 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const lastMonthMembers = members.filter(
    m => new Date(m.joined_at) >= thirtyDaysAgo
  ).length;

  const previousMonthMembers = members.filter(
    m => new Date(m.joined_at) >= sixtyDaysAgo && new Date(m.joined_at) < thirtyDaysAgo
  ).length;

  const growthRate = previousMonthMembers > 0
    ? ((lastMonthMembers - previousMonthMembers) / previousMonthMembers) * 100
    : lastMonthMembers > 0 ? 100 : 0;

  return {
    totalMembers,
    activeMembers,
    churnedMembers,
    totalRevenue,
    averageLifetimeValue,
    monthlyRecurringRevenue,
    churnRate,
    growthRate,
  };
}

/**
 * Calculate member growth over time
 */
export function calculateMemberGrowth(
  members: Member[],
  dateRange: DateRangeFilter
): MemberGrowthData[] {
  const days = eachDayOfInterval({
    start: dateRange.startDate,
    end: dateRange.endDate,
  });

  return days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const membersUpToDay = members.filter(
      m => new Date(m.joined_at) <= day
    );

    const newMembers = members.filter(
      m => format(new Date(m.joined_at), 'yyyy-MM-dd') === dayStr
    ).length;

    const activeMembers = membersUpToDay.filter(m => m.status === 'active').length;
    const churnedMembers = membersUpToDay.filter(m => m.status === 'churned').length;

    return {
      date: dayStr,
      newMembers,
      totalMembers: membersUpToDay.length,
      activeMembers,
      churnedMembers,
    };
  });
}

/**
 * Calculate revenue over time
 */
export function calculateRevenueOverTime(
  purchases: Purchase[],
  dateRange: DateRangeFilter
): RevenueData[] {
  const days = eachDayOfInterval({
    start: dateRange.startDate,
    end: dateRange.endDate,
  });

  return days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayPurchases = purchases.filter(
      p => format(new Date(p.purchased_at), 'yyyy-MM-dd') === dayStr
    );

    const revenue = dayPurchases.reduce(
      (sum, p) => sum + safeParseFloat(p.amount),
      0
    );

    const uniqueMembers = new Set(dayPurchases.map(p => p.member_id)).size;
    const averageRevenuePerUser = uniqueMembers > 0 ? revenue / uniqueMembers : 0;

    return {
      date: dayStr,
      revenue,
      memberCount: uniqueMembers,
      averageRevenuePerUser,
    };
  });
}

/**
 * Calculate engagement over time
 */
export function calculateEngagementOverTime(
  engagement: MemberEngagement[],
  dateRange: DateRangeFilter
): EngagementData[] {
  const days = eachDayOfInterval({
    start: dateRange.startDate,
    end: dateRange.endDate,
  });

  return days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayEngagement = engagement.filter(e => e.date === dayStr);

    const totalMessages = dayEngagement.reduce(
      (sum, e) => sum + e.messages_sent + e.messages_received,
      0
    );

    const totalInteractions = dayEngagement.reduce(
      (sum, e) => sum + e.interactions,
      0
    );

    const activeUsers = dayEngagement.length;
    const averageEngagementPerUser = activeUsers > 0
      ? (totalMessages + totalInteractions) / activeUsers
      : 0;

    return {
      date: dayStr,
      totalMessages,
      totalInteractions,
      activeUsers,
      averageEngagementPerUser,
    };
  });
}

/**
 * Calculate product performance
 */
export function calculateProductPerformance(purchases: Purchase[]): ProductPerformance[] {
  const groupedByProduct = groupBy(purchases, 'product_id');

  return Object.entries(groupedByProduct).map(([productId, productPurchases]) => {
    const totalRevenue = productPurchases.reduce(
      (sum, p) => sum + safeParseFloat(p.amount),
      0
    );

    const uniqueCustomers = new Set(productPurchases.map(p => p.member_id)).size;
    const averageOrderValue = productPurchases.length > 0
      ? totalRevenue / productPurchases.length
      : 0;

    return {
      product_id: productId,
      product_name: productPurchases[0].product_name,
      totalRevenue,
      totalPurchases: productPurchases.length,
      uniqueCustomers,
      averageOrderValue,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Calculate churn analysis by month
 */
export function calculateChurnAnalysis(
  members: Member[],
  dateRange: DateRangeFilter
): ChurnAnalysis[] {
  const months = eachMonthOfInterval({
    start: dateRange.startDate,
    end: dateRange.endDate,
  });

  return months.map(month => {
    const monthStr = format(month, 'MMM yyyy');
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const membersAtStart = members.filter(
      m => new Date(m.joined_at) <= monthStart
    );

    const churnedInMonth = membersAtStart.filter(
      m => m.status === 'churned' &&
           m.updated_at &&
           new Date(m.updated_at) >= monthStart &&
           new Date(m.updated_at) <= monthEnd
    );

    const totalMembers = membersAtStart.length;
    const churnedMembers = churnedInMonth.length;
    const churnRate = totalMembers > 0 ? (churnedMembers / totalMembers) * 100 : 0;
    const retentionRate = 100 - churnRate;

    return {
      period: monthStr,
      totalMembers,
      churnedMembers,
      churnRate,
      retentionRate,
    };
  });
}

/**
 * Calculate cohort retention
 */
export function calculateCohortRetention(members: Member[]): any[] {
  const cohorts = groupBy(
    members,
    (m) => format(new Date(m.joined_at), 'yyyy-MM') as any
  );

  return Object.entries(cohorts).map(([cohortMonth, cohortMembers]) => {
    const totalMembers = cohortMembers.length;
    const activeMembers = cohortMembers.filter(m => m.status === 'active').length;
    const retentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

    return {
      cohort: cohortMonth,
      totalMembers,
      activeMembers,
      retentionRate,
    };
  }).sort((a, b) => a.cohort.localeCompare(b.cohort));
}

/**
 * Calculate lifetime value by cohort
 */
export function calculateLTVByCohort(members: Member[], purchases: Purchase[]): any[] {
  const cohorts = groupBy(
    members,
    (m) => format(new Date(m.joined_at), 'yyyy-MM') as any
  );

  return Object.entries(cohorts).map(([cohortMonth, cohortMembers]) => {
    const memberIds = new Set(cohortMembers.map(m => m.id));
    const cohortPurchases = purchases.filter(p => memberIds.has(p.member_id));

    const totalRevenue = cohortPurchases.reduce(
      (sum, p) => sum + safeParseFloat(p.amount),
      0
    );

    const averageLTV = cohortMembers.length > 0
      ? totalRevenue / cohortMembers.length
      : 0;

    return {
      cohort: cohortMonth,
      memberCount: cohortMembers.length,
      totalRevenue,
      averageLTV,
    };
  }).sort((a, b) => a.cohort.localeCompare(b.cohort));
}

/**
 * Get top performing products
 */
export function getTopProducts(purchases: Purchase[], limit: number = 5): ProductPerformance[] {
  return calculateProductPerformance(purchases).slice(0, limit);
}

/**
 * Calculate average order value
 */
export function calculateAverageOrderValue(purchases: Purchase[]): number {
  if (purchases.length === 0) return 0;
  const totalRevenue = purchases.reduce(
    (sum, p) => sum + safeParseFloat(p.amount),
    0
  );
  return totalRevenue / purchases.length;
}

/**
 * Calculate customer acquisition cost (placeholder - needs marketing spend data)
 */
export function calculateCAC(totalMarketingSpend: number, newCustomers: number): number {
  if (newCustomers === 0) return 0;
  return totalMarketingSpend / newCustomers;
}

/**
 * Calculate LTV:CAC ratio
 */
export function calculateLTVCACRatio(averageLTV: number, cac: number): number {
  if (cac === 0) return 0;
  return averageLTV / cac;
}

/**
 * Calculate churn rate with trends
 */
export function calculateChurnRate(
  members: Member[],
  dateRange: DateRangeFilter
): { churnRate: number; trend: ChurnAnalysis[]; churnedCount: number } {
  const totalMembers = members.length;
  const churnedMembers = members.filter(m => m.status === 'churned').length;
  const churnRate = totalMembers > 0 ? (churnedMembers / totalMembers) * 100 : 0;

  const trend = calculateChurnAnalysis(members, dateRange);

  return {
    churnRate,
    trend,
    churnedCount: churnedMembers,
  };
}

/**
 * Calculate revenue breakdown by product
 */
export function calculateRevenueBreakdown(purchases: Purchase[]): {
  byProduct: ProductPerformance[];
  totalRevenue: number;
  avgOrderValue: number;
} {
  const byProduct = calculateProductPerformance(purchases);
  const totalRevenue = purchases.reduce(
    (sum, p) => sum + safeParseFloat(p.amount),
    0
  );
  const avgOrderValue = calculateAverageOrderValue(purchases);

  return {
    byProduct,
    totalRevenue,
    avgOrderValue,
  };
}

/**
 * Calculate top products by revenue
 */
export function calculateTopProducts(
  purchases: Purchase[],
  limit: number = 5
): ProductPerformance[] {
  return getTopProducts(purchases, limit);
}

/**
 * Calculate member lifetime value statistics
 */
export function calculateMemberLifetimeValue(members: Member[]): {
  average: number;
  median: number;
  max: number;
  min: number;
} {
  if (members.length === 0) {
    return { average: 0, median: 0, max: 0, min: 0 };
  }

  const ltvValues = members
    .map(m => safeParseFloat(m.lifetime_value))
    .sort((a, b) => a - b);

  const average = ltvValues.reduce((sum, val) => sum + val, 0) / ltvValues.length;
  const median = ltvValues.length % 2 === 0
    ? (ltvValues[ltvValues.length / 2 - 1] + ltvValues[ltvValues.length / 2]) / 2
    : ltvValues[Math.floor(ltvValues.length / 2)];
  const max = ltvValues[ltvValues.length - 1];
  const min = ltvValues[0];

  return { average, median, max, min };
}

/**
 * Calculate engagement metrics summary
 */
export function calculateEngagementMetrics(
  engagement: MemberEngagement[],
  dateRange: DateRangeFilter
): {
  engagementScore: number;
  trend: 'up' | 'down' | 'flat';
  totalMessages: number;
  totalInteractions: number;
  activeUsers: number;
  heatmapData: EngagementData[];
} {
  const heatmapData = calculateEngagementOverTime(engagement, dateRange);

  const totalMessages = engagement.reduce(
    (sum, e) => sum + e.messages_sent + e.messages_received,
    0
  );
  const totalInteractions = engagement.reduce(
    (sum, e) => sum + e.interactions,
    0
  );
  const activeUsers = new Set(engagement.map(e => e.member_id)).size;

  // Calculate engagement score (0-100)
  const avgMessagesPerUser = activeUsers > 0 ? totalMessages / activeUsers : 0;
  const avgInteractionsPerUser = activeUsers > 0 ? totalInteractions / activeUsers : 0;
  const engagementScore = Math.min(
    100,
    ((avgMessagesPerUser + avgInteractionsPerUser) / 20) * 100
  );

  // Calculate trend by comparing first half to second half
  const midpoint = Math.floor(heatmapData.length / 2);
  const firstHalf = heatmapData.slice(0, midpoint);
  const secondHalf = heatmapData.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce(
    (sum, d) => sum + d.totalMessages + d.totalInteractions,
    0
  ) / (firstHalf.length || 1);

  const secondHalfAvg = secondHalf.reduce(
    (sum, d) => sum + d.totalMessages + d.totalInteractions,
    0
  ) / (secondHalf.length || 1);

  let trend: 'up' | 'down' | 'flat' = 'flat';
  const difference = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  if (difference > 5) trend = 'up';
  else if (difference < -5) trend = 'down';

  return {
    engagementScore: Math.round(engagementScore),
    trend,
    totalMessages,
    totalInteractions,
    activeUsers,
    heatmapData,
  };
}
