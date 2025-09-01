/**
 * Internal Data Type Definitions
 * Normalized data structures for the RFFL_codex_DB system
 * These represent the clean, validated data after ESPN API transformation
 */

// Core League Data
export interface InternalLeague {
  espnLeagueId: number;
  name: string;
  seasonYear: number;
  teamCount: number;
  leagueType: 'standard' | 'keeper' | 'dynasty' | 'redraft';
  visibility: 'public' | 'private';
  
  // League Configuration
  playoffTeams: number;
  regularSeasonWeeks: number;
  playoffWeeks: number;
  
  // Scoring System
  scoringType: 'standard' | 'ppr' | 'half_ppr' | 'custom';
  scoringSettings: ScoringSettings;
  
  // Roster Configuration
  rosterPositions: Record<string, number>;
  benchSpots: number;
  irSpots: number;
  
  // League Rules
  waiverType: 'rolling' | 'continuous' | 'free_agent';
  waiverPeriodDays: number;
  tradeDeadline?: number; // Week number
  acquisitionBudget?: number; // FAAB budget
  draftType: 'snake' | 'auction' | 'linear';
  
  // Status Information
  isActive: boolean;
  isComplete: boolean;
  currentWeek: number;
  finalWeek: number;
  
  // Data Quality Metadata
  dataQualityScore: number;
  lastUpdated: Date;
}

export interface ScoringSettings {
  // Passing
  passingYards: number;
  passingTouchdowns: number;
  passingInterceptions: number;
  passing2ptConversions?: number;
  
  // Rushing
  rushingYards: number;
  rushingTouchdowns: number;
  rushing2ptConversions?: number;
  
  // Receiving
  receivingYards: number;
  receivingTouchdowns: number;
  receptions: number; // PPR value
  receiving2ptConversions?: number;
  
  // General
  fumblesLost: number;
  
  // Kicking
  fieldGoals0to19: number;
  fieldGoals20to29: number;
  fieldGoals30to39: number;
  fieldGoals40to49: number;
  fieldGoals50plus: number;
  extraPoints: number;
  missedExtraPoints?: number;
  
  // Defense/Special Teams
  defensiveTouchdowns: number;
  interceptions: number;
  fumbleRecoveries: number;
  sacks: number;
  safeties: number;
  blockedKicks: number;
  pointsAllowedTiers?: Record<string, number>;
  yardsAllowedTiers?: Record<string, number>;
}

// Team Data
export interface InternalTeam {
  espnTeamId: number;
  leagueId: string;
  name: string;
  abbreviation?: string;
  logoUrl?: string;
  ownerName?: string;
  coOwnerNames: string[];
  
  // Performance Data
  finalStanding?: number;
  regularSeasonWins: number;
  regularSeasonLosses: number;
  regularSeasonTies: number;
  pointsFor: number;
  pointsAgainst: number;
  
  // Additional Metadata
  waiverRank?: number;
  streakType?: string;
  streakLength: number;
}

// Player Data
export interface InternalPlayer {
  espnPlayerId: number;
  name: string;
  firstName?: string;
  lastName?: string;
  position: string;
  eligiblePositions: string[];
  team?: string; // NFL team abbreviation
  jerseyNumber?: number;
  
  // Fantasy Metadata
  percentOwned?: number;
  percentStarted?: number;
  averageDraftPosition?: number;
  
  // Status Information
  status: 'active' | 'injured' | 'suspended' | 'retired';
  injuryStatus?: string;
  byeWeek?: number;
  
  // Physical Attributes (optional)
  heightInches?: number;
  weightLbs?: number;
  age?: number;
  experienceYears?: number;
}

// Player Statistics
export interface InternalPlayerStats {
  playerId: string;
  seasonYear: number;
  weekNumber: number;
  
  // Game Context
  opponent?: string;
  gameDate?: Date;
  isHome?: boolean;
  gameResult?: 'W' | 'L' | 'T';
  
  // Fantasy Performance
  fantasyPoints: number;
  projectedPoints?: number;
  
  // Detailed Statistics
  passingStats: Record<string, any>;
  rushingStats: Record<string, any>;
  receivingStats: Record<string, any>;
  kickingStats: Record<string, any>;
  defenseStats: Record<string, any>;
  
  // Data Quality Indicators
  isProjected: boolean;
  dataSource: string;
  confidenceScore: number;
  anomalyFlags: string[];
  lastVerified: Date;
}

// Matchup Data
export interface InternalMatchup {
  weekId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  matchupType: 'regular' | 'playoff' | 'consolation' | 'championship';
  isComplete: boolean;
  winnerTeamId?: string;
  isTied: boolean;
  
  // Additional Scoring Details
  homeBenchPoints?: number;
  awayBenchPoints?: number;
  homeProjectedScore?: number;
  awayProjectedScore?: number;
}

// Roster Data
export interface InternalRoster {
  teamSeasonId: string;
  playerId: string;
  weekId: string;
  rosterSlot: string;
  isStarter: boolean;
  isCaptain?: boolean;
  pointsScored: number;
  projectedPoints: number;
}

// Transaction Data
export interface InternalTransaction {
  leagueId: string;
  seasonYear: number;
  weekNumber?: number;
  espnTransactionId?: number;
  
  transactionType: 'trade' | 'waiver' | 'free_agent' | 'drop' | 'add';
  transactionDate: Date;
  
  proposingTeamId?: string;
  acceptingTeamId?: string;
  
  status: 'pending' | 'completed' | 'failed' | 'vetoed';
  bidAmount?: number;
  waiverPriority?: number;
  
  players: TransactionPlayer[];
  notes?: string;
}

export interface TransactionPlayer {
  playerId: string;
  fromTeamId?: string;
  toTeamId?: string;
  movementType: 'acquired' | 'dropped' | 'traded_for' | 'traded_away';
}

// Data Quality and Validation Types
export interface ValidationResult {
  passed: boolean;
  severity: 'info' | 'warning' | 'critical';
  validationType: string;
  message: string;
  errors?: any[];
  violations?: BusinessRuleViolation[];
  outliers?: StatisticalOutlier[];
}

export interface BusinessRuleViolation {
  ruleName: string;
  description: string;
  severity: 'warning' | 'critical';
  violatedValue: any;
  expectedRange?: { min: any; max: any };
}

export interface StatisticalOutlier {
  type: 'statistical_outlier' | 'completion_percentage_anomaly' | 'yards_per_attempt_anomaly' | 'rushing_efficiency_anomaly' | 'impossible_catch_rate';
  metricName: string;
  actualValue: number;
  expectedRange?: { min: number; max: number };
  zScore?: number;
  severity: 'info' | 'warning' | 'high' | 'critical';
  confidence: number;
  potentialCauses: string[];
}

export interface DataQualityReport {
  leagueId: string;
  seasonYear: number;
  overallScore: number;
  completenessScore: number;
  accuracyScore: number;
  consistencyScore: number;
  timelinessScore: number;
  validityScore: number;
  qualityGrade: 'A+' | 'A' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'F';
  issuesFound: QualityIssue[];
  recommendedActions: string[];
  timestamp: Date;
}

export interface QualityIssue {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  affectedRecords: number;
  suggestedFix?: string;
}

// Data Ingestion Types
export interface IngestionResult {
  success: boolean;
  leagueId: number;
  seasonYear: number;
  recordsIngested: number;
  validationScore: number;
  errors: IngestionError[];
  performance: IngestionPerformance;
}

export interface IngestionError {
  type: 'api_error' | 'validation_error' | 'transformation_error' | 'database_error' | 'ingestion_error';
  message: string;
  context?: any;
  recoverable: boolean;
  retryCount?: number;
}

export interface IngestionPerformance {
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  recordsPerSecond: number;
  apiRequestCount: number;
  cacheHitRate: number;
}

// Configuration Types
export interface IngestionConfig {
  startYear: number;
  endYear: number;
  targetLeagues: number[];
  batchSize: number;
  parallelJobs: number;
  retryAttempts: number;
  validateData: boolean;
  skipExisting: boolean;
}

export interface ValidationContext {
  playerId?: string;
  position?: string;
  seasonYear: number;
  weekNumber?: number;
  leagueId?: string;
  teamId?: string;
}

// ESPN API Response Caching
export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  memoryUsage: number;
}

// Rate Limiting Types
export interface RateLimitConfig {
  requestsPerSecond: number;
  burstCapacity: number;
  cooldownPeriod: number;
}

export interface RateLimitState {
  requestCount: number;
  windowStart: Date;
  isInCooldown: boolean;
  cooldownEnd?: Date;
}

// Historical Data Coverage
export interface DataCoverage {
  leagueId: number;
  seasonYear: number;
  hasLeagueSettings: boolean;
  hasTeamData: boolean;
  hasPlayerStats: boolean;
  hasMatchups: boolean;
  hasTransactions: boolean;
  hasDraftData: boolean;
  completenessScore: number;
  lastUpdated: Date;
}

// Data Export Types
export interface ExportRequest {
  leagueIds: string[];
  seasonYears: number[];
  dataTypes: ExportDataType[];
  format: 'json' | 'csv' | 'xlsx';
  includeMetadata: boolean;
}

export type ExportDataType = 
  | 'league_settings'
  | 'team_data' 
  | 'player_stats'
  | 'matchups'
  | 'transactions'
  | 'rosters';

export interface ExportResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  fileSize?: number;
  recordCount?: number;
  error?: string;
  createdAt: Date;
  expiresAt: Date;
}