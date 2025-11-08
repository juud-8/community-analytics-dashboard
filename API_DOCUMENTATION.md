# Analytics API Documentation

Complete API reference for the Whop Analytics Dashboard analytics endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API uses company ID-based filtering. In production, add authentication middleware to protect these endpoints.

---

## Endpoints

### 1. Member Analytics

**GET** `/api/analytics/members`

Fetch member growth and churn analytics.

**Query Parameters:**
- `companyId` (required) - Company identifier
- `dateRange` (optional) - One of: `7d`, `30d`, `90d`, `1y`, `all` (default: `30d`)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "growth": [
      {
        "date": "2024-01-01",
        "newMembers": 15,
        "totalMembers": 1500,
        "activeMembers": 1420,
        "churnedMembers": 80
      }
    ],
    "churn": [
      {
        "period": "Jan 2024",
        "totalMembers": 1500,
        "churnedMembers": 30,
        "churnRate": 2.0,
        "retentionRate": 98.0
      }
    ],
    "totalMembers": 1500,
    "activeMembers": 1420,
    "churnedMembers": 80,
    "churnRate": 5.33
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/analytics/members?companyId=comp_123&dateRange=30d"
```

**Use Cases:**
- Display member growth chart
- Show churn trends
- Calculate retention metrics
- Monitor member status distribution

---

### 2. Revenue Analytics

**GET** `/api/analytics/revenue`

Fetch revenue breakdown, top products, and revenue trends.

**Query Parameters:**
- `companyId` (required) - Company identifier
- `dateRange` (optional) - One of: `7d`, `30d`, `90d`, `1y`, `all` (default: `30d`)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "byProduct": [
      {
        "product_id": "prod_123",
        "product_name": "Premium Membership",
        "totalRevenue": 45000.00,
        "totalPurchases": 150,
        "uniqueCustomers": 120,
        "averageOrderValue": 300.00
      }
    ],
    "topProducts": [
      {
        "product_id": "prod_123",
        "product_name": "Premium Membership",
        "totalRevenue": 45000.00,
        "totalPurchases": 150,
        "uniqueCustomers": 120,
        "averageOrderValue": 300.00
      }
    ],
    "totalRevenue": 75000.00,
    "avgOrderValue": 250.00,
    "revenueOverTime": [
      {
        "date": "2024-01-01",
        "revenue": 2500.00,
        "memberCount": 10,
        "averageRevenuePerUser": 250.00
      }
    ],
    "purchaseCount": 300
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/analytics/revenue?companyId=comp_123&dateRange=30d"
```

**Use Cases:**
- Display revenue charts
- Show top-performing products
- Calculate average order value
- Analyze revenue trends

---

### 3. Engagement Analytics

**GET** `/api/analytics/engagement`

Fetch engagement metrics including heatmap data and engagement scores.

**Query Parameters:**
- `companyId` (required) - Company identifier
- `dateRange` (optional) - One of: `7d`, `30d`, `90d`, `1y`, `all` (default: `30d`)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "heatmapData": [
      {
        "date": "2024-01-01",
        "totalMessages": 450,
        "totalInteractions": 120,
        "activeUsers": 85,
        "averageEngagementPerUser": 6.7
      }
    ],
    "engagementScore": 75,
    "trend": "up",
    "totalMessages": 13500,
    "totalInteractions": 3600,
    "activeUsers": 250
  }
}
```

**Trend Values:**
- `up` - Engagement increasing (>5% change)
- `down` - Engagement decreasing (<-5% change)
- `flat` - Engagement stable (±5%)

**Example Request:**
```bash
curl "http://localhost:3000/api/analytics/engagement?companyId=comp_123&dateRange=30d"
```

**Use Cases:**
- Display engagement heatmaps
- Show engagement trends
- Calculate engagement scores
- Monitor community activity

---

### 4. Overall Metrics

**GET** `/api/analytics/metrics`

Fetch comprehensive analytics metrics including LTV statistics.

**Query Parameters:**
- `companyId` (required) - Company identifier
- `dateRange` (optional) - One of: `7d`, `30d`, `90d`, `1y`, `all` (default: `30d`)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalMembers": 1500,
    "activeMembers": 1420,
    "churnedMembers": 80,
    "totalRevenue": 450000.00,
    "averageLifetimeValue": 300.00,
    "monthlyRecurringRevenue": 15000.00,
    "churnRate": 5.33,
    "growthRate": 12.5,
    "ltvStats": {
      "average": 300.00,
      "median": 275.00,
      "max": 5000.00,
      "min": 50.00
    }
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/analytics/metrics?companyId=comp_123"
```

**Use Cases:**
- Display KPI dashboard
- Show high-level metrics
- Calculate LTV statistics
- Monitor overall performance

---

### 5. Data Export

**POST** `/api/export`

Export analytics data in CSV or JSON format.

**Request Body:**
```json
{
  "companyId": "comp_123",
  "type": "members",
  "format": "csv"
}
```

**Parameters:**
- `companyId` (required) - Company identifier
- `type` (required) - One of: `members`, `revenue`, `engagement`, `all`
- `format` (required) - One of: `csv`, `json`

**Response Format:**
```json
{
  "success": true,
  "csv": "id,email,name,status,joined_at,lifetime_value\n..."
}
```

or

```json
{
  "success": true,
  "json": {
    "members": [...],
    "purchases": [...],
    "engagement": [...]
  }
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/export \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "comp_123",
    "type": "all",
    "format": "json"
  }'
```

**Use Cases:**
- Export data for analysis
- Generate reports
- Backup analytics data
- Integration with external tools

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

**Common Error Codes:**
- `400` - Bad Request (missing or invalid parameters)
- `500` - Internal Server Error

**Example Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch member analytics",
  "message": "Database connection failed"
}
```

---

## Performance Considerations

### Response Times
- Member Analytics: ~200-500ms
- Revenue Analytics: ~300-700ms
- Engagement Analytics: ~200-500ms
- Overall Metrics: ~400-800ms

### Optimization Tips
1. **Use specific date ranges** - Smaller date ranges process faster
2. **Cache results** - Implement client-side caching for frequently accessed data
3. **Parallel requests** - Fetch multiple endpoints simultaneously
4. **Database indexes** - All tables are indexed on `company_id` and date fields

### Rate Limiting
Currently no rate limiting is implemented. In production, consider:
- 100 requests per minute per company
- Implement caching headers
- Use Redis for caching frequently accessed data

---

## Debugging

All endpoints include detailed console logging:

```
[Members Analytics] Request received - companyId: comp_123, dateRange: 30d
[Members Analytics] Date range: 2024-01-01T00:00:00.000Z to 2024-01-31T23:59:59.999Z
[Members Analytics] Fetching members for company: comp_123
[Members Analytics] Retrieved 1500 members
[Members Analytics] Calculated growth data for 31 days
[Members Analytics] Churn rate: 5.33%
[Members Analytics] Request completed in 245ms
```

To view logs:
1. Check browser console for client-side errors
2. Check terminal/server logs for API errors
3. Look for `[Analytics]` prefixed messages

---

## Data Requirements

### Database Schema
Ensure the following tables exist:

1. **members** - Member information
2. **purchases** - Purchase transactions
3. **member_engagement** - Daily engagement metrics
4. **revenue_tracking** - Aggregated revenue data

### Sample Data
For testing, populate with:
- At least 100 members across different statuses
- 500+ purchases across multiple products
- Daily engagement records for active members

---

## Integration Examples

### React/Next.js
```typescript
async function fetchMemberAnalytics(companyId: string, dateRange: string = '30d') {
  const response = await fetch(
    `/api/analytics/members?companyId=${companyId}&dateRange=${dateRange}`
  );
  const data = await response.json();
  return data.data;
}
```

### Dashboard Component
```typescript
useEffect(() => {
  const loadAnalytics = async () => {
    const [members, revenue, engagement] = await Promise.all([
      fetch(`/api/analytics/members?companyId=${companyId}&dateRange=${dateRange}`),
      fetch(`/api/analytics/revenue?companyId=${companyId}&dateRange=${dateRange}`),
      fetch(`/api/analytics/engagement?companyId=${companyId}&dateRange=${dateRange}`),
    ]);

    const [membersData, revenueData, engagementData] = await Promise.all([
      members.json(),
      revenue.json(),
      engagement.json(),
    ]);

    // Update state with analytics data
  };

  loadAnalytics();
}, [companyId, dateRange]);
```

---

## Support

For issues or questions:
- Check server logs for error details
- Verify database connection
- Ensure environment variables are set
- Validate date range parameters
