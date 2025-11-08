# Analytics Engine Testing Guide

This guide helps you test and verify the analytics engine functionality.

## Prerequisites

1. **Database Setup**
   - Run `database-schema.sql` in Supabase SQL editor
   - Verify all tables are created with indexes

2. **Environment Variables**
   - Ensure `.env.local` has valid Supabase credentials
   - Set `NEXT_PUBLIC_WHOP_COMPANY_ID` for testing

3. **Sample Data**
   - Populate at least 100 members
   - Add 500+ purchases
   - Insert engagement records

## Testing the Analytics Functions

### 1. Test Member Analytics

**Function**: `calculateMemberGrowth()`

```typescript
// src/lib/analytics.ts

import { calculateMemberGrowth, calculateChurnRate } from '@/lib/analytics';
import { getDateRange } from '@/lib/utils';

// Test with sample data
const members = await db.members.getAll('your-company-id');
const dateRange = getDateRange('30d');

const growth = calculateMemberGrowth(members, dateRange);
console.log('Growth data points:', growth.length);
console.log('Sample:', growth[0]);

const churnData = calculateChurnRate(members, dateRange);
console.log('Churn rate:', churnData.churnRate);
console.log('Churn trend:', churnData.trend);
```

**Expected Output**:
- Array of daily growth data points
- Each point contains: date, newMembers, totalMembers, activeMembers, churnedMembers
- Churn rate as percentage
- Trend analysis by month

### 2. Test Revenue Analytics

**Function**: `calculateRevenueBreakdown()`

```typescript
import { calculateRevenueBreakdown, calculateTopProducts } from '@/lib/analytics';

const purchases = await db.purchases.getAll('your-company-id');

const breakdown = calculateRevenueBreakdown(purchases);
console.log('Total revenue:', breakdown.totalRevenue);
console.log('Average order value:', breakdown.avgOrderValue);
console.log('Products:', breakdown.byProduct.length);

const topProducts = calculateTopProducts(purchases, 5);
console.log('Top 5 products:', topProducts);
```

**Expected Output**:
- Total revenue sum
- Average order value
- Array of products sorted by revenue
- Top 5 products with details

### 3. Test Engagement Analytics

**Function**: `calculateEngagementMetrics()`

```typescript
import { calculateEngagementMetrics } from '@/lib/analytics';

const engagement = await db.engagement.getAll('your-company-id');
const dateRange = getDateRange('30d');

const metrics = calculateEngagementMetrics(engagement, dateRange);
console.log('Engagement score:', metrics.engagementScore);
console.log('Trend:', metrics.trend);
console.log('Active users:', metrics.activeUsers);
console.log('Total messages:', metrics.totalMessages);
```

**Expected Output**:
- Engagement score (0-100)
- Trend: 'up', 'down', or 'flat'
- Total messages and interactions
- Active user count
- Heatmap data array

### 4. Test LTV Calculations

**Function**: `calculateMemberLifetimeValue()`

```typescript
import { calculateMemberLifetimeValue } from '@/lib/analytics';

const members = await db.members.getAll('your-company-id');

const ltvStats = calculateMemberLifetimeValue(members);
console.log('Average LTV:', ltvStats.average);
console.log('Median LTV:', ltvStats.median);
console.log('Max LTV:', ltvStats.max);
console.log('Min LTV:', ltvStats.min);
```

**Expected Output**:
- Statistical analysis of LTV
- Average, median, max, min values
- All values in same currency

## Testing API Endpoints

### 1. Test Member Analytics Endpoint

```bash
# Test with curl
curl "http://localhost:3000/api/analytics/members?companyId=your-company-id&dateRange=30d"

# Expected response structure:
{
  "success": true,
  "data": {
    "growth": [...],
    "churn": [...],
    "totalMembers": 1500,
    "activeMembers": 1420,
    "churnedMembers": 80,
    "churnRate": 5.33
  }
}
```

**Check Console Logs**:
```
[Members Analytics] Request received - companyId: xxx, dateRange: 30d
[Members Analytics] Date range: 2024-XX-XX to 2024-XX-XX
[Members Analytics] Fetching members for company: xxx
[Members Analytics] Retrieved XX members
[Members Analytics] Calculated growth data for XX days
[Members Analytics] Churn rate: X.XX%
[Members Analytics] Request completed in XXms
```

### 2. Test Revenue Analytics Endpoint

```bash
curl "http://localhost:3000/api/analytics/revenue?companyId=your-company-id&dateRange=30d"

# Expected response:
{
  "success": true,
  "data": {
    "byProduct": [...],
    "topProducts": [...],
    "totalRevenue": 75000.00,
    "avgOrderValue": 250.00,
    "revenueOverTime": [...],
    "purchaseCount": 300
  }
}
```

**Check Console Logs**:
```
[Revenue Analytics] Request received - companyId: xxx, dateRange: 30d
[Revenue Analytics] Retrieved XX purchases
[Revenue Analytics] Filtered to XX purchases in date range
[Revenue Analytics] Revenue breakdown - Products: X, Total: $XXX.XX
[Revenue Analytics] Top X products identified
[Revenue Analytics] Request completed in XXms
```

### 3. Test Engagement Analytics Endpoint

```bash
curl "http://localhost:3000/api/analytics/engagement?companyId=your-company-id&dateRange=30d"

# Expected response:
{
  "success": true,
  "data": {
    "heatmapData": [...],
    "engagementScore": 75,
    "trend": "up",
    "totalMessages": 13500,
    "totalInteractions": 3600,
    "activeUsers": 250
  }
}
```

**Check Console Logs**:
```
[Engagement Analytics] Request received - companyId: xxx, dateRange: 30d
[Engagement Analytics] Retrieved XX engagement records
[Engagement Analytics] Engagement score: XX, Trend: up/down/flat
[Engagement Analytics] Active users: XX, Messages: XX
[Engagement Analytics] Request completed in XXms
```

### 4. Test Metrics Endpoint

```bash
curl "http://localhost:3000/api/analytics/metrics?companyId=your-company-id"

# Expected response:
{
  "success": true,
  "data": {
    "totalMembers": 1500,
    "activeMembers": 1420,
    "totalRevenue": 450000.00,
    "ltvStats": {
      "average": 300.00,
      "median": 275.00,
      "max": 5000.00,
      "min": 50.00
    }
  }
}
```

## Testing Error Handling

### 1. Missing Company ID

```bash
curl "http://localhost:3000/api/analytics/members"

# Expected:
{
  "success": false,
  "error": "Company ID is required"
}
```

### 2. Invalid Date Range

```bash
curl "http://localhost:3000/api/analytics/members?companyId=test&dateRange=invalid"

# Should default to 30d
```

### 3. Empty Data

Test with company ID that has no data:

```bash
curl "http://localhost:3000/api/analytics/engagement?companyId=empty-company"

# Expected:
{
  "success": true,
  "data": {
    "heatmapData": [],
    "engagementScore": 0,
    "trend": "flat",
    "totalMessages": 0,
    "totalInteractions": 0,
    "activeUsers": 0
  }
}
```

## Performance Testing

### 1. Response Time Benchmarks

```bash
# Test member analytics performance
time curl "http://localhost:3000/api/analytics/members?companyId=test&dateRange=30d"

# Target: < 500ms
```

### 2. Check Database Query Performance

Enable Supabase query logging and check:
- Query execution times
- Index usage
- N+1 query issues

### 3. Load Testing

```bash
# Install autocannon
npm install -g autocannon

# Run load test
autocannon -c 10 -d 30 http://localhost:3000/api/analytics/members?companyId=test
```

**Expected Results**:
- Average latency < 500ms
- No errors under normal load
- Consistent response times

## Integration Testing

### Test Dashboard Component

```typescript
// Create test file: __tests__/dashboard.test.tsx

import { render, waitFor, screen } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';

test('loads and displays analytics', async () => {
  render(<Dashboard companyId="test-company" />);

  await waitFor(() => {
    expect(screen.getByText(/Total Members/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
  });
});
```

### Test API Integration

```typescript
// Create test file: __tests__/api.test.ts

describe('Analytics API', () => {
  it('should fetch member analytics', async () => {
    const res = await fetch('/api/analytics/members?companyId=test&dateRange=30d');
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('growth');
    expect(data.data).toHaveProperty('totalMembers');
  });
});
```

## Debugging Common Issues

### Issue: Empty Response

**Check**:
1. Company ID exists in database
2. Data exists for the date range
3. Supabase connection is active
4. Environment variables are set

**Solution**:
```bash
# Check server logs
npm run dev

# Look for error messages
[Analytics] Error: ...
```

### Issue: Slow Performance

**Check**:
1. Database indexes are created
2. Date range is not too large
3. Network latency to Supabase

**Solution**:
```sql
-- Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename IN ('members', 'purchases', 'member_engagement');
```

### Issue: Incorrect Calculations

**Check**:
1. Sample data is realistic
2. Date formats are consistent
3. Timezone handling

**Debug**:
```typescript
// Add debug logging
console.log('Members:', members.length);
console.log('Date range:', dateRange);
console.log('Calculated growth:', growth);
```

## Data Validation

### Validate Member Data

```sql
-- Check member status distribution
SELECT status, COUNT(*)
FROM members
WHERE company_id = 'your-company-id'
GROUP BY status;

-- Should return active, churned, paused
```

### Validate Purchase Data

```sql
-- Check purchase date range
SELECT
  MIN(purchased_at) as earliest,
  MAX(purchased_at) as latest,
  COUNT(*) as total
FROM purchases
WHERE company_id = 'your-company-id';
```

### Validate Engagement Data

```sql
-- Check engagement coverage
SELECT
  DATE(date) as engagement_date,
  COUNT(DISTINCT member_id) as active_users
FROM member_engagement
WHERE company_id = 'your-company-id'
GROUP BY DATE(date)
ORDER BY engagement_date DESC
LIMIT 30;
```

## Success Criteria

Analytics engine is working correctly if:

✅ All API endpoints return 200 status codes
✅ Response times are < 500ms for typical queries
✅ Console logs show detailed execution steps
✅ Error handling returns meaningful messages
✅ Empty data cases return zero values (not errors)
✅ Calculations match manual verification
✅ Charts display correctly with returned data
✅ Date range filtering works accurately
✅ LTV statistics are mathematically correct
✅ Engagement scores are within 0-100 range

## Next Steps

After testing:

1. ✅ Verify all endpoints work
2. ✅ Check performance benchmarks
3. ✅ Validate calculations
4. ✅ Test edge cases
5. 🔄 Deploy to production
6. 🔄 Set up monitoring
7. 🔄 Configure caching
8. 🔄 Add rate limiting

## Support

If tests fail:
1. Check server console logs
2. Verify database schema
3. Validate sample data
4. Review API documentation
5. Check Supabase connection
