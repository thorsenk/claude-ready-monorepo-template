import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ESPNAuthService } from './espn-auth.service';
import { RateLimiterService } from './rate-limiter.service';
import { DataValidationService } from './data-validation.service';
import { 
  ESPNLeagueResponse, 
  ESPNPlayerResponse, 
  ESPNMatchupResponse,
  GetLeagueOptions,
  GetPlayersOptions,
  APIRequestOptions 
} from '../types/espn-api.types';

/**
 * ESPN Fantasy Football API Client Service
 * Handles all direct communication with ESPN's unofficial Fantasy Football API
 * with proper rate limiting, error handling, and authentication
 */
@Injectable()
export class ESPNApiService {
  private readonly logger = new Logger(ESPNApiService.name);
  private readonly baseUrl = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl';
  private readonly historicalUrl = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory';
  
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: ESPNAuthService,
    private readonly rateLimiter: RateLimiterService,
    private readonly validator: DataValidationService,
  ) {}

  /**
   * Get comprehensive league information
   */
  async getLeague(
    leagueId: number,
    season: number,
    options: GetLeagueOptions = {}
  ): Promise<ESPNLeagueResponse> {
    this.logger.debug(`Fetching league ${leagueId} for season ${season}`);

    const url = this.buildLeagueUrl(leagueId, season);
    const views = options.views || ['mTeam', 'mRoster', 'mMatchup', 'mSettings'];
    
    const params = new URLSearchParams();
    views.forEach(view => params.append('view', view));
    
    if (options.scoringPeriodId) {
      params.set('scoringPeriodId', options.scoringPeriodId.toString());
    }

    const fullUrl = `${url}?${params.toString()}`;
    const response = await this.makeRequest<ESPNLeagueResponse>(fullUrl, {
      requiresAuth: !options.publicOnly
    });

    // Validate response structure
    await this.validator.validateESPNLeagueResponse(response);
    
    this.logger.debug(`Successfully fetched league ${leagueId} data`);
    return response;
  }

  /**
   * Get historical league data (2017 and earlier)
   */
  async getLeagueHistory(
    leagueId: number,
    seasons: number[]
  ): Promise<ESPNLeagueResponse[]> {
    this.logger.debug(`Fetching historical data for league ${leagueId}, seasons: ${seasons.join(', ')}`);
    
    const results: ESPNLeagueResponse[] = [];
    
    for (const season of seasons) {
      try {
        await this.rateLimiter.waitForSlot();
        
        const url = `${this.historicalUrl}/${leagueId}?seasonId=${season}`;
        const response = await this.makeRequest<ESPNLeagueResponse>(url, {
          requiresAuth: true
        });
        
        await this.validator.validateESPNLeagueResponse(response);
        results.push(response);
        
      } catch (error) {
        this.logger.warn(`Failed to fetch season ${season} for league ${leagueId}:`, error.message);
        // Continue with other seasons
      }
    }

    this.logger.debug(`Fetched ${results.length}/${seasons.length} historical seasons`);
    return results;
  }

  /**
   * Get player data with statistics
   */
  async getPlayers(
    season: number,
    options: GetPlayersOptions = {}
  ): Promise<ESPNPlayerResponse> {
    this.logger.debug(`Fetching players for season ${season}`);

    const url = `${this.baseUrl}/seasons/${season}/players`;
    const params = new URLSearchParams();
    
    if (options.scoringPeriodId) {
      params.set('scoringPeriodId', options.scoringPeriodId.toString());
    }

    // Add filter for player data
    const headers: Record<string, string> = {};
    if (options.filter) {
      headers['X-Fantasy-Filter'] = JSON.stringify(options.filter);
    }

    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    const response = await this.makeRequest<ESPNPlayerResponse>(fullUrl, {
      headers,
      requiresAuth: false
    });

    this.logger.debug(`Successfully fetched player data for season ${season}`);
    return response;
  }

  /**
   * Get matchup data for specific week
   */
  async getMatchups(
    leagueId: number,
    season: number,
    week?: number
  ): Promise<ESPNMatchupResponse> {
    this.logger.debug(`Fetching matchups for league ${leagueId}, season ${season}, week ${week || 'all'}`);

    const url = this.buildLeagueUrl(leagueId, season);
    const params = new URLSearchParams();
    params.append('view', 'mMatchup');
    
    if (week) {
      params.set('scoringPeriodId', week.toString());
    }

    const fullUrl = `${url}?${params.toString()}`;
    const response = await this.makeRequest<ESPNMatchupResponse>(fullUrl, {
      requiresAuth: true
    });

    this.logger.debug(`Successfully fetched matchup data`);
    return response;
  }

  /**
   * Get team roster information
   */
  async getTeamRosters(
    leagueId: number,
    season: number,
    week?: number
  ): Promise<ESPNLeagueResponse> {
    this.logger.debug(`Fetching team rosters for league ${leagueId}, season ${season}, week ${week || 'all'}`);

    const url = this.buildLeagueUrl(leagueId, season);
    const params = new URLSearchParams();
    params.append('view', 'mRoster');
    params.append('view', 'mTeam');
    
    if (week) {
      params.set('scoringPeriodId', week.toString());
    }

    const fullUrl = `${url}?${params.toString()}`;
    const response = await this.makeRequest<ESPNLeagueResponse>(fullUrl, {
      requiresAuth: true
    });

    this.logger.debug(`Successfully fetched roster data`);
    return response;
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    leagueId: number,
    season: number
  ): Promise<any> {
    this.logger.debug(`Fetching transactions for league ${leagueId}, season ${season}`);

    const url = this.buildLeagueUrl(leagueId, season);
    const params = new URLSearchParams();
    params.append('view', 'mTransactions2');

    const fullUrl = `${url}?${params.toString()}`;
    const response = await this.makeRequest<any>(fullUrl, {
      requiresAuth: true
    });

    this.logger.debug(`Successfully fetched transaction data`);
    return response;
  }

  /**
   * Build appropriate URL based on season
   */
  private buildLeagueUrl(leagueId: number, season: number): string {
    if (season >= 2018) {
      return `${this.baseUrl}/seasons/${season}/segments/0/leagues/${leagueId}`;
    } else {
      return `${this.historicalUrl}/${leagueId}`;
    }
  }

  /**
   * Make HTTP request with proper error handling and rate limiting
   */
  private async makeRequest<T>(
    url: string,
    options: APIRequestOptions = {}
  ): Promise<T> {
    // Wait for rate limiter
    await this.rateLimiter.waitForSlot();

    try {
      const headers: Record<string, string> = {
        'User-Agent': 'RFFL-Codex-DB/1.0',
        'Accept': 'application/json',
        ...options.headers
      };

      // Add authentication if required
      if (options.requiresAuth) {
        const authHeaders = await this.authService.getAuthHeaders();
        Object.assign(headers, authHeaders);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const data = await response.json();
      return data as T;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new HttpException('Request timeout', HttpStatus.REQUEST_TIMEOUT);
      }
      
      this.logger.error(`API request failed for URL ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleHttpError(response: Response): Promise<never> {
    const errorBody = await response.text();
    
    switch (response.status) {
      case 401:
        this.logger.error('Authentication failed - refreshing credentials');
        await this.authService.refreshAuth();
        throw new HttpException(
          'Authentication failed - credentials refreshed',
          HttpStatus.UNAUTHORIZED
        );
        
      case 403:
        throw new HttpException(
          'Access forbidden - verify league permissions',
          HttpStatus.FORBIDDEN
        );
        
      case 404:
        throw new HttpException(
          'League or data not found',
          HttpStatus.NOT_FOUND
        );
        
      case 429:
        this.logger.warn('Rate limit hit - backing off');
        await this.rateLimiter.handleRateLimit();
        throw new HttpException(
          'Rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS
        );
        
      case 500:
      case 502:
      case 503:
        throw new HttpException(
          `ESPN server error (${response.status})`,
          HttpStatus.BAD_GATEWAY
        );
        
      default:
        throw new HttpException(
          `HTTP ${response.status}: ${errorBody}`,
          response.status
        );
    }
  }
}