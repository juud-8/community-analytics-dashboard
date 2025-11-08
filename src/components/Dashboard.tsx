'use client';

import { useState, useEffect } from 'react';
import { MetricsCard } from './MetricsCard';
import { MemberGrowthChart } from './MemberGrowthChart';
import { RevenueChart } from './RevenueChart';
import { RevenueByProductChart } from './RevenueByProductChart';
import { EngagementHeatmap } from './EngagementHeatmap';
import { ExportButton } from './ExportButton';
import { Users, DollarSign, TrendingUp, Activity, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import type {
  AnalyticsMetrics,
  MemberGrowthData,
  RevenueData,
  ProductPerformance,
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
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [companyId, dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [metricsRes, growthRes, revenueRes, productsRes, heatmapRes] = await Promise.all([
        fetch(`/api/analytics/metrics?companyId=${companyId}&dateRange=${dateRange}`),
        fetch(`/api/analytics/members?companyId=${companyId}&dateRange=${dateRange}`),
        fetch(`/api/analytics/revenue?companyId=${companyId}&dateRange=${dateRange}`),
        fetch(`/api/analytics/products?companyId=${companyId}&dateRange=${dateRange}`),
        fetch(`/api/analytics/heatmap?companyId=${companyId}&dateRange=${dateRange}`),
      ]);

      // Check for HTTP errors
      if (!metricsRes.ok || !growthRes.ok || !revenueRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [metricsData, growthData, revenueDataRes, productsData, heatmapDataRes] = await Promise.all([
        metricsRes.json(),
        growthRes.json(),
        revenueRes.json(),
        productsRes.ok ? productsRes.json() : { success: true, data: [] },
        heatmapRes.ok ? heatmapRes.json() : { success: true, data: [] },
      ]);

      if (metricsData.success) setMetrics(metricsData.data);
      if (growthData.success) setMemberGrowth(growthData.data);
      if (revenueDataRes.success) setRevenueData(revenueDataRes.data);
      if (productsData.success) setProductPerformance(productsData.data);
      if (heatmapDataRes.success) setHeatmapData(heatmapDataRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your community performance and growth
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalytics} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ExportButton companyId={companyId} type="all" label="Export Data" />
        </div>
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

      {/* Revenue by Product */}
      {productPerformance.length > 0 && (
        <div className="grid gap-4">
          <RevenueByProductChart data={productPerformance} />
        </div>
      )}

      {/* Engagement Heatmap */}
      {heatmapData.length > 0 && (
        <div className="grid gap-4">
          <EngagementHeatmap data={heatmapData} />
        </div>
      )}

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
