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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Sword,
  Trophy,
  Target,
  AlertCircle,
  Crown,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Activity,
  Swords,
} from 'lucide-react';

const CHART_COLORS = {
  team1: 'hsl(var(--chart-1))',
  team2: 'hsl(var(--chart-2))',
  neutral: 'hsl(var(--chart-3))',
};

interface HeadToHeadComparisonProps {
  className?: string;
}

export function HeadToHeadComparison({ className }: HeadToHeadComparisonProps) {
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');

  // Fetch teams list
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => apiClient.getTeamsList(),
  });

  // Fetch team performance data for both teams
  const { data: team1Performance, isLoading: team1Loading } = useQuery({
    queryKey: ['team-performance', team1Id],
    queryFn: () => apiClient.getTeamPerformance(team1Id),
    enabled: !!team1Id,
  });

  const { data: team2Performance, isLoading: team2Loading } = useQuery({
    queryKey: ['team-performance', team2Id],
    queryFn: () => apiClient.getTeamPerformance(team2Id),
    enabled: !!team2Id,
  });

  // Fetch head-to-head record
  const { data: headToHeadData, isLoading: h2hLoading } = useQuery({
    queryKey: ['head-to-head', team1Id, team2Id],
    queryFn: () => apiClient.getHeadToHeadRecord(team1Id, team2Id),
    enabled: !!team1Id && !!team2Id,
  });

  const team1 = team1Performance?.[0];
  const team2 = team2Performance?.[0];

  const comparisonData = team1 && team2 ? [
    {
      category: 'Win %',
      team1: team1.winPercentage,
      team2: team2.winPercentage,
    },
    {
      category: 'Avg PF',
      team1: team1.avgPointsFor,
      team2: team2.avgPointsFor,
    },
    {
      category: 'Avg PA',
      team1: team1.avgPointsAgainst,
      team2: team2.avgPointsAgainst,
    },
    {
      category: 'Championships',
      team1: team1.championshipsWon,
      team2: team2.championshipsWon,
    },
    {
      category: 'Playoff Apps',
      team1: team1.playoffAppearances,
      team2: team2.playoffAppearances,
    },
  ] : [];

  const radarData = team1 && team2 ? [
    {
      category: 'Win Rate',
      team1: team1.winPercentage / 100,
      team2: team2.winPercentage / 100,
    },
    {
      category: 'Offense',
      team1: Math.min(team1.avgPointsFor / 150, 1),
      team2: Math.min(team2.avgPointsFor / 150, 1),
    },
    {
      category: 'Defense',
      team1: Math.max(1 - (team1.avgPointsAgainst / 150), 0),
      team2: Math.max(1 - (team2.avgPointsAgainst / 150), 0),
    },
    {
      category: 'Championship Success',
      team1: team1.totalSeasons ? team1.championshipsWon / team1.totalSeasons : 0,
      team2: team2.totalSeasons ? team2.championshipsWon / team2.totalSeasons : 0,
    },
    {
      category: 'Playoff Success',
      team1: team1.totalSeasons ? team1.playoffAppearances / team1.totalSeasons : 0,
      team2: team2.totalSeasons ? team2.playoffAppearances / team2.totalSeasons : 0,
    },
  ] : [];

  const seasonComparisonData = team1 && team2 ? 
    team1.seasonPerformance.map(season1 => {
      const season2 = team2.seasonPerformance.find(s => s.year === season1.year);
      return {
        year: season1.year,
        team1Wins: season1.wins,
        team2Wins: season2?.wins || 0,
        team1Points: season1.pointsFor,
        team2Points: season2?.pointsFor || 0,
      };
    }).filter(data => data.team2Wins > 0) : [];

  const swapTeams = () => {
    const temp = team1Id;
    setTeam1Id(team2Id);
    setTeam2Id(temp);
  };

  const resetComparison = () => {
    setTeam1Id('');
    setTeam2Id('');
  };

  return (
    <div className="space-y-6">
      {/* Team Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Head-to-Head Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
            {/* Team 1 Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Team 1</label>
              {teamsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={team1Id} onValueChange={setTeam1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(teams) ? teams : []).filter((team: any) => team.id !== team2Id).map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* VS Icon */}
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                <Swords className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Team 2 Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Team 2</label>
              {teamsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={team2Id} onValueChange={setTeam2Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(teams) ? teams : []).filter((team: any) => team.id !== team1Id).map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={swapTeams}
                disabled={!team1Id || !team2Id}
                className="flex-1"
              >
                Swap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetComparison}
                disabled={!team1Id && !team2Id}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {team1Id && team2Id && (
        <>
          {/* Head-to-Head Record */}
          {headToHeadData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Direct Matchup Record
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {headToHeadData?.team1Wins || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {team1?.teamName} Wins
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {headToHeadData?.totalGames || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Games
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {headToHeadData?.team2Wins || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {team2?.teamName} Wins
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Percentage</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 font-medium">{team1?.teamName}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPercentage(team1?.winPercentage || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 font-medium">{team2?.teamName}</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatPercentage(team2?.winPercentage || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Points For</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 font-medium">{team1?.teamName}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatDecimal(team1?.avgPointsFor || 0, 1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 font-medium">{team2?.teamName}</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatDecimal(team2?.avgPointsFor || 0, 1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Championships</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 font-medium">{team1?.teamName}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {team1?.championshipsWon || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 font-medium">{team2?.teamName}</span>
                    <span className="text-lg font-bold text-red-600">
                      {team2?.championshipsWon || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Playoff Apps</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600 font-medium">{team1?.teamName}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {team1?.playoffAppearances || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600 font-medium">{team2?.teamName}</span>
                    <span className="text-lg font-bold text-red-600">
                      {team2?.playoffAppearances || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Comparisons */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Profile Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {team1Loading || team2Loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis 
                        angle={18} 
                        domain={[0, 1]} 
                        tick={false}
                      />
                      <Radar
                        name={team1?.teamName}
                        dataKey="team1"
                        stroke={CHART_COLORS.team1}
                        fill={CHART_COLORS.team1}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name={team2?.teamName}
                        dataKey="team2"
                        stroke={CHART_COLORS.team2}
                        fill={CHART_COLORS.team2}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Statistical Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Statistical Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {team1Loading || team2Loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar
                        dataKey="team1"
                        fill={CHART_COLORS.team1}
                        name={team1?.teamName}
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="team2"
                        fill={CHART_COLORS.team2}
                        name={team2?.teamName}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Season-by-Season Comparison */}
          {seasonComparisonData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Season-by-Season Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={seasonComparisonData}>
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
                        dataKey="team1Points"
                        stroke={CHART_COLORS.team1}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        name={`${team1?.teamName} Points`}
                      />
                      <Line
                        type="monotone"
                        dataKey="team2Points"
                        stroke={CHART_COLORS.team2}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        name={`${team2?.teamName} Points`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Weaknesses */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {team1?.teamName} Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                  <span className="text-sm font-medium">Strongest Area</span>
                  <Badge variant="secondary">
                    {(team1?.avgPointsFor || 0) > (team1?.avgPointsAgainst || 0) ? 'Offense' : 'Defense'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <span className="text-sm font-medium">Championship Rate</span>
                  <span className="font-semibold">
                    {team1?.totalSeasons ? 
                      formatPercentage(team1.championshipsWon / team1.totalSeasons) : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                  <span className="text-sm font-medium">Playoff Rate</span>
                  <span className="font-semibold">
                    {team1?.totalSeasons ? 
                      formatPercentage(team1.playoffAppearances / team1.totalSeasons) : '0%'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  {team2?.teamName} Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                  <span className="text-sm font-medium">Strongest Area</span>
                  <Badge variant="secondary">
                    {(team2?.avgPointsFor || 0) > (team2?.avgPointsAgainst || 0) ? 'Offense' : 'Defense'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <span className="text-sm font-medium">Championship Rate</span>
                  <span className="font-semibold">
                    {team2?.totalSeasons ? 
                      formatPercentage(team2.championshipsWon / team2.totalSeasons) : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                  <span className="text-sm font-medium">Playoff Rate</span>
                  <span className="font-semibold">
                    {team2?.totalSeasons ? 
                      formatPercentage(team2.playoffAppearances / team2.totalSeasons) : '0%'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}