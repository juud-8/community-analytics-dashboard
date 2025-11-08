'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ProductPerformance } from '@/types';

interface RevenueByProductChartProps {
  data: ProductPerformance[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
const GRADIENT_COLORS = [
  { start: '#3b82f6', end: '#2563eb' },
  { start: '#10b981', end: '#059669' },
  { start: '#8b5cf6', end: '#7c3aed' },
  { start: '#f59e0b', end: '#d97706' },
  { start: '#ef4444', end: '#dc2626' },
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="glass rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-xl min-w-[200px]">
      <p className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
        {data.fullName}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-slate-600 dark:text-slate-400">Revenue:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(data.revenue)}
          </span>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <span className="text-slate-600 dark:text-slate-400">Share:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {data.percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export function RevenueByProductChart({ data }: RevenueByProductChartProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Get top 5 products by revenue
  const topProducts = [...data]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Calculate total revenue
  const totalRevenue = topProducts.reduce((sum, product) => sum + product.totalRevenue, 0);

  // Format data for chart
  const chartData = topProducts.map((product, index) => ({
    name: product.product_name.length > 20
      ? product.product_name.substring(0, 20) + '...'
      : product.product_name,
    fullName: product.product_name,
    revenue: product.totalRevenue,
    percentage: ((product.totalRevenue / totalRevenue) * 100).toFixed(1),
    purchases: product.totalPurchases,
    customers: product.uniqueCustomers,
    aov: product.averageOrderValue,
    color: COLORS[index % COLORS.length],
    gradient: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
  }));

  const handleBarClick = (data: any) => {
    setSelectedProduct(selectedProduct === data.fullName ? null : data.fullName);
  };

  const selectedData = chartData.find(p => p.fullName === selectedProduct);

  const handleExport = () => {
    alert('Chart export functionality - would export to PNG');
  };

  return (
    <Card className="glass border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Revenue by Product
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
            Top 5 products • Total: {formatCurrency(totalRevenue)}
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
        <div className="space-y-6">
          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.gradient.start} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={entry.gradient.end} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="revenue"
                radius={[8, 8, 0, 0]}
                cursor="pointer"
                onClick={(data: any) => handleBarClick(data)}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#gradient-${index})`}
                    opacity={selectedProduct && selectedProduct !== entry.fullName ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Product Details */}
          {selectedData && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-slate-900 dark:text-white">{selectedData.fullName}</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedData.revenue)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {selectedData.percentage}% of total
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Purchases</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedData.purchases}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customers</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedData.customers}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg Order Value</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(selectedData.aov)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            {chartData.map((product, index) => (
              <button
                key={product.fullName}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                onClick={() => handleBarClick(product)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="text-sm font-medium truncate text-slate-700 dark:text-slate-300">
                    {product.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(product.revenue)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {product.percentage}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
