'use client';

import { useState, useEffect } from 'react';
import { MetricsCard } from './MetricsCard';
import { MemberGrowthChart } from './MemberGrowthChart';
import { RevenueChart } from './RevenueChart';
import { EngagementChart } from './EngagementChart';
import { ExportButton } from './ExportButton';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import type {
  AnalyticsMetrics,
  MemberGrowthData,
  RevenueData,
  EngagementData,
  DateRange,
} from '@/types';

interface DashboardProps {
  companyId: string;
  initialDateRange?: DateRange;
}

export function Dashboard({ companyId, initialDateRange = '30d' }: DashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowthData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [companyId, dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Fetch all analytics data in parallel
      const [metricsRes, growthRes, revenueRes, engagementRes] = await Promise.all([
        fetch(`/api/analytics/metrics?companyId=${companyId}&dateRange=${dateRange}`),
        fetch(`/api/analytics/members?companyId=${companyId}&dateRange=${dateRange}`),
        fetch(`/api/analytics/revenue?companyId=${companyId}&dateRange=${dateRange}`),
        fetch(`/api/analytics/engagement?companyId=${companyId}&dateRange=${dateRange}`),
      ]);

      const [metricsData, growthData, revenueDataRes, engagementDataRes] = await Promise.all([
        metricsRes.json(),
        growthRes.json(),
        revenueRes.json(),
        engagementRes.json(),
      ]);

      if (metricsData.success) setMetrics(metricsData.data);
      if (growthData.success) setMemberGrowth(growthData.data);
      if (revenueDataRes.success) setRevenueData(revenueDataRes.data);
      if (engagementDataRes.success) setEngagementData(engagementDataRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your community performance and growth
          </p>
        </div>
        <ExportButton companyId={companyId} type="all" label="Export All Data" />
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', '1y', 'all'] as DateRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {range === '7d' && 'Last 7 Days'}
            {range === '30d' && 'Last 30 Days'}
            {range === '90d' && 'Last 90 Days'}
            {range === '1y' && 'Last Year'}
            {range === 'all' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Members"
            value={formatNumber(metrics.totalMembers)}
            description="from all time"
            change={metrics.growthRate}
            icon={<Users className="h-4 w-4" />}
          />
          <MetricsCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            description="all time revenue"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricsCard
            title="Active Members"
            value={formatNumber(metrics.activeMembers)}
            description={`${formatPercentage((metrics.activeMembers / metrics.totalMembers) * 100)} of total`}
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricsCard
            title="Churn Rate"
            value={formatPercentage(metrics.churnRate)}
            description={`${metrics.churnedMembers} churned`}
            change={-metrics.churnRate}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <MemberGrowthChart data={memberGrowth} />
        <RevenueChart data={revenueData} />
      </div>

      <div className="grid gap-4">
        <EngagementChart data={engagementData} />
      </div>

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricsCard
            title="MRR"
            value={formatCurrency(metrics.monthlyRecurringRevenue)}
            description="Monthly Recurring Revenue"
          />
          <MetricsCard
            title="Average LTV"
            value={formatCurrency(metrics.averageLifetimeValue)}
            description="Lifetime Value per Member"
          />
          <MetricsCard
            title="Growth Rate"
            value={formatPercentage(metrics.growthRate)}
            description="Month over month"
            change={metrics.growthRate}
          />
        </div>
      )}
    </div>
  );
}
