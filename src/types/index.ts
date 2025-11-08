// Database Types
export interface Member {
  id: string;
  company_id: string;
  whop_user_id: string;
  email: string;
  name: string | null;
  joined_at: string;
  status: 'active' | 'churned' | 'paused';
  lifetime_value: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  company_id: string;
  member_id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  purchased_at: string;
  created_at: string;
}

export interface MemberEngagement {
  id: string;
  company_id: string;
  member_id: string;
  date: string;
  messages_sent: number;
  messages_received: number;
  interactions: number;
  created_at: string;
}

export interface RevenueTracking {
  id: string;
  company_id: string;
  date: string;
  product_id: string;
  product_name: string;
  revenue: number;
  member_count: number;
  created_at: string;
}

// Analytics Types
export interface AnalyticsMetrics {
  totalMembers: number;
  activeMembers: number;
  churnedMembers: number;
  totalRevenue: number;
  averageLifetimeValue: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  growthRate: number;
}

export interface MemberGrowthData {
  date: string;
  newMembers: number;
  totalMembers: number;
  activeMembers: number;
  churnedMembers: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  memberCount: number;
  averageRevenuePerUser: number;
}

export interface EngagementData {
  date: string;
  totalMessages: number;
  totalInteractions: number;
  activeUsers: number;
  averageEngagementPerUser: number;
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  totalRevenue: number;
  totalPurchases: number;
  uniqueCustomers: number;
  averageOrderValue: number;
}

export interface ChurnAnalysis {
  period: string;
  totalMembers: number;
  churnedMembers: number;
  churnRate: number;
  retentionRate: number;
}

// Date Range Types
export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiLineChartData {
  date: string;
  [key: string]: string | number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter Types
export interface AnalyticsFilters {
  companyId: string;
  dateRange?: DateRange;
  startDate?: string;
  endDate?: string;
  productId?: string;
  status?: Member['status'];
}

// Export Types
export type ExportFormat = 'csv' | 'pdf' | 'json';

export interface ExportRequest {
  companyId: string;
  type: 'members' | 'revenue' | 'engagement' | 'all';
  format: ExportFormat;
  dateRange?: DateRangeFilter;
}
