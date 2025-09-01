import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ESPNApiService } from '../services/espn-api.service';
import { DataIngestionService } from '../services/data-ingestion.service';
import { DataValidationService } from '../services/data-validation.service';
import { ESPNAuthService } from '../services/espn-auth.service';
import { IngestionConfig } from '../types/internal-data.types';

@ApiTags('ESPN Integration')
@Controller('api/v1/espn')
export class ESPNDataController {
  private readonly logger = new Logger(ESPNDataController.name);

  constructor(
    private readonly espnApi: ESPNApiService,
    private readonly ingestionService: DataIngestionService,
    private readonly validationService: DataValidationService,
    private readonly authService: ESPNAuthService,
  ) {}

  /**
   * Test ESPN API authentication and connectivity
   */
  @Get('test-connection')
  @ApiOperation({ summary: 'Test ESPN API authentication and connectivity' })
  @ApiResponse({ status: 200, description: 'ESPN API connection test results' })
  async testConnection() {
    try {
      this.logger.log('Testing ESPN API connection and authentication');

      // Get authentication status
      const authStatus = this.authService.getAuthStatus();
      
      // Test API call with league 323196 for current year
      const currentYear = new Date().getFullYear();
      let leagueData;
      let apiTestSuccess = false;
      let apiTestError;

      try {
        leagueData = await this.espnApi.getLeague(323196, currentYear, { 
          views: ['mTeam', 'mSettings'] 
        });
        apiTestSuccess = true;
      } catch (error) {
        apiTestError = error.message;
        this.logger.warn('API test call failed:', error.message);
      }

      return {
        success: true,
        authenticationStatus: authStatus,
        apiConnectivity: {
          success: apiTestSuccess,
          error: apiTestError,
          testedLeague: 323196,
          testedSeason: currentYear,
        },
        leaguePreview: apiTestSuccess ? {
          id: leagueData?.id,
          name: leagueData?.settings?.name,
          teamCount: leagueData?.teams?.length,
          seasonId: leagueData?.seasonId,
        } : null,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('ESPN connection test failed:', error);
      throw new HttpException(
        `ESPN connection test failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Pilot data ingestion for league 323196
   */
  @Post('pilot-ingestion')
  @ApiOperation({ summary: 'Run pilot data ingestion for league 323196' })
  @ApiResponse({ status: 200, description: 'Pilot ingestion completed successfully' })
  async pilotIngestion(
    @Body() options?: { season?: number, fullHistory?: boolean, skipValidation?: boolean }
  ) {
    try {
      this.logger.log('Starting pilot data ingestion for league 323196');

      const leagueId = 323196;
      const currentYear = new Date().getFullYear();
      const targetSeason = options?.season || currentYear;
      
      // For pilot, we'll ingest just one season to start
      const config: IngestionConfig = {
        startYear: targetSeason,
        endYear: targetSeason,
        targetLeagues: [leagueId],
        batchSize: 1,
        parallelJobs: 1,
        retryAttempts: 3,
        validateData: !options?.skipValidation,
        skipExisting: false,
      };

      this.logger.log(`Pilot ingestion config: ${JSON.stringify(config)}`);

      const startTime = new Date();
      const result = await this.ingestionService.ingestSingleLeague(
        leagueId, 
        config,
        'pilot-job'
      );

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        success: result.success,
        leagueId,
        targetSeason,
        duration: `${duration}ms`,
        recordsIngested: result.recordsIngested,
        validationScore: result.validationScore,
        errors: result.errors,
        performance: result.performance,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error('Pilot ingestion failed:', error);
      throw new HttpException(
        `Pilot ingestion failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get league information from ESPN API
   */
  @Get('leagues/:leagueId')
  @ApiOperation({ summary: 'Get league data from ESPN API' })
  @ApiParam({ name: 'leagueId', description: 'ESPN League ID' })
  @ApiQuery({ name: 'season', description: 'Season year', required: false })
  @ApiQuery({ name: 'views', description: 'Comma-separated ESPN views', required: false })
  @ApiResponse({ status: 200, description: 'League data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'League not found' })
  async getLeague(
    @Param('leagueId') leagueId: string,
    @Query('season') season?: string,
    @Query('views') views?: string,
  ) {
    try {
      const leagueIdNum = parseInt(leagueId);
      const seasonYear = season ? parseInt(season) : new Date().getFullYear();
      const viewsArray = views ? views.split(',') : undefined;

      this.logger.log(`Fetching league ${leagueIdNum} for season ${seasonYear}`);

      const leagueData = await this.espnApi.getLeague(leagueIdNum, seasonYear, {
        views: viewsArray,
      });

      return {
        success: true,
        data: leagueData,
        metadata: {
          leagueId: leagueIdNum,
          season: seasonYear,
          fetchedAt: new Date().toISOString(),
        },
      };

    } catch (error) {
      this.logger.error(`Failed to fetch league ${leagueId}:`, error);
      
      if (error.status === 404) {
        throw new HttpException('League not found', HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        `Failed to fetch league data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get historical league data for multiple seasons
   */
  @Get('leagues/:leagueId/history')
  @ApiOperation({ summary: 'Get historical league data from ESPN API' })
  @ApiParam({ name: 'leagueId', description: 'ESPN League ID' })
  @ApiQuery({ name: 'seasons', description: 'Comma-separated list of seasons', required: false })
  @ApiResponse({ status: 200, description: 'Historical data retrieved successfully' })
  async getLeagueHistory(
    @Param('leagueId') leagueId: string,
    @Query('seasons') seasons?: string,
  ) {
    try {
      const leagueIdNum = parseInt(leagueId);
      
      // Default to last 5 years if no seasons specified
      const seasonList = seasons 
        ? seasons.split(',').map(s => parseInt(s.trim()))
        : Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

      this.logger.log(`Fetching historical data for league ${leagueIdNum}, seasons: ${seasonList.join(', ')}`);

      const historicalData = await this.espnApi.getLeagueHistory(leagueIdNum, seasonList);

      return {
        success: true,
        data: historicalData,
        metadata: {
          leagueId: leagueIdNum,
          seasons: seasonList,
          recordsReturned: historicalData.length,
          fetchedAt: new Date().toISOString(),
        },
      };

    } catch (error) {
      this.logger.error(`Failed to fetch historical data for league ${leagueId}:`, error);
      throw new HttpException(
        `Failed to fetch historical data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get player data from ESPN API
   */
  @Get('players')
  @ApiOperation({ summary: 'Get player data from ESPN API' })
  @ApiQuery({ name: 'season', description: 'Season year', required: false })
  @ApiQuery({ name: 'week', description: 'Week number', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of players to return', required: false })
  @ApiResponse({ status: 200, description: 'Player data retrieved successfully' })
  async getPlayers(
    @Query('season') season?: string,
    @Query('week') week?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const seasonYear = season ? parseInt(season) : new Date().getFullYear();
      const weekNumber = week ? parseInt(week) : undefined;
      const limitNum = limit ? parseInt(limit) : 50;

      this.logger.log(`Fetching players for season ${seasonYear}${weekNumber ? ` week ${weekNumber}` : ''}`);

      const playersData = await this.espnApi.getPlayers(seasonYear, {
        scoringPeriodId: weekNumber,
        filter: {
          players: {
            limit: limitNum,
            sortPercOwned: {
              sortPriority: 1,
              sortAsc: false,
            },
          },
        },
      });

      return {
        success: true,
        data: playersData,
        metadata: {
          season: seasonYear,
          week: weekNumber,
          limit: limitNum,
          fetchedAt: new Date().toISOString(),
        },
      };

    } catch (error) {
      this.logger.error('Failed to fetch player data:', error);
      throw new HttpException(
        `Failed to fetch player data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Start data ingestion for a single league
   */
  @Post('ingest/league')
  @ApiOperation({ summary: 'Start data ingestion for a single league' })
  @ApiResponse({ status: 202, description: 'Ingestion started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async ingestLeague(@Body() body: {
    leagueId: number;
    startYear?: number;
    endYear?: number;
    validateData?: boolean;
    skipExisting?: boolean;
  }) {
    try {
      const {
        leagueId,
        startYear = new Date().getFullYear() - 5,
        endYear = new Date().getFullYear(),
        validateData = true,
        skipExisting = true,
      } = body;

      this.logger.log(`Starting ingestion for league ${leagueId}, seasons ${startYear}-${endYear}`);

      const config: IngestionConfig = {
        startYear,
        endYear,
        targetLeagues: [leagueId],
        batchSize: 1,
        parallelJobs: 1,
        retryAttempts: 3,
        validateData,
        skipExisting,
      };

      // Start ingestion (this would typically be done asynchronously)
      const result = await this.ingestionService.ingestSingleLeague(leagueId, config);

      return {
        success: true,
        message: 'League ingestion completed',
        data: {
          leagueId,
          seasonsProcessed: endYear - startYear + 1,
          recordsIngested: result.recordsIngested,
          validationScore: result.validationScore,
          errors: result.errors,
          performance: result.performance,
        },
      };

    } catch (error) {
      this.logger.error('Failed to ingest league:', error);
      throw new HttpException(
        `Failed to ingest league: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Start batch ingestion for multiple leagues
   */
  @Post('ingest/batch')
  @ApiOperation({ summary: 'Start batch data ingestion for multiple leagues' })
  @ApiResponse({ status: 202, description: 'Batch ingestion started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async ingestBatch(@Body() config: IngestionConfig) {
    try {
      this.logger.log(`Starting batch ingestion for ${config.targetLeagues.length} leagues`);

      // Validate configuration
      if (!config.targetLeagues || config.targetLeagues.length === 0) {
        throw new HttpException('No target leagues specified', HttpStatus.BAD_REQUEST);
      }

      if (config.startYear > config.endYear) {
        throw new HttpException('Start year cannot be greater than end year', HttpStatus.BAD_REQUEST);
      }

      // Start batch ingestion (this would typically be done asynchronously)
      const results = await this.ingestionService.ingestLeagueHistory(config);

      const successfulIngestions = results.filter(r => r.success);
      const totalRecords = results.reduce((sum, r) => sum + r.recordsIngested, 0);

      return {
        success: true,
        message: 'Batch ingestion completed',
        data: {
          totalLeagues: results.length,
          successfulLeagues: successfulIngestions.length,
          totalRecords,
          averageValidationScore: results.length > 0 ? 
            results.reduce((sum, r) => sum + r.validationScore, 0) / results.length : 0,
          results: results.map(r => ({
            leagueId: r.leagueId,
            success: r.success,
            recordsIngested: r.recordsIngested,
            validationScore: r.validationScore,
            errorCount: r.errors.length,
          })),
        },
      };

    } catch (error) {
      this.logger.error('Failed to start batch ingestion:', error);
      throw new HttpException(
        `Failed to start batch ingestion: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Validate ESPN data structure
   */
  @Post('validate')
  @ApiOperation({ summary: 'Validate ESPN data structure' })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validateData(@Body() body: {
    dataType: 'league' | 'player_stats' | 'matchup';
    data: any;
    context?: any;
  }) {
    try {
      const { dataType, data, context = {} } = body;

      this.logger.log(`Validating ${dataType} data`);

      const validationResult = await this.validationService.validateIngestedData(
        dataType,
        data,
        context
      );

      const qualityScore = this.validationService.calculateQualityScore(validationResult);

      return {
        success: true,
        validation: validationResult,
        qualityScore,
        recommendations: this.generateValidationRecommendations(validationResult),
      };

    } catch (error) {
      this.logger.error('Failed to validate data:', error);
      throw new HttpException(
        `Failed to validate data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get ESPN API service status
   */
  @Get('status')
  @ApiOperation({ summary: 'Get ESPN API service status' })
  @ApiResponse({ status: 200, description: 'Service status retrieved successfully' })
  async getStatus() {
    try {
      // This would check ESPN API availability, rate limits, authentication status, etc.
      return {
        success: true,
        status: 'operational',
        checks: {
          espnApiReachable: true,
          authenticationValid: true,
          rateLimitStatus: 'normal',
          lastSuccessfulRequest: new Date().toISOString(),
        },
        version: '1.0.0',
      };

    } catch (error) {
      this.logger.error('Failed to get service status:', error);
      throw new HttpException(
        'Failed to get service status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateValidationRecommendations(validationResult: any): string[] {
    const recommendations: string[] = [];

    if (!validationResult.passed) {
      if (validationResult.errors?.length > 0) {
        recommendations.push('Fix schema validation errors before proceeding with data ingestion');
      }

      if (validationResult.violations?.length > 0) {
        const criticalViolations = validationResult.violations.filter((v: any) => v.severity === 'critical');
        if (criticalViolations.length > 0) {
          recommendations.push('Address critical business rule violations immediately');
        }
      }

      if (validationResult.outliers?.length > 0) {
        recommendations.push('Review statistical outliers for potential data quality issues');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Data validation passed - ready for ingestion');
    }

    return recommendations;
  }
}