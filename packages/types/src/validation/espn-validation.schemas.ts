/**
 * ESPN Fantasy Football API Validation Schemas
 * Comprehensive Zod schemas for validating ESPN API responses
 * Ensures data integrity and catches API changes early
 */

import { z } from 'zod';

// Base validation schemas
const PositiveInteger = z.number().int().min(0);
const NonNegativeFloat = z.number().min(0);
const SeasonYear = z.number().int().min(2005).max(new Date().getFullYear() + 1);
const WeekNumber = z.number().int().min(1).max(18);
const FantasyPoints = z.number().min(-10).max(100); // Allow negative points for defensive fumbles
const Percentage = z.number().min(0).max(100);

// ESPN Scoring Item Schema
export const ESPNScoringItemSchema = z.object({
  isReverseItem: z.boolean(),
  points: z.number(),
  pointsOverrides: z.record(z.string(), z.number()).optional(),
  statId: z.number().int(),
});

// ESPN Division Schema
export const ESPNDivisionSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(100),
  size: z.number().int().min(1).max(20),
});

// ESPN League Settings Schema
export const ESPNLeagueSettingsSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().min(2).max(20),
  isPublic: z.boolean(),
  restrictionType: z.string(),
  
  acquisitionSettings: z.object({
    acquisitionBudget: z.number().int().min(0).max(1000),
    acquisitionLimit: z.number().int(),
    acquisitionType: z.string(),
    waiverHours: z.number().int().min(0).max(168), // Max 1 week
  }),
  
  draftSettings: z.object({
    auctionBudget: z.number().int().min(0).max(1000),
    availableDate: z.string(),
    date: z.string(),
    isTradingEnabled: z.boolean(),
    keeperCount: z.number().int().min(0).max(20),
    leagueSubType: z.string(),
    pickOrder: z.array(z.number().int().min(1).max(20)),
    timePerSelection: z.number().int().min(0).max(600), // Max 10 minutes
    type: z.string(),
  }),
  
  financeSettings: z.object({
    entryFee: z.number().min(0),
    miscFee: z.number().min(0),
    perLoss: z.number().min(0),
    perTrade: z.number().min(0),
    playerAcquisitionFee: z.number().min(0),
    playerDropFee: z.number().min(0),
  }),
  
  rosterSettings: z.object({
    isBenchUnlimited: z.boolean().optional(),
    isUsingUndroppableList: z.boolean().optional(),
    lineupSlotCounts: z.record(z.string(), z.number().int().min(0)),
    moveLimit: z.number().int().min(-1), // -1 means unlimited
    positionLimits: z.record(z.string(), z.number().int().min(0)).optional(),
    rosterLocktimeType: z.number().int().optional(),
    universeIds: z.array(z.number().int()).optional(),
  }),
  
  scheduleSettings: z.object({
    divisions: z.array(ESPNDivisionSchema).optional(),
    matchupPeriodCount: z.number().int().min(1).max(18),
    matchupPeriodLength: z.number().int().min(1).max(2),
    matchupPeriods: z.record(z.string(), z.array(z.number().int())),
    periodTypeId: z.number().int().optional(),
    playoffMatchupPeriodLength: z.number().int().min(1).max(2).optional(),
    playoffReseed: z.boolean().optional(),
    playoffSeedingRule: z.number().int().optional(),
    playoffSeedingTieRule: z.number().int().optional(),
    playoffTeamCount: z.number().int().min(0).max(16),
  }),
  
  scoringSettings: z.object({
    allowOutOfPositionScoring: z.boolean().optional(),
    homeTeamBonus: z.number().optional(),
    matchupPeriods: z.record(z.string(), z.array(z.number().int())),
    matchupPeriodCount: z.number().int().min(1).max(18),
    matchupPeriodLength: z.number().int().min(1).max(2),
    playerRankDisplayType: z.number().int().optional(),
    playoffHomeTeamBonus: z.number().optional(),
    playoffMatchupTieRule: z.number().int().optional(),
    playoffMatchupTieRuleBy: z.number().int().optional(),
    scoringItems: z.array(ESPNScoringItemSchema),
    scoringType: z.number().int(),
  }),
  
  tradeSettings: z.object({
    allowOutOfUniverse: z.boolean(),
    deadlineDate: z.string(),
    max: z.number().int().min(-1), // -1 means unlimited
    reviewPeriod: z.number().int().min(0),
    veto: z.string(),
  }),
});

// ESPN League Status Schema
export const ESPNLeagueStatusSchema = z.object({
  activatedDate: z.number().int().optional(),
  createdAsLeagueType: z.number().int().optional(),
  currentMatchupPeriod: z.number().int().min(1).max(18),
  finalScoringPeriod: z.number().int().min(1).max(18),
  firstScoringPeriod: z.number().int().min(1).max(18),
  isActive: z.boolean(),
  isExpired: z.boolean().optional(),
  isFull: z.boolean().optional(),
  isPlayoffMatchupEdited: z.boolean().optional(),
  isToBeDeleted: z.boolean().optional(),
  isViewable: z.boolean().optional(),
  isWaiverOrderEdited: z.boolean().optional(),
  latestScoringPeriod: z.number().int().min(1).max(18),
  previousSeasons: z.array(SeasonYear).optional(),
  standingsUpdateDate: z.number().int().optional(),
  teamsJoined: z.number().int().min(0).max(20),
  transactionScoringPeriod: z.number().int().optional(),
  waiverLastExecutionDate: z.number().int().optional(),
  waiverNextExecutionDate: z.number().int().optional(),
});

// ESPN Record Schema
export const ESPNRecordSchema = z.object({
  gamesBack: z.number().min(0),
  losses: PositiveInteger,
  percentage: z.number().min(0).max(1),
  pointsAgainst: NonNegativeFloat,
  pointsFor: NonNegativeFloat,
  streakLength: PositiveInteger,
  streakType: z.string(),
  ties: PositiveInteger,
  wins: PositiveInteger,
}).refine((data) => {
  // Validate that percentage matches wins/losses/ties
  const totalGames = data.wins + data.losses + data.ties;
  if (totalGames === 0) return true; // No games played yet
  
  const calculatedPercentage = data.wins / totalGames;
  const tolerance = 0.001; // Allow small floating point differences
  
  return Math.abs(data.percentage - calculatedPercentage) < tolerance;
}, {
  message: "Win percentage doesn't match wins, losses, and ties",
});

// ESPN Player Schema
export const ESPNPlayerSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(1).max(100),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  defaultPositionId: z.number().int().min(0).max(30),
  eligibleSlots: z.array(z.number().int().min(0).max(30)),
  jersey: z.string().optional(),
  proTeamId: z.number().int().min(0).max(35).optional(),
  universeId: z.number().int().optional(),
  
  ownership: z.object({
    auctionValueAverage: z.number().optional(),
    auctionValueAverageChange: z.number().optional(),
    averageDraftPosition: z.number().min(0).optional(),
    averageDraftPositionPercentChange: z.number().optional(),
    date: z.number().int().optional(),
    leagueType: z.number().int().optional(),
    percentChange: z.number().optional(),
    percentOwned: Percentage.optional(),
    percentStarted: Percentage.optional(),
  }).optional(),
  
  rankings: z.record(z.string(), z.object({
    positionalRanking: z.number().int().min(1).optional(),
    totalRanking: z.number().int().min(1).optional(),
  })).optional(),
  
  stats: z.array(z.object({
    appliedTotal: FantasyPoints,
    externalId: z.string(),
    id: z.string(),
    proTeamId: z.number().int().min(0).max(35),
    scoringPeriodId: WeekNumber,
    seasonId: SeasonYear,
    statSourceId: z.number().int(),
    statSplitTypeId: z.number().int(),
    stats: z.record(z.string(), z.number()),
  })).optional(),
});

// ESPN Roster Entry Schema
export const ESPNRosterEntrySchema = z.object({
  injuryStatus: z.string(),
  lineupSlotId: z.number().int().min(0).max(30),
  playerId: z.number().int().positive(),
  
  playerPoolEntry: z.object({
    appliedStatTotal: z.number().optional(),
    id: z.number().int().positive(),
    keeperValue: z.number().optional(),
    keeperValueFuture: z.number().optional(),
    lineupLocked: z.boolean().optional(),
    onTeamId: z.number().int().min(1).max(20),
    player: ESPNPlayerSchema,
    rosterLocked: z.boolean().optional(),
    status: z.string().optional(),
    tradeLocked: z.boolean().optional(),
  }),
});

// ESPN Team Schema
export const ESPNTeamSchema = z.object({
  id: z.number().int().min(1).max(20),
  abbrev: z.string().min(1).max(10),
  location: z.string().min(0).max(100),
  nickname: z.string().min(0).max(100),
  owners: z.array(z.string()).min(1),
  playoffSeed: z.number().int().min(1).max(20).optional(),
  points: NonNegativeFloat.optional(),
  pointsAdjusted: z.number().optional(),
  pointsFor: NonNegativeFloat.optional(),
  pointsAgainst: NonNegativeFloat.optional(),
  logo: z.string().url().optional(),
  
  record: z.object({
    overall: ESPNRecordSchema,
    home: ESPNRecordSchema.optional(),
    away: ESPNRecordSchema.optional(),
  }).optional(),
  
  roster: z.object({
    appliedStatTotal: z.number().optional(),
    entries: z.array(ESPNRosterEntrySchema),
  }).optional(),
  
  valuesByStat: z.record(z.string(), z.number()).optional(),
  waiverRank: z.number().int().min(1).max(20).optional(),
});

// ESPN Matchup Schema
export const ESPNMatchupSchema = z.object({
  away: z.object({
    adjustment: z.number().optional(),
    cumulativeScore: z.number().optional(),
    pointsBench: NonNegativeFloat.optional(),
    pointsFor: NonNegativeFloat.optional(),
    rosterForCurrentScoringPeriod: z.object({
      appliedStatTotal: z.number().optional(),
      entries: z.array(ESPNRosterEntrySchema),
    }).optional(),
    rosterForMatchupPeriod: z.object({
      appliedStatTotal: z.number().optional(),
      entries: z.array(ESPNRosterEntrySchema),
    }).optional(),
    teamId: z.number().int().min(1).max(20),
    totalPoints: NonNegativeFloat.optional(),
    totalPointsLive: NonNegativeFloat.optional(),
  }).optional(),
  
  home: z.object({
    adjustment: z.number().optional(),
    cumulativeScore: z.number().optional(),
    pointsBench: NonNegativeFloat.optional(),
    pointsFor: NonNegativeFloat.optional(),
    rosterForCurrentScoringPeriod: z.object({
      appliedStatTotal: z.number().optional(),
      entries: z.array(ESPNRosterEntrySchema),
    }).optional(),
    rosterForMatchupPeriod: z.object({
      appliedStatTotal: z.number().optional(),
      entries: z.array(ESPNRosterEntrySchema),
    }).optional(),
    teamId: z.number().int().min(1).max(20),
    totalPoints: NonNegativeFloat.optional(),
    totalPointsLive: NonNegativeFloat.optional(),
  }).optional(),
  
  id: z.number().int().optional(),
  matchupPeriodId: WeekNumber,
  playoffTierType: z.string().optional(),
  tied: z.boolean().optional(),
  winner: z.enum(['HOME', 'AWAY']).optional(),
}).refine((matchup) => {
  // Validate that we have at least home or away team
  return matchup.home || matchup.away;
}, {
  message: "Matchup must have at least home or away team data",
});

// ESPN Member Schema
export const ESPNMemberSchema = z.object({
  displayName: z.string().min(1).max(100),
  firstName: z.string().min(1).max(50).optional(),
  id: z.string().min(1),
  isLeagueCreator: z.boolean().optional(),
  isLeagueManager: z.boolean().optional(),
  lastName: z.string().min(1).max(50).optional(),
  notificationSettings: z.array(z.any()).optional(),
});

// ESPN Draft Pick Schema
export const ESPNDraftPickSchema = z.object({
  autoDraftTypeId: z.number().int().optional(),
  bidAmount: z.number().min(0).optional(),
  id: z.number().int(),
  keeper: z.boolean().optional(),
  lineupSlotId: z.number().int().min(0).max(30),
  memberProfile: z.string().optional(),
  nominatingTeamId: z.number().int().min(1).max(20).optional(),
  overallPickNumber: z.number().int().min(1),
  playerId: z.number().int().positive(),
  reservedForKeeper: z.boolean().optional(),
  roundId: z.number().int().min(1),
  roundPickNumber: z.number().int().min(1),
  teamId: z.number().int().min(1).max(20),
  tradeLocked: z.boolean().optional(),
});

// ESPN Draft Detail Schema
export const ESPNDraftDetailSchema = z.object({
  completeDate: z.number().int(),
  drafted: z.boolean(),
  inProgress: z.boolean(),
  picks: z.array(ESPNDraftPickSchema),
});

// ESPN Transaction Item Schema
export const ESPNTransactionItemSchema = z.object({
  fromTeamId: z.number().int().min(1).max(20).optional(),
  isKeeper: z.boolean().optional(),
  playerId: z.number().int().positive(),
  toTeamId: z.number().int().min(1).max(20).optional(),
  type: z.string(),
});

// ESPN Transaction Schema
export const ESPNTransactionSchema = z.object({
  acceptingTeamId: z.number().int().min(1).max(20).optional(),
  bidAmount: z.number().min(0).optional(),
  executionType: z.string().optional(),
  id: z.number().int(),
  isActingAsTeamOwner: z.boolean().optional(),
  isPending: z.boolean().optional(),
  isSuccessful: z.boolean().optional(),
  items: z.array(ESPNTransactionItemSchema).min(1),
  memberId: z.string().optional(),
  proposingTeamId: z.number().int().min(1).max(20).optional(),
  rating: z.number().optional(),
  scoringPeriodId: WeekNumber.optional(),
  status: z.string().optional(),
  subOrder: z.number().int().optional(),
  teamsVotedAgainst: z.array(z.number().int().min(1).max(20)).optional(),
  type: z.string(),
  processDate: z.number().int().optional(),
});

// Main ESPN League Response Schema
export const ESPNLeagueResponseSchema = z.object({
  gameId: z.number().int(),
  id: z.number().int().positive(),
  scoringPeriodId: WeekNumber,
  seasonId: SeasonYear,
  segmentId: z.number().int().optional(),
  settings: ESPNLeagueSettingsSchema,
  status: ESPNLeagueStatusSchema,
  teams: z.array(ESPNTeamSchema).min(2).max(20),
  members: z.array(ESPNMemberSchema).optional(),
  schedule: z.array(ESPNMatchupSchema).optional(),
  draftDetail: ESPNDraftDetailSchema.optional(),
  transactions: z.array(ESPNTransactionSchema).optional(),
}).refine((league) => {
  // Validate that team count matches settings
  return league.teams.length === league.settings.size;
}, {
  message: "Number of teams doesn't match league size setting",
});

// ESPN Player Response Schema (for player endpoint)
export const ESPNPlayerResponseSchema = z.object({
  players: z.array(z.object({
    id: z.number().int().positive(),
    keeperValue: z.number().optional(),
    keeperValueFuture: z.number().optional(),
    lineupLocked: z.boolean().optional(),
    onTeamId: z.number().int().min(0).max(20).optional(),
    player: ESPNPlayerSchema,
    rosterLocked: z.boolean().optional(),
    status: z.string().optional(),
    tradeLocked: z.boolean().optional(),
  })),
});

// ESPN Matchup Response Schema
export const ESPNMatchupResponseSchema = z.object({
  schedule: z.array(ESPNMatchupSchema),
});

// Business Rule Validation Schemas
export const PlayerStatsValidationSchema = z.object({
  fantasyPoints: FantasyPoints,
  passingYards: z.number().min(-50).max(600).optional(),
  rushingYards: z.number().min(-20).max(300).optional(),
  receivingYards: z.number().min(0).max(400).optional(),
  passingAttempts: z.number().int().min(0).max(70).optional(),
  passingCompletions: z.number().int().min(0).max(70).optional(),
  rushingAttempts: z.number().int().min(0).max(40).optional(),
  receivingTargets: z.number().int().min(0).max(25).optional(),
  receptions: z.number().int().min(0).max(25).optional(),
  passingTouchdowns: z.number().int().min(0).max(8).optional(),
  rushingTouchdowns: z.number().int().min(0).max(5).optional(),
  receivingTouchdowns: z.number().int().min(0).max(4).optional(),
  interceptions: z.number().int().min(0).max(6).optional(),
  fumbles: z.number().int().min(0).max(5).optional(),
}).refine((stats) => {
  // Completions can't exceed attempts
  if (stats.passingCompletions && stats.passingAttempts) {
    return stats.passingCompletions <= stats.passingAttempts;
  }
  return true;
}, {
  message: "Passing completions cannot exceed passing attempts",
}).refine((stats) => {
  // Receptions can't exceed targets
  if (stats.receptions && stats.receivingTargets) {
    return stats.receptions <= stats.receivingTargets;
  }
  return true;
}, {
  message: "Receptions cannot exceed receiving targets",
});

// League Configuration Validation Schema
export const LeagueConfigValidationSchema = z.object({
  teamCount: z.number().int().min(2).max(20),
  playoffTeams: z.number().int().min(0).max(16),
  regularSeasonWeeks: z.number().int().min(1).max(14),
  playoffWeeks: z.number().int().min(0).max(4),
  benchSpots: z.number().int().min(1).max(20),
  startingLineupSize: z.number().int().min(1).max(15),
}).refine((config) => {
  // Playoff teams can't exceed team count
  return config.playoffTeams <= config.teamCount;
}, {
  message: "Playoff teams cannot exceed total team count",
}).refine((config) => {
  // Total season length should be reasonable
  const totalWeeks = config.regularSeasonWeeks + config.playoffWeeks;
  return totalWeeks >= 1 && totalWeeks <= 18;
}, {
  message: "Total season length must be between 1 and 18 weeks",
});

// Export all schemas for use in validation service
export const ValidationSchemas = {
  ESPNLeagueResponse: ESPNLeagueResponseSchema,
  ESPNPlayerResponse: ESPNPlayerResponseSchema,
  ESPNMatchupResponse: ESPNMatchupResponseSchema,
  PlayerStatsValidation: PlayerStatsValidationSchema,
  LeagueConfigValidation: LeagueConfigValidationSchema,
} as const;