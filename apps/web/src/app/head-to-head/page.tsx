import { HeadToHeadComparison } from '@/components/dashboard/head-to-head-comparison';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function HeadToHeadPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <DashboardHeader />
        <HeadToHeadComparison />
      </div>
    </DashboardLayout>
  );
}