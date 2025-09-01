import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('league-overview')
  async getLeagueOverview() {
    return this.analyticsService.getLeagueOverview();
  }

  @Get('team-performance')
  async getTeamPerformance(@Query('teamId') teamId?: string) {
    return this.analyticsService.getTeamPerformance(teamId);
  }

  @Get('head-to-head/:team1Id/:team2Id')
  async getHeadToHeadRecord(
    @Param('team1Id') team1Id: string,
    @Param('team2Id') team2Id: string,
  ) {
    return this.analyticsService.getHeadToHeadRecord(team1Id, team2Id);
  }

  @Get('season-comparisons')
  async getSeasonComparisons() {
    return this.analyticsService.getSeasonComparisons();
  }

  @Get('scoring-analysis')
  async getScoringAnalysis() {
    return this.analyticsService.getScoringAnalysis();
  }

  @Get('teams')
  async getTeamsList() {
    return this.analyticsService.getTeamsList();
  }

  @Get('seasons')
  async getSeasonsList() {
    return this.analyticsService.getSeasonsList();
  }
}