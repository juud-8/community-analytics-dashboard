'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, ComposedChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { RevenueData } from '@/types';

interface RevenueChartProps {
  data: RevenueData[];
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-xl">
      <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-slate-600 dark:text-slate-400">Revenue:</span>
        <span className="font-semibold text-slate-900 dark:text-white">
          {formatCurrency(payload[0].value)}
        </span>
      </div>
    </div>
  );
};

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: formatDate(item.date, 'MMM d'),
  }));

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / data.length;

  const handleExport = () => {
    // Export chart as PNG (simplified version)
    alert('Chart export functionality - would export to PNG');
  };

  return (
    <Card className="glass border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Revenue Over Time
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
            Total: {formatCurrency(totalRevenue)} • Avg: {formatCurrency(avgRevenue)}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4 text-slate-500" />
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={formattedData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1000}
            />
            <Bar
              dataKey="revenue"
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
              opacity={0.3}
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
