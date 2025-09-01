import { CalendarDays, Database, Trophy } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="border-b border-gray-200 pb-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFFL Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive analysis of RFFL historical data (2018-2024)
          </p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-sm text-gray-500">
            <Database className="h-4 w-4 mr-1" />
            <span>13,478 Records</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span>7 Seasons</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Trophy className="h-4 w-4 mr-1" />
            <span>14 Teams</span>
          </div>
        </div>
      </div>
    </div>
  );
}