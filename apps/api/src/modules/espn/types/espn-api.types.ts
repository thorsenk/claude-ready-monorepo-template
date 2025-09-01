/**
 * ESPN Fantasy Football API Type Definitions
 * Based on actual ESPN API response structures for data mapping
 */

export interface ESPNLeagueResponse {
  gameId: number;
  id: number;
  scoringPeriodId: number;
  seasonId: number;
  segmentId: number;
  settings: ESPNLeagueSettings;
  status: ESPNLeagueStatus;
  teams: ESPNTeam[];
  members?: ESPNMember[];
  schedule?: ESPNMatchup[];
  draftDetail?: ESPNDraftDetail;
  transactions?: ESPNTransaction[];
}

export interface ESPNLeagueSettings {
  name: string;
  size: number;
  isPublic: boolean;
  restrictionType: string;
  acquisitionSettings: {
    acquisitionBudget: number;
    acquisitionLimit: number;
    acquisitionType: string;
    waiverHours: number;
  };
  draftSettings: {
    auctionBudget: number;
    availableDate: string;
    date: string;
    isTradingEnabled: boolean;
    keeperCount: number;
    leagueSubType: string;
    pickOrder: number[];
    timePerSelection: number;
    type: string;
  };
  financeSettings: {
    entryFee: number;
    miscFee: number;
    perLoss: number;
    perTrade: number;
    playerAcquisitionFee: number;
    playerDropFee: number;
  };
  rosterSettings: {
    isBenchUnlimited: boolean;
    isUsingUndroppableList: boolean;
    lineupSlotCounts: Record<number, number>;
    moveLimit: number;
    positionLimits: Record<number, number>;
    rosterLocktimeType: number;
    universeIds: number[];
  };
  scheduleSettings: {
    divisions: ESPNDivision[];
    matchupPeriodCount: number;
    matchupPeriodLength: number;
    matchupPeriods: Record<string, number[]>;
    periodTypeId: number;
    playoffMatchupPeriodLength: number;
    playoffReseed: boolean;
    playoffSeedingRule: number;
    playoffSeedingTieRule: number;
    playoffTeamCount: number;
  };
  scoringSettings: {
    allowOutOfPositionScoring: boolean;
    homeTeamBonus: number;
    matchupPeriods: Record<string, number[]>;
    matchupPeriodCount: number;
    matchupPeriodLength: number;
    playerRankDisplayType: number;
    playoffHomeTeamBonus: number;
    playoffMatchupTieRule: number;
    playoffMatchupTieRuleBy: number;
    scoringItems: ESPNScoringItem[];
    scoringType: number;
  };
  tradeSettings: {
    allowOutOfUniverse: boolean;
    deadlineDate: string;
    max: number;
    reviewPeriod: number;
    veto: string;
  };
}

export interface ESPNLeagueStatus {
  activatedDate: number;
  createdAsLeagueType: number;
  currentMatchupPeriod: number;
  finalScoringPeriod: number;
  firstScoringPeriod: number;
  isActive: boolean;
  isExpired: boolean;
  isFull: boolean;
  isPlayoffMatchupEdited: boolean;
  isToBeDeleted: boolean;
  isViewable: boolean;
  isWaiverOrderEdited: boolean;
  latestScoringPeriod: number;
  previousSeasons: number[];
  standingsUpdateDate: number;
  teamsJoined: number;
  transactionScoringPeriod: number;
  waiverLastExecutionDate: number;
  waiverNextExecutionDate: number;
}

export interface ESPNTeam {
  id: number;
  abbrev: string;
  location: string;
  nickname: string;
  owners: string[];
  playoffSeed?: number;
  points?: number;
  pointsAdjusted?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  logo?: string;
  record?: {
    overall: ESPNRecord;
    home?: ESPNRecord;
    away?: ESPNRecord;
  };
  roster?: {
    appliedStatTotal?: number;
    entries: ESPNRosterEntry[];
  };
  valuesByStat?: Record<string, number>;
  waiverRank?: number;
}

export interface ESPNRecord {
  gamesBack: number;
  losses: number;
  percentage: number;
  pointsAgainst: number;
  pointsFor: number;
  streakLength: number;
  streakType: string;
  ties: number;
  wins: number;
}

export interface ESPNRosterEntry {
  injuryStatus: string;
  lineupSlotId: number;
  playerId: number;
  playerPoolEntry: {
    appliedStatTotal?: number;
    id: number;
    keeperValue?: number;
    keeperValueFuture?: number;
    lineupLocked?: boolean;
    onTeamId: number;
    player: ESPNPlayer;
    rosterLocked?: boolean;
    status?: string;
    tradeLocked?: boolean;
  };
}

export interface ESPNPlayer {
  id: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  defaultPositionId: number;
  eligibleSlots: number[];
  jersey?: string;
  proTeamId?: number;
  universeId?: number;
  ownership?: {
    auctionValueAverage?: number;
    auctionValueAverageChange?: number;
    averageDraftPosition?: number;
    averageDraftPositionPercentChange?: number;
    date?: number;
    leagueType?: number;
    percentChange?: number;
    percentOwned?: number;
    percentStarted?: number;
  };
  rankings?: Record<string, ESPNPlayerRanking>;
  stats?: ESPNPlayerStats[];
}

export interface ESPNPlayerStats {
  appliedTotal: number;
  externalId: string;
  id: string;
  proTeamId: number;
  scoringPeriodId: number;
  seasonId: number;
  statSourceId: number;
  statSplitTypeId: number;
  stats: Record<string, number>;
}

export interface ESPNPlayerRanking {
  positionalRanking?: number;
  totalRanking?: number;
}

export interface ESPNMatchup {
  away?: {
    adjustment?: number;
    cumulativeScore?: number;
    pointsBench?: number;
    pointsFor?: number;
    rosterForCurrentScoringPeriod?: {
      appliedStatTotal?: number;
      entries: ESPNRosterEntry[];
    };
    rosterForMatchupPeriod?: {
      appliedStatTotal?: number;
      entries: ESPNRosterEntry[];
    };
    teamId: number;
    totalPoints?: number;
    totalPointsLive?: number;
  };
  home?: {
    adjustment?: number;
    cumulativeScore?: number;
    pointsBench?: number;
    pointsFor?: number;
    rosterForCurrentScoringPeriod?: {
      appliedStatTotal?: number;
      entries: ESPNRosterEntry[];
    };
    rosterForMatchupPeriod?: {
      appliedStatTotal?: number;
      entries: ESPNRosterEntry[];
    };
    teamId: number;
    totalPoints?: number;
    totalPointsLive?: number;
  };
  id?: number;
  matchupPeriodId: number;
  playoffTierType?: string;
  tied?: boolean;
  winner?: string;
}

export interface ESPNMember {
  displayName: string;
  firstName?: string;
  id: string;
  isLeagueCreator?: boolean;
  isLeagueManager?: boolean;
  lastName?: string;
  notificationSettings?: any[];
}

export interface ESPNDraftDetail {
  completeDate: number;
  drafted: boolean;
  inProgress: boolean;
  picks: ESPNDraftPick[];
}

export interface ESPNDraftPick {
  autoDraftTypeId?: number;
  bidAmount?: number;
  id: number;
  keeper?: boolean;
  lineupSlotId: number;
  memberProfile?: string;
  nominatingTeamId?: number;
  overallPickNumber: number;
  playerId: number;
  reservedForKeeper?: boolean;
  roundId: number;
  roundPickNumber: number;
  teamId: number;
  tradeLocked?: boolean;
}

export interface ESPNTransaction {
  acceptingTeamId?: number;
  bidAmount?: number;
  executionType?: string;
  id: number;
  isActingAsTeamOwner?: boolean;
  isPending?: boolean;
  isSuccessful?: boolean;
  items: ESPNTransactionItem[];
  memberId?: string;
  proposingTeamId?: number;
  rating?: number;
  scoringPeriodId?: number;
  status?: string;
  subOrder?: number;
  teamsVotedAgainst?: number[];
  type: string;
  processDate?: number;
}

export interface ESPNTransactionItem {
  fromTeamId?: number;
  isKeeper?: boolean;
  playerId: number;
  toTeamId?: number;
  type: string;
}

export interface ESPNScoringItem {
  isReverseItem: boolean;
  points: number;
  pointsOverrides?: Record<string, number>;
  statId: number;
}

export interface ESPNDivision {
  id: number;
  name: string;
  size: number;
}

// Player response for player endpoint
export interface ESPNPlayerResponse {
  players: ESPNPlayerPoolEntry[];
}

export interface ESPNPlayerPoolEntry {
  id: number;
  keeperValue?: number;
  keeperValueFuture?: number;
  lineupLocked?: boolean;
  onTeamId?: number;
  player: ESPNPlayer;
  rosterLocked?: boolean;
  status?: string;
  tradeLocked?: boolean;
}

// Matchup response type
export interface ESPNMatchupResponse {
  schedule: ESPNMatchup[];
}

// API Request Options
export interface GetLeagueOptions {
  views?: string[];
  scoringPeriodId?: number;
  publicOnly?: boolean;
}

export interface GetPlayersOptions {
  scoringPeriodId?: number;
  filter?: {
    players?: {
      limit?: number;
      offset?: number;
      sortPercOwned?: {
        sortPriority: number;
        sortAsc: boolean;
      };
      filterSlotIds?: {
        value: number[];
      };
    };
  };
}

export interface APIRequestOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  retryAttempts?: number;
}

// ESPN Position ID mappings
export const ESPN_POSITION_MAP: Record<number, string> = {
  0: 'QB',
  1: 'QB', 
  2: 'RB',
  3: 'RB',
  4: 'WR',
  5: 'WR', 
  6: 'TE',
  16: 'D/ST',
  17: 'K',
  20: 'FLEX',
  21: 'BENCH',
  23: 'FLEX',
  24: 'SUPER_FLEX'
};

// ESPN Stat ID mappings for fantasy scoring
export const ESPN_STAT_MAP: Record<number, string> = {
  0: 'passing_yards',
  1: 'passing_touchdowns',
  2: 'passing_interceptions',
  3: 'passing_2pt_conversions',
  20: 'rushing_yards',
  21: 'rushing_touchdowns',
  22: 'rushing_2pt_conversions',
  23: 'rushing_attempts',
  42: 'receiving_yards',
  43: 'receiving_touchdowns',
  44: 'receptions',
  45: 'receiving_2pt_conversions',
  53: 'receiving_targets',
  72: 'fumbles_lost',
  74: 'fg_made_0_19',
  77: 'fg_made_20_29',
  78: 'fg_made_30_39',
  79: 'fg_made_40_49',
  80: 'fg_made_50_plus',
  85: 'extra_points_made',
  86: 'extra_points_missed',
  95: 'def_touchdown',
  96: 'def_interceptions',
  97: 'def_fumble_recoveries',
  98: 'def_blocked_kicks',
  99: 'def_safeties',
  100: 'def_sacks'
};