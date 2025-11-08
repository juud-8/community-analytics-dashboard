'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { MemberGrowthData } from '@/types';

interface MemberGrowthChartProps {
  data: MemberGrowthData[];
}

export function MemberGrowthChart({ data }: MemberGrowthChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: formatDate(item.date, 'MMM d'),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Growth</CardTitle>
        <CardDescription>Track your member growth over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalMembers"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Total Members"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="activeMembers"
              stroke="hsl(142.1 76.2% 36.3%)"
              strokeWidth={2}
              name="Active Members"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="newMembers"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2}
              name="New Members"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
