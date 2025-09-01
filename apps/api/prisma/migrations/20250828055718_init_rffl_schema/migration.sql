-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "espn_league_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_year" INTEGER NOT NULL,
    "league_type" TEXT NOT NULL DEFAULT 'standard',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT,
    "logo_url" TEXT,
    "data_quality_score" REAL NOT NULL DEFAULT 0,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "league_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "league_id" TEXT NOT NULL,
    "season_year" INTEGER NOT NULL,
    "team_count" INTEGER NOT NULL DEFAULT 10,
    "playoff_teams" INTEGER NOT NULL DEFAULT 6,
    "regular_season_weeks" INTEGER NOT NULL DEFAULT 14,
    "playoff_weeks" INTEGER NOT NULL DEFAULT 3,
    "scoring_type" TEXT NOT NULL DEFAULT 'standard',
    "qb_scoring" TEXT NOT NULL DEFAULT '{}',
    "rb_scoring" TEXT NOT NULL DEFAULT '{}',
    "wr_scoring" TEXT NOT NULL DEFAULT '{}',
    "te_scoring" TEXT NOT NULL DEFAULT '{}',
    "k_scoring" TEXT NOT NULL DEFAULT '{}',
    "def_scoring" TEXT NOT NULL DEFAULT '{}',
    "roster_positions" TEXT NOT NULL DEFAULT '{}',
    "bench_spots" INTEGER NOT NULL DEFAULT 6,
    "ir_spots" INTEGER NOT NULL DEFAULT 0,
    "waiver_type" TEXT NOT NULL DEFAULT 'rolling',
    "waiver_period_days" INTEGER NOT NULL DEFAULT 2,
    "trade_deadline_week" INTEGER,
    "acquisition_budget" INTEGER DEFAULT 100,
    "draft_type" TEXT NOT NULL DEFAULT 'snake',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "league_settings_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "league_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "seasons_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weeks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "season_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "week_type" TEXT NOT NULL DEFAULT 'regular',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "weeks_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "espn_team_id" INTEGER NOT NULL,
    "league_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "logo_url" TEXT,
    "owner_name" TEXT,
    "co_owner_names" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "teams_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_seasons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "team_id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "season_year" INTEGER NOT NULL,
    "final_standing" INTEGER,
    "regular_season_wins" INTEGER NOT NULL DEFAULT 0,
    "regular_season_losses" INTEGER NOT NULL DEFAULT 0,
    "regular_season_ties" INTEGER NOT NULL DEFAULT 0,
    "points_for" REAL NOT NULL DEFAULT 0.00,
    "points_against" REAL NOT NULL DEFAULT 0.00,
    "playoff_result" TEXT,
    "acquisition_budget" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "team_seasons_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_seasons_league_id_season_year_fkey" FOREIGN KEY ("league_id", "season_year") REFERENCES "seasons" ("league_id", "year") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "espn_player_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "team" TEXT,
    "jersey_number" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "injury_status" TEXT,
    "bye_week" INTEGER,
    "height_inches" INTEGER,
    "weight_lbs" INTEGER,
    "age" INTEGER,
    "experience_years" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "player_week_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "player_id" TEXT NOT NULL,
    "season_year" INTEGER NOT NULL,
    "week_number" INTEGER NOT NULL,
    "week_id" TEXT,
    "opponent" TEXT,
    "game_date" DATETIME,
    "is_home" BOOLEAN,
    "game_result" TEXT,
    "fantasy_points" REAL NOT NULL DEFAULT 0.00,
    "projected_points" REAL,
    "passing_stats" TEXT NOT NULL DEFAULT '{}',
    "rushing_stats" TEXT NOT NULL DEFAULT '{}',
    "receiving_stats" TEXT NOT NULL DEFAULT '{}',
    "kicking_stats" TEXT NOT NULL DEFAULT '{}',
    "defense_stats" TEXT NOT NULL DEFAULT '{}',
    "is_projected" BOOLEAN NOT NULL DEFAULT false,
    "data_source" TEXT NOT NULL DEFAULT 'espn',
    "confidence_score" REAL DEFAULT 100,
    "anomaly_flags" TEXT,
    "last_verified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_week_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_week_stats_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "weeks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "matchups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "week_id" TEXT NOT NULL,
    "home_team_id" TEXT NOT NULL,
    "away_team_id" TEXT NOT NULL,
    "home_score" REAL NOT NULL DEFAULT 0.00,
    "away_score" REAL NOT NULL DEFAULT 0.00,
    "matchup_type" TEXT NOT NULL DEFAULT 'regular',
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "winner_team_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "matchups_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "weeks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "matchups_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matchups_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matchups_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rosters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "team_season_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "week_id" TEXT NOT NULL,
    "roster_slot" TEXT NOT NULL,
    "is_starter" BOOLEAN NOT NULL DEFAULT false,
    "is_captain" BOOLEAN NOT NULL DEFAULT false,
    "points_scored" REAL NOT NULL DEFAULT 0.00,
    "projected_points" REAL NOT NULL DEFAULT 0.00,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rosters_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "team_seasons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rosters_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rosters_week_id_fkey" FOREIGN KEY ("week_id") REFERENCES "weeks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "league_id" TEXT NOT NULL,
    "season_year" INTEGER NOT NULL,
    "week_number" INTEGER,
    "transaction_type" TEXT NOT NULL,
    "transaction_date" DATETIME NOT NULL,
    "espn_transaction_id" BIGINT,
    "proposing_team_id" TEXT,
    "accepting_team_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "waiver_priority" INTEGER,
    "bid_amount" INTEGER,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transactions_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_proposing_team_id_fkey" FOREIGN KEY ("proposing_team_id") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_accepting_team_id_fkey" FOREIGN KEY ("accepting_team_id") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_proposing_team_id_season_year_fkey" FOREIGN KEY ("proposing_team_id", "season_year") REFERENCES "team_seasons" ("team_id", "season_year") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction_players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transaction_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "from_team_id" TEXT,
    "to_team_id" TEXT,
    "movement_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transaction_players_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "data_ingestion_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "job_type" TEXT NOT NULL,
    "league_id" TEXT,
    "season_year" INTEGER,
    "week_number" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "errors_count" INTEGER NOT NULL DEFAULT 0,
    "success_rate" REAL,
    "quality_score" REAL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "error_messages" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "data_quality_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "league_id" TEXT NOT NULL,
    "season_year" INTEGER NOT NULL,
    "report_type" TEXT NOT NULL,
    "overall_score" REAL NOT NULL,
    "completeness_score" REAL NOT NULL,
    "accuracy_score" REAL NOT NULL,
    "consistency_score" REAL NOT NULL,
    "timeliness_score" REAL NOT NULL,
    "validity_score" REAL NOT NULL,
    "quality_grade" TEXT NOT NULL,
    "issues_found" TEXT NOT NULL DEFAULT '[]',
    "recommended_actions" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metric_type" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "labels" TEXT NOT NULL DEFAULT '{}',
    "timestamp" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "leagues_espn_league_id_key" ON "leagues"("espn_league_id");

-- CreateIndex
CREATE INDEX "leagues_espn_league_id_idx" ON "leagues"("espn_league_id");

-- CreateIndex
CREATE INDEX "idx_leagues_status" ON "leagues"("status");

-- CreateIndex
CREATE INDEX "idx_leagues_created_year" ON "leagues"("created_year");

-- CreateIndex
CREATE INDEX "idx_leagues_data_quality" ON "leagues"("data_quality_score");

-- CreateIndex
CREATE INDEX "idx_league_settings_season" ON "league_settings"("season_year");

-- CreateIndex
CREATE INDEX "idx_league_settings_scoring_type" ON "league_settings"("scoring_type");

-- CreateIndex
CREATE UNIQUE INDEX "league_settings_league_id_season_year_key" ON "league_settings"("league_id", "season_year");

-- CreateIndex
CREATE INDEX "idx_seasons_year" ON "seasons"("year");

-- CreateIndex
CREATE INDEX "idx_seasons_complete" ON "seasons"("is_complete");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_league_id_year_key" ON "seasons"("league_id", "year");

-- CreateIndex
CREATE INDEX "idx_weeks_number" ON "weeks"("week_number");

-- CreateIndex
CREATE INDEX "idx_weeks_type" ON "weeks"("week_type");

-- CreateIndex
CREATE INDEX "idx_weeks_complete" ON "weeks"("is_complete");

-- CreateIndex
CREATE UNIQUE INDEX "weeks_season_id_week_number_key" ON "weeks"("season_id", "week_number");

-- CreateIndex
CREATE INDEX "idx_teams_espn_id" ON "teams"("espn_team_id");

-- CreateIndex
CREATE INDEX "idx_teams_owner" ON "teams"("owner_name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_league_id_espn_team_id_key" ON "teams"("league_id", "espn_team_id");

-- CreateIndex
CREATE INDEX "idx_team_seasons_league_year" ON "team_seasons"("league_id", "season_year");

-- CreateIndex
CREATE INDEX "idx_team_seasons_standing" ON "team_seasons"("final_standing");

-- CreateIndex
CREATE INDEX "idx_team_seasons_points_for" ON "team_seasons"("points_for");

-- CreateIndex
CREATE UNIQUE INDEX "team_seasons_team_id_season_year_key" ON "team_seasons"("team_id", "season_year");

-- CreateIndex
CREATE UNIQUE INDEX "players_espn_player_id_key" ON "players"("espn_player_id");

-- CreateIndex
CREATE INDEX "idx_players_espn_id" ON "players"("espn_player_id");

-- CreateIndex
CREATE INDEX "idx_players_position" ON "players"("position");

-- CreateIndex
CREATE INDEX "idx_players_team" ON "players"("team");

-- CreateIndex
CREATE INDEX "idx_players_name" ON "players"("name");

-- CreateIndex
CREATE INDEX "idx_player_stats_player_season" ON "player_week_stats"("player_id", "season_year");

-- CreateIndex
CREATE INDEX "idx_player_stats_week" ON "player_week_stats"("season_year", "week_number");

-- CreateIndex
CREATE INDEX "idx_player_stats_points" ON "player_week_stats"("fantasy_points");

-- CreateIndex
CREATE INDEX "idx_player_stats_source" ON "player_week_stats"("data_source");

-- CreateIndex
CREATE INDEX "idx_player_stats_verified" ON "player_week_stats"("last_verified");

-- CreateIndex
CREATE UNIQUE INDEX "player_week_stats_player_id_season_year_week_number_key" ON "player_week_stats"("player_id", "season_year", "week_number");

-- CreateIndex
CREATE INDEX "idx_matchups_week" ON "matchups"("week_id");

-- CreateIndex
CREATE INDEX "idx_matchups_teams" ON "matchups"("home_team_id", "away_team_id");

-- CreateIndex
CREATE INDEX "idx_matchups_type" ON "matchups"("matchup_type");

-- CreateIndex
CREATE INDEX "idx_matchups_complete" ON "matchups"("is_complete");

-- CreateIndex
CREATE INDEX "idx_rosters_team_week" ON "rosters"("team_season_id", "week_id");

-- CreateIndex
CREATE INDEX "idx_rosters_starters" ON "rosters"("is_starter");

-- CreateIndex
CREATE INDEX "idx_rosters_slot" ON "rosters"("roster_slot");

-- CreateIndex
CREATE UNIQUE INDEX "rosters_team_season_id_player_id_week_id_key" ON "rosters"("team_season_id", "player_id", "week_id");

-- CreateIndex
CREATE INDEX "idx_transactions_league_season" ON "transactions"("league_id", "season_year");

-- CreateIndex
CREATE INDEX "idx_transactions_date" ON "transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "idx_transactions_type" ON "transactions"("transaction_type");

-- CreateIndex
CREATE INDEX "idx_transactions_espn_id" ON "transactions"("espn_transaction_id");

-- CreateIndex
CREATE INDEX "idx_transaction_players_transaction" ON "transaction_players"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_transaction_players_player" ON "transaction_players"("player_id");

-- CreateIndex
CREATE INDEX "idx_transaction_players_movement" ON "transaction_players"("movement_type");

-- CreateIndex
CREATE INDEX "idx_ingestion_jobs_status" ON "data_ingestion_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_ingestion_jobs_type" ON "data_ingestion_jobs"("job_type");

-- CreateIndex
CREATE INDEX "idx_ingestion_jobs_league" ON "data_ingestion_jobs"("league_id");

-- CreateIndex
CREATE INDEX "idx_ingestion_jobs_started" ON "data_ingestion_jobs"("started_at");

-- CreateIndex
CREATE INDEX "idx_quality_reports_league_season" ON "data_quality_reports"("league_id", "season_year");

-- CreateIndex
CREATE INDEX "idx_quality_reports_score" ON "data_quality_reports"("overall_score");

-- CreateIndex
CREATE INDEX "idx_quality_reports_grade" ON "data_quality_reports"("quality_grade");

-- CreateIndex
CREATE INDEX "idx_quality_reports_created" ON "data_quality_reports"("created_at");

-- CreateIndex
CREATE INDEX "idx_metrics_type_name" ON "system_metrics"("metric_type", "metric_name");

-- CreateIndex
CREATE INDEX "idx_metrics_timestamp" ON "system_metrics"("timestamp");
