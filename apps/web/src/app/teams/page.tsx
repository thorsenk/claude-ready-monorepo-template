import { TeamDeepDive } from '@/components/dashboard/team-deep-dive';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function TeamsPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <DashboardHeader />
        <TeamDeepDive />
      </div>
    </DashboardLayout>
  );
}