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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Crown,
  Trophy,
  Medal,
  Star,
  Calendar,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  Award,
  Flame,
  Zap,
} from 'lucide-react';

const CHART_COLORS = {
  champion: '#FFD700', // Gold
  runnerup: '#C0C0C0', // Silver
  semifinal: '#CD7F32', // Bronze
  playoff: 'hsl(var(--chart-4))', // Blue
  regular: 'hsl(var(--muted))', // Muted
};

interface ChampionshipTrackerProps {
  className?: string;
}

export function ChampionshipTracker({ className }: ChampionshipTrackerProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch season comparisons (includes champion data)
  const {
    data: seasonComparisons,
    isLoading: seasonsLoading,
    error: seasonsError,
  } = useQuery({
    queryKey: ['season-comparisons'],
    queryFn: () => apiClient.getSeasonComparisons(),
  });

  // Fetch team performance data
  const {
    data: teamPerformance,
    isLoading: teamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ['team-performance'],
    queryFn: () => apiClient.getTeamPerformance(),
  });

  // Process championship data
  const championshipData = seasonComparisons?.map(season => ({
    year: season.year,
    champion: season.champion.name,
    championWins: season.mostWins.wins,
    totalGames: season.totalGames,
    avgPoints: season.averagePointsFor,
    highestScore: season.highestScoringTeam.points,
    lowestScore: season.lowestScoringTeam.points,
  })) || [];

  // Championship frequency
  const championFrequency = championshipData.reduce((acc, season) => {
    const champion = season.champion;
    acc[champion] = (acc[champion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const championFrequencyChart = Object.entries(championFrequency)
    .map(([team, count]) => ({ team, championships: count }))
    .sort((a, b) => b.championships - a.championships);

  // Playoff success analysis
  const playoffAnalysis = teamPerformance?.map(team => ({
    teamName: team.teamName,
    playoffAppearances: team.playoffAppearances,
    championshipsWon: team.championshipsWon,
    playoffRate: team.totalSeasons > 0 ? team.playoffAppearances / team.totalSeasons : 0,
    championshipRate: team.totalSeasons > 0 ? team.championshipsWon / team.totalSeasons : 0,
    totalSeasons: team.totalSeasons,
  })).sort((a, b) => b.championshipsWon - a.championshipsWon) || [];

  // Dynasty analysis (consecutive championships or multiple in short span)
  const dynastyAnalysis = () => {
    const dynasties: Array<{ team: string; years: number[]; type: string }> = [];
    
    // Check for consecutive championships
    for (let i = 0; i < championshipData.length - 1; i++) {
      const current = championshipData[i];
      const next = championshipData[i + 1];
      
      if (current.champion === next.champion && Math.abs(current.year - next.year) === 1) {
        const existingDynasty = dynasties.find(d => d.team === current.champion && d.type === 'consecutive');
        if (existingDynasty) {
          if (!existingDynasty.years.includes(current.year)) existingDynasty.years.push(current.year);
          if (!existingDynasty.years.includes(next.year)) existingDynasty.years.push(next.year);
        } else {
          dynasties.push({
            team: current.champion,
            years: [current.year, next.year],
            type: 'consecutive'
          });
        }
      }
    }

    // Check for multiple championships in 3-year span
    Object.entries(championFrequency).forEach(([team, count]) => {
      if (count >= 2) {
        const teamYears = championshipData.filter(s => s.champion === team).map(s => s.year).sort();
        for (let i = 0; i < teamYears.length - 1; i++) {
          if (teamYears[i + 1] - teamYears[i] <= 3) {
            const existingDynasty = dynasties.find(d => d.team === team && d.type === 'dominant');
            if (!existingDynasty) {
              dynasties.push({
                team,
                years: teamYears,
                type: 'dominant'
              });
            }
          }
        }
      }
    });

    return dynasties;
  };

  const dynasties = dynastyAnalysis();

  if (seasonsError || teamsError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load championship data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Championship Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card-hover championship-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Championships</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {seasonsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{championshipData.length}</div>
                <p className="text-xs text-muted-foreground">
                  {championshipData.length} seasons completed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Championships</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {seasonsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-lg font-bold truncate">
                  {championFrequencyChart[0]?.team || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {championFrequencyChart[0]?.championships || 0} titles
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dynasties Found</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {seasonsLoading || teamsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dynasties.length}</div>
                <p className="text-xs text-muted-foreground">
                  Multi-year dominance
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Playoff Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {teamsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatPercentage(
                    playoffAnalysis.reduce((sum, team) => sum + team.playoffRate, 0) / 
                    (playoffAnalysis.length || 1)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  League average
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Championship Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="dynasties">Dynasties</TabsTrigger>
          <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Championship Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Championship Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seasonsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={championFrequencyChart}
                        dataKey="championships"
                        nameKey="team"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ team, championships }) => `${team}: ${championships}`}
                      >
                        {championFrequencyChart.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Playoff Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Playoff Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={playoffAnalysis.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="teamName" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        interval={0}
                        fontSize={12}
                      />
                      <YAxis tickFormatter={formatPercentage} />
                      <Tooltip
                        formatter={(value, name) => [
                          formatPercentage(Number(value)),
                          name === 'playoffRate' ? 'Playoff Rate' : 'Championship Rate'
                        ]}
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="playoffRate" fill={CHART_COLORS.playoff} name="Playoff Rate" />
                      <Bar dataKey="championshipRate" fill={CHART_COLORS.champion} name="Championship Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {/* Championship Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Championship Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seasonsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {championshipData
                    .sort((a, b) => b.year - a.year)
                    .map((season, index) => (
                      <div
                        key={season.year}
                        className="relative flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-white font-bold">
                            {season.year}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Crown className="h-5 w-5 text-yellow-600" />
                              <span className="font-bold text-lg">{season.champion}</span>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Champion
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatNumber(season.totalGames)} games • 
                              {formatDecimal(season.avgPoints, 1)} avg pts • 
                              High: {formatDecimal(season.highestScore, 1)}
                            </div>
                          </div>
                        </div>
                        {index === 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Most Recent
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dynasties" className="space-y-6">
          {/* Dynasty Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Dynasty Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seasonsLoading || teamsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : dynasties.length > 0 ? (
                <div className="space-y-4">
                  {dynasties.map((dynasty, index) => (
                    <div
                      key={`${dynasty.team}-${dynasty.type}-${index}`}
                      className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Flame className="h-6 w-6 text-red-500" />
                          <div>
                            <div className="font-bold text-lg">{dynasty.team}</div>
                            <div className="text-sm text-muted-foreground">
                              {dynasty.type === 'consecutive' ? 'Consecutive Championships' : 'Dominant Era'}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="bg-red-100 text-red-800 border-red-300"
                        >
                          Dynasty
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Years:</span>
                        <div className="flex gap-1">
                          {dynasty.years.sort().map(year => (
                            <Badge key={year} variant="secondary" className="text-xs">
                              {year}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No dynasties detected in the current data.</p>
                  <p className="text-sm">Dynasties require consecutive championships or multiple titles in short spans.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playoffs" className="space-y-6">
          {/* Playoff Performance Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Championship Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playoffAnalysis
                      .filter(team => team.playoffAppearances > 0)
                      .sort((a, b) => b.championshipRate - a.championshipRate)
                      .slice(0, 8)
                      .map((team, index) => (
                        <div key={team.teamName} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-orange-500 text-white' :
                              'bg-muted text-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{team.teamName}</div>
                              <div className="text-xs text-muted-foreground">
                                {team.championshipsWon}/{team.playoffAppearances} conversions
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatPercentage(team.championshipRate)}</div>
                            <div className="text-xs text-muted-foreground">efficiency</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Playoff Consistency</CardTitle>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playoffAnalysis
                      .sort((a, b) => b.playoffRate - a.playoffRate)
                      .slice(0, 8)
                      .map((team, index) => (
                        <div key={team.teamName} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-green-500 text-white' :
                              index === 1 ? 'bg-blue-500 text-white' :
                              index === 2 ? 'bg-purple-500 text-white' :
                              'bg-muted text-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{team.teamName}</div>
                              <div className="text-xs text-muted-foreground">
                                {team.playoffAppearances}/{team.totalSeasons} seasons
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatPercentage(team.playoffRate)}</div>
                            <div className="text-xs text-muted-foreground">playoff rate</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}