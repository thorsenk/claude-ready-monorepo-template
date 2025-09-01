'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatNumber, formatDecimal, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Share,
  Copy,
  CheckCircle,
  AlertCircle,
  Settings,
  Calendar,
  Users,
  BarChart3,
  Trophy,
  Clock,
} from 'lucide-react';

interface DataExportProps {
  className?: string;
}

export function DataExport({ className }: DataExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [selectedDataset, setSelectedDataset] = useState<string>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('export');

  // Fetch data for export
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['league-overview'],
    queryFn: () => apiClient.getLeagueOverview(),
  });

  const { data: teamPerformance, isLoading: teamsLoading } = useQuery({
    queryKey: ['team-performance'],
    queryFn: () => apiClient.getTeamPerformance(),
  });

  const { data: seasonComparisons, isLoading: seasonsLoading } = useQuery({
    queryKey: ['season-comparisons'],
    queryFn: () => apiClient.getSeasonComparisons(),
  });

  const { data: scoringAnalysis, isLoading: scoringLoading } = useQuery({
    queryKey: ['scoring-analysis'],
    queryFn: () => apiClient.getScoringAnalysis(),
  });

  const datasets = [
    {
      id: 'overview',
      name: 'League Overview',
      description: 'High-level league statistics and metadata',
      icon: BarChart3,
      size: '< 1KB',
      records: overview ? `${overview.totalSeasons} seasons` : 'Loading...',
    },
    {
      id: 'teams',
      name: 'Team Performance',
      description: 'Complete team statistics and season-by-season performance',
      icon: Users,
      size: '~50KB',
      records: teamPerformance ? `${teamPerformance.length} teams` : 'Loading...',
    },
    {
      id: 'seasons',
      name: 'Season Comparisons',
      description: 'Season-by-season analysis and championship data',
      icon: Calendar,
      size: '~10KB',
      records: seasonComparisons ? `${seasonComparisons.length} seasons` : 'Loading...',
    },
    {
      id: 'scoring',
      name: 'Scoring Analysis',
      description: 'Detailed scoring statistics and distributions',
      icon: Trophy,
      size: '~5KB',
      records: scoringAnalysis ? 'Statistical analysis' : 'Loading...',
    },
    {
      id: 'complete',
      name: 'Complete Dataset',
      description: 'All available data in a single export',
      icon: Download,
      size: '~100KB',
      records: '13,478+ records',
    },
  ];

  const formats = [
    {
      id: 'csv' as const,
      name: 'CSV',
      description: 'Comma-separated values for Excel/Google Sheets',
      icon: FileSpreadsheet,
      extension: '.csv',
    },
    {
      id: 'json' as const,
      name: 'JSON',
      description: 'Structured data for developers and applications',
      icon: FileText,
      extension: '.json',
    },
    {
      id: 'pdf' as const,
      name: 'PDF Report',
      description: 'Formatted report with charts and analysis',
      icon: FileText,
      extension: '.pdf',
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const data = getDataForExport();
      const filename = `rffl-${selectedDataset}-${new Date().toISOString().split('T')[0]}`;

      if (selectedFormat === 'csv') {
        downloadCSV(data, filename);
      } else if (selectedFormat === 'json') {
        downloadJSON(data, filename);
      } else if (selectedFormat === 'pdf') {
        // In a real implementation, you would generate a PDF
        console.log('PDF generation would happen here');
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getDataForExport = () => {
    switch (selectedDataset) {
      case 'overview':
        return overview;
      case 'teams':
        return teamPerformance;
      case 'seasons':
        return seasonComparisons;
      case 'scoring':
        return scoringAnalysis;
      case 'complete':
        return {
          overview,
          teamPerformance,
          seasonComparisons,
          scoringAnalysis,
          exportDate: new Date().toISOString(),
          exportVersion: '1.0',
        };
      default:
        return null;
    }
  };

  const downloadCSV = (data: any, filename: string) => {
    let csvContent = '';
    
    if (Array.isArray(data)) {
      if (data.length > 0) {
        // Get headers from first object
        const headers = Object.keys(data[0]);
        csvContent += headers.join(',') + '\n';
        
        // Add data rows
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            // Handle nested objects and arrays
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    } else if (data && typeof data === 'object') {
      // Handle single object
      const entries = Object.entries(data);
      csvContent += 'Key,Value\n';
      entries.forEach(([key, value]) => {
        const processedValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value).replace(/"/g, '""')
          : String(value).replace(/"/g, '""');
        csvContent += `"${key}","${processedValue}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyShareableLink = () => {
    const url = `${window.location.origin}/?export=${selectedDataset}&format=${selectedFormat}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-6">
      {/* Export Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Datasets</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasets.length}</div>
            <p className="text-xs text-muted-foreground">Export options</p>
          </CardContent>
        </Card>

        <Card className="stat-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13,478+</div>
            <p className="text-xs text-muted-foreground">Data points</p>
          </CardContent>
        </Card>

        <Card className="stat-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formats.length}</div>
            <p className="text-xs text-muted-foreground">CSV, JSON, PDF</p>
          </CardContent>
        </Card>

        <Card className="stat-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Today</div>
            <p className="text-xs text-muted-foreground">Live data</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Dataset Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Select Dataset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedDataset === dataset.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedDataset(dataset.id)}
                  >
                    <div className="flex items-center gap-3">
                      <dataset.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-semibold">{dataset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dataset.description}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{dataset.size}</div>
                        <div className="text-muted-foreground">{dataset.records}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Format Selection & Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Format Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Export Format</label>
                  <div className="space-y-2">
                    {formats.map((format) => (
                      <div
                        key={format.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedFormat === format.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <div className="flex items-center gap-3">
                          <format.icon className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">{format.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {format.description}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {format.extension}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Actions */}
                <div className="space-y-3 pt-4 border-t">
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full"
                    size="lg"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Exporting...
                      </>
                    ) : exportSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Export Complete
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={copyShareableLink}
                      className="flex-1"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share Link
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const data = getDataForExport();
                        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                </div>

                {/* Export Preview */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Export Preview:</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Dataset: {datasets.find(d => d.id === selectedDataset)?.name}</div>
                    <div>Format: {formats.find(f => f.id === selectedFormat)?.name}</div>
                    <div>Estimated Size: {datasets.find(d => d.id === selectedDataset)?.size}</div>
                    <div>Filename: rffl-{selectedDataset}-{new Date().toISOString().split('T')[0]}.{selectedFormat}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { dataset: 'Complete Dataset', format: 'CSV', date: '2024-08-28', size: '98KB' },
                  { dataset: 'Team Performance', format: 'JSON', date: '2024-08-27', size: '45KB' },
                  { dataset: 'Season Comparisons', format: 'PDF', date: '2024-08-26', size: '234KB' },
                ].map((export_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Download className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{export_.dataset}</div>
                        <div className="text-sm text-muted-foreground">
                          {export_.format} • {export_.date} • {export_.size}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Scheduled exports coming soon!</p>
                <p className="text-sm">Set up automatic data exports on a recurring schedule.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Export settings coming soon!</p>
                <p className="text-sm">Configure default formats, compression, and other preferences.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}