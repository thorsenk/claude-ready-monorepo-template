import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';

export default function SeasonsPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <DashboardHeader />
        
        {/* Coming Soon Placeholder */}
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-full">
                  <Calendar className="h-8 w-8 text-primary" />
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Season Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Detailed season-by-season analysis coming soon! This page will feature:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• Season performance comparisons</li>
                <li>• Year-over-year trend analysis</li>
                <li>• League evolution insights</li>
                <li>• Historical context and milestones</li>
                <li>• Interactive timeline visualization</li>
              </ul>
              <div className="pt-4">
                <div className="text-sm text-primary font-medium">
                  Available in the main Dashboard for now
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}