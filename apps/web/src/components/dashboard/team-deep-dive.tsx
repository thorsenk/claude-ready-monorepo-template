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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  Target,
  Award,
  AlertCircle,
  Crown,
  Zap,
  BarChart3,
  Activity,
  Star,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
};

interface TeamDeepDiveProps {
  className?: string;
}

export function TeamDeepDive({ className }: TeamDeepDiveProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch teams list
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => apiClient.getTeamsList(),
  });

  // Fetch team performance data
  const {
    data: teamPerformance,
    isLoading: performanceLoading,
    error: performanceError,
  } = useQuery({
    queryKey: ['team-performance', selectedTeamId],
    queryFn: () => apiClient.getTeamPerformance(selectedTeamId),
    enabled: !!selectedTeamId,
  });

  const selectedTeam = teamPerformance?.[0];

  const getPerformanceIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getWinLossColor = (result: string) => {
    if (result.includes('Champion')) return 'bg-yellow-500';
    if (result.includes('Playoff')) return 'bg-green-500';
    if (result.includes('Last')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  if (performanceError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load team data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team to analyze" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedTeamId && (
        <>
          {/* Team Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{selectedTeam?.totalSeasons || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      League participation
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Percentage</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatPercentage(selectedTeam?.winPercentage || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedTeam?.totalWins || 0}-{selectedTeam?.totalLosses || 0}-{selectedTeam?.totalTies || 0}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Championships</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{selectedTeam?.championshipsWon || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedTeam?.playoffAppearances || 0} playoff appearances
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatDecimal(selectedTeam?.avgPointsFor || 0, 1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDecimal(selectedTeam?.avgPointsAgainst || 0, 1)} allowed
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Season Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Season-by-Season Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={selectedTeam?.seasonPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              background: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="wins" fill={CHART_COLORS.success} name="Wins" />
                          <Bar dataKey="losses" fill={CHART_COLORS.tertiary} name="Losses" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Points Scoring Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Points Scoring Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={selectedTeam?.seasonPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              background: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="pointsFor"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            name="Points For"
                          />
                          <Line
                            type="monotone"
                            dataKey="pointsAgainst"
                            stroke={CHART_COLORS.tertiary}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4 }}
                            name="Points Against"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* Performance Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={[
                        {
                          category: 'Win Rate',
                          value: (selectedTeam?.winPercentage || 0) / 100,
                        },
                        {
                          category: 'Points For',
                          value: Math.min((selectedTeam?.avgPointsFor || 0) / 150, 1),
                        },
                        {
                          category: 'Points Against',
                          value: Math.max(1 - ((selectedTeam?.avgPointsAgainst || 150) / 150), 0),
                        },
                        {
                          category: 'Playoff Rate',
                          value: selectedTeam?.totalSeasons ? 
                            (selectedTeam.playoffAppearances / selectedTeam.totalSeasons) : 0,
                        },
                        {
                          category: 'Championship Rate',
                          value: selectedTeam?.totalSeasons ? 
                            (selectedTeam.championshipsWon / selectedTeam.totalSeasons) : 0,
                        },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis 
                          angle={18} 
                          domain={[0, 1]} 
                          tick={false}
                        />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke={CHART_COLORS.primary}
                          fill={CHART_COLORS.primary}
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {/* Year-over-Year Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Year-over-Year Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedTeam?.seasonPerformance?.slice(-3).map((season, index, array) => {
                        const prevSeason = array[index - 1];
                        const winPercentage = season.wins / (season.wins + season.losses + season.ties);
                        const prevWinPercentage = prevSeason ? 
                          prevSeason.wins / (prevSeason.wins + prevSeason.losses + prevSeason.ties) : 0;

                        return (
                          <div key={season.year} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-lg font-bold">{season.year}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant={season.finalStanding && season.finalStanding <= 3 ? 'default' : 'secondary'}>
                                  {season.finalStanding ? `#${season.finalStanding}` : 'N/A'}
                                </Badge>
                                {season.playoffResult && (
                                  <Badge 
                                    variant="outline"
                                    className={getWinLossColor(season.playoffResult)}
                                  >
                                    {season.playoffResult}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <div className="font-medium">
                                  {season.wins}-{season.losses}-{season.ties}
                                </div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  {formatPercentage(winPercentage)}
                                  {index > 0 && getPerformanceIcon(winPercentage, prevWinPercentage)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{formatDecimal(season.pointsFor, 1)}</div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  PF
                                  {index > 0 && getPerformanceIcon(season.pointsFor, prevSeason.pointsFor)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{formatDecimal(season.pointsAgainst, 1)}</div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  PA
                                  {index > 0 && getPerformanceIcon(prevSeason.pointsAgainst, season.pointsAgainst)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="space-y-6">
              {/* Historical Records */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Best Seasons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedTeam?.seasonPerformance
                          ?.sort((a, b) => {
                            const aWinPct = a.wins / (a.wins + a.losses + a.ties);
                            const bWinPct = b.wins / (b.wins + b.losses + b.ties);
                            return bWinPct - aWinPct;
                          })
                          .slice(0, 3)
                          .map((season, index) => {
                            const winPct = season.wins / (season.wins + season.losses + season.ties);
                            return (
                              <div key={season.year} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0 ? 'bg-yellow-500 text-white' :
                                    index === 1 ? 'bg-gray-400 text-white' :
                                    'bg-orange-500 text-white'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold">{season.year}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {season.wins}-{season.losses}-{season.ties}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">{formatPercentage(winPct)}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDecimal(season.pointsFor, 1)} PF
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Career Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Trophy className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Total Wins</span>
                          </div>
                          <span className="font-bold text-green-600">{selectedTeam?.totalWins}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Total Points</span>
                          </div>
                          <span className="font-bold text-blue-600">
                            {formatNumber(selectedTeam?.totalPointsFor || 0)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Crown className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Championships</span>
                          </div>
                          <span className="font-bold text-purple-600">{selectedTeam?.championshipsWon}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-orange-600" />
                            <span className="font-medium">Playoff Apps</span>
                          </div>
                          <span className="font-bold text-orange-600">{selectedTeam?.playoffAppearances}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}