import { Injectable, Logger } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { 
  ValidationSchemas,
  PlayerStatsValidationSchema,
  LeagueConfigValidationSchema 
} from '../validation/espn-validation.schemas';
import {
  ESPNLeagueResponse,
  ESPNPlayerResponse,
  ESPNMatchupResponse,
} from '../types/espn-api.types';
import {
  ValidationResult,
  BusinessRuleViolation,
  StatisticalOutlier,
  ValidationContext,
  InternalPlayerStats,
} from '../types/internal-data.types';

/**
 * Data Validation Service
 * Comprehensive validation framework for ESPN Fantasy Football data
 * Implements multi-level validation: schema, business rules, statistical analysis
 */
@Injectable()
export class DataValidationService {
  private readonly logger = new Logger(DataValidationService.name);

  /**
   * Validate ESPN League Response
   */
  async validateESPNLeagueResponse(data: unknown): Promise<ValidationResult> {
    return this.validateWithSchema(
      ValidationSchemas.ESPNLeagueResponse,
      data,
      'espn_league_response'
    );
  }

  /**
   * Validate ESPN Player Response
   */
  async validateESPNPlayerResponse(data: unknown): Promise<ValidationResult> {
    return this.validateWithSchema(
      ValidationSchemas.ESPNPlayerResponse,
      data,
      'espn_player_response'
    );
  }

  /**
   * Validate ESPN Matchup Response
   */
  async validateESPNMatchupResponse(data: unknown): Promise<ValidationResult> {
    return this.validateWithSchema(
      ValidationSchemas.ESPNMatchupResponse,
      data,
      'espn_matchup_response'
    );
  }

  /**
   * Multi-level validation pipeline for ingested data
   */
  async validateIngestedData(
    dataType: 'league' | 'player_stats' | 'matchup' | 'transaction',
    payload: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    this.logger.debug(`Validating ${dataType} data for context: ${JSON.stringify(context)}`);

    const validationStages = [
      () => this.performSchemaValidation(dataType, payload),
      () => this.performBusinessRuleValidation(dataType, payload, context),
      () => this.performStatisticalValidation(dataType, payload, context),
      () => this.performCrossReferenceValidation(dataType, payload, context),
    ];

    const results: ValidationResult[] = [];
    let overallPassed = true;
    let highestSeverity: 'info' | 'warning' | 'critical' = 'info';

    for (const [index, stage] of validationStages.entries()) {
      try {
        const result = await stage();
        results.push(result);

        if (!result.passed) {
          overallPassed = false;
        }

        // Track highest severity
        if (this.getSeverityWeight(result.severity) > this.getSeverityWeight(highestSeverity)) {
          highestSeverity = result.severity;
        }

        // Stop on critical failures unless it's the schema validation
        if (result.severity === 'critical' && !result.passed && index === 0) {
          break;
        }

      } catch (error) {
        this.logger.error(`Validation stage ${index} failed:`, error);
        results.push({
          passed: false,
          severity: 'critical',
          validationType: `stage_${index}_error`,
          message: `Validation stage failed: ${error.message}`,
          errors: [error],
        });
        overallPassed = false;
        highestSeverity = 'critical';
        break;
      }
    }

    return this.aggregateValidationResults(results, overallPassed, highestSeverity);
  }

  /**
   * Schema-level validation using Zod
   */
  private async performSchemaValidation(
    dataType: string,
    payload: any
  ): Promise<ValidationResult> {
    try {
      let schema: ZodSchema | null = null;

      switch (dataType) {
        case 'league':
          schema = ValidationSchemas.ESPNLeagueResponse;
          break;
        case 'player_stats':
          schema = PlayerStatsValidationSchema;
          break;
        case 'league_config':
          schema = LeagueConfigValidationSchema;
          break;
        default:
          return {
            passed: true,
            severity: 'info',
            validationType: 'schema',
            message: `No schema validation available for type: ${dataType}`,
          };
      }

      if (schema) {
        await schema.parseAsync(payload);
      }

      return {
        passed: true,
        severity: 'info',
        validationType: 'schema',
        message: 'Schema validation passed',
      };

    } catch (error) {
      if (error instanceof ZodError) {
        return {
          passed: false,
          severity: 'critical',
          validationType: 'schema',
          message: `Schema validation failed: ${error.message}`,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        };
      }

      throw error;
    }
  }

  /**
   * Business logic validation
   */
  private async performBusinessRuleValidation(
    dataType: string,
    payload: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const violations: BusinessRuleViolation[] = [];

    switch (dataType) {
      case 'player_stats':
        violations.push(...await this.validatePlayerStatsBusinessRules(payload, context));
        break;
      case 'league':
        violations.push(...await this.validateLeagueBusinessRules(payload, context));
        break;
      case 'matchup':
        violations.push(...await this.validateMatchupBusinessRules(payload, context));
        break;
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const passed = criticalViolations.length === 0;
    const severity = criticalViolations.length > 0 ? 'critical' : 
                     violations.length > 0 ? 'warning' : 'info';

    return {
      passed,
      severity,
      validationType: 'business_rules',
      message: passed ? 'Business rule validation passed' : 'Business rule violations found',
      violations,
    };
  }

  /**
   * Statistical anomaly detection
   */
  private async performStatisticalValidation(
    dataType: string,
    payload: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    if (dataType !== 'player_stats') {
      return {
        passed: true,
        severity: 'info',
        validationType: 'statistical',
        message: 'Statistical validation not applicable for this data type',
      };
    }

    const outliers = await this.detectPlayerStatAnomalies(payload, context);
    const criticalOutliers = outliers.filter(o => o.severity === 'critical');
    const passed = criticalOutliers.length === 0;
    const severity = criticalOutliers.length > 0 ? 'critical' :
                     outliers.length > 0 ? 'warning' : 'info';

    return {
      passed,
      severity,
      validationType: 'statistical',
      message: passed ? 'Statistical validation passed' : 'Statistical anomalies detected',
      outliers,
    };
  }

  /**
   * Cross-reference validation
   */
  private async performCrossReferenceValidation(
    dataType: string,
    payload: any,
    context: ValidationContext
  ): Promise<ValidationResult> {
    // This would include validations like:
    // - Player team assignments match NFL rosters
    // - Game dates align with NFL schedule
    // - Bye week players have zero statistics
    // For now, return a placeholder implementation

    return {
      passed: true,
      severity: 'info',
      validationType: 'cross_reference',
      message: 'Cross-reference validation passed (placeholder)',
    };
  }

  /**
   * Validate player statistics business rules
   */
  private async validatePlayerStatsBusinessRules(
    stats: InternalPlayerStats,
    context: ValidationContext
  ): Promise<BusinessRuleViolation[]> {
    const violations: BusinessRuleViolation[] = [];

    // Fantasy points reasonable range
    if (stats.fantasyPoints < -10 || stats.fantasyPoints > 100) {
      violations.push({
        ruleName: 'fantasy_points_range',
        description: 'Fantasy points outside reasonable range',
        severity: stats.fantasyPoints < -20 || stats.fantasyPoints > 150 ? 'critical' : 'warning',
        violatedValue: stats.fantasyPoints,
        expectedRange: { min: -10, max: 100 },
      });
    }

    // Passing statistics validation
    if (stats.passingStats) {
      const { attempts, completions, yards, touchdowns, interceptions } = stats.passingStats;

      if (completions && attempts && completions > attempts) {
        violations.push({
          ruleName: 'passing_completions_vs_attempts',
          description: 'Passing completions exceed attempts',
          severity: 'critical',
          violatedValue: { completions, attempts },
          expectedRange: { min: 0, max: attempts },
        });
      }

      if (attempts && attempts > 70) {
        violations.push({
          ruleName: 'excessive_passing_attempts',
          description: 'Unreasonable number of passing attempts',
          severity: 'warning',
          violatedValue: attempts,
          expectedRange: { min: 0, max: 70 },
        });
      }

      if (yards && (yards < -50 || yards > 600)) {
        violations.push({
          ruleName: 'passing_yards_range',
          description: 'Passing yards outside typical range',
          severity: yards < -100 || yards > 700 ? 'critical' : 'warning',
          violatedValue: yards,
          expectedRange: { min: -50, max: 600 },
        });
      }
    }

    // Rushing statistics validation
    if (stats.rushingStats) {
      const { attempts, yards, touchdowns } = stats.rushingStats;

      if (attempts && attempts > 40) {
        violations.push({
          ruleName: 'excessive_rushing_attempts',
          description: 'Unreasonable number of rushing attempts',
          severity: 'warning',
          violatedValue: attempts,
          expectedRange: { min: 0, max: 40 },
        });
      }

      if (yards && (yards < -20 || yards > 300)) {
        violations.push({
          ruleName: 'rushing_yards_range',
          description: 'Rushing yards outside typical range',
          severity: yards < -50 || yards > 400 ? 'critical' : 'warning',
          violatedValue: yards,
          expectedRange: { min: -20, max: 300 },
        });
      }
    }

    // Receiving statistics validation
    if (stats.receivingStats) {
      const { targets, receptions, yards, touchdowns } = stats.receivingStats;

      if (receptions && targets && receptions > targets) {
        violations.push({
          ruleName: 'receptions_vs_targets',
          description: 'Receptions exceed targets',
          severity: 'critical',
          violatedValue: { receptions, targets },
          expectedRange: { min: 0, max: targets },
        });
      }

      if (targets && targets > 25) {
        violations.push({
          ruleName: 'excessive_targets',
          description: 'Unreasonable number of targets',
          severity: 'warning',
          violatedValue: targets,
          expectedRange: { min: 0, max: 25 },
        });
      }
    }

    return violations;
  }

  /**
   * Validate league business rules
   */
  private async validateLeagueBusinessRules(
    league: any,
    context: ValidationContext
  ): Promise<BusinessRuleViolation[]> {
    const violations: BusinessRuleViolation[] = [];

    // Team count validation
    if (league.teamCount < 2 || league.teamCount > 20) {
      violations.push({
        ruleName: 'team_count_range',
        description: 'Team count outside supported range',
        severity: 'critical',
        violatedValue: league.teamCount,
        expectedRange: { min: 2, max: 20 },
      });
    }

    // Playoff teams validation
    if (league.playoffTeams > league.teamCount) {
      violations.push({
        ruleName: 'playoff_teams_exceed_total',
        description: 'Playoff teams exceed total team count',
        severity: 'critical',
        violatedValue: league.playoffTeams,
        expectedRange: { min: 0, max: league.teamCount },
      });
    }

    // Season length validation
    const totalWeeks = league.regularSeasonWeeks + league.playoffWeeks;
    if (totalWeeks < 1 || totalWeeks > 18) {
      violations.push({
        ruleName: 'total_season_length',
        description: 'Total season length outside valid range',
        severity: 'warning',
        violatedValue: totalWeeks,
        expectedRange: { min: 1, max: 18 },
      });
    }

    return violations;
  }

  /**
   * Validate matchup business rules
   */
  private async validateMatchupBusinessRules(
    matchup: any,
    context: ValidationContext
  ): Promise<BusinessRuleViolation[]> {
    const violations: BusinessRuleViolation[] = [];

    // Score validation
    if (matchup.homeScore < 0 || matchup.awayScore < 0) {
      violations.push({
        ruleName: 'negative_scores',
        description: 'Matchup scores cannot be negative',
        severity: 'critical',
        violatedValue: { homeScore: matchup.homeScore, awayScore: matchup.awayScore },
        expectedRange: { min: 0, max: 300 },
      });
    }

    // Extremely high scores
    if (matchup.homeScore > 250 || matchup.awayScore > 250) {
      violations.push({
        ruleName: 'extremely_high_scores',
        description: 'Matchup scores are unusually high',
        severity: 'warning',
        violatedValue: { homeScore: matchup.homeScore, awayScore: matchup.awayScore },
        expectedRange: { min: 0, max: 250 },
      });
    }

    return violations;
  }

  /**
   * Detect statistical anomalies in player performance
   */
  private async detectPlayerStatAnomalies(
    stats: InternalPlayerStats,
    context: ValidationContext
  ): Promise<StatisticalOutlier[]> {
    const outliers: StatisticalOutlier[] = [];

    // This would typically require historical data for comparison
    // For now, implementing basic threshold-based detection

    // Fantasy points outlier detection
    if (stats.fantasyPoints > 50) {
      outliers.push({
        type: 'statistical_outlier',
        metricName: 'fantasy_points',
        actualValue: stats.fantasyPoints,
        severity: stats.fantasyPoints > 60 ? 'critical' : 'warning',
        confidence: 0.95,
        potentialCauses: ['exceptional_performance', 'data_error', 'scoring_bonus'],
      });
    }

    // Position-specific anomaly detection
    if (context.position === 'QB' && stats.passingStats) {
      const { attempts, completions, yards, touchdowns } = stats.passingStats;

      // Completion percentage anomaly
      if (attempts && completions) {
        const completionPct = completions / attempts;
        if (completionPct < 0.3 || completionPct > 0.95) {
          outliers.push({
            type: 'completion_percentage_anomaly',
            metricName: 'completion_percentage',
            actualValue: completionPct,
            severity: completionPct < 0.2 || completionPct > 0.98 ? 'critical' : 'warning',
            confidence: 0.85,
            potentialCauses: ['weather', 'injury', 'defensive_pressure', 'data_error'],
          });
        }
      }

      // Yards per attempt validation
      if (attempts && yards) {
        const yardsPerAttempt = yards / attempts;
        if (yardsPerAttempt < 3.0 || yardsPerAttempt > 15.0) {
          outliers.push({
            type: 'yards_per_attempt_anomaly',
            metricName: 'yards_per_attempt',
            actualValue: yardsPerAttempt,
            severity: 'warning',
            confidence: 0.80,
            potentialCauses: ['game_script', 'weather', 'opponent_defense', 'data_error'],
          });
        }
      }
    }

    return outliers;
  }

  /**
   * Generic schema validation helper
   */
  private async validateWithSchema<T>(
    schema: ZodSchema<T>,
    data: unknown,
    schemaName: string
  ): Promise<ValidationResult> {
    try {
      await schema.parseAsync(data);
      
      return {
        passed: true,
        severity: 'info',
        validationType: 'schema',
        message: `${schemaName} schema validation passed`,
      };

    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.warn(`Schema validation failed for ${schemaName}:`, error.errors);
        
        return {
          passed: false,
          severity: 'critical',
          validationType: 'schema',
          message: `${schemaName} schema validation failed`,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            received: (err as any).input,
          })),
        };
      }

      this.logger.error(`Unexpected error during schema validation:`, error);
      throw error;
    }
  }

  /**
   * Aggregate multiple validation results
   */
  private aggregateValidationResults(
    results: ValidationResult[],
    overallPassed: boolean,
    highestSeverity: 'info' | 'warning' | 'critical'
  ): ValidationResult {
    const allErrors = results.flatMap(r => r.errors || []);
    const allViolations = results.flatMap(r => r.violations || []);
    const allOutliers = results.flatMap(r => r.outliers || []);

    return {
      passed: overallPassed,
      severity: highestSeverity,
      validationType: 'comprehensive',
      message: overallPassed ? 
        'All validation stages passed' : 
        `Validation failed with ${results.filter(r => !r.passed).length} failed stages`,
      errors: allErrors.length > 0 ? allErrors : undefined,
      violations: allViolations.length > 0 ? allViolations : undefined,
      outliers: allOutliers.length > 0 ? allOutliers : undefined,
    };
  }

  /**
   * Get numeric weight for severity comparison
   */
  private getSeverityWeight(severity: 'info' | 'warning' | 'critical'): number {
    const weights = { info: 1, warning: 2, critical: 3 };
    return weights[severity];
  }

  /**
   * Calculate data quality score based on validation results
   */
  calculateQualityScore(validationResult: ValidationResult): number {
    if (validationResult.passed) {
      return 100;
    }

    let baseScore = 100;
    const errors = validationResult.errors?.length || 0;
    const violations = validationResult.violations || [];
    const outliers = validationResult.outliers || [];

    // Deduct points for different types of issues
    baseScore -= errors * 10; // Schema errors are serious
    baseScore -= violations.filter(v => v.severity === 'critical').length * 15;
    baseScore -= violations.filter(v => v.severity === 'warning').length * 5;
    baseScore -= outliers.filter(o => o.severity === 'critical').length * 10;
    baseScore -= outliers.filter(o => o.severity === 'warning').length * 3;

    return Math.max(0, Math.min(100, baseScore));
  }
}