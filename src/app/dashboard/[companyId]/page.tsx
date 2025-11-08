import { Dashboard } from '@/components/Dashboard';

interface DashboardPageProps {
  params: {
    companyId: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  return (
    <div className="container mx-auto p-6 lg:p-8">
      <Dashboard companyId={params.companyId} />
    </div>
  );
}

export async function generateMetadata({ params }: DashboardPageProps) {
  return {
    title: `Analytics Dashboard - ${params.companyId}`,
    description: 'Whop Analytics Dashboard for tracking community growth and engagement',
  };
}
