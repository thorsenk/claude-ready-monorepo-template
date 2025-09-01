import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('DatabaseSeed');

/**
 * Database Seeding Script
 * Creates initial test data for development and testing purposes
 */
async function main() {
  logger.log('Starting database seeding...');

  try {
    // Create sample league
    const sampleLeague = await prisma.league.upsert({
      where: { espnLeagueId: 123456 },
      update: {},
      create: {
        espnLeagueId: 123456,
        name: 'RFFL Sample League',
        createdYear: 2020,
        leagueType: 'standard',
        visibility: 'private',
        status: 'active',
        description: 'Sample fantasy football league for testing and development',
        dataQualityScore: 95.5,
      },
    });

    logger.log(`Created sample league: ${sampleLeague.name} (ID: ${sampleLeague.id})`);

    // Create league settings for multiple seasons
    const seasons = [2020, 2021, 2022, 2023, 2024];
    
    for (const year of seasons) {
      await prisma.leagueSettings.upsert({
        where: {
          leagueId_seasonYear: {
            leagueId: sampleLeague.id,
            seasonYear: year,
          },
        },
        update: {},
        create: {
          leagueId: sampleLeague.id,
          seasonYear: year,
          teamCount: 10,
          playoffTeams: 4,
          regularSeasonWeeks: 14,
          playoffWeeks: 3,
          scoringType: 'ppr',
          qbScoring: {
            passingYards: 0.04,
            passingTouchdowns: 4,
            passingInterceptions: -2,
            rushing2ptConversions: 2,
          },
          rbScoring: {
            rushingYards: 0.1,
            rushingTouchdowns: 6,
            receivingYards: 0.1,
            receivingTouchdowns: 6,
            receptions: 1, // PPR
            fumbles: -2,
          },
          wrScoring: {
            receivingYards: 0.1,
            receivingTouchdowns: 6,
            receptions: 1, // PPR
            fumbles: -2,
          },
          teScoring: {
            receivingYards: 0.1,
            receivingTouchdowns: 6,
            receptions: 1, // PPR
            fumbles: -2,
          },
          kScoring: {
            fieldGoals0to19: 3,
            fieldGoals20to29: 3,
            fieldGoals30to39: 3,
            fieldGoals40to49: 4,
            fieldGoals50plus: 5,
            extraPoints: 1,
            missedExtraPoints: -1,
          },
          defScoring: {
            sacks: 1,
            interceptions: 2,
            fumbleRecoveries: 2,
            safeties: 2,
            defensiveTouchdowns: 6,
            blockedKicks: 2,
            pointsAllowed0: 10,
            pointsAllowed1to6: 7,
            pointsAllowed7to13: 4,
            pointsAllowed14to20: 1,
            pointsAllowed21to27: 0,
            pointsAllowed28to34: -1,
            pointsAllowed35plus: -4,
          },
          rosterPositions: {
            'QB': 1,
            'RB': 2,
            'WR': 2,
            'TE': 1,
            'FLEX': 1,
            'D/ST': 1,
            'K': 1,
            'BENCH': 6,
          },
          benchSpots: 6,
          irSpots: 1,
          waiverType: 'rolling',
          waiverPeriodDays: 2,
          tradeDeadlineWeek: 11,
          acquisitionBudget: 100,
          draftType: 'snake',
        },
      });
    }

    logger.log(`Created league settings for seasons: ${seasons.join(', ')}`);

    // Create sample teams
    const teamNames = [
      'The Touchdown Titans', 'Gridiron Gladiators', 'End Zone Eagles',
      'Field Goal Fanatics', 'Rushing Raiders', 'Passing Pioneers',
      'Defense Dynasty', 'Fantasy Phenoms', 'Championship Chasers', 'Victory Vikings'
    ];

    const sampleTeams = [];
    
    for (let i = 0; i < teamNames.length; i++) {
      const team = await prisma.team.upsert({
        where: {
          leagueId_espnTeamId: {
            leagueId: sampleLeague.id,
            espnTeamId: i + 1,
          },
        },
        update: {},
        create: {
          espnTeamId: i + 1,
          leagueId: sampleLeague.id,
          name: teamNames[i],
          abbreviation: teamNames[i].split(' ').map(w => w[0]).join('').toUpperCase(),
          ownerName: `Owner ${i + 1}`,
          coOwnerNames: [],
        },
      });
      
      sampleTeams.push(team);
    }

    logger.log(`Created ${sampleTeams.length} sample teams`);

    // Create team seasons with sample records
    for (const year of seasons) {
      for (let i = 0; i < sampleTeams.length; i++) {
        const team = sampleTeams[i];
        
        // Generate random but realistic season records
        const wins = Math.floor(Math.random() * 9) + 3; // 3-11 wins
        const losses = 14 - wins;
        const pointsFor = Math.floor(Math.random() * 400) + 1200; // 1200-1600 points
        const pointsAgainst = Math.floor(Math.random() * 400) + 1200;
        
        await prisma.teamSeason.upsert({
          where: {
            teamId_seasonYear: {
              teamId: team.id,
              seasonYear: year,
            },
          },
          update: {},
          create: {
            teamId: team.id,
            leagueId: sampleLeague.id,
            seasonYear: year,
            finalStanding: i + 1, // Will be adjusted based on record
            regularSeasonWins: wins,
            regularSeasonLosses: losses,
            regularSeasonTies: 0,
            pointsFor: pointsFor,
            pointsAgainst: pointsAgainst,
            acquisitionBudget: 100,
          },
        });
      }
    }

    logger.log(`Created team season records for all teams and seasons`);

    // Create sample players
    const samplePlayers = [
      // Quarterbacks
      { name: 'Josh Allen', position: 'QB', team: 'BUF', espnId: 3294 },
      { name: 'Patrick Mahomes', position: 'QB', team: 'KC', espnId: 3139477 },
      { name: 'Lamar Jackson', position: 'QB', team: 'BAL', espnId: 3916387 },
      { name: 'Aaron Rodgers', position: 'QB', team: 'NYJ', espnId: 8439 },
      
      // Running Backs  
      { name: 'Christian McCaffrey', position: 'RB', team: 'SF', espnId: 3043048 },
      { name: 'Derrick Henry', position: 'RB', team: 'BAL', espnId: 2976499 },
      { name: 'Alvin Kamara', position: 'RB', team: 'NO', espnId: 3054850 },
      { name: 'Dalvin Cook', position: 'RB', team: 'NYJ', espnId: 2976644 },
      
      // Wide Receivers
      { name: 'Davante Adams', position: 'WR', team: 'LV', espnId: 2330250 },
      { name: 'Tyreek Hill', position: 'WR', team: 'MIA', espnId: 2976316 },
      { name: 'Stefon Diggs', position: 'WR', team: 'HOU', espnId: 2976499 },
      { name: 'DeAndre Hopkins', position: 'WR', team: 'TEN', espnId: 15705 },
      
      // Tight Ends
      { name: 'Travis Kelce', position: 'TE', team: 'KC', espnId: 15847 },
      { name: 'Mark Andrews', position: 'TE', team: 'BAL', espnId: 3915416 },
      { name: 'George Kittle', position: 'TE', team: 'SF', espnId: 3040151 },
      
      // Kickers
      { name: 'Justin Tucker', position: 'K', team: 'BAL', espnId: 14429 },
      { name: 'Harrison Butker', position: 'K', team: 'KC', espnId: 3046779 },
      
      // Defense
      { name: 'San Francisco 49ers', position: 'D/ST', team: 'SF', espnId: -16025 },
      { name: 'Buffalo Bills', position: 'D/ST', team: 'BUF', espnId: -16002 },
    ];

    for (const player of samplePlayers) {
      await prisma.player.upsert({
        where: { espnPlayerId: player.espnId },
        update: {},
        create: {
          espnPlayerId: player.espnId,
          name: player.name,
          position: player.position,
          team: player.team,
          status: 'active',
        },
      });
    }

    logger.log(`Created ${samplePlayers.length} sample players`);

    // Create sample player stats for 2024 season
    const players = await prisma.player.findMany();
    const currentYear = 2024;
    
    for (let week = 1; week <= 8; week++) {
      for (const player of players.slice(0, 10)) { // First 10 players only to avoid too much seed data
        let fantasyPoints = 0;
        let passingStats = {};
        let rushingStats = {};
        let receivingStats = {};
        let kickingStats = {};
        let defenseStats = {};
        
        // Generate position-specific stats
        switch (player.position) {
          case 'QB':
            const passingYards = Math.floor(Math.random() * 200) + 200; // 200-400 yards
            const passingTDs = Math.floor(Math.random() * 3) + 1; // 1-3 TDs
            const interceptions = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 1 : 0;
            const rushingYards = Math.floor(Math.random() * 50); // 0-50 rushing yards
            const rushingTDs = Math.random() < 0.2 ? 1 : 0;
            
            fantasyPoints = (passingYards * 0.04) + (passingTDs * 4) + (interceptions * -2) + 
                           (rushingYards * 0.1) + (rushingTDs * 6);
                           
            passingStats = {
              attempts: Math.floor(passingYards / 7) + Math.floor(Math.random() * 10),
              completions: Math.floor(passingYards / 11) + Math.floor(Math.random() * 5),
              yards: passingYards,
              touchdowns: passingTDs,
              interceptions,
            };
            
            rushingStats = {
              attempts: Math.floor(rushingYards / 5) + 1,
              yards: rushingYards,
              touchdowns: rushingTDs,
            };
            break;
            
          case 'RB':
            const rbRushingYards = Math.floor(Math.random() * 100) + 50; // 50-150 yards
            const rbRushingTDs = Math.random() < 0.4 ? Math.floor(Math.random() * 2) + 1 : 0;
            const receptions = Math.floor(Math.random() * 6) + 1; // 1-6 catches
            const receivingYards = receptions * (Math.floor(Math.random() * 8) + 5); // 5-12 yards per catch
            const receivingTDs = Math.random() < 0.2 ? 1 : 0;
            
            fantasyPoints = (rbRushingYards * 0.1) + (rbRushingTDs * 6) + 
                           (receivingYards * 0.1) + (receivingTDs * 6) + receptions; // PPR
                           
            rushingStats = {
              attempts: Math.floor(rbRushingYards / 4) + Math.floor(Math.random() * 5),
              yards: rbRushingYards,
              touchdowns: rbRushingTDs,
            };
            
            receivingStats = {
              targets: receptions + Math.floor(Math.random() * 3),
              receptions,
              yards: receivingYards,
              touchdowns: receivingTDs,
            };
            break;
            
          case 'WR':
            const wrReceptions = Math.floor(Math.random() * 8) + 3; // 3-10 catches
            const wrReceivingYards = wrReceptions * (Math.floor(Math.random() * 10) + 8); // 8-17 yards per catch
            const wrReceivingTDs = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 1 : 0;
            
            fantasyPoints = (wrReceivingYards * 0.1) + (wrReceivingTDs * 6) + wrReceptions; // PPR
                           
            receivingStats = {
              targets: wrReceptions + Math.floor(Math.random() * 4),
              receptions: wrReceptions,
              yards: wrReceivingYards,
              touchdowns: wrReceivingTDs,
            };
            break;
            
          case 'K':
            const extraPoints = Math.floor(Math.random() * 4) + 1; // 1-4 XPs
            const fieldGoals = Math.random() < 0.7 ? Math.floor(Math.random() * 3) + 1 : 0; // 0-3 FGs
            
            fantasyPoints = (extraPoints * 1) + (fieldGoals * 3.5); // Average FG value
            
            kickingStats = {
              extraPointsAttempted: extraPoints + (Math.random() < 0.1 ? 1 : 0),
              extraPointsMade: extraPoints,
              fieldGoalsAttempted: fieldGoals + (Math.random() < 0.2 ? 1 : 0),
              fieldGoalsMade: fieldGoals,
            };
            break;
            
          case 'D/ST':
            const sacks = Math.floor(Math.random() * 4); // 0-3 sacks
            const defInterceptions = Math.random() < 0.3 ? Math.floor(Math.random() * 2) + 1 : 0;
            const fumbleRecoveries = Math.random() < 0.2 ? 1 : 0;
            const defTDs = Math.random() < 0.1 ? 1 : 0;
            const pointsAllowed = Math.floor(Math.random() * 28) + 7; // 7-34 points allowed
            
            let pointsAllowedScore = 0;
            if (pointsAllowed === 0) pointsAllowedScore = 10;
            else if (pointsAllowed <= 6) pointsAllowedScore = 7;
            else if (pointsAllowed <= 13) pointsAllowedScore = 4;
            else if (pointsAllowed <= 20) pointsAllowedScore = 1;
            else if (pointsAllowed <= 27) pointsAllowedScore = 0;
            else if (pointsAllowed <= 34) pointsAllowedScore = -1;
            else pointsAllowedScore = -4;
            
            fantasyPoints = (sacks * 1) + (defInterceptions * 2) + (fumbleRecoveries * 2) + 
                           (defTDs * 6) + pointsAllowedScore;
                           
            defenseStats = {
              sacks,
              interceptions: defInterceptions,
              fumbleRecoveries,
              touchdowns: defTDs,
              pointsAllowed,
            };
            break;
        }

        await prisma.playerWeekStats.create({
          data: {
            playerId: player.id,
            seasonYear: currentYear,
            weekNumber: week,
            fantasyPoints: Math.round(fantasyPoints * 100) / 100, // Round to 2 decimal places
            passingStats,
            rushingStats,
            receivingStats,
            kickingStats,
            defenseStats,
            dataSource: 'seed',
            confidenceScore: 100,
          },
        });
      }
    }

    logger.log(`Created sample player statistics for weeks 1-8 of ${currentYear} season`);

    // Create sample data quality report
    await prisma.dataQualityReport.create({
      data: {
        leagueId: sampleLeague.id,
        seasonYear: currentYear,
        reportType: 'season_summary',
        overallScore: 95.5,
        completenessScore: 98.2,
        accuracyScore: 94.1,
        consistencyScore: 96.3,
        timelinessScore: 93.8,
        validityScore: 97.1,
        qualityGrade: 'A',
        issuesFound: [
          {
            type: 'missing_transaction_data',
            severity: 'warning',
            description: 'Some transaction data missing for weeks 5-6',
            affectedRecords: 12,
          },
          {
            type: 'statistical_outlier',
            severity: 'info', 
            description: 'Unusually high fantasy points for Josh Allen in week 3',
            affectedRecords: 1,
          },
        ],
        recommendedActions: [
          'Re-fetch transaction data for weeks 5-6',
          'Verify Josh Allen week 3 statistics against NFL official data',
          'Run consistency check on all quarterback statistics',
        ],
      },
    });

    logger.log('Created sample data quality report');

    // Create sample ingestion job
    await prisma.dataIngestionJob.create({
      data: {
        jobType: 'league_history',
        leagueId: sampleLeague.id,
        status: 'completed',
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
        completedAt: new Date(),
        recordsProcessed: 850,
        errorsCount: 3,
        successRate: 0.996,
        qualityScore: 95.5,
        metadata: {
          seasons: seasons,
          batchSize: 5,
          parallelJobs: 2,
        },
        errorMessages: [
          'Failed to fetch week 17 data for season 2020',
          'Player ID 12345 not found in database',
          'Rate limit exceeded, retrying after cooldown',
        ],
      },
    });

    logger.log('Created sample ingestion job record');

    logger.log('Database seeding completed successfully!');
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });