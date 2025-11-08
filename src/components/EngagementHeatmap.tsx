'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';

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
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; score: number } | null>(null);

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
    if (score === undefined) return 'bg-slate-200 dark:bg-slate-800';

    const normalized = maxScore > minScore ? (score - minScore) / (maxScore - minScore) : 0.5;

    if (normalized < 0.2) return 'bg-blue-200 dark:bg-blue-900/30';
    if (normalized < 0.4) return 'bg-blue-300 dark:bg-blue-800/50';
    if (normalized < 0.6) return 'bg-blue-400 dark:bg-blue-700/70';
    if (normalized < 0.8) return 'bg-blue-500 dark:bg-blue-600/90';
    return 'bg-blue-600 dark:bg-blue-500';
  };

  const handleExport = () => {
    alert('Heatmap export functionality - would export to PNG');
  };

  return (
    <Card className="glass border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Engagement Heatmap
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Activity patterns by day and hour
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{avgScore}</div>
              <div className="flex items-center gap-1 text-sm">
                {trend >= 0 ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">+{trend}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    <span className="text-red-600 dark:text-red-400 font-semibold">{trend}%</span>
                  </>
                )}
                <span className="text-slate-500 dark:text-slate-400">trend</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Hour labels */}
              <div className="flex mb-3">
                <div className="w-16"></div>
                {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                  <div
                    key={hour}
                    className="flex-1 text-center text-xs font-medium text-slate-600 dark:text-slate-400"
                    style={{ minWidth: '44px' }}
                  >
                    {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1.5">
                  <div className="w-16 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                    {day}
                  </div>
                  <div className="flex gap-1.5 flex-1">
                    {HOURS.map(hour => {
                      const key = `${dayIndex}-${hour}`;
                      const score = dataMap.get(key);
                      const color = getColor(score);

                      return (
                        <div
                          key={hour}
                          className={`h-10 rounded-md transition-all hover:ring-2 hover:ring-primary hover:scale-110 cursor-pointer ${color}`}
                          style={{ minWidth: '14px', flex: 1 }}
                          onMouseEnter={() => score !== undefined && setHoveredCell({ day, hour, score })}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={`${day} ${hour}:00 - Score: ${score ?? 'No data'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hovered cell info */}
          {hoveredCell && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {hoveredCell.day} at {hoveredCell.hour === 0 ? '12am' : hoveredCell.hour < 12 ? `${hoveredCell.hour}am` : hoveredCell.hour === 12 ? '12pm' : `${hoveredCell.hour - 12}pm`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Engagement Score</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {hoveredCell.score}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Engagement Level</div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">Low</span>
              <div className="flex gap-1.5">
                <div className="w-8 h-5 rounded bg-blue-200 dark:bg-blue-900/30"></div>
                <div className="w-8 h-5 rounded bg-blue-300 dark:bg-blue-800/50"></div>
                <div className="w-8 h-5 rounded bg-blue-400 dark:bg-blue-700/70"></div>
                <div className="w-8 h-5 rounded bg-blue-500 dark:bg-blue-600/90"></div>
                <div className="w-8 h-5 rounded bg-blue-600 dark:bg-blue-500"></div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
