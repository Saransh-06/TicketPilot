'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Trip, TrainComparisonResult, TravelClass } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrainComparisonTable } from '@/components/trains/TrainComparisonTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Train, Layers, Sparkles, Filter, Info, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function CompareTrainsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [trains, setTrains] = useState<TrainComparisonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const res = await api.getTrips();
      const loadedTrips = res.data || [];
      setTrips(loadedTrips);

      if (loadedTrips.length > 0) {
        const first = loadedTrips[0];
        setSelectedTripId(first.id);
        await fetchComparisons(first.sourceStation, first.destStation, first.travelClass);
      } else {
        // Fallback default demo sector
        await fetchComparisons('NDLS - New Delhi', 'BCT - Mumbai Central', '3A');
      }
      setLoading(false);
    }
    init();
  }, []);

  const fetchComparisons = async (source: string, dest: string, travelClass?: TravelClass) => {
    setError(null);
    try {
      const res = await api.getTrainComparisons(source, dest, travelClass);
      if (res.success && res.data) {
        setTrains(res.data);
      } else {
        setError(res.error?.message || 'Failed to retrieve train comparison data.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    }
  };

  const handleTripChange = async (tripId: string) => {
    setSelectedTripId(tripId);
    const target = trips.find(t => t.id === tripId);
    if (target) {
      setLoading(true);
      await fetchComparisons(target.sourceStation, target.destStation, target.travelClass);
      setLoading(false);
    }
  };

  const currentTrip = trips.find(t => t.id === selectedTripId) || {
    sourceStation: 'NDLS - New Delhi',
    destStation: 'BCT - Mumbai Central',
    travelClass: '3A' as TravelClass,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-idx">[03 // TIMETABLES]</span>
            <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
              MEMBER 4 SCORING ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Train Timetable & Fare Comparison</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Authorized schedule data and recommendation explanations powered by Member 4 Comparison Engine.
          </p>
        </div>

        {/* Sector Switcher */}
        {trips.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-ink-subtle uppercase tracking-widest">SECTOR:</span>
            <select
              value={selectedTripId}
              onChange={(e) => handleTripChange(e.target.value)}
              className="text-xs bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-ink font-mono font-medium focus:outline-none focus:ring-1 focus:ring-accent-coral"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id} className="bg-surface text-ink">
                  {t.sourceStation.split('-')[0].trim()} → {t.destStation.split('-')[0].trim()} ({t.travelClass})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Sector Banner */}
      <div className="p-4 rounded-xl bg-surface/80 border border-white/8 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-ink-subtle uppercase tracking-wider font-mono font-semibold block text-[10px]">Active Route Sector</span>
          <strong className="text-sm sm:text-base text-ink font-bold tracking-tight">
            {currentTrip.sourceStation} → {currentTrip.destStation}
          </strong>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge label={`Class: ${currentTrip.travelClass}`} variant="info" />
          <StatusBadge label="Member 4 Scoring Active" variant="success" />
        </div>
      </div>

      {/* Train Comparison Table */}
      <TrainComparisonTable
        trains={trains}
        isLoading={loading}
        error={error}
        sourceStation={currentTrip.sourceStation}
        destStation={currentTrip.destStation}
      />

      {/* Data Provenance & Ethics Disclosure */}
      <GlassCard className="text-xs text-ink-muted space-y-2">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <ShieldAlert className="w-4 h-4 text-accent-coral" />
          <span>Data Provenance & IRCTC Compliance Notice</span>
        </div>
        <p className="leading-relaxed font-mono text-[11px] text-ink-subtle">
          Timetables, run times, and base fares are synchronized from official railway schedule disclosures. Tatkal seat allocations and waitlist statuses are estimates based on standard Indian Railways zonal quotas. This application does not claim live real-time seat locks and never overrides IRCTC official availability.
        </p>
      </GlassCard>
    </div>
  );
}
