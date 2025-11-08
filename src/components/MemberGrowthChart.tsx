'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { MemberGrowthData } from '@/types';

interface MemberGrowthChartProps {
  data: MemberGrowthData[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="glass rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-xl">
      <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export function MemberGrowthChart({ data }: MemberGrowthChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: formatDate(item.date, 'MMM d'),
  }));

  const handleExport = () => {
    // Export chart as PNG (simplified version)
    alert('Chart export functionality - would export to PNG');
  };

  return (
    <Card className="glass border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Member Growth
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
            Track your member growth over time
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
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="totalMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="activeMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="newMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: 500,
              }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="totalMembers"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#totalMembers)"
              name="Total Members"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="activeMembers"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#activeMembers)"
              name="Active Members"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="newMembers"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#newMembers)"
              name="New Members"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
