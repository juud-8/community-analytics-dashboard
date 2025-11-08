'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon, Inbox, TrendingUp, Users, DollarSign } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'no-data' | 'error';
  className?: string;
}

export function EmptyState({
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        'border-2 border-dashed border-slate-200 dark:border-slate-800',
        'bg-slate-50/50 dark:bg-slate-900/50',
        className
      )}
    >
      {/* Animated icon container */}
      <div className="relative mb-6">
        {/* Background decoration circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-primary/5 rounded-full animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full animate-pulse animation-delay-300" />
        </div>

        {/* Main icon */}
        <div className="relative z-10 w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center animate-float">
          <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      {/* Action button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}

      {/* Decorative elements */}
      {variant === 'no-data' && (
        <div className="mt-8 flex items-center gap-6 opacity-20">
          <TrendingUp className="w-6 h-6 text-slate-400" />
          <Users className="w-6 h-6 text-slate-400" />
          <DollarSign className="w-6 h-6 text-slate-400" />
        </div>
      )}
    </Card>
  );
}

// Skeleton loader for cards
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-10 w-10 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-3 w-48 rounded" />
      </div>
    </Card>
  );
}

// Skeleton loader for charts
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <Card className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-8 w-24 rounded" />
      </div>
      <div className="skeleton h-64 w-full rounded-lg" />
      <div className="flex gap-4 justify-center">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </Card>
  );
}

// Loading state for the entire dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-4 w-96 rounded" />
        </div>
        <div className="skeleton h-10 w-32 rounded" />
      </div>

      {/* Date range selector skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-10 w-24 rounded" />
        ))}
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className={`animate-slide-up stagger-${i}`} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonChart className="animate-slide-up stagger-5" />
        <SkeletonChart className="animate-slide-up stagger-6" />
      </div>
    </div>
  );
}
