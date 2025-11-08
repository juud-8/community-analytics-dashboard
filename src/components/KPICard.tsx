'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: number[]; // Sparkline data
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

const colorSchemes = {
  blue: {
    gradient: 'from-blue-500/20 to-blue-600/20',
    text: 'text-blue-600 dark:text-blue-400',
    line: '#3b82f6',
    icon: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  green: {
    gradient: 'from-green-500/20 to-emerald-600/20',
    text: 'text-green-600 dark:text-green-400',
    line: '#10b981',
    icon: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
  },
  purple: {
    gradient: 'from-purple-500/20 to-violet-600/20',
    text: 'text-purple-600 dark:text-purple-400',
    line: '#a855f7',
    icon: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  },
  orange: {
    gradient: 'from-orange-500/20 to-amber-600/20',
    text: 'text-orange-600 dark:text-orange-400',
    line: '#f97316',
    icon: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  },
  red: {
    gradient: 'from-red-500/20 to-rose-600/20',
    text: 'text-red-600 dark:text-red-400',
    line: '#ef4444',
    icon: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  },
};

export function KPICard({
  title,
  value,
  description,
  change,
  changeLabel = 'vs last period',
  icon,
  trend,
  color = 'blue',
  tooltip,
  onClick,
  className,
}: KPICardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;
  const scheme = colorSchemes[color];

  // Format trend data for recharts
  const trendData = trend?.map((value, index) => ({ value, index })) || [];

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:scale-[1.02]',
        'glass border-slate-200/50 dark:border-slate-800/50',
        onClick && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Gradient background */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br',
          scheme.gradient,
          isHovered && 'opacity-100'
        )}
      />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {title}
          </CardTitle>
          {tooltip && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {icon && (
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', scheme.icon)}>
            {icon}
          </div>
        )}
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            {/* Main value */}
            <div className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
              {value}
            </div>

            {/* Change indicator */}
            {change !== undefined && (
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'flex items-center text-sm font-semibold px-2 py-0.5 rounded-full',
                    isPositive && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    isNegative && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {isPositive ? (
                    <ArrowUpIcon className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3.5 w-3.5 mr-1" />
                  )}
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {changeLabel}
                </span>
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {/* Sparkline chart */}
          {trend && trend.length > 0 && (
            <div className="w-24 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={scheme.line}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
