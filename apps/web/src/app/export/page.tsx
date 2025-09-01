import { DataExport } from '@/components/dashboard/data-export';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function ExportPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <DashboardHeader />
        <DataExport />
      </div>
    </DashboardLayout>
  );
}