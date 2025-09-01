#!/usr/bin/env python3
"""
Analyze PF/PA data in RFFL CSV to identify patterns and missing data
"""

import csv
from collections import defaultdict
import statistics

def analyze_pf_pa_data(filename):
    """Analyze PF/PA data by season and identify patterns"""
    
    season_data = defaultdict(list)
    missing_by_season = defaultdict(int)
    complete_seasons = []
    
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            season = int(row['season_year'])
            rs_pf = row['rs_pf'].strip()
            rs_pa = row['rs_pa'].strip()
            
            # Check if this row has complete PF/PA data
            if rs_pf and rs_pa and rs_pf != '0.00' and rs_pa != '0.00' and rs_pf != 'MISSING_TASK_ESPN-MCP':
                try:
                    pf_val = float(rs_pf)
                    pa_val = float(rs_pa)
                    season_data[season].append({
                        'team': row['team_code'],
                        'pf': pf_val,
                        'pa': pa_val,
                        'wins': int(row['rs_wins']) if row['rs_wins'] else 0,
                        'losses': int(row['rs_losses']) if row['rs_losses'] else 0
                    })
                except ValueError:
                    missing_by_season[season] += 1
            else:
                missing_by_season[season] += 1
    
    # Calculate season statistics
    print("=== PF/PA Data Analysis by Season ===\n")
    
    for season in sorted(season_data.keys()):
        teams = season_data[season]
        if len(teams) >= 8:  # Consider seasons with most data complete
            pf_values = [team['pf'] for team in teams]
            pa_values = [team['pa'] for team in teams]
            
            avg_pf = statistics.mean(pf_values)
            avg_pa = statistics.mean(pa_values)
            
            print(f"Season {season} - Complete data for {len(teams)} teams:")
            print(f"  Average PF: {avg_pf:.2f}")
            print(f"  Average PA: {avg_pa:.2f}")
            print(f"  PF Range: {min(pf_values):.2f} - {max(pf_values):.2f}")
            print(f"  Missing entries: {missing_by_season[season]}")
            
            complete_seasons.append({
                'season': season,
                'avg_pf': avg_pf,
                'avg_pa': avg_pa,
                'teams': len(teams)
            })
            print()
    
    # Show incomplete seasons
    print("=== Seasons with Missing PF/PA Data ===\n")
    all_seasons = set()
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            all_seasons.add(int(row['season_year']))
    
    for season in sorted(all_seasons):
        complete_count = len(season_data[season])
        missing_count = missing_by_season[season]
        total_count = complete_count + missing_count
        
        if complete_count < total_count * 0.8:  # Less than 80% complete
            print(f"Season {season}: {complete_count}/{total_count} complete ({missing_count} missing)")
    
    return complete_seasons, season_data

def generate_historical_averages(complete_seasons, season_data):
    """Generate historical averages for filling missing data"""
    
    print("\n=== Historical Trends for Data Filling ===\n")
    
    # Overall averages by era
    early_era = []  # 2002-2010
    middle_era = []  # 2011-2018  
    modern_era = []  # 2019+
    
    for season_info in complete_seasons:
        season = season_info['season']
        if season <= 2010:
            early_era.append(season_info)
        elif season <= 2018:
            middle_era.append(season_info)
        else:
            modern_era.append(season_info)
    
    eras = [
        ("Early Era (2002-2010)", early_era),
        ("Middle Era (2011-2018)", middle_era), 
        ("Modern Era (2019+)", modern_era)
    ]
    
    for era_name, era_data in eras:
        if era_data:
            avg_pf = statistics.mean([s['avg_pf'] for s in era_data])
            avg_pa = statistics.mean([s['avg_pa'] for s in era_data])
            print(f"{era_name}:")
            print(f"  Average PF: {avg_pf:.2f}")
            print(f"  Average PA: {avg_pa:.2f}")
            print()
    
    # Team-specific averages for teams with enough data
    print("=== Team Historical Averages ===\n")
    team_stats = defaultdict(list)
    
    for season, teams in season_data.items():
        for team in teams:
            team_stats[team['team']].append({
                'season': season,
                'pf': team['pf'],
                'pa': team['pa'],
                'wins': team['wins']
            })
    
    for team_code in sorted(team_stats.keys()):
        team_data = team_stats[team_code]
        if len(team_data) >= 3:  # Teams with at least 3 seasons of data
            avg_pf = statistics.mean([t['pf'] for t in team_data])
            avg_pa = statistics.mean([t['pa'] for t in team_data])
            seasons_played = len(team_data)
            print(f"{team_code}: {seasons_played} seasons - Avg PF: {avg_pf:.2f}, Avg PA: {avg_pa:.2f}")

if __name__ == "__main__":
    filename = "RFFL MASTER DB POWERBOOK - DATA NORMALIZED (MASTER INPUT) (1).csv"
    complete_seasons, season_data = analyze_pf_pa_data(filename)
    generate_historical_averages(complete_seasons, season_data)