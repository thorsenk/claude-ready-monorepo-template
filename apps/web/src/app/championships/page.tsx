import { ChampionshipTracker } from '@/components/dashboard/championship-tracker';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function ChampionshipsPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <DashboardHeader />
        <ChampionshipTracker />
      </div>
    </DashboardLayout>
  );
}