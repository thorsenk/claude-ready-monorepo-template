'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { formatNumber, formatDecimal, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
} from 'recharts';
import {
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  AlertCircle,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export function DashboardOverview() {
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
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{overview?.totalSeasons || 0}</div>
                <p className="text-xs text-muted-foreground">2018-2024</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{overview?.totalTeams || 0}</div>
                <p className="text-xs text-muted-foreground">Unique franchises</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(overview?.totalGames || 0)}</div>
                <p className="text-xs text-muted-foreground">Matchups played</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatPercentage((overview?.dataQuality || 0) / 100)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    Excellent
                  </Badge>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Season Performance Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Season Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {seasonsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={seasonComparisons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatDecimal(Number(value), 1),
                      name === 'averagePointsFor' ? 'Avg Points' : name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="averagePointsFor"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="averageMarginOfVictory"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {scoringLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scoringAnalysis ? Object.entries(scoringAnalysis.scoreDistribution).map(
                      ([range, count]) => ({
                        name: range,
                        value: count,
                      })
                    ) : []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {scoringAnalysis && Object.keys(scoringAnalysis.scoreDistribution).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Top Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {teamsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={teamPerformance
                    ?.sort((a, b) => b.winPercentage - a.winPercentage)
                    .slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="teamName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) => formatPercentage(value)}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatPercentage(Number(value)),
                      'Win Percentage',
                    ]}
                  />
                  <Bar dataKey="winPercentage" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* League Champions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            League Champions by Season
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seasonComparisons?.map((season) => (
                <Card key={season.year} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{season.year}</div>
                        <div className="text-sm text-muted-foreground">
                          {season.champion.name}
                        </div>
                      </div>
                      <Trophy className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formatNumber(season.totalGames)} games played
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}