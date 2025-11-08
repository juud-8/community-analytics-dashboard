import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Type-safe database helpers
export const db = {
  members: {
    getAll: async (companyId: string) => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('company_id', companyId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    getByStatus: async (companyId: string, status: string) => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', status);

      if (error) throw error;
      return data;
    },

    getActiveCount: async (companyId: string) => {
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
  },

  purchases: {
    getAll: async (companyId: string) => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('company_id', companyId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    getByDateRange: async (companyId: string, startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('company_id', companyId)
        .gte('purchased_at', startDate)
        .lte('purchased_at', endDate)
        .order('purchased_at', { ascending: true });

      if (error) throw error;
      return data;
    },

    getTotalRevenue: async (companyId: string) => {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount')
        .eq('company_id', companyId);

      if (error) throw error;
      return data.reduce((sum, purchase) => sum + parseFloat(purchase.amount.toString()), 0);
    },
  },

  engagement: {
    getAll: async (companyId: string) => {
      const { data, error } = await supabase
        .from('member_engagement')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },

    getByDateRange: async (companyId: string, startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .from('member_engagement')
        .select('*')
        .eq('company_id', companyId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
  },

  revenue: {
    getAll: async (companyId: string) => {
      const { data, error } = await supabase
        .from('revenue_tracking')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },

    getByDateRange: async (companyId: string, startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .from('revenue_tracking')
        .select('*')
        .eq('company_id', companyId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
  },
};
