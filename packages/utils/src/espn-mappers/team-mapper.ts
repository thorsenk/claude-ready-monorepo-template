/**
 * ESPN Team Mapping Utilities
 * Maps ESPN pro team IDs to NFL team abbreviations and metadata
 */

// ESPN Pro Team ID to NFL Team mapping
export const ESPN_PRO_TEAM_MAP: Record<number, {
  abbreviation: string;
  city: string;
  name: string;
  conference: 'AFC' | 'NFC';
  division: 'North' | 'South' | 'East' | 'West';
}> = {
  1: { abbreviation: 'ATL', city: 'Atlanta', name: 'Falcons', conference: 'NFC', division: 'South' },
  2: { abbreviation: 'BUF', city: 'Buffalo', name: 'Bills', conference: 'AFC', division: 'East' },
  3: { abbreviation: 'CHI', city: 'Chicago', name: 'Bears', conference: 'NFC', division: 'North' },
  4: { abbreviation: 'CIN', city: 'Cincinnati', name: 'Bengals', conference: 'AFC', division: 'North' },
  5: { abbreviation: 'CLE', city: 'Cleveland', name: 'Browns', conference: 'AFC', division: 'North' },
  6: { abbreviation: 'DAL', city: 'Dallas', name: 'Cowboys', conference: 'NFC', division: 'East' },
  7: { abbreviation: 'DEN', city: 'Denver', name: 'Broncos', conference: 'AFC', division: 'West' },
  8: { abbreviation: 'DET', city: 'Detroit', name: 'Lions', conference: 'NFC', division: 'North' },
  9: { abbreviation: 'GB', city: 'Green Bay', name: 'Packers', conference: 'NFC', division: 'North' },
  10: { abbreviation: 'TEN', city: 'Tennessee', name: 'Titans', conference: 'AFC', division: 'South' },
  11: { abbreviation: 'IND', city: 'Indianapolis', name: 'Colts', conference: 'AFC', division: 'South' },
  12: { abbreviation: 'KC', city: 'Kansas City', name: 'Chiefs', conference: 'AFC', division: 'West' },
  13: { abbreviation: 'LV', city: 'Las Vegas', name: 'Raiders', conference: 'AFC', division: 'West' },
  14: { abbreviation: 'LAR', city: 'Los Angeles', name: 'Rams', conference: 'NFC', division: 'West' },
  15: { abbreviation: 'MIA', city: 'Miami', name: 'Dolphins', conference: 'AFC', division: 'East' },
  16: { abbreviation: 'MIN', city: 'Minnesota', name: 'Vikings', conference: 'NFC', division: 'North' },
  17: { abbreviation: 'NE', city: 'New England', name: 'Patriots', conference: 'AFC', division: 'East' },
  18: { abbreviation: 'NO', city: 'New Orleans', name: 'Saints', conference: 'NFC', division: 'South' },
  19: { abbreviation: 'NYG', city: 'New York', name: 'Giants', conference: 'NFC', division: 'East' },
  20: { abbreviation: 'NYJ', city: 'New York', name: 'Jets', conference: 'AFC', division: 'East' },
  21: { abbreviation: 'PHI', city: 'Philadelphia', name: 'Eagles', conference: 'NFC', division: 'East' },
  22: { abbreviation: 'ARI', city: 'Arizona', name: 'Cardinals', conference: 'NFC', division: 'West' },
  23: { abbreviation: 'PIT', city: 'Pittsburgh', name: 'Steelers', conference: 'AFC', division: 'North' },
  24: { abbreviation: 'LAC', city: 'Los Angeles', name: 'Chargers', conference: 'AFC', division: 'West' },
  25: { abbreviation: 'SF', city: 'San Francisco', name: '49ers', conference: 'NFC', division: 'West' },
  26: { abbreviation: 'SEA', city: 'Seattle', name: 'Seahawks', conference: 'NFC', division: 'West' },
  27: { abbreviation: 'TB', city: 'Tampa Bay', name: 'Buccaneers', conference: 'NFC', division: 'South' },
  28: { abbreviation: 'WAS', city: 'Washington', name: 'Commanders', conference: 'NFC', division: 'East' },
  29: { abbreviation: 'CAR', city: 'Carolina', name: 'Panthers', conference: 'NFC', division: 'South' },
  30: { abbreviation: 'JAX', city: 'Jacksonville', name: 'Jaguars', conference: 'AFC', division: 'South' },
  33: { abbreviation: 'BAL', city: 'Baltimore', name: 'Ravens', conference: 'AFC', division: 'North' },
  34: { abbreviation: 'HOU', city: 'Houston', name: 'Texans', conference: 'AFC', division: 'South' },
} as const;

// Reverse mapping for abbreviation to ESPN ID
export const NFL_TEAM_TO_ESPN_ID: Record<string, number> = Object.entries(ESPN_PRO_TEAM_MAP)
  .reduce((acc, [id, team]) => {
    acc[team.abbreviation] = parseInt(id);
    return acc;
  }, {} as Record<string, number>);

/**
 * Map ESPN pro team ID to NFL team abbreviation
 */
export function mapESPNProTeam(proTeamId: number): string | null {
  return ESPN_PRO_TEAM_MAP[proTeamId]?.abbreviation || null;
}

/**
 * Get full team information from ESPN pro team ID
 */
export function getTeamInfo(proTeamId: number): typeof ESPN_PRO_TEAM_MAP[number] | null {
  return ESPN_PRO_TEAM_MAP[proTeamId] || null;
}

/**
 * Get ESPN pro team ID from NFL abbreviation
 */
export function getESPNProTeamId(abbreviation: string): number | null {
  return NFL_TEAM_TO_ESPN_ID[abbreviation.toUpperCase()] || null;
}

/**
 * Get teams by conference
 */
export function getTeamsByConference(conference: 'AFC' | 'NFC'): Array<{
  id: number;
  info: typeof ESPN_PRO_TEAM_MAP[number];
}> {
  return Object.entries(ESPN_PRO_TEAM_MAP)
    .filter(([, team]) => team.conference === conference)
    .map(([id, info]) => ({ id: parseInt(id), info }));
}

/**
 * Get teams by division
 */
export function getTeamsByDivision(
  conference: 'AFC' | 'NFC',
  division: 'North' | 'South' | 'East' | 'West'
): Array<{
  id: number;
  info: typeof ESPN_PRO_TEAM_MAP[number];
}> {
  return Object.entries(ESPN_PRO_TEAM_MAP)
    .filter(([, team]) => team.conference === conference && team.division === division)
    .map(([id, info]) => ({ id: parseInt(id), info }));
}

/**
 * Validate ESPN pro team ID
 */
export function isValidESPNProTeamId(proTeamId: number): boolean {
  return proTeamId in ESPN_PRO_TEAM_MAP;
}

/**
 * Get all valid ESPN pro team IDs
 */
export function getAllESPNProTeamIds(): number[] {
  return Object.keys(ESPN_PRO_TEAM_MAP).map(id => parseInt(id));
}

/**
 * Get all NFL team abbreviations
 */
export function getAllNFLTeamAbbreviations(): string[] {
  return Object.values(ESPN_PRO_TEAM_MAP).map(team => team.abbreviation);
}

/**
 * Format team display name
 */
export function formatTeamDisplayName(
  proTeamId: number,
  format: 'full' | 'city_name' | 'abbreviation' = 'full'
): string {
  const team = ESPN_PRO_TEAM_MAP[proTeamId];
  
  if (!team) {
    return 'Unknown Team';
  }
  
  switch (format) {
    case 'full':
      return `${team.city} ${team.name}`;
    case 'city_name':
      return `${team.city} ${team.name}`;
    case 'abbreviation':
      return team.abbreviation;
    default:
      return `${team.city} ${team.name}`;
  }
}

/**
 * Get opponent team for scheduling/matchup purposes
 * This would require additional data about NFL schedules
 */
export function getOpponentTeam(
  teamAbbreviation: string,
  week: number,
  season: number
): string | null {
  // This would require NFL schedule data integration
  // For now, return null - to be implemented with NFL schedule API
  return null;
}

/**
 * Determine if game is home/away based on team and opponent
 * This would require NFL schedule data
 */
export function isHomeGame(
  teamAbbreviation: string,
  opponentAbbreviation: string,
  week: number,
  season: number
): boolean | null {
  // This would require NFL schedule data integration
  // For now, return null - to be implemented with NFL schedule API
  return null;
}

/**
 * Get team's bye week for a given season
 */
export function getTeamByeWeek(
  teamAbbreviation: string,
  season: number
): number | null {
  // This would require NFL schedule data
  // Bye weeks typically occur between weeks 4-14
  // For now, return null - to be implemented with NFL schedule API
  return null;
}

/**
 * Historical team name/location changes
 * Useful for mapping older data correctly
 */
export const TEAM_HISTORY_MAP: Record<string, Array<{
  seasons: [number, number]; // [start_year, end_year] 
  abbreviation: string;
  city: string;
  name: string;
}>> = {
  'WAS': [
    { seasons: [1937, 2019], abbreviation: 'WAS', city: 'Washington', name: 'Redskins' },
    { seasons: [2020, 2021], abbreviation: 'WAS', city: 'Washington', name: 'Football Team' },
    { seasons: [2022, 2024], abbreviation: 'WAS', city: 'Washington', name: 'Commanders' },
  ],
  'LV': [
    { seasons: [1960, 1981], abbreviation: 'OAK', city: 'Oakland', name: 'Raiders' },
    { seasons: [1982, 1994], abbreviation: 'LA', city: 'Los Angeles', name: 'Raiders' },
    { seasons: [1995, 2019], abbreviation: 'OAK', city: 'Oakland', name: 'Raiders' },
    { seasons: [2020, 2024], abbreviation: 'LV', city: 'Las Vegas', name: 'Raiders' },
  ],
  'LAC': [
    { seasons: [1960, 1960], abbreviation: 'LAC', city: 'Los Angeles', name: 'Chargers' },
    { seasons: [1961, 2016], abbreviation: 'SD', city: 'San Diego', name: 'Chargers' },
    { seasons: [2017, 2024], abbreviation: 'LAC', city: 'Los Angeles', name: 'Chargers' },
  ],
  'LAR': [
    { seasons: [1937, 1994], abbreviation: 'LA', city: 'Los Angeles', name: 'Rams' },
    { seasons: [1995, 2015], abbreviation: 'STL', city: 'St. Louis', name: 'Rams' },
    { seasons: [2016, 2024], abbreviation: 'LAR', city: 'Los Angeles', name: 'Rams' },
  ],
};

/**
 * Get historical team info for a specific season
 */
export function getHistoricalTeamInfo(
  currentAbbreviation: string,
  season: number
): {
  abbreviation: string;
  city: string;
  name: string;
} | null {
  const history = TEAM_HISTORY_MAP[currentAbbreviation];
  
  if (!history) {
    // No history available, return current info
    const espnId = getESPNProTeamId(currentAbbreviation);
    if (espnId) {
      const currentInfo = getTeamInfo(espnId);
      if (currentInfo) {
        return {
          abbreviation: currentInfo.abbreviation,
          city: currentInfo.city,
          name: currentInfo.name,
        };
      }
    }
    return null;
  }
  
  // Find the historical entry for the given season
  const historicalInfo = history.find(entry => 
    season >= entry.seasons[0] && season <= entry.seasons[1]
  );
  
  return historicalInfo || null;
}