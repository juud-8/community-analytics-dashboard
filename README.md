# Whop Analytics Dashboard

A comprehensive Next.js 14 analytics dashboard for Whop creators to track community growth, revenue, and member engagement.

## Features

- **Member Analytics**: Track member growth, churn rate, and retention
- **Revenue Insights**: Monitor total revenue, MRR, and lifetime value
- **Engagement Metrics**: Measure community interactions and activity
- **Interactive Charts**: Visualize trends with Recharts
- **Data Export**: Export analytics data in CSV or JSON format
- **Multiple Date Ranges**: View data for 7d, 30d, 90d, 1y, or all time
- **Real-time Updates**: Live analytics calculations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Whop account (optional for Whop integration)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the `.env.local` file and update with your credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Whop Configuration (optional)
   NEXT_PUBLIC_WHOP_APP_ID=your-whop-app-id
   NEXT_PUBLIC_WHOP_COMPANY_ID=your-whop-company-id
   WHOP_API_KEY=your-whop-api-key
   ```

4. **Set up the database**

   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # The schema is available in database-schema.sql
   ```

   This will create:
   - `members` table
   - `purchases` table
   - `member_engagement` table
   - `revenue_tracking` table
   - Indexes for performance
   - Row Level Security (RLS) policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── dashboard/
│   │   └── [companyId]/
│   │       └── page.tsx        # Dashboard page
│   └── api/
│       ├── analytics/
│       │   ├── members/        # Member analytics endpoint
│       │   ├── revenue/        # Revenue analytics endpoint
│       │   ├── engagement/     # Engagement analytics endpoint
│       │   └── metrics/        # Overall metrics endpoint
│       └── export/             # Data export endpoint
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── Dashboard.tsx           # Main dashboard component
│   ├── MemberGrowthChart.tsx   # Member growth chart
│   ├── RevenueChart.tsx        # Revenue chart
│   ├── EngagementChart.tsx     # Engagement chart
│   ├── MetricsCard.tsx         # Metrics display card
│   └── ExportButton.tsx        # Export functionality
├── lib/
│   ├── supabase.ts             # Supabase client & DB helpers
│   ├── analytics.ts            # Analytics calculations
│   └── utils.ts                # Utility functions
└── types/
    └── index.ts                # TypeScript types
```

## Usage

### Viewing Analytics

Navigate to `/dashboard/[your-company-id]` to view your analytics dashboard.

The dashboard displays:
- Total members and active members
- Total revenue and MRR
- Churn rate and growth rate
- Member growth over time (chart)
- Revenue over time (chart)
- Engagement metrics (chart)
- Average lifetime value

### Date Range Selection

Use the date range selector to view analytics for:
- Last 7 days
- Last 30 days
- Last 90 days
- Last year
- All time

### Exporting Data

Click the "Export All Data" button to download your analytics data in CSV or JSON format.

## Database Schema

### Members Table
Stores member information and status.

```sql
- id: UUID (primary key)
- company_id: TEXT
- whop_user_id: TEXT
- email: TEXT
- name: TEXT
- joined_at: TIMESTAMP
- status: TEXT (active, churned, paused)
- lifetime_value: DECIMAL
```

### Purchases Table
Tracks all purchases and revenue.

```sql
- id: UUID (primary key)
- company_id: TEXT
- member_id: UUID (foreign key)
- product_id: TEXT
- product_name: TEXT
- amount: DECIMAL
- currency: TEXT
- purchased_at: TIMESTAMP
```

### Member Engagement Table
Records member engagement metrics.

```sql
- id: UUID (primary key)
- company_id: TEXT
- member_id: UUID (foreign key)
- date: DATE
- messages_sent: INT
- messages_received: INT
- interactions: INT
```

### Revenue Tracking Table
Aggregated revenue data by product and date.

```sql
- id: UUID (primary key)
- company_id: TEXT
- date: DATE
- product_id: TEXT
- product_name: TEXT
- revenue: DECIMAL
- member_count: INT
```

## API Endpoints

### GET /api/analytics/members
Fetch member growth data.

**Query Parameters:**
- `companyId` (required)
- `dateRange` (optional): 7d, 30d, 90d, 1y, all

### GET /api/analytics/revenue
Fetch revenue analytics.

**Query Parameters:**
- `companyId` (required)
- `dateRange` (optional): 7d, 30d, 90d, 1y, all

### GET /api/analytics/engagement
Fetch engagement metrics.

**Query Parameters:**
- `companyId` (required)
- `dateRange` (optional): 7d, 30d, 90d, 1y, all

### GET /api/analytics/metrics
Fetch overall analytics metrics.

**Query Parameters:**
- `companyId` (required)
- `dateRange` (optional): 7d, 30d, 90d, 1y, all

### POST /api/export
Export analytics data.

**Request Body:**
```json
{
  "companyId": "string",
  "type": "members" | "revenue" | "engagement" | "all",
  "format": "csv" | "json"
}
```

## Customization

### Adding New Metrics

1. Add the metric calculation to `src/lib/analytics.ts`
2. Update the TypeScript types in `src/types/index.ts`
3. Create a new component in `src/components/`
4. Add the component to the dashboard

### Styling

The project uses Tailwind CSS with shadcn/ui. To customize:

1. Edit `tailwind.config.ts` for theme changes
2. Update `src/app/globals.css` for CSS variables
3. Modify component styles in individual component files

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Security

- Row Level Security (RLS) is enabled on all tables
- Environment variables are used for sensitive data
- API routes validate company IDs
- Supabase handles authentication and authorization

## Performance

- Server-side rendering for fast initial loads
- Client-side data fetching for interactive updates
- Database indexes for query optimization
- Efficient calculations with memoization

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Contact support

## Roadmap

- [ ] PDF export functionality
- [ ] Email reports
- [ ] Custom date range selection
- [ ] Product-level analytics
- [ ] Cohort analysis dashboard
- [ ] A/B testing insights
- [ ] Webhooks for real-time updates
- [ ] Mobile app

## Acknowledgments

- Built with Next.js 14
- UI components from shadcn/ui
- Charts powered by Recharts
- Database by Supabase
