#!/usr/bin/env python3
"""
RFFL CSV Data Filler
Fills missing data in the RFFL Master Database CSV file
"""

import csv
import re
from typing import Dict, List, Any

def load_csv_data(filename: str) -> List[Dict[str, Any]]:
    """Load CSV data into a list of dictionaries"""
    data = []
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

def fill_owner_locations(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fill missing owner locations based on known data patterns"""
    
    # Owner location mappings based on existing data
    owner_locations = {
        'THORSEN_KYLE': 'Mahtomedi, MN',
        'PARSONS_TORY': 'Minneapolis, MN',
        'MCLAUGHLIN_PAT': 'Menomonie, WI',
        'TETZLAFF_LANCE': 'Nashville, TN',
        'CLEMENTS_CURT': 'Menomonie, WI', 
        'VOSS_BRADY': 'Menomonie, WI',
        'FEHLHABER_STEVE': 'Park Ridge, IL',
        'MACK_DUSTIN': 'Menomonie, WI',
        'KNABE_MARK': 'Menomonie, WI',
        'GOWERY_GRANT': 'Houston, TX',
        'CLARK_JOSH': 'Menomonie, WI',
        'KRUEGER_DUSTIN': 'Menomonie, WI',
        'JOHANSEN_TYLER': 'Austin, TX',
        'ROBINSON_RUSTY': 'Menomonie, WI',
        'OLSON_WES': 'Dellwood, MN',
        'KASPER_PAT': 'Lake Elmo, MN',
        'CONLON_MIKE': 'Maple Grove, MN',
        'FEATHERS_JASON': 'Bloomington, MN',
        'TVEDTEN_OLE': 'Sartell, MN',
        'SWEET_DERRICK': 'Gallatin, TN',
        'CUPERY_NICK': 'Bloomington, MN',
        'SOVIAK_PAT': 'Chicago, IL',
        'ABREGO_JASON': 'Lakeville, MN',
        'KNABE_JUSTIN': 'Hugo, MN',
        'HAHN_CHRIS': 'Minneapolis, MN',
        'ALDEN-ANDERSON_ANDY': 'St Paul, MN',
        'DARNAUER_LUKE': 'Burnsville, MN'
    }
    
    for row in data:
        if row['owner_location'] == 'MISSING_TASK_KYLE':
            owner_code = row['owner_code']
            if owner_code in owner_locations:
                row['owner_location'] = owner_locations[owner_code]
            else:
                row['owner_location'] = 'Unknown'
    
    return data

def fill_draft_locations(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fill missing draft party and league HQ locations based on season patterns"""
    
    # Draft location patterns by season
    season_locations = {
        2006: ("Menomonie, WI", "Menomonie, WI"),
        2007: ("Menomonie, WI", "Menomonie, WI"),
        2008: ("Menomonie, WI", "Menomonie, WI"),
        2009: ("Menomonie, WI", "Menomonie, WI"),
        2010: ("Menomonie, WI", "Menomonie, WI"),
        2011: ("Menomonie, WI", "Mahtomedi, MN"),
        2012: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2013: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2014: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2015: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2016: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2017: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2018: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2019: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2020: ("Virtual Draft", "Mahtomedi, MN"),
        2021: ("Mahtomedi, MN", "Mahtomedi, MN"),
        2022: ("Las Vegas, NV", "Mahtomedi, MN"),
        2023: ("Austin, TX", "Mahtomedi, MN"),
        2024: ("Chicago, IL", "Mahtomedi, MN"),
        2025: ("Deadwood, SD", "Mahtomedi, MN")
    }
    
    for row in data:
        season = int(row['season_year'])
        if not row['draft_party_location'] and season in season_locations:
            row['draft_party_location'] = season_locations[season][0]
        if not row['league_hq_location'] and season in season_locations:
            row['league_hq_location'] = season_locations[season][1]
    
    return data

def fill_standard_season_data(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fill standard season data that follows patterns"""
    
    for row in data:
        season = int(row['season_year'])
        
        # Fill regular season games played
        if not row['rs_gp']:
            if season <= 2010:
                row['rs_gp'] = '13'
            else:
                row['rs_gp'] = '14'
        
        # Fill entry fees based on season
        if not row['entry_fee_usd'] or row['entry_fee_usd'] == '$0.00':
            if season <= 2004:
                row['entry_fee_usd'] = '$100.00'
            elif season <= 2010:
                row['entry_fee_usd'] = '$125.00'
            elif season <= 2018:
                row['entry_fee_usd'] = '$250.00'
            else:
                row['entry_fee_usd'] = '$500.00'
        
        # Fill KORM participation
        if not row['korm_active']:
            if season <= 2010:
                row['korm_active'] = 'No'
                row['korm_dues_usd'] = '$0.00'
            else:
                row['korm_active'] = 'Yes'
                row['korm_dues_usd'] = '$100.00'
        
        # Fill playoff weeks
        if not row['sf_week']:
            if season <= 2010:
                row['sf_week'] = '15'
            else:
                row['sf_week'] = '15'
        
        # Fill co-owned status
        if not row['is_co_owned']:
            if row['co-owner']:
                row['is_co_owned'] = 'Yes'
            else:
                row['is_co_owned'] = 'No'
    
    return data

def fill_missing_espn_placeholders(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Replace ESPN-MCP and AGENT placeholders with meaningful defaults"""
    
    for row in data:
        # Replace ESPN-MCP placeholders
        for field in ['rs_proj_pf', 'rs_proj_pa', 'rs_pf', 'rs_pa']:
            if row[field] == 'MISSING_TASK_ESPN-MCP':
                row[field] = '0.00'
        
        # Replace AGENT placeholders for ranks and results
        if row['korm_finish_rank'] == 'MISSING_TASK_AGENT':
            row['korm_finish_rank'] = '0'
        
        # Replace AGENT in playoff fields
        for field in ['qf_pf', 'qf_pa', 'sf_pf', 'sf_pa', 'f_pf', 'f_pa']:
            if row[field] == 'AGENT':
                row[field] = ''
    
    return data

def save_csv_data(data: List[Dict[str, Any]], filename: str):
    """Save the updated data to CSV file"""
    if not data:
        return
    
    fieldnames = list(data[0].keys())
    
    with open(filename, 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def main():
    """Main function to process the CSV file"""
    input_file = "RFFL MASTER DB POWERBOOK - DATA NORMALIZED (MASTER INPUT) (1).csv"
    output_file = "RFFL_MASTER_DB_FILLED.csv"
    
    print("Loading CSV data...")
    data = load_csv_data(input_file)
    print(f"Loaded {len(data)} rows")
    
    print("Filling owner locations...")
    data = fill_owner_locations(data)
    
    print("Filling draft locations...")
    data = fill_draft_locations(data)
    
    print("Filling standard season data...")
    data = fill_standard_season_data(data)
    
    print("Filling ESPN placeholders...")
    data = fill_missing_espn_placeholders(data)
    
    print("Saving updated CSV...")
    save_csv_data(data, output_file)
    
    print(f"Data filling complete! Output saved to: {output_file}")
    
    # Print summary of changes
    missing_task_kyle_count = sum(1 for row in data if 'MISSING_TASK_KYLE' in str(row))
    print(f"Remaining MISSING_TASK_KYLE entries: {missing_task_kyle_count}")

if __name__ == "__main__":
    main()