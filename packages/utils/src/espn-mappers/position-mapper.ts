/**
 * ESPN Position Mapping Utilities
 * Maps ESPN position and slot IDs to normalized position strings
 */

// ESPN Position ID to Position Name mapping
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
  20: 'BENCH',
  21: 'IR',
  23: 'FLEX',
  24: 'SUPER_FLEX',
} as const;

// ESPN Lineup Slot ID mapping
export const ESPN_LINEUP_SLOT_MAP: Record<number, string> = {
  0: 'QB',
  1: 'QB', 
  2: 'RB',
  3: 'RB',
  4: 'WR',
  5: 'WR',
  6: 'TE',
  7: 'FLEX',
  16: 'D/ST',
  17: 'K',
  20: 'BENCH',
  21: 'IR',
  23: 'SUPER_FLEX',
  24: 'OP', // Offensive Player
} as const;

// Reverse mapping for lookups
export const POSITION_TO_ESPN_ID: Record<string, number[]> = {
  'QB': [0, 1],
  'RB': [2, 3],
  'WR': [4, 5],
  'TE': [6],
  'D/ST': [16],
  'K': [17],
  'FLEX': [7, 23],
  'BENCH': [20],
  'IR': [21],
  'SUPER_FLEX': [24],
};

/**
 * Map ESPN position ID to normalized position string
 */
export function mapESPNPosition(positionId: number): string {
  return ESPN_POSITION_MAP[positionId] || 'UNKNOWN';
}

/**
 * Map ESPN lineup slot ID to roster slot string  
 */
export function mapESPNLineupSlot(slotId: number): string {
  return ESPN_LINEUP_SLOT_MAP[slotId] || 'UNKNOWN';
}

/**
 * Get ESPN position IDs for a normalized position
 */
export function getESPNPositionIds(position: string): number[] {
  return POSITION_TO_ESPN_ID[position.toUpperCase()] || [];
}

/**
 * Check if a position is eligible for a lineup slot
 */
export function isPositionEligibleForSlot(
  playerEligibleSlots: number[],
  slotId: number
): boolean {
  return playerEligibleSlots.includes(slotId);
}

/**
 * Get all eligible roster positions for a player
 */
export function getEligiblePositions(eligibleSlots: number[]): string[] {
  const positions = new Set<string>();
  
  eligibleSlots.forEach(slotId => {
    const position = mapESPNLineupSlot(slotId);
    if (position !== 'UNKNOWN') {
      positions.add(position);
    }
  });
  
  return Array.from(positions);
}

/**
 * Determine if a lineup slot is a starting position
 */
export function isStartingPosition(slotId: number): boolean {
  const nonStartingSlots = [20, 21]; // BENCH, IR
  return !nonStartingSlots.includes(slotId);
}

/**
 * Get position priority for sorting/ranking
 */
export function getPositionPriority(position: string): number {
  const priorities: Record<string, number> = {
    'QB': 1,
    'RB': 2, 
    'WR': 3,
    'TE': 4,
    'FLEX': 5,
    'SUPER_FLEX': 6,
    'K': 7,
    'D/ST': 8,
    'BENCH': 9,
    'IR': 10,
  };
  
  return priorities[position.toUpperCase()] || 99;
}

/**
 * Validate ESPN position data consistency
 */
export function validatePositionConsistency(
  defaultPositionId: number,
  eligibleSlots: number[]
): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const defaultPosition = mapESPNPosition(defaultPositionId);
  
  if (defaultPosition === 'UNKNOWN') {
    issues.push(`Invalid default position ID: ${defaultPositionId}`);
  }
  
  // Check if default position is in eligible slots
  if (defaultPositionId !== 0) { // Skip validation for QB (position 0)
    const isEligible = eligibleSlots.some(slotId => {
      const slotPosition = mapESPNLineupSlot(slotId);
      return slotPosition === defaultPosition;
    });
    
    if (!isEligible) {
      issues.push(`Default position ${defaultPosition} not found in eligible slots`);
    }
  }
  
  // Check for invalid slot IDs
  const invalidSlots = eligibleSlots.filter(slotId => 
    mapESPNLineupSlot(slotId) === 'UNKNOWN'
  );
  
  if (invalidSlots.length > 0) {
    issues.push(`Invalid eligible slot IDs: ${invalidSlots.join(', ')}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}