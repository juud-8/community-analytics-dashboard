'use client';

import { useState, useEffect } from 'react';
import { Header } from './Header';
import { KPICard } from './KPICard';
import { DateRangeSelector } from './DateRangeSelector';
import { EmptyState, DashboardSkeleton } from './EmptyState';
import { MemberGrowthChart } from './MemberGrowthChart';
import { RevenueChart } from './RevenueChart';
import { RevenueByProductChart } from './RevenueByProductChart';
import { EngagementHeatmap } from './EngagementHeatmap';
import { ExportButton } from './ExportButton';
import { Users, DollarSign, TrendingUp, Activity, RefreshCw, AlertCircle, Target, Zap } from 'lucide-react';
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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate sparkline data from member growth
  const memberTrend = memberGrowth.slice(-7).map(d => d.totalMembers);
  const revenueTrend = revenueData.slice(-7).map(d => d.revenue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated gradient background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10 pointer-events-none" />

      {/* Noise texture for depth */}
      <div className="fixed inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
      />

      {/* Content */}
      <div className="relative">
        <Header companyName="Community Analytics" lastUpdated={lastUpdated} />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <EmptyState
                title="Failed to Load Analytics"
                description={error}
                icon={AlertCircle}
                actionLabel="Retry"
                onAction={loadAnalytics}
                variant="error"
              />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Page Header with Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-down">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Analytics Overview
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Monitor your community performance and growth metrics
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadAnalytics}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="glass border-slate-200 dark:border-slate-800"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <ExportButton companyId={companyId} type="all" label="Export Data" />
                </div>
              </div>

              {/* Date Range Selector */}
              <div className="animate-slide-up stagger-1">
                <DateRangeSelector
                  value={dateRange}
                  onChange={(range) => setDateRange(range)}
                />
              </div>

              {/* Key Metrics Grid - Premium KPI Cards */}
              {metrics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <KPICard
                    title="Total Members"
                    value={formatNumber(metrics.totalMembers)}
                    description="from all time"
                    change={metrics.growthRate}
                    changeLabel="vs last period"
                    icon={<Users className="h-5 w-5" />}
                    trend={memberTrend}
                    color="blue"
                    tooltip="Total number of community members across all time"
                    className="animate-slide-up stagger-1"
                  />
                  <KPICard
                    title="Total Revenue"
                    value={formatCurrency(metrics.totalRevenue)}
                    description="all time revenue"
                    icon={<DollarSign className="h-5 w-5" />}
                    trend={revenueTrend}
                    color="green"
                    tooltip="Total revenue generated from all members"
                    className="animate-slide-up stagger-2"
                  />
                  <KPICard
                    title="Active Members"
                    value={formatNumber(metrics.activeMembers)}
                    description={`${formatPercentage((metrics.activeMembers / metrics.totalMembers) * 100)} of total`}
                    icon={<Activity className="h-5 w-5" />}
                    color="purple"
                    tooltip="Members who have been active in the last 30 days"
                    className="animate-slide-up stagger-3"
                  />
                  <KPICard
                    title="Churn Rate"
                    value={formatPercentage(metrics.churnRate)}
                    description={`${metrics.churnedMembers} churned`}
                    change={-metrics.churnRate}
                    changeLabel="vs last period"
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="orange"
                    tooltip="Percentage of members who left in the selected period"
                    className="animate-slide-up stagger-4"
                  />
                </div>
              )}

              {/* Charts Section */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="animate-slide-up stagger-5">
                  <MemberGrowthChart data={memberGrowth} />
                </div>
                <div className="animate-slide-up stagger-6">
                  <RevenueChart data={revenueData} />
                </div>
              </div>

              {/* Revenue by Product */}
              {productPerformance.length > 0 ? (
                <div className="animate-slide-up stagger-7">
                  <RevenueByProductChart data={productPerformance} />
                </div>
              ) : (
                <div className="animate-slide-up stagger-7">
                  <EmptyState
                    title="No Product Data"
                    description="Product performance data will appear here once available."
                    icon={Target}
                    variant="no-data"
                  />
                </div>
              )}

              {/* Engagement Heatmap */}
              {heatmapData.length > 0 ? (
                <div className="animate-slide-up stagger-8">
                  <EngagementHeatmap data={heatmapData} />
                </div>
              ) : (
                <div className="animate-slide-up stagger-8">
                  <EmptyState
                    title="No Engagement Data"
                    description="Engagement heatmap will appear here once members start interacting."
                    icon={Zap}
                    variant="no-data"
                  />
                </div>
              )}

              {/* Additional Metrics */}
              {metrics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <KPICard
                    title="MRR"
                    value={formatCurrency(metrics.monthlyRecurringRevenue)}
                    description="Monthly Recurring Revenue"
                    icon={<DollarSign className="h-5 w-5" />}
                    color="green"
                    tooltip="Predictable monthly revenue from subscriptions"
                    className="animate-slide-up stagger-9"
                  />
                  <KPICard
                    title="Average LTV"
                    value={formatCurrency(metrics.averageLifetimeValue)}
                    description="Lifetime Value per Member"
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="purple"
                    tooltip="Average total revenue expected from each member"
                    className="animate-slide-up stagger-10"
                  />
                  <KPICard
                    title="Growth Rate"
                    value={formatPercentage(metrics.growthRate)}
                    description="Month over month"
                    change={metrics.growthRate}
                    icon={<Activity className="h-5 w-5" />}
                    color="blue"
                    tooltip="Member growth rate compared to previous period"
                    className="animate-slide-up stagger-11"
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
