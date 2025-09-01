import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
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
                  <Settings className="h-8 w-8 text-primary" />
                  <Palette className="h-6 w-6 text-primary" />
                  <Database className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Dashboard Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Customization settings coming soon! This page will feature:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• Theme and appearance preferences</li>
                <li>• Dashboard layout customization</li>
                <li>• Data refresh and caching settings</li>
                <li>• Export format defaults</li>
                <li>• Notification preferences</li>
              </ul>
              <div className="pt-4">
                <div className="text-sm text-primary font-medium">
                  The dashboard is currently optimized with default settings
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}