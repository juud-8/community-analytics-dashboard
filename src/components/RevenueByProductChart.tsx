'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { ProductPerformance } from '@/types';

interface RevenueByProductChartProps {
  data: ProductPerformance[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142.1 76.2% 36.3%)',
  'hsl(221.2 83.2% 53.3%)',
  'hsl(262.1 83.3% 57.8%)',
  'hsl(346.8 77.2% 49.8%)',
];

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
  }));

  const handleBarClick = (data: any) => {
    setSelectedProduct(selectedProduct === data.fullName ? null : data.fullName);
  };

  const selectedData = chartData.find(p => p.fullName === selectedProduct);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Product</CardTitle>
        <CardDescription>
          Top 5 products - Total: {formatCurrency(totalRevenue)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar
                dataKey="revenue"
                radius={[8, 8, 0, 0]}
                cursor="pointer"
                onClick={(data: any) => handleBarClick(data)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={selectedProduct && selectedProduct !== entry.fullName ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Product Details */}
          {selectedData && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold mb-3">{selectedData.fullName}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedData.revenue)}</p>
                  <p className="text-xs text-muted-foreground">{selectedData.percentage}% of total</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchases</p>
                  <p className="text-lg font-bold">{selectedData.purchases}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="text-lg font-bold">{selectedData.customers}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Order Value</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedData.aov)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-border">
            {chartData.map((product, index) => (
              <div
                key={product.fullName}
                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleBarClick(product)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="text-sm font-medium truncate">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatCurrency(product.revenue)}</div>
                  <div className="text-xs text-muted-foreground">{product.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
