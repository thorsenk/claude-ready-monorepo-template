'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Filter, X, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Season {
  year: number;
  teamsCount: number;
  gamesCount: number;
  isComplete: boolean;
}

interface SeasonFilterProps {
  selectedSeasons: number[];
  onSeasonsChange: (seasons: number[]) => void;
  className?: string;
}

export function SeasonFilter({ selectedSeasons, onSeasonsChange, className }: SeasonFilterProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'single' | 'multi'>('all');

  const { data: seasons, isLoading } = useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const overview = await apiClient.getLeagueOverview();
      return overview.seasonsData.sort((a, b) => b.year - a.year);
    },
  });

  const handleSeasonToggle = (year: number) => {
    if (filterMode === 'single') {
      onSeasonsChange([year]);
    } else if (filterMode === 'multi') {
      const newSelected = selectedSeasons.includes(year)
        ? selectedSeasons.filter(s => s !== year)
        : [...selectedSeasons, year];
      onSeasonsChange(newSelected);
    }
  };

  const handleModeChange = (mode: 'all' | 'single' | 'multi') => {
    setFilterMode(mode);
    if (mode === 'all') {
      onSeasonsChange([]);
    } else if (mode === 'single' && selectedSeasons.length > 1) {
      onSeasonsChange([selectedSeasons[0]]);
    }
  };

  const clearAllSelections = () => {
    onSeasonsChange([]);
    setFilterMode('all');
  };

  const selectAllSeasons = () => {
    if (seasons) {
      onSeasonsChange(seasons.map(s => s.year));
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Season Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded-md" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Season Filter
          {selectedSeasons.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedSeasons.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Mode Selection */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('all')}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            All Seasons
          </Button>
          <Button
            variant={filterMode === 'single' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('single')}
          >
            Single Season
          </Button>
          <Button
            variant={filterMode === 'multi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('multi')}
          >
            Multiple Seasons
          </Button>
        </div>

        {/* Quick Actions */}
        {filterMode === 'multi' && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={selectAllSeasons}>
              <CheckSquare className="h-4 w-4 mr-1" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllSelections}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Single Season Dropdown */}
        {filterMode === 'single' && (
          <Select
            value={selectedSeasons[0]?.toString() || ''}
            onValueChange={(value) => onSeasonsChange([parseInt(value)])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              {seasons?.map((season) => (
                <SelectItem key={season.year} value={season.year.toString()}>
                  <div className="flex items-center gap-2">
                    {season.year}
                    <Badge 
                      variant={season.isComplete ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {season.isComplete ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Season Selection Grid */}
        {(filterMode === 'multi' || filterMode === 'all') && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {seasons?.map((season) => {
              const isSelected = selectedSeasons.includes(season.year);
              const isDisabled = filterMode === 'all';
              
              return (
                <Button
                  key={season.year}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleSeasonToggle(season.year)}
                  className={cn(
                    "flex flex-col h-auto py-2 px-3 gap-1 transition-all",
                    isSelected && "ring-2 ring-primary/20",
                    !isDisabled && "hover:scale-105"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {filterMode === 'multi' && (
                      isSelected ? 
                        <CheckSquare className="h-3 w-3" /> : 
                        <Square className="h-3 w-3" />
                    )}
                    <span className="font-semibold">{season.year}</span>
                  </div>
                  <div className="text-xs opacity-75 space-y-0.5">
                    <div>{season.gamesCount} games</div>
                    <Badge 
                      variant={season.isComplete ? 'default' : 'secondary'}
                      className="text-xs h-4 px-1"
                    >
                      {season.isComplete ? '✓' : '○'}
                    </Badge>
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        {/* Selected Seasons Summary */}
        {selectedSeasons.length > 0 && filterMode !== 'all' && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Selected Seasons:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllSelections}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedSeasons.sort((a, b) => b - a).map((year) => {
                const season = seasons?.find(s => s.year === year);
                return (
                  <Badge
                    key={year}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {year}
                    {season && (
                      <span className="text-xs opacity-75">
                        ({season.gamesCount})
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSeasonToggle(year)}
                      className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Total Games: {seasons?.filter(s => selectedSeasons.includes(s.year))
                .reduce((sum, s) => sum + s.gamesCount, 0) || 0}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}