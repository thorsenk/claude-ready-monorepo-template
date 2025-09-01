import { z } from 'zod';

// ESPN League Response Schema
const ESPNLeagueSettingsSchema = z.object({
  name: z.string(),
  size: z.number(),
  isPublic: z.boolean(),
  restrictionType: z.string(),
  acquisitionSettings: z.object({
    acquisitionBudget: z.number().optional(),
    acquisitionLimit: z.number().optional(),
    acquisitionType: z.string().optional(),
    waiverHours: z.number().optional(),
  }).optional(),
  draftSettings: z.object({
    auctionBudget: z.number().optional(),
    availableDate: z.union([z.string(), z.number()]).optional(),
    date: z.union([z.string(), z.number()]).optional(),
    isTradingEnabled: z.boolean().optional(),
    keeperCount: z.number().optional(),
    leagueSubType: z.string().optional(),
    pickOrder: z.array(z.number()).optional(),
    timePerSelection: z.number().optional(),
    type: z.string().optional(),
  }).optional(),
  rosterSettings: z.object({
    isBenchUnlimited: z.boolean().optional(),
    isUsingUndroppableList: z.boolean().optional(),
    lineupSlotCounts: z.record(z.number()).optional(),
    moveLimit: z.number().optional(),
    positionLimits: z.record(z.number()).optional(),
    rosterLocktimeType: z.union([z.number(), z.string()]).optional(),
    universeIds: z.array(z.number()).optional(),
  }).optional(),
});

const ESPNLeagueStatusSchema = z.object({
  activatedDate: z.number(),
  createdAsLeagueType: z.number(),
  currentMatchupPeriod: z.number(),
  finalScoringPeriod: z.number(),
  firstScoringPeriod: z.number(),
  isActive: z.boolean(),
  isExpired: z.boolean(),
  isFull: z.boolean(),
  isViewable: z.boolean(),
  latestScoringPeriod: z.number(),
  previousSeasons: z.array(z.number()),
  teamsJoined: z.number(),
});

const ESPNPlayerSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  defaultPositionId: z.number(),
  eligibleSlots: z.array(z.number()),
  jersey: z.string().optional(),
  proTeamId: z.number().optional(),
  universeId: z.number().optional(),
});

const ESPNTeamSchema = z.object({
  id: z.number(),
  abbrev: z.string().optional(),
  location: z.string().optional(),
  nickname: z.string().optional(),
  name: z.string().optional(), // Historical data may use 'name' instead of location/nickname
  owners: z.array(z.string()).optional(),
  playoffSeed: z.number().optional(),
  points: z.number().optional(),
  pointsFor: z.number().optional(),
  pointsAgainst: z.number().optional(),
  logo: z.string().optional(),
});

const ESPNLeagueResponseSchema = z.object({
  gameId: z.number(),
  id: z.number(),
  scoringPeriodId: z.number(),
  seasonId: z.number(),
  segmentId: z.number(),
  settings: ESPNLeagueSettingsSchema,
  status: ESPNLeagueStatusSchema,
  teams: z.array(ESPNTeamSchema),
  members: z.array(z.any()).optional(),
  schedule: z.array(z.any()).optional(),
  draftDetail: z.any().optional(),
  transactions: z.array(z.any()).optional(),
});

// ESPN Player Response Schema
const ESPNPlayerResponseSchema = z.object({
  players: z.array(z.object({
    id: z.number(),
    player: ESPNPlayerSchema,
  })),
});

// ESPN Matchup Response Schema
const ESPNMatchupResponseSchema = z.object({
  schedule: z.array(z.object({
    id: z.number().optional(),
    matchupPeriodId: z.number(),
    away: z.object({
      teamId: z.number(),
      totalPoints: z.number().optional(),
    }).optional(),
    home: z.object({
      teamId: z.number(),
      totalPoints: z.number().optional(),
    }).optional(),
    winner: z.string().optional(),
    tied: z.boolean().optional(),
  })),
});

// Player Stats Validation Schema
export const PlayerStatsValidationSchema = z.object({
  playerId: z.string(),
  seasonYear: z.number(),
  weekNumber: z.number(),
  fantasyPoints: z.number(),
  projectedPoints: z.number().optional(),
  passingStats: z.record(z.any()).optional(),
  rushingStats: z.record(z.any()).optional(),
  receivingStats: z.record(z.any()).optional(),
  kickingStats: z.record(z.any()).optional(),
  defenseStats: z.record(z.any()).optional(),
  isProjected: z.boolean(),
  dataSource: z.string(),
  confidenceScore: z.number(),
});

// League Configuration Validation Schema
export const LeagueConfigValidationSchema = z.object({
  espnLeagueId: z.number(),
  name: z.string(),
  seasonYear: z.number(),
  teamCount: z.number(),
  playoffTeams: z.number(),
  regularSeasonWeeks: z.number(),
  playoffWeeks: z.number(),
  scoringType: z.enum(['standard', 'ppr', 'half_ppr', 'custom']),
});

// Export all schemas
export const ValidationSchemas = {
  ESPNLeagueResponse: ESPNLeagueResponseSchema,
  ESPNPlayerResponse: ESPNPlayerResponseSchema,
  ESPNMatchupResponse: ESPNMatchupResponseSchema,
  PlayerStats: PlayerStatsValidationSchema,
  LeagueConfig: LeagueConfigValidationSchema,
};

export type ESPNLeagueResponseType = z.infer<typeof ESPNLeagueResponseSchema>;
export type ESPNPlayerResponseType = z.infer<typeof ESPNPlayerResponseSchema>;
export type ESPNMatchupResponseType = z.infer<typeof ESPNMatchupResponseSchema>;
export type PlayerStatsType = z.infer<typeof PlayerStatsValidationSchema>;
export type LeagueConfigType = z.infer<typeof LeagueConfigValidationSchema>;