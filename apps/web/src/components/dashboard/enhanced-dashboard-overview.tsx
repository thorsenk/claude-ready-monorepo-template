'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatNumber, formatDecimal, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { StatDisplay } from '@/components/ui/stat-display';
import { PerformanceBadge, getPerformanceBadgeVariant } from '@/components/ui/performance-badge';
import { 
  EnhancedChartContainer, 
  EnhancedTooltip, 
  EnhancedCartesianGrid,
  EnhancedXAxis,
  EnhancedYAxis,
  ENHANCED_CHART_COLORS,
  ChartGradients,
  formatChartValue,
  getChartColor
} from '@/components/ui/enhanced-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeasonFilter } from './season-filter';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  AlertCircle,
  Crown,
  Zap,
  BarChart3,
  Download,
  Share,
  Eye,
  Star,
  Activity,
} from 'lucide-react';

const PIE_COLORS = Object.values(ENHANCED_CHART_COLORS);

export function EnhancedDashboardOverview() {
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all data
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ['league-overview'],
    queryFn: () => apiClient.getLeagueOverview(),
  });

  const {
    data: seasonComparisons,
    isLoading: seasonsLoading,
    error: seasonsError,
  } = useQuery({
    queryKey: ['season-comparisons'],
    queryFn: () => apiClient.getSeasonComparisons(),
  });

  const {
    data: scoringAnalysis,
    isLoading: scoringLoading,
    error: scoringError,
  } = useQuery({
    queryKey: ['scoring-analysis'],
    queryFn: () => apiClient.getScoringAnalysis(),
  });

  const {
    data: teamPerformance,
    isLoading: teamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ['team-performance'],
    queryFn: () => apiClient.getTeamPerformance(),
  });

  // Filter data based on selected seasons
  const filteredData = useMemo(() => {
    if (selectedSeasons.length === 0) {
      return {
        seasons: seasonComparisons,
        teams: teamPerformance,
      };
    }

    return {
      seasons: seasonComparisons?.filter(season => selectedSeasons.includes(season.year)),
      teams: teamPerformance?.map(team => ({
        ...team,
        seasonPerformance: team.seasonPerformance?.filter(perf => selectedSeasons.includes(perf.year))
      })),
    };
  }, [seasonComparisons, teamPerformance, selectedSeasons]);

  // Compute enhanced statistics
  const enhancedStats = useMemo(() => {
    if (!filteredData.seasons || !filteredData.teams) return null;

    const seasons = filteredData.seasons;
    const teams = filteredData.teams;

    const totalGames = seasons.reduce((sum, season) => sum + season.totalGames, 0);
    const avgPointsPerGame = seasons.length > 0 
      ? seasons.reduce((sum, season) => sum + season.averagePointsFor, 0) / seasons.length 
      : 0;

    // Championship distribution
    const championshipCounts = seasons.reduce((acc, season) => {
      const champion = season.champion.name;
      acc[champion] = (acc[champion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Performance trends
    const performanceTrends = teams
      .filter(team => team.seasonPerformance.length > 0)
      .map(team => ({
        teamName: team.teamName,
        avgWinPercentage: team.seasonPerformance.reduce((sum, perf) => {
          const totalGames = perf.wins + perf.losses + perf.ties;
          return sum + (totalGames > 0 ? perf.wins / totalGames : 0);
        }, 0) / team.seasonPerformance.length,
        avgPointsFor: team.seasonPerformance.reduce((sum, perf) => sum + perf.pointsFor, 0) / team.seasonPerformance.length,
        consistency: calculateConsistency(team.seasonPerformance),
      }))
      .sort((a, b) => b.avgWinPercentage - a.avgWinPercentage);

    return {
      totalSeasons: seasons.length,
      totalGames,
      avgPointsPerGame,
      championshipCounts,
      performanceTrends,
      mostDominantTeam: performanceTrends[0],
      mostConsistentTeam: [...performanceTrends].sort((a, b) => a.consistency - b.consistency)[0],
    };
  }, [filteredData]);

  function calculateConsistency(performances: any[]) {
    if (performances.length === 0) return 0;
    const winPercentages = performances.map(perf => {
      const total = perf.wins + perf.losses + perf.ties;
      return total > 0 ? perf.wins / total : 0;
    });
    const mean = winPercentages.reduce((sum, wp) => sum + wp, 0) / winPercentages.length;
    const variance = winPercentages.reduce((sum, wp) => sum + Math.pow(wp - mean, 2), 0) / winPercentages.length;
    return Math.sqrt(variance); // Lower is more consistent
  }

  const exportData = () => {
    // Implement CSV export functionality
    console.log('Exporting data...');
  };

  if (overviewError || seasonsError || scoringError || teamsError) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data. Please check your API connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Professional Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-tertiary/5 rounded-2xl blur-xl"></div>
        <EnhancedCard variant="glass" className="relative border-0 shadow-2xl">
          <EnhancedCardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                      RFFL Analytics Dashboard
                    </h1>
                    <div className="flex items-center gap-3">
                      <PerformanceBadge variant="champion" hideIcon>
                        Elite Platform
                      </PerformanceBadge>
                      <PerformanceBadge variant="consistent">
                        Professional Grade
                      </PerformanceBadge>
                    </div>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Comprehensive fantasy football analytics powered by 7 seasons of historical data. 
                  Advanced insights for championship-caliber league management.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button 
                  onClick={exportData} 
                  className="btn-primary w-full sm:w-auto flex items-center gap-2 text-white font-semibold"
                >
                  <Download className="h-4 w-4" />
                  Export Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto flex items-center gap-2 hover:bg-muted/50 transition-all duration-300"
                >
                  <Share className="h-4 w-4" />
                  Share Dashboard
                </Button>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Season Filter */}
      <SeasonFilter 
        selectedSeasons={selectedSeasons}
        onSeasonsChange={setSelectedSeasons}
      />

      {/* Professional Key Metrics Grid */}
      <div className="dashboard-grid">
        <EnhancedCard variant="interactive" className="group">
          {overviewLoading ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : (
            <div className="p-6">
              <StatDisplay
                label={selectedSeasons.length > 0 ? 'Selected Seasons' : 'Total Seasons'}
                value={enhancedStats?.totalSeasons || overview?.totalSeasons || 0}
                icon={<Calendar className="h-4 w-4 text-blue-500" />}
                description={selectedSeasons.length > 0 
                  ? `${selectedSeasons.join(', ')}`
                  : '2018-2024 Data Range'
                }
                animate
                size="lg"
              />
            </div>
          )}
        </EnhancedCard>

        <EnhancedCard variant="interactive" className="group">
          {overviewLoading || seasonsLoading ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <div className="p-6">
              <StatDisplay
                label="Total Matchups"
                value={formatNumber(enhancedStats?.totalGames || overview?.totalGames || 0)}
                icon={<Trophy className="h-4 w-4 text-amber-500" />}
                description="Games analyzed across all seasons"
                animate
                size="lg"
                variant="warning"
              />
            </div>
          )}
        </EnhancedCard>

        <EnhancedCard variant="interactive" className="group">
          {seasonsLoading ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : (
            <div className="p-6">
              <StatDisplay
                label="Average Points/Game"
                value={formatDecimal(enhancedStats?.avgPointsPerGame || 0, 1)}
                icon={<BarChart3 className="h-4 w-4 text-green-500" />}
                description="League scoring average"
                animate
                size="lg"
                variant="success"
              />
            </div>
          )}
        </EnhancedCard>

        <EnhancedCard variant="interactive" className="group">
          {teamsLoading ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Most Dominant
                </span>
                <PerformanceBadge variant="champion" size="sm">
                  Elite
                </PerformanceBadge>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gradient animate-slide-up">
                  {enhancedStats?.mostDominantTeam?.teamName || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>
                    {enhancedStats?.mostDominantTeam 
                      ? formatPercentage(enhancedStats.mostDominantTeam.avgWinPercentage)
                      : '0%'
                    } win rate
                  </span>
                  <div className="performance-meter" style={{'--progress': `${(enhancedStats?.mostDominantTeam?.avgWinPercentage || 0) * 100}%`} as React.CSSProperties}></div>
                </div>
              </div>
            </div>
          )}
        </EnhancedCard>
      </div>

      {/* Enhanced Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl h-12">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-success/10 data-[state=active]:to-success/5 data-[state=active]:text-success data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger 
            value="champions" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-warning/10 data-[state=active]:to-warning/5 data-[state=active]:text-warning data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Champions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-info/10 data-[state=active]:to-info/5 data-[state=active]:text-info data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-slide-up">
          {/* Enhanced Season Performance & Scoring Distribution */}
          <div className="dashboard-grid-2">
            <EnhancedCard variant="elevated" className="overflow-hidden">
              <EnhancedCardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/30 p-6">
                <EnhancedCardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-sm">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Season Performance Trends
                </EnhancedCardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Historical scoring patterns and victory margins across seasons
                </p>
              </EnhancedCardHeader>
              <EnhancedCardContent className="p-6">
                <EnhancedChartContainer 
                  height={350} 
                  loading={seasonsLoading}
                  className="chart-container"
                >
                  <AreaChart data={filteredData.seasons}>
                    <ChartGradients />
                    <EnhancedCartesianGrid />
                    <EnhancedXAxis dataKey="year" />
                    <EnhancedYAxis />
                    <EnhancedTooltip 
                      formatter={(value: number, name: string) => [
                        formatDecimal(value, 1),
                        name === 'averagePointsFor' ? 'Average Points' : 'Victory Margin',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="averagePointsFor"
                      stroke={ENHANCED_CHART_COLORS.primary}
                      fill="url(#primaryGradient)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="averageMarginOfVictory"
                      stroke={ENHANCED_CHART_COLORS.secondary}
                      fill="url(#secondaryGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </EnhancedChartContainer>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="overflow-hidden">
              <EnhancedCardHeader className="bg-gradient-to-r from-tertiary/5 to-quaternary/5 border-b border-border/30 p-6">
                <EnhancedCardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-tertiary to-quaternary rounded-lg shadow-sm">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Scoring Distribution
                </EnhancedCardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Game score ranges and frequency analysis
                </p>
              </EnhancedCardHeader>
              <EnhancedCardContent className="p-6">
                <EnhancedChartContainer 
                  height={350} 
                  loading={scoringLoading}
                  className="chart-container"
                >
                  <PieChart>
                    <Pie
                      data={scoringAnalysis ? Object.entries(scoringAnalysis.scoreDistribution).map(
                        ([range, count]) => ({
                          name: range.replace('_', '-').replace('plus', '+'),
                          value: count,
                        })
                      ) : []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {scoringAnalysis && Object.keys(scoringAnalysis.scoreDistribution).map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getChartColor(index)}
                          stroke={getChartColor(index)}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <EnhancedTooltip 
                      formatter={(value: number) => [formatChartValue(value), 'Games']}
                    />
                  </PieChart>
                </EnhancedChartContainer>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-8 animate-slide-up">
          {/* Enhanced Team Performance Analysis */}
          <EnhancedCard variant="elevated" className="overflow-hidden">
            <EnhancedCardHeader className="bg-gradient-to-r from-success/5 to-info/5 border-b border-border/30 p-6">
              <EnhancedCardTitle className="flex items-center gap-3 text-xl">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-success to-info rounded-lg shadow-sm">
                  <Star className="h-5 w-5 text-white" />
                </div>
                Team Performance Rankings
              </EnhancedCardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Comparative win percentages and performance metrics across all teams
              </p>
            </EnhancedCardHeader>
            <EnhancedCardContent className="p-6">
              {teamsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Teams Grid */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {enhancedStats?.performanceTrends?.slice(0, 3).map((team, index) => {
                      const podiumColors = ['from-yellow-400 to-orange-500', 'from-gray-400 to-gray-500', 'from-amber-600 to-yellow-700']
                      const ranks = ['1st', '2nd', '3rd']
                      return (
                        <div key={team.teamName} className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-r ${podiumColors[index]} rounded-xl blur-sm opacity-20`}></div>
                          <EnhancedCard variant="glass" className="relative">
                            <div className="p-4 text-center">
                              <div className={`inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r ${podiumColors[index]} text-white rounded-full font-bold text-sm mb-2`}>
                                {ranks[index]}
                              </div>
                              <h3 className="font-semibold text-sm text-gradient mb-1">{team.teamName}</h3>
                              <div className="text-2xl font-bold mb-1">{formatPercentage(team.avgWinPercentage)}</div>
                              <p className="text-xs text-muted-foreground">{formatDecimal(team.avgPointsFor, 1)} avg pts</p>
                            </div>
                          </EnhancedCard>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Full Performance Chart */}
                  <EnhancedChartContainer 
                    height={450} 
                    className="chart-container"
                  >
                    <BarChart
                      data={enhancedStats?.performanceTrends?.slice(0, 10)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <ChartGradients />
                      <EnhancedCartesianGrid />
                      <EnhancedXAxis
                        dataKey="teamName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={11}
                      />
                      <EnhancedYAxis
                        tickFormatter={formatPercentage}
                      />
                      <EnhancedTooltip
                        formatter={(value: number) => [
                          formatPercentage(value),
                          'Win Percentage',
                        ]}
                        labelFormatter={(label) => `Team: ${label}`}
                      />
                      <Bar 
                        dataKey="avgWinPercentage" 
                        fill="url(#primaryGradient)"
                        stroke={ENHANCED_CHART_COLORS.primary}
                        strokeWidth={2}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </EnhancedChartContainer>
                </div>
              )}
            </EnhancedCardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="champions" className="space-y-8 animate-slide-up">
          {/* Enhanced Championship Analysis */}
          <div className="dashboard-grid-2">
            <EnhancedCard variant="championship" className="overflow-hidden">
              <EnhancedCardHeader className="bg-gradient-to-r from-warning/10 to-yellow-500/10 border-b border-warning/20 p-6">
                <EnhancedCardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-warning to-yellow-500 rounded-lg shadow-lg">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  Championship Distribution
                </EnhancedCardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Title winners across all seasons with championship frequency
                </p>
              </EnhancedCardHeader>
              <EnhancedCardContent className="p-6">
                <EnhancedChartContainer 
                  height={350} 
                  loading={seasonsLoading}
                  className="chart-container"
                >
                  <PieChart>
                    <Pie
                      data={enhancedStats ? Object.entries(enhancedStats.championshipCounts).map(
                        ([team, count]) => ({ name: team, value: count })
                      ) : []}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={50}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {enhancedStats && Object.keys(enhancedStats.championshipCounts).map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getChartColor(index)}
                          stroke={getChartColor(index)}
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <EnhancedTooltip 
                      formatter={(value: number) => [value, value === 1 ? 'Championship' : 'Championships']}
                    />
                  </PieChart>
                </EnhancedChartContainer>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="overflow-hidden">
              <EnhancedCardHeader className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-b border-border/30 p-6">
                <EnhancedCardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  Championship Timeline
                </EnhancedCardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Historical championship winners by season
                </p>
              </EnhancedCardHeader>
              <EnhancedCardContent className="p-6">
                {seasonsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {filteredData.seasons?.slice().sort((a, b) => b.year - a.year).map((season, index) => (
                      <div
                        key={season.year}
                        className="group relative overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-warning/5 via-transparent to-warning/5 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                        <div className="relative flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30 group-hover:border-warning/30 transition-all duration-300 group-hover:shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-warning/20 rounded-lg blur-sm group-hover:blur-none transition-all duration-300"></div>
                              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-r from-warning to-yellow-500 rounded-lg shadow-sm group-hover:shadow-lg transition-all duration-300">
                                <Crown className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gradient">{season.year}</span>
                                <PerformanceBadge variant="champion" size="sm">
                                  Champion
                                </PerformanceBadge>
                              </div>
                              <div className="font-semibold text-foreground">
                                {season.champion.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-sm font-medium text-foreground">
                              {formatNumber(season.totalGames)} games
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {formatDecimal(season.averagePointsFor, 1)} avg pts
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8 animate-slide-up">
          {/* Advanced Analytics Section */}
          <div className="dashboard-grid-2">
            <EnhancedCard variant="elevated" className="overflow-hidden">
              <EnhancedCardHeader className="bg-gradient-to-r from-info/5 to-primary/5 border-b border-border/30 p-6">
                <EnhancedCardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-info to-primary rounded-lg shadow-sm">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  Team Performance Radar
                </EnhancedCardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Multi-dimensional team performance analysis
                </p>
              </EnhancedCardHeader>
              <EnhancedCardContent className="p-6">
                <EnhancedChartContainer 
                  height={350} 
                  loading={teamsLoading}
                  className="chart-container"
                >
                  <RadarChart data={enhancedStats?.performanceTrends?.slice(0, 8)}>
                    <PolarGrid 
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.3}
                    />
                    <PolarAngleAxis 
                      dataKey="teamName" 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={60} 
                      domain={[0, 1]} 
                      tickFormatter={formatPercentage}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      name="Win Rate"
                      dataKey="avgWinPercentage"
                      stroke={ENHANCED_CHART_COLORS.primary}
                      fill={ENHANCED_CHART_COLORS.primary}
                      fillOpacity={0.2}
                      strokeWidth={3}
                      dot={{ fill: ENHANCED_CHART_COLORS.primary, r: 4 }}
                    />
                    <EnhancedTooltip 
                      formatter={(value: number) => [
                        formatPercentage(value),
                        'Win Rate'
                      ]}
                    />
                  </RadarChart>
                </EnhancedChartContainer>
              </EnhancedCardContent>
            </EnhancedCard>

            <EnhancedCard variant="elevated" className="overflow-hidden">
              <EnhancedCardHeader className="bg-gradient-to-r from-secondary/5 to-tertiary/5 border-b border-border/30 p-6">
                <EnhancedCardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-secondary to-tertiary rounded-lg shadow-sm">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  Historical Scoring Trends
                </EnhancedCardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  League scoring evolution across seasons
                </p>
              </EnhancedCardHeader>
              <EnhancedCardContent className="p-6">
                <EnhancedChartContainer 
                  height={350} 
                  loading={seasonsLoading}
                  className="chart-container"
                >
                  <LineChart data={filteredData.seasons}>
                    <ChartGradients />
                    <EnhancedCartesianGrid />
                    <EnhancedXAxis dataKey="year" />
                    <EnhancedYAxis />
                    <EnhancedTooltip 
                      formatter={(value: number) => [
                        formatDecimal(value, 1),
                        'Average Points'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="averagePointsFor"
                      stroke={ENHANCED_CHART_COLORS.secondary}
                      strokeWidth={4}
                      dot={{ 
                        fill: ENHANCED_CHART_COLORS.secondary, 
                        stroke: ENHANCED_CHART_COLORS.secondary,
                        strokeWidth: 2,
                        r: 6 
                      }}
                      activeDot={{ 
                        r: 8, 
                        stroke: ENHANCED_CHART_COLORS.secondary,
                        strokeWidth: 2,
                        fill: '#fff'
                      }}
                    />
                  </LineChart>
                </EnhancedChartContainer>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}