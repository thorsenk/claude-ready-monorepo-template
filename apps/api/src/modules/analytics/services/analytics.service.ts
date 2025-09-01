import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

export interface HeadToHeadRecord {
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  team1Wins: number;
  team2Wins: number;
  ties: number;
  totalGames: number;
  team1AvgScore: number;
  team2AvgScore: number;
  lastMeeting: {
    week: number;
    year: number;
    winner: string;
    score: string;
  } | null;
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

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeagueOverview(): Promise<LeagueOverview> {
    // Get total counts
    const [seasonsCount, teamsCount, gamesCount, league] = await Promise.all([
      this.prisma.season.count(),
      this.prisma.team.count(),
      this.prisma.matchup.count(),
      this.prisma.league.findFirst({
        select: { dataQualityScore: true }
      })
    ]);

    // Get seasons data
    const seasonsData = await this.prisma.season.findMany({
      select: {
        year: true,
        isComplete: true,
        _count: {
          select: {
            weeks: true
          }
        }
      },
      orderBy: { year: 'asc' }
    });

    // Get games count per season
    const seasonsWithGames = await Promise.all(
      seasonsData.map(async (season) => {
        const gamesCount = await this.prisma.matchup.count({
          where: {
            week: {
              season: {
                year: season.year
              }
            }
          }
        });

        const teamsCount = await this.prisma.teamSeason.count({
          where: { seasonYear: season.year }
        });

        return {
          year: season.year,
          teamsCount,
          gamesCount,
          isComplete: season.isComplete
        };
      })
    );

    return {
      totalSeasons: seasonsCount,
      totalTeams: teamsCount,
      totalGames: gamesCount,
      dataQuality: league?.dataQualityScore || 0,
      seasonsData: seasonsWithGames
    };
  }

  async getTeamPerformance(teamId?: string): Promise<TeamPerformance[]> {
    const whereClause = teamId ? { teamId } : {};
    
    const teamSeasons = await this.prisma.teamSeason.findMany({
      where: whereClause,
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [{ team: { name: 'asc' } }, { seasonYear: 'asc' }]
    });

    // Group by team
    const teamData = new Map<string, any>();

    teamSeasons.forEach(ts => {
      const teamId = ts.team.id;
      
      if (!teamData.has(teamId)) {
        teamData.set(teamId, {
          teamId,
          teamName: ts.team.name,
          totalSeasons: 0,
          totalWins: 0,
          totalLosses: 0,
          totalTies: 0,
          totalPointsFor: 0,
          totalPointsAgainst: 0,
          championshipsWon: 0,
          playoffAppearances: 0,
          seasonPerformance: []
        });
      }

      const teamInfo = teamData.get(teamId);
      teamInfo.totalSeasons++;
      teamInfo.totalWins += ts.regularSeasonWins;
      teamInfo.totalLosses += ts.regularSeasonLosses;
      teamInfo.totalTies += ts.regularSeasonTies;
      teamInfo.totalPointsFor += ts.pointsFor;
      teamInfo.totalPointsAgainst += ts.pointsAgainst;
      
      if (ts.finalStanding === 1) teamInfo.championshipsWon++;
      if (ts.playoffResult) teamInfo.playoffAppearances++;

      teamInfo.seasonPerformance.push({
        year: ts.seasonYear,
        wins: ts.regularSeasonWins,
        losses: ts.regularSeasonLosses,
        ties: ts.regularSeasonTies,
        pointsFor: ts.pointsFor,
        pointsAgainst: ts.pointsAgainst,
        finalStanding: ts.finalStanding,
        playoffResult: ts.playoffResult
      });
    });

    return Array.from(teamData.values()).map(team => ({
      ...team,
      winPercentage: team.totalWins / (team.totalWins + team.totalLosses + team.totalTies),
      avgPointsFor: team.totalPointsFor / team.totalSeasons,
      avgPointsAgainst: team.totalPointsAgainst / team.totalSeasons
    }));
  }

  async getHeadToHeadRecord(team1Id: string, team2Id: string): Promise<HeadToHeadRecord | null> {
    const [team1, team2] = await Promise.all([
      this.prisma.team.findUnique({ where: { id: team1Id }, select: { id: true, name: true } }),
      this.prisma.team.findUnique({ where: { id: team2Id }, select: { id: true, name: true } })
    ]);

    if (!team1 || !team2) return null;

    const matchups = await this.prisma.matchup.findMany({
      where: {
        OR: [
          { homeTeamId: team1Id, awayTeamId: team2Id },
          { homeTeamId: team2Id, awayTeamId: team1Id }
        ],
        isComplete: true
      },
      include: {
        week: {
          include: {
            season: {
              select: { year: true }
            }
          }
        }
      },
      orderBy: {
        week: {
          season: {
            year: 'desc'
          }
        }
      }
    });

    let team1Wins = 0;
    let team2Wins = 0;
    let ties = 0;
    let team1TotalScore = 0;
    let team2TotalScore = 0;
    let lastMeeting = null;

    matchups.forEach((matchup, index) => {
      let team1Score, team2Score;
      
      if (matchup.homeTeamId === team1Id) {
        team1Score = matchup.homeScore;
        team2Score = matchup.awayScore;
      } else {
        team1Score = matchup.awayScore;
        team2Score = matchup.homeScore;
      }

      team1TotalScore += team1Score;
      team2TotalScore += team2Score;

      if (team1Score > team2Score) {
        team1Wins++;
      } else if (team2Score > team1Score) {
        team2Wins++;
      } else {
        ties++;
      }

      if (index === 0) { // Most recent game
        lastMeeting = {
          week: matchup.week.weekNumber,
          year: matchup.week.season.year,
          winner: team1Score > team2Score ? team1.name : team2Score > team1Score ? team2.name : 'Tie',
          score: `${team1Score} - ${team2Score}`
        };
      }
    });

    const totalGames = matchups.length;

    return {
      team1Id,
      team1Name: team1.name,
      team2Id,
      team2Name: team2.name,
      team1Wins,
      team2Wins,
      ties,
      totalGames,
      team1AvgScore: totalGames > 0 ? team1TotalScore / totalGames : 0,
      team2AvgScore: totalGames > 0 ? team2TotalScore / totalGames : 0,
      lastMeeting
    };
  }

  async getSeasonComparisons(): Promise<SeasonComparison[]> {
    const seasons = await this.prisma.season.findMany({
      select: { year: true },
      orderBy: { year: 'asc' }
    });

    const seasonComparisons = await Promise.all(
      seasons.map(async (season) => {
        const teamSeasons = await this.prisma.teamSeason.findMany({
          where: { seasonYear: season.year },
          include: {
            team: {
              select: { name: true }
            }
          }
        });

        const matchups = await this.prisma.matchup.findMany({
          where: {
            week: {
              season: {
                year: season.year
              }
            },
            isComplete: true
          }
        });

        const totalPointsFor = teamSeasons.reduce((sum, ts) => sum + ts.pointsFor, 0);
        const averagePointsFor = totalPointsFor / teamSeasons.length;

        const highestScoringTeam = teamSeasons.reduce((max, ts) => 
          ts.pointsFor > max.pointsFor ? ts : max
        );

        const lowestScoringTeam = teamSeasons.reduce((min, ts) => 
          ts.pointsFor < min.pointsFor ? ts : min
        );

        const mostWins = teamSeasons.reduce((max, ts) => 
          ts.regularSeasonWins > max.regularSeasonWins ? ts : max
        );

        const champion = teamSeasons.find(ts => ts.finalStanding === 1);

        // Calculate average margin of victory
        const margins = matchups.map(m => Math.abs(m.homeScore - m.awayScore));
        const averageMarginOfVictory = margins.length > 0 ? 
          margins.reduce((sum, margin) => sum + margin, 0) / margins.length : 0;

        return {
          year: season.year,
          averagePointsFor,
          highestScoringTeam: {
            name: highestScoringTeam.team.name,
            points: highestScoringTeam.pointsFor
          },
          lowestScoringTeam: {
            name: lowestScoringTeam.team.name,
            points: lowestScoringTeam.pointsFor
          },
          mostWins: {
            name: mostWins.team.name,
            wins: mostWins.regularSeasonWins
          },
          champion: champion ? {
            name: champion.team.name,
            finalStanding: champion.finalStanding
          } : { name: 'Unknown', finalStanding: 0 },
          totalGames: matchups.length,
          averageMarginOfVictory
        };
      })
    );

    return seasonComparisons;
  }

  async getScoringAnalysis() {
    const teamSeasons = await this.prisma.teamSeason.findMany({
      include: {
        team: { select: { name: true } }
      },
      orderBy: { pointsFor: 'desc' }
    });

    const allScores = teamSeasons.map(ts => ts.pointsFor);
    const totalPoints = allScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalPoints / allScores.length;
    
    // Calculate percentiles
    const sortedScores = [...allScores].sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * sortedScores.length) - 1;
      return sortedScores[index];
    };

    return {
      totalSeasons: teamSeasons.length,
      averageScore,
      highestScore: Math.max(...allScores),
      lowestScore: Math.min(...allScores),
      percentile25: getPercentile(25),
      percentile50: getPercentile(50),
      percentile75: getPercentile(75),
      percentile90: getPercentile(90),
      standardDeviation: Math.sqrt(
        allScores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / allScores.length
      ),
      topPerformers: teamSeasons.slice(0, 10).map(ts => ({
        teamName: ts.team.name,
        season: ts.seasonYear,
        pointsFor: ts.pointsFor,
        wins: ts.regularSeasonWins
      })),
      scoreDistribution: {
        '0-1000': allScores.filter(s => s < 1000).length,
        '1000-1200': allScores.filter(s => s >= 1000 && s < 1200).length,
        '1200-1400': allScores.filter(s => s >= 1200 && s < 1400).length,
        '1400-1600': allScores.filter(s => s >= 1400 && s < 1600).length,
        '1600+': allScores.filter(s => s >= 1600).length
      }
    };
  }

  async getTeamsList() {
    return this.prisma.team.findMany({
      select: {
        id: true,
        name: true,
        ownerName: true,
        _count: {
          select: {
            teamSeasons: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getSeasonsList() {
    return this.prisma.season.findMany({
      select: {
        year: true,
        isComplete: true,
        _count: {
          select: {
            teamSeasons: true
          }
        }
      },
      orderBy: { year: 'desc' }
    });
  }
}