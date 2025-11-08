import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, TrendingUp, Activity, Download } from "lucide-react";

export default function Home() {
  const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || "your-company-id";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Whop Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Powerful analytics for Whop creators to track community growth, revenue, and engagement
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={`/dashboard/${companyId}`}>
              <Button size="lg">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Member Analytics</CardTitle>
              <CardDescription>
                Track member growth, churn rate, and retention over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Active member tracking</li>
                <li>• Churn analysis</li>
                <li>• Growth rate metrics</li>
                <li>• Cohort retention</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Revenue Insights</CardTitle>
              <CardDescription>
                Monitor revenue streams and financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Total revenue tracking</li>
                <li>• MRR calculations</li>
                <li>• Average lifetime value</li>
                <li>• Product performance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Measure community interaction and activity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Message tracking</li>
                <li>• Interaction analytics</li>
                <li>• Active user counts</li>
                <li>• Engagement trends</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>
                Visualize trends and growth patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Interactive charts</li>
                <li>• Time-based comparisons</li>
                <li>• Multiple date ranges</li>
                <li>• Trend analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Export your data in multiple formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• CSV export</li>
                <li>• JSON export</li>
                <li>• Filtered exports</li>
                <li>• Date range selection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Stay up-to-date with live analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Live data refresh</li>
                <li>• Instant calculations</li>
                <li>• Performance metrics</li>
                <li>• KPI monitoring</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Quick Setup</CardTitle>
            <CardDescription>Get started with your analytics dashboard in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Configure Environment Variables</h4>
              <p className="text-sm text-muted-foreground">
                Update your <code className="bg-muted px-2 py-1 rounded">.env.local</code> file with your Supabase and Whop credentials.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Set Up Database</h4>
              <p className="text-sm text-muted-foreground">
                Run the SQL schema from <code className="bg-muted px-2 py-1 rounded">database-schema.sql</code> in your Supabase SQL editor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. View Your Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Navigate to <code className="bg-muted px-2 py-1 rounded">/dashboard/[your-company-id]</code> to see your analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
