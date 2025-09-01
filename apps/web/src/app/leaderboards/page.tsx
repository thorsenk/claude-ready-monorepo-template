import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trophy, Medal } from 'lucide-react';

export default function LeaderboardsPage() {
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
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <Star className="h-6 w-6 text-primary" />
                  <Medal className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <CardTitle className="text-2xl">Leaderboards</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Comprehensive leaderboards coming soon! This page will feature:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• All-time win percentage rankings</li>
                <li>• Highest scoring performances</li>
                <li>• Championship and playoff leaderboards</li>
                <li>• Season-specific top performers</li>
                <li>• Interactive filtering and sorting</li>
              </ul>
              <div className="pt-4">
                <div className="text-sm text-primary font-medium">
                  Team rankings available in Team Analysis
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}