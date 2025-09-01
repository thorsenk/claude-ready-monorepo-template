const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LeagueOverview {
  totalSeasons: number;
  totalTeams: number;
  totalGames: number;
  dataQuality: number;
  seasonsData: {
    year: number;
    teamsCount: number;
    gamesCount: number;
    isComplete: boolean;
  }[];
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  totalSeasons: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  winPercentage: number;
  totalPointsFor: number;
  totalPointsAgainst: number;
  avgPointsFor: number;
  avgPointsAgainst: number;
  championshipsWon: number;
  playoffAppearances: number;
  seasonPerformance: {
    year: number;
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    finalStanding: number | null;
    playoffResult: string | null;
  }[];
}

export interface SeasonComparison {
  year: number;
  averagePointsFor: number;
  highestScoringTeam: { name: string; points: number };
  lowestScoringTeam: { name: string; points: number };
  mostWins: { name: string; wins: number };
  champion: { name: string; finalStanding: number };
  totalGames: number;
  averageMarginOfVictory: number;
}

export interface ScoringAnalysis {
  totalSeasons: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  standardDeviation: number;
  topPerformers: {
    teamName: string;
    season: number;
    pointsFor: number;
    wins: number;
  }[];
  scoreDistribution: Record<string, number>;
}

class ApiClient {
  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getLeagueOverview(): Promise<LeagueOverview> {
    return this.request<LeagueOverview>('/analytics/league-overview');
  }

  async getTeamPerformance(teamId?: string): Promise<TeamPerformance[]> {
    const query = teamId ? `?teamId=${teamId}` : '';
    return this.request<TeamPerformance[]>(`/analytics/team-performance${query}`);
  }

  async getSeasonComparisons(): Promise<SeasonComparison[]> {
    return this.request<SeasonComparison[]>('/analytics/season-comparisons');
  }

  async getScoringAnalysis(): Promise<ScoringAnalysis> {
    return this.request<ScoringAnalysis>('/analytics/scoring-analysis');
  }

  async getTeamsList() {
    return this.request('/analytics/teams');
  }

  async getSeasonsList() {
    return this.request('/analytics/seasons');
  }

  async getHeadToHeadRecord(team1Id: string, team2Id: string) {
    return this.request(`/analytics/head-to-head/${team1Id}/${team2Id}`);
  }
}

export const apiClient = new ApiClient();