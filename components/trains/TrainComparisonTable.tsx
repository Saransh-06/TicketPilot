'use client';

import React, { useState, useMemo } from 'react';
import { TrainComparisonResult, TravelClass, DataFreshness } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { ArrowUpDown, Clock, DollarSign, Sparkles, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface TrainComparisonTableProps {
  trains: TrainComparisonResult[];
  isLoading?: boolean;
  error?: string | null;
  onSelectTrain?: (train: TrainComparisonResult) => void;
  selectedTrainNumber?: string;
  sourceStation: string;
  destStation: string;
}

type SortField = 'fare' | 'duration' | 'departure';
type SortOrder = 'asc' | 'desc';

export function TrainComparisonTable({
  trains,
  isLoading = false,
  error = null,
  onSelectTrain,
  selectedTrainNumber,
  sourceStation,
  destStation,
}: TrainComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('duration');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Presentation-only sorting (does not alter or substitute the ranking logic)
  const sortedAndFilteredTrains = useMemo(() => {
    let result = [...trains];

    if (selectedClassFilter !== 'ALL') {
      result = result.filter(t => t.travelClass === selectedClassFilter);
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'fare') {
        comp = a.totalFare - b.totalFare;
      } else if (sortField === 'duration') {
        comp = a.durationMinutes - b.durationMinutes;
      } else if (sortField === 'departure') {
        comp = a.departureTime.localeCompare(b.departureTime);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [trains, sortField, sortOrder, selectedClassFilter]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    trains.forEach(t => set.add(t.travelClass));
    return Array.from(set);
  }, [trains]);

  const getProvenanceBadge = (provenance: DataFreshness) => {
    switch (provenance) {
      case 'verified':
        return <StatusBadge label="Verified Data" variant="success" hint="Direct official timetable match" />;
      case 'estimated':
        return <StatusBadge label="Estimated Quota" variant="warning" hint="Historical statistical estimate" />;
      case 'stale':
        return <StatusBadge label="Stale Cache" variant="error" hint="Data > 30 minutes old" />;
      case 'unavailable':
      default:
        return <StatusBadge label="Unavailable" variant="neutral" hint="No recent fetch available" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface/70 border border-white/10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-coral border-t-transparent mb-3" />
        <p className="text-sm font-semibold text-ink">Retrieving train comparisons from TicketPilot Engine...</p>
        <p className="text-xs text-ink-muted mt-1 font-mono">Verifying routes between {sourceStation} and {destStation}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-200">
        <div className="flex items-center gap-2 mb-2 font-semibold">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>Train Comparison Error</span>
        </div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (trains.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface/60 border border-white/10 text-ink-muted">
        <p className="font-semibold text-ink">No train comparisons available for this sector.</p>
        <p className="text-xs mt-1 text-ink-subtle">
          {sourceStation && destStation
            ? `No trains found matching ${sourceStation} → ${destStation}. Verify stations or add trip parameters.`
            : 'Select an origin and destination to view train comparisons.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar: Sort & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface/80 backdrop-blur-md rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-ink-subtle uppercase tracking-widest">FILTER CLASS:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs bg-surface-elevated border border-white/10 rounded-lg px-2.5 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-accent-coral font-mono"
            aria-label="Filter trains by travel class"
          >
            <option value="ALL">All Classes ({trains.length})</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-ink-subtle uppercase tracking-widest mr-1">SORT:</span>
          <button
            onClick={() => toggleSort('duration')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
              sortField === 'duration'
                ? 'bg-accent-coral text-white border-accent-coral shadow-glow-orange'
                : 'bg-surface-elevated text-ink-muted border-white/10 hover:text-ink hover:bg-surface-elevated/80'
            }`}
            aria-label={`Sort by duration, currently ${sortField === 'duration' ? sortOrder : 'inactive'}`}
          >
            <Clock className="w-3 h-3" />
            <span>Duration {sortField === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
          </button>
          <button
            onClick={() => toggleSort('fare')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
              sortField === 'fare'
                ? 'bg-accent-coral text-white border-accent-coral shadow-glow-orange'
                : 'bg-surface-elevated text-ink-muted border-white/10 hover:text-ink hover:bg-surface-elevated/80'
            }`}
            aria-label={`Sort by total fare, currently ${sortField === 'fare' ? sortOrder : 'inactive'}`}
          >
            <DollarSign className="w-3 h-3" />
            <span>Fare {sortField === 'fare' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
          </button>
        </div>
      </div>

      {/* Train Cards List */}
      <div className="space-y-3" role="list" aria-label="Available Trains Comparison">
        {sortedAndFilteredTrains.map((train) => {
          const isSelected = selectedTrainNumber === train.trainNumber;

          return (
            <div
              key={`${train.trainNumber}-${train.travelClass}`}
              role="listitem"
              onClick={() => onSelectTrain && onSelectTrain(train)}
              className={`p-5 rounded-xl border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-surface-elevated border-accent-coral ring-1 ring-accent-coral/30 shadow-glow-orange'
                  : 'bg-surface/85 border-white/8 hover:border-white/15 hover:bg-surface-elevated/70'
              } ${onSelectTrain ? 'cursor-pointer' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Train Identifiers & Badges */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-accent-coral border border-accent-coral/20">
                      #{train.trainNumber}
                    </span>
                    <h4 className="font-bold text-ink text-base tracking-tight">{train.trainName}</h4>
                    <StatusBadge label={train.travelClass} variant="info" />
                    {getProvenanceBadge(train.dataProvenance)}
                  </div>

                  {/* Route & Times with Technical Visuals */}
                  <div className="flex items-center gap-4 text-sm text-ink-muted pt-1">
                    <div>
                      <strong className="text-ink font-mono text-base block">{train.departureTime}</strong>
                      <span className="text-[11px] font-mono text-ink-subtle">{train.originStation}</span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <span className="text-[10px] font-mono font-semibold text-accent-emerald bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {train.duration}
                      </span>
                      <div className="w-20 h-px bg-white/20 my-1.5 relative">
                        <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-accent-coral/80" />
                        <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-accent-emerald" />
                      </div>
                    </div>
                    <div>
                      <strong className="text-ink font-mono text-base block">{train.arrivalTime}</strong>
                      <span className="text-[11px] font-mono text-ink-subtle">{train.destinationStation}</span>
                    </div>
                  </div>
                </div>

                {/* Fare & Availability */}
                <div className="flex flex-row md:flex-col items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/5 gap-2 min-w-[170px]">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block">Total Tatkal Fare</span>
                    <span className="text-xl font-extrabold text-ink font-mono tracking-tight">₹{train.totalFare}</span>
                    <span className="text-[10px] text-ink-subtle font-mono block">
  Estimated fare; breakdown unavailable
</span>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/12 text-emerald-300 border border-emerald-500/25">
                      {train.availabilityStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Panel from TicketPilot Comparison Engine */}
              {train.recommendation && (
                <div className="mt-4 pt-3 border-t border-white/8 bg-surface-elevated/40 -mx-5 -mb-5 px-5 py-3 rounded-b-xl flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-accent-coral shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-accent-coral font-mono font-semibold text-xs uppercase tracking-wide">
                        {train.recommendation.badge.replace(/_/g, ' ')}
                      </strong>
                      <span className="text-[10px] font-mono text-ink-subtle">({train.recommendation.engineProvenance})</span>
                    </div>
                    <p className="mt-0.5 text-ink-muted text-xs leading-relaxed">{train.recommendation.reason}</p>
                  </div>
                  {onSelectTrain && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrain(train);
                      }}
                      className="shrink-0 px-3 py-1 bg-white/8 hover:bg-accent-coral text-ink hover:text-white border border-white/10 text-xs font-mono font-medium rounded-lg transition-colors"
                    >
                      {isSelected ? 'Selected' : 'Select Train'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[11px] font-mono text-ink-subtle flex items-center gap-1.5 pt-2">
        <Info className="w-3.5 h-3.5 text-accent-coral" aria-hidden="true" />
        <span>
          Sorting controls are presentation aids only. Recommendations and availability allocations are generated by the TicketPilot comparison engine.
        </span>
      </div>
    </div>
  );
}
