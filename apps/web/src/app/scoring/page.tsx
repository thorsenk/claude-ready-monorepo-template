import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

export default function ScoringPage() {
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
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Scoring Trends</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Advanced scoring analysis coming soon! This page will feature:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• Detailed scoring distribution analysis</li>
                <li>• Performance trend visualizations</li>
                <li>• Statistical outlier identification</li>
                <li>• Scoring consistency metrics</li>
                <li>• Interactive scoring heatmaps</li>
              </ul>
              <div className="pt-4">
                <div className="text-sm text-primary font-medium">
                  Basic scoring analysis available in the main Dashboard
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}