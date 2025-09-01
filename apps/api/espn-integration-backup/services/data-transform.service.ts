import { Injectable, Logger } from '@nestjs/common';
import { 
  ESPNLeagueResponse, 
  ESPNTeam, 
  ESPNPlayer, 
  ESPNPlayerStats,
  ESPNMatchup,
  ESPNTransaction,
  ESPN_POSITION_MAP,
  ESPN_STAT_MAP
} from '../types/espn-api.types';
import {
  InternalLeague,
  InternalTeam,
  InternalPlayer,
  InternalPlayerStats,
  InternalMatchup,
  InternalTransaction,
  ScoringSettings
} from '../types/internal-data.types';

/**
 * Data Transformation Service
 * Converts ESPN API responses to normalized internal data structures
 * Handles complex nested data and applies business logic transformations
 */
@Injectable()
export class DataTransformService {
  private readonly logger = new Logger(DataTransformService.name);

  /**
   * Transform ESPN league response to internal league format
   */
  transformLeague(espnLeague: ESPNLeagueResponse): InternalLeague {
    this.logger.debug(`Transforming league data for league ID: ${espnLeague.id}`);

    try {
      const scoringSettings = this.transformScoringSettings(espnLeague.settings);
      
      return {
        espnLeagueId: espnLeague.id,
        name: espnLeague.settings.name,
        seasonYear: espnLeague.seasonId,
        teamCount: espnLeague.settings.size,
        leagueType: this.mapLeagueType(espnLeague.settings.draftSettings.leagueSubType),
        visibility: espnLeague.settings.isPublic ? 'public' : 'private',
        
        // League settings
        playoffTeams: espnLeague.settings.scheduleSettings.playoffTeamCount,
        regularSeasonWeeks: espnLeague.settings.scheduleSettings.matchupPeriodCount - 
                           (espnLeague.settings.scheduleSettings.playoffTeamCount > 0 ? 3 : 0),
        playoffWeeks: espnLeague.settings.scheduleSettings.playoffTeamCount > 0 ? 3 : 0,
        
        // Scoring configuration
        scoringType: this.mapScoringType(espnLeague.settings.scoringSettings.scoringType),
        scoringSettings,
        
        // Roster settings
        rosterPositions: espnLeague.settings.rosterSettings.lineupSlotCounts,
        benchSpots: espnLeague.settings.rosterSettings.lineupSlotCounts[20] || 6,
        irSpots: espnLeague.settings.rosterSettings.lineupSlotCounts[21] || 0,
        
        // League rules
        waiverType: this.mapWaiverType(espnLeague.settings.acquisitionSettings.acquisitionType),
        waiverPeriodDays: Math.ceil(espnLeague.settings.acquisitionSettings.waiverHours / 24),
        tradeDeadline: this.parseTradeDeadline(espnLeague.settings.tradeSettings.deadlineDate),
        acquisitionBudget: espnLeague.settings.acquisitionSettings.acquisitionBudget,
        draftType: this.mapDraftType(espnLeague.settings.draftSettings.type),
        
        // Status information
        isActive: espnLeague.status.isActive,
        isComplete: espnLeague.status.isExpired,
        currentWeek: espnLeague.status.currentMatchupPeriod,
        finalWeek: espnLeague.status.finalScoringPeriod,
        
        // Metadata
        dataQualityScore: 100, // Will be updated by validation service
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to transform league data for league ${espnLeague.id}:`, error);
      throw new Error(`League transformation failed: ${error.message}`);
    }
  }

  /**
   * Transform ESPN team data to internal format
   */
  transformTeam(espnTeam: ESPNTeam, leagueId: string): InternalTeam {
    this.logger.debug(`Transforming team data for team ID: ${espnTeam.id}`);

    try {
      return {
        espnTeamId: espnTeam.id,
        leagueId,
        name: `${espnTeam.location} ${espnTeam.nickname}`.trim(),
        abbreviation: espnTeam.abbrev,
        logoUrl: espnTeam.logo,
        ownerName: this.extractOwnerName(espnTeam.owners),
        coOwnerNames: espnTeam.owners.length > 1 ? espnTeam.owners.slice(1) : [],
        
        // Season performance
        finalStanding: espnTeam.playoffSeed,
        regularSeasonWins: espnTeam.record?.overall?.wins || 0,
        regularSeasonLosses: espnTeam.record?.overall?.losses || 0,
        regularSeasonTies: espnTeam.record?.overall?.ties || 0,
        pointsFor: espnTeam.record?.overall?.pointsFor || espnTeam.pointsFor || 0,
        pointsAgainst: espnTeam.record?.overall?.pointsAgainst || espnTeam.pointsAgainst || 0,
        
        // Additional metadata
        waiverRank: espnTeam.waiverRank,
        streakType: espnTeam.record?.overall?.streakType,
        streakLength: espnTeam.record?.overall?.streakLength || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to transform team data for team ${espnTeam.id}:`, error);
      throw new Error(`Team transformation failed: ${error.message}`);
    }
  }

  /**
   * Transform ESPN player data to internal format
   */
  transformPlayer(espnPlayer: ESPNPlayer): InternalPlayer {
    try {
      return {
        espnPlayerId: espnPlayer.id,
        name: espnPlayer.fullName,
        firstName: espnPlayer.firstName,
        lastName: espnPlayer.lastName,
        position: ESPN_POSITION_MAP[espnPlayer.defaultPositionId] || 'UNKNOWN',
        eligiblePositions: espnPlayer.eligibleSlots.map(slot => ESPN_POSITION_MAP[slot]).filter(Boolean),
        team: this.mapProTeam(espnPlayer.proTeamId),
        jerseyNumber: espnPlayer.jersey ? parseInt(espnPlayer.jersey) : null,
        
        // Ownership data
        percentOwned: espnPlayer.ownership?.percentOwned,
        percentStarted: espnPlayer.ownership?.percentStarted,
        averageDraftPosition: espnPlayer.ownership?.averageDraftPosition,
        
        // Status
        status: 'active', // Will be updated by other processes
        injuryStatus: null, // Will be updated from roster data
      };
    } catch (error) {
      this.logger.error(`Failed to transform player data for player ${espnPlayer.id}:`, error);
      throw new Error(`Player transformation failed: ${error.message}`);
    }
  }

  /**
   * Transform ESPN player statistics to internal format
   */
  transformPlayerStats(
    espnStats: ESPNPlayerStats,
    playerId: string,
    seasonYear: number
  ): InternalPlayerStats {
    try {
      const week = espnStats.scoringPeriodId;
      const rawStats = espnStats.stats || {};
      
      // Parse detailed statistics by position
      const passingStats = this.extractPassingStats(rawStats);
      const rushingStats = this.extractRushingStats(rawStats);
      const receivingStats = this.extractReceivingStats(rawStats);
      const kickingStats = this.extractKickingStats(rawStats);
      const defenseStats = this.extractDefenseStats(rawStats);
      
      return {
        playerId,
        seasonYear,
        weekNumber: week,
        
        // Game context
        opponent: this.mapProTeam(espnStats.proTeamId),
        gameDate: null, // Will be enriched from NFL schedule data
        isHome: null,
        gameResult: null,
        
        // Fantasy performance
        fantasyPoints: espnStats.appliedTotal,
        projectedPoints: null, // Will be added from projections endpoint
        
        // Detailed statistics
        passingStats,
        rushingStats,
        receivingStats,
        kickingStats,
        defenseStats,
        
        // Data quality metadata
        isProjected: false,
        dataSource: 'espn',
        confidenceScore: 100,
        anomalyFlags: [],
        lastVerified: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to transform player stats:`, error);
      throw new Error(`Player stats transformation failed: ${error.message}`);
    }
  }

  /**
   * Transform ESPN matchup to internal format
   */
  transformMatchup(espnMatchup: ESPNMatchup, weekId: string): InternalMatchup {
    try {
      const homeScore = espnMatchup.home?.totalPoints || espnMatchup.home?.pointsFor || 0;
      const awayScore = espnMatchup.away?.totalPoints || espnMatchup.away?.pointsFor || 0;
      
      let winnerId: string | null = null;
      if (espnMatchup.winner === 'HOME') {
        winnerId = espnMatchup.home?.teamId.toString() || null;
      } else if (espnMatchup.winner === 'AWAY') {
        winnerId = espnMatchup.away?.teamId.toString() || null;
      }
      
      return {
        weekId,
        homeTeamId: espnMatchup.home?.teamId.toString() || '',
        awayTeamId: espnMatchup.away?.teamId.toString() || '',
        homeScore,
        awayScore,
        matchupType: this.mapMatchupType(espnMatchup.playoffTierType),
        isComplete: espnMatchup.winner !== undefined || homeScore > 0 || awayScore > 0,
        winnerTeamId: winnerId,
        isTied: espnMatchup.tied || false,
        
        // Additional scoring details
        homeBenchPoints: espnMatchup.home?.pointsBench || 0,
        awayBenchPoints: espnMatchup.away?.pointsBench || 0,
        homeProjectedScore: espnMatchup.home?.totalPointsLive || null,
        awayProjectedScore: espnMatchup.away?.totalPointsLive || null,
      };
    } catch (error) {
      this.logger.error(`Failed to transform matchup:`, error);
      throw new Error(`Matchup transformation failed: ${error.message}`);
    }
  }

  /**
   * Transform ESPN transaction to internal format
   */
  transformTransaction(
    espnTransaction: ESPNTransaction,
    leagueId: string,
    seasonYear: number
  ): InternalTransaction {
    try {
      return {
        leagueId,
        seasonYear,
        weekNumber: espnTransaction.scoringPeriodId,
        espnTransactionId: espnTransaction.id,
        
        transactionType: this.mapTransactionType(espnTransaction.type),
        transactionDate: espnTransaction.processDate 
          ? new Date(espnTransaction.processDate) 
          : new Date(),
        
        proposingTeamId: espnTransaction.proposingTeamId?.toString(),
        acceptingTeamId: espnTransaction.acceptingTeamId?.toString(),
        
        status: this.mapTransactionStatus(espnTransaction),
        bidAmount: espnTransaction.bidAmount,
        waiverPriority: null, // Not always available in ESPN data
        
        // Player movements
        players: espnTransaction.items.map(item => ({
          playerId: item.playerId.toString(),
          fromTeamId: item.fromTeamId?.toString(),
          toTeamId: item.toTeamId?.toString(),
          movementType: this.mapTransactionItemType(item.type),
        })),
        
        notes: null,
      };
    } catch (error) {
      this.logger.error(`Failed to transform transaction:`, error);
      throw new Error(`Transaction transformation failed: ${error.message}`);
    }
  }

  /**
   * Extract passing statistics from raw stats
   */
  private extractPassingStats(rawStats: Record<string, number>): Record<string, any> {
    return {
      attempts: rawStats[53] || 0,      // Passing attempts
      completions: rawStats[54] || 0,   // Completions
      yards: rawStats[0] || 0,          // Passing yards
      touchdowns: rawStats[1] || 0,     // Passing TDs
      interceptions: rawStats[2] || 0,  // Interceptions
      twoPointConversions: rawStats[3] || 0,
      sacks: rawStats[9] || 0,
      sackYards: rawStats[10] || 0,
    };
  }

  /**
   * Extract rushing statistics from raw stats
   */
  private extractRushingStats(rawStats: Record<string, number>): Record<string, any> {
    return {
      attempts: rawStats[23] || 0,      // Rushing attempts
      yards: rawStats[20] || 0,         // Rushing yards
      touchdowns: rawStats[21] || 0,    // Rushing TDs
      twoPointConversions: rawStats[22] || 0,
      fumbles: rawStats[72] || 0,       // Fumbles lost
    };
  }

  /**
   * Extract receiving statistics from raw stats
   */
  private extractReceivingStats(rawStats: Record<string, number>): Record<string, any> {
    return {
      targets: rawStats[53] || 0,       // Receiving targets
      receptions: rawStats[44] || 0,    // Receptions
      yards: rawStats[42] || 0,         // Receiving yards
      touchdowns: rawStats[43] || 0,    // Receiving TDs
      twoPointConversions: rawStats[45] || 0,
      fumbles: rawStats[72] || 0,       // Fumbles lost
    };
  }

  /**
   * Extract kicking statistics from raw stats
   */
  private extractKickingStats(rawStats: Record<string, number>): Record<string, any> {
    return {
      fieldGoalsAttempted: (rawStats[74] || 0) + (rawStats[77] || 0) + (rawStats[78] || 0) + 
                          (rawStats[79] || 0) + (rawStats[80] || 0),
      fieldGoalsMade: rawStats[74] + rawStats[77] + rawStats[78] + rawStats[79] + rawStats[80] || 0,
      fg0to19: rawStats[74] || 0,
      fg20to29: rawStats[77] || 0,
      fg30to39: rawStats[78] || 0,
      fg40to49: rawStats[79] || 0,
      fg50plus: rawStats[80] || 0,
      extraPointsAttempted: (rawStats[85] || 0) + (rawStats[86] || 0),
      extraPointsMade: rawStats[85] || 0,
      extraPointsMissed: rawStats[86] || 0,
    };
  }

  /**
   * Extract defense/special teams statistics
   */
  private extractDefenseStats(rawStats: Record<string, number>): Record<string, any> {
    return {
      sacks: rawStats[100] || 0,
      interceptions: rawStats[96] || 0,
      fumbleRecoveries: rawStats[97] || 0,
      blockedKicks: rawStats[98] || 0,
      safeties: rawStats[99] || 0,
      touchdowns: rawStats[95] || 0,
      pointsAllowed: rawStats[120] || 0,
      yardsAllowed: rawStats[121] || 0,
    };
  }

  /**
   * Transform ESPN scoring settings to internal format
   */
  private transformScoringSettings(settings: any): ScoringSettings {
    const scoringItems = settings.scoringSettings.scoringItems || [];
    const scoringMap: Record<string, number> = {};
    
    scoringItems.forEach((item: any) => {
      const statName = ESPN_STAT_MAP[item.statId];
      if (statName) {
        scoringMap[statName] = item.isReverseItem ? -item.points : item.points;
      }
    });
    
    return {
      passingYards: scoringMap.passing_yards || 0.04, // 1 point per 25 yards
      passingTouchdowns: scoringMap.passing_touchdowns || 4,
      passingInterceptions: scoringMap.passing_interceptions || -2,
      rushingYards: scoringMap.rushing_yards || 0.1, // 1 point per 10 yards
      rushingTouchdowns: scoringMap.rushing_touchdowns || 6,
      receivingYards: scoringMap.receiving_yards || 0.1, // 1 point per 10 yards
      receivingTouchdowns: scoringMap.receiving_touchdowns || 6,
      receptions: scoringMap.receptions || 0, // PPR scoring
      fumblesLost: scoringMap.fumbles_lost || -2,
      
      // Kicking
      fieldGoals0to19: scoringMap.fg_made_0_19 || 3,
      fieldGoals20to29: scoringMap.fg_made_20_29 || 3,
      fieldGoals30to39: scoringMap.fg_made_30_39 || 3,
      fieldGoals40to49: scoringMap.fg_made_40_49 || 4,
      fieldGoals50plus: scoringMap.fg_made_50_plus || 5,
      extraPoints: scoringMap.extra_points_made || 1,
      
      // Defense/ST
      defensiveTouchdowns: scoringMap.def_touchdown || 6,
      interceptions: scoringMap.def_interceptions || 2,
      fumbleRecoveries: scoringMap.def_fumble_recoveries || 2,
      sacks: scoringMap.def_sacks || 1,
      safeties: scoringMap.def_safeties || 2,
      blockedKicks: scoringMap.def_blocked_kicks || 2,
    };
  }

  // Helper mapping functions
  private mapLeagueType(espnType: string): string {
    const typeMap: Record<string, string> = {
      'STANDARD': 'standard',
      'KEEPER': 'keeper',
      'DYNASTY': 'dynasty',
    };
    return typeMap[espnType] || 'standard';
  }

  private mapScoringType(espnScoringType: number): string {
    // ESPN scoring type mapping needs to be determined from actual data
    return 'standard'; // Default, will be refined based on scoring settings
  }

  private mapWaiverType(espnWaiverType: string): string {
    const waiverMap: Record<string, string> = {
      'WAIVERS_TRADITIONAL': 'rolling',
      'WAIVERS_CONTINUOUS': 'continuous',
      'FREE_AGENT_ACQUISITION': 'free_agent',
    };
    return waiverMap[espnWaiverType] || 'rolling';
  }

  private mapDraftType(espnDraftType: string): string {
    const draftMap: Record<string, string> = {
      'SNAKE': 'snake',
      'LINEAR': 'linear',
      'AUCTION': 'auction',
    };
    return draftMap[espnDraftType] || 'snake';
  }

  private mapMatchupType(playoffTierType?: string): string {
    if (!playoffTierType || playoffTierType === 'NONE') return 'regular';
    if (playoffTierType === 'WINNERS_BRACKET') return 'playoff';
    if (playoffTierType === 'LOSERS_CONSOLATION_LADDER') return 'consolation';
    return 'regular';
  }

  private mapTransactionType(espnType: string): string {
    const typeMap: Record<string, string> = {
      'TRADE': 'trade',
      'WAIVER': 'waiver',
      'FREEAGENT': 'free_agent',
      'DROP': 'drop',
    };
    return typeMap[espnType] || 'unknown';
  }

  private mapTransactionStatus(transaction: ESPNTransaction): string {
    if (transaction.isPending) return 'pending';
    if (transaction.isSuccessful === false) return 'failed';
    return 'completed';
  }

  private mapTransactionItemType(itemType: string): string {
    const itemMap: Record<string, string> = {
      'ADD': 'acquired',
      'DROP': 'dropped',
      'TRADE_FOR': 'traded_for',
      'TRADE_AWAY': 'traded_away',
    };
    return itemMap[itemType] || 'unknown';
  }

  private extractOwnerName(owners: string[]): string | null {
    // ESPN owner IDs are GUIDs - we'll need to map these to actual names
    // This would require additional API calls or member data
    return owners.length > 0 ? owners[0] : null;
  }

  private parseTradeDeadline(deadlineDate: string): number | null {
    try {
      const date = new Date(deadlineDate);
      // Convert to week number (this is a simplified calculation)
      const seasonStart = new Date(date.getFullYear(), 8, 1); // September 1st
      const weeksDiff = Math.floor((date.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return Math.max(1, weeksDiff);
    } catch {
      return null;
    }
  }

  private mapProTeam(proTeamId?: number): string | null {
    // ESPN Pro Team ID to NFL team abbreviation mapping
    const teamMap: Record<number, string> = {
      1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
      9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN',
      17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC',
      25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WAS', 29: 'CAR', 30: 'JAX', 33: 'BAL', 34: 'HOU'
    };
    
    return proTeamId ? teamMap[proTeamId] || null : null;
  }
}