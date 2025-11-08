-- Whop Analytics Dashboard Database Schema
-- Run this in your Supabase SQL Editor

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  whop_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, churned, paused
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, whop_user_id)
);

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  member_id UUID REFERENCES members(id),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  purchased_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Member engagement table
CREATE TABLE member_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  member_id UUID REFERENCES members(id),
  date DATE NOT NULL,
  messages_sent INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  interactions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, member_id, date)
);

-- Revenue tracking table
CREATE TABLE revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  date DATE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  revenue DECIMAL(10,2) NOT NULL,
  member_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, date, product_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_members_company_id ON members(company_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_joined_at ON members(joined_at);
CREATE INDEX idx_purchases_company_id ON purchases(company_id);
CREATE INDEX idx_purchases_member_id ON purchases(member_id);
CREATE INDEX idx_purchases_purchased_at ON purchases(purchased_at);
CREATE INDEX idx_engagement_company_id ON member_engagement(company_id);
CREATE INDEX idx_engagement_member_id ON member_engagement(member_id);
CREATE INDEX idx_engagement_date ON member_engagement(date);
CREATE INDEX idx_revenue_company_id ON revenue_tracking(company_id);
CREATE INDEX idx_revenue_date ON revenue_tracking(date);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your authentication setup)
-- Example: Allow authenticated users to read their own company's data
CREATE POLICY "Users can view their company members"
  ON members FOR SELECT
  USING (auth.jwt() ->> 'company_id' = company_id);

CREATE POLICY "Users can view their company purchases"
  ON purchases FOR SELECT
  USING (auth.jwt() ->> 'company_id' = company_id);

CREATE POLICY "Users can view their company engagement"
  ON member_engagement FOR SELECT
  USING (auth.jwt() ->> 'company_id' = company_id);

CREATE POLICY "Users can view their company revenue"
  ON revenue_tracking FOR SELECT
  USING (auth.jwt() ->> 'company_id' = company_id);
