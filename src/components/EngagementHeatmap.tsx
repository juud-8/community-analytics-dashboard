'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HeatmapData {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  engagementScore: number;
}

interface EngagementHeatmapProps {
  data: HeatmapData[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function EngagementHeatmap({ data }: EngagementHeatmapProps) {
  // Calculate min/max for color scaling
  const { minScore, maxScore, avgScore, trend } = useMemo(() => {
    if (data.length === 0) {
      return { minScore: 0, maxScore: 100, avgScore: 0, trend: 0 };
    }

    const scores = data.map(d => d.engagementScore);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midPoint);
    const secondHalf = scores.slice(midPoint);
    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
    const trendPercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    return {
      minScore: min,
      maxScore: max,
      avgScore: Math.round(avg),
      trend: Math.round(trendPercent * 10) / 10
    };
  }, [data]);

  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      const key = `${item.dayOfWeek}-${item.hour}`;
      map.set(key, item.engagementScore);
    });
    return map;
  }, [data]);

  // Get color based on engagement score
  const getColor = (score: number | undefined) => {
    if (score === undefined) return 'bg-slate-800';

    const normalized = maxScore > minScore ? (score - minScore) / (maxScore - minScore) : 0.5;

    if (normalized < 0.2) return 'bg-slate-700';
    if (normalized < 0.4) return 'bg-green-900/40';
    if (normalized < 0.6) return 'bg-green-700/60';
    if (normalized < 0.8) return 'bg-green-600/80';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Engagement Heatmap</CardTitle>
            <CardDescription>
              Activity patterns by day and hour
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{avgScore}</div>
            <div className="flex items-center gap-1 text-sm">
              {trend >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{trend}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">{trend}%</span>
                </>
              )}
              <span className="text-muted-foreground">trend</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Hour labels */}
              <div className="flex mb-2">
                <div className="w-12"></div>
                {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                  <div
                    key={hour}
                    className="flex-1 text-center text-xs text-muted-foreground"
                    style={{ minWidth: '40px' }}
                  >
                    {hour}h
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-xs text-muted-foreground font-medium">
                    {day}
                  </div>
                  <div className="flex gap-1 flex-1">
                    {HOURS.map(hour => {
                      const key = `${dayIndex}-${hour}`;
                      const score = dataMap.get(key);
                      const color = getColor(score);

                      return (
                        <div
                          key={hour}
                          className={`h-8 rounded-sm transition-all hover:ring-2 hover:ring-primary cursor-pointer ${color}`}
                          style={{ minWidth: '12px', flex: 1 }}
                          title={`${day} ${hour}:00 - Score: ${score ?? 'No data'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">Engagement Level</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex gap-1">
                <div className="w-6 h-4 rounded bg-slate-700"></div>
                <div className="w-6 h-4 rounded bg-green-900/40"></div>
                <div className="w-6 h-4 rounded bg-green-700/60"></div>
                <div className="w-6 h-4 rounded bg-green-600/80"></div>
                <div className="w-6 h-4 rounded bg-green-500"></div>
              </div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
