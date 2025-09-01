import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-card rounded-xl p-6 border shadow-lg">
            <h1 className="text-3xl font-bold text-gradient mb-4">RFFL Analytics Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Welcome to your professional fantasy football analytics platform featuring 7 seasons of historical data (2018-2024).
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl p-6 border stat-card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold">7</span>
                </div>
                <h3 className="text-lg font-semibold">Seasons</h3>
              </div>
              <p className="text-2xl font-bold text-primary">2018-2024</p>
              <p className="text-sm text-muted-foreground">Complete historical coverage</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border stat-card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <span className="text-success font-bold">14</span>
                </div>
                <h3 className="text-lg font-semibold">Teams</h3>
              </div>
              <p className="text-2xl font-bold text-success">Historical Data</p>
              <p className="text-sm text-muted-foreground">All franchise records</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border stat-card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="text-warning font-bold">95</span>
                </div>
                <h3 className="text-lg font-semibold">Data Quality</h3>
              </div>
              <p className="text-2xl font-bold text-warning">95.5%</p>
              <p className="text-sm text-muted-foreground">Professional accuracy</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border stat-card-hover">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                  <span className="text-info font-bold">13K</span>
                </div>
                <h3 className="text-lg font-semibold">Records</h3>
              </div>
              <p className="text-2xl font-bold text-info">13,478+</p>
              <p className="text-sm text-muted-foreground">Total data points</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 border">
            <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Team Analysis</h3>
                <p className="text-sm text-muted-foreground">Explore individual team performance across all seasons</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Head-to-Head</h3>
                <p className="text-sm text-muted-foreground">Compare team performance and rivalry statistics</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Championships</h3>
                <p className="text-sm text-muted-foreground">View championship history and playoff success</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download analytics data in multiple formats</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}