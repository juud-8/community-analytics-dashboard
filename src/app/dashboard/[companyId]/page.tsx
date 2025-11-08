import { Dashboard } from '@/components/Dashboard';
import { ChevronRight, Home, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DashboardPageProps {
  params: {
    companyId: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  // Format company name from ID
  const companyName = params.companyId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-white">Whop Analytics</h1>
                <p className="text-xs text-slate-400">{companyName}</p>
              </div>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href={`/dashboard/${params.companyId}`}
                className="text-white font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-600" />
            <Link
              href={`/dashboard/${params.companyId}`}
              className="text-white font-medium"
            >
              {companyName}
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-600" />
            <span className="text-slate-400">Analytics</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-6 lg:p-8">
        <Dashboard companyId={params.companyId} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 mt-16">
        <div className="container mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <div>
              <p>© {new Date().getFullYear()} Whop Analytics. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                API
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function generateMetadata({ params }: DashboardPageProps) {
  const companyName = params.companyId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${companyName} - Analytics Dashboard | Whop`,
    description: `View analytics, growth metrics, and engagement data for ${companyName}`,
  };
}
