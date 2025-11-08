'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { EngagementData } from '@/types';

interface EngagementChartProps {
  data: EngagementData[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: formatDate(item.date, 'MMM d'),
  }));

  const totalEngagement = data.reduce(
    (sum, item) => sum + item.totalMessages + item.totalInteractions,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Engagement</CardTitle>
        <CardDescription>
          Total Engagement Events: {totalEngagement.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={formattedData}>
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
            <Bar
              dataKey="totalMessages"
              fill="hsl(var(--primary))"
              name="Messages"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="totalInteractions"
              fill="hsl(142.1 76.2% 36.3%)"
              name="Interactions"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
