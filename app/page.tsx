'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trip, SchedulerOpeningInfo, TrainComparisonResult, BookingOutcomeRecord } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { CountdownWidget } from '@/components/countdown/CountdownWidget';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PreparationChecklist } from '@/components/booking/PreparationChecklist';
import { JourneyRouteVisualizer } from '@/components/trains/JourneyRouteVisualizer';
import {
  Train,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Compass,
  History,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Activity,
  Layers,
  Terminal,
} from 'lucide-react';

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [schedulerInfo, setSchedulerInfo] = useState<SchedulerOpeningInfo | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<TrainComparisonResult[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingOutcomeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [tripsRes, historyRes] = await Promise.all([
        api.getTrips(),
        api.getBookingHistory(),
      ]);

      const loadedTrips = tripsRes.data || [];
      setTrips(loadedTrips);
      setRecentBookings((historyRes.data || []).slice(0, 3));

      if (loadedTrips.length > 0) {
        const primary = loadedTrips[0];
        setSelectedTrip(primary);

        // Fetch scheduler info for primary trip
        const schedRes = await api.getSchedulerStatus(primary.id);
        if (schedRes.data) {
          setSchedulerInfo(schedRes.data);
        }

        // Fetch recommendations for this sector
        const compRes = await api.getTrainComparisons(primary.sourceStation, primary.destStation, primary.travelClass);
        if (compRes.data) {
          setRecommendations(compRes.data);
        }
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    const schedRes = await api.getSchedulerStatus(trip.id);
    if (schedRes.data) {
      setSchedulerInfo(schedRes.data);
    }
    const compRes = await api.getTrainComparisons(trip.sourceStation, trip.destStation, trip.travelClass);
    if (compRes.data) {
      setRecommendations(compRes.data);
    }
  };

  const topRecommendation = recommendations.find(t => t.recommendation?.badge === 'TOP_RECOMMENDATION') || recommendations[0];

  return (
    <div className="space-y-8">
      {/* Editorial Hero Header — Syntax Error style with technical badge, index, and strong typography */}
      <div className="relative pb-6 border-b border-white/8 animate-hero-enter">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="section-idx">[00 // RAILWAY.CMD]</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-accent-coral/10 text-accent-coral border border-accent-coral/25">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-ping" />
                Active Terminal
              </span>
              <span className="text-[10px] font-mono text-ink-subtle hidden sm:inline-block">
                IRCTC TATKAL PROTOCOL READY
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink tracking-tight">
              Tatkal Booking <span className="gradient-text">Preparation Desk</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted max-w-2xl leading-relaxed">
              Precision countdowns, verified timetable comparisons, and automated readiness checklists to ensure you are fully prepared when official IRCTC booking opens.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-coral hover:bg-orange-600 text-white text-xs font-mono font-bold shadow-glow-orange transition-all focus:outline-none focus:ring-2 focus:ring-accent-coral focus:ring-offset-2 focus:ring-offset-background"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Journey</span>
            </Link>
          </div>
        </div>

        {/* Signature Journey Route Visualizer Graphic */}
        <div className="mt-5 animate-route-enter">
          <JourneyRouteVisualizer trip={selectedTrip} />
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Countdown & Upcoming Trip (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 animate-dashboard-col-left">
          {/* Active Countdown Widget */}
          {selectedTrip ? (
            <CountdownWidget
              schedulerInfo={schedulerInfo}
              journeyTitle={`${selectedTrip.sourceStation.split('-')[0].trim()} → ${selectedTrip.destStation.split('-')[0].trim()}`}
              travelClass={selectedTrip.travelClass}
            />
          ) : (
            <GlassCard className="text-center py-12">
              <Compass className="w-10 h-10 text-ink-subtle mx-auto mb-3" />
              <h3 className="font-bold text-base text-ink">No Journey Selected Yet</h3>
              <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto font-mono">
                Create a journey to activate the Tatkal opening countdown and timetable recommendation engine.
              </p>
              <Link
                href="/trips/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-coral text-white text-xs font-mono font-semibold shadow-glow-orange"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Journey</span>
              </Link>
            </GlassCard>
          )}

          {/* Selected Trip Details Card */}
          {selectedTrip && (
            <GlassCard depth={1}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <span className="section-idx">[02 // ROUTE.PROFILE]</span>
                  <div className="flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-accent-coral" />
                    <h3 className="font-bold text-sm sm:text-base text-ink tracking-tight">Selected Journey Profile</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={selectedTrip.isAC ? 'AC Quota (10:00 AM)' : 'Non-AC Quota (11:00 AM)'}
                    variant={selectedTrip.isAC ? 'ac' : 'nonac'}
                  />
                  <Link
                    href={`/trips/${selectedTrip.id}`}
                    className="text-xs font-mono text-accent-coral hover:underline"
                  >
                    Edit Trip
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated/60 border border-white/8 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block">Sector</span>
                    <strong className="text-base sm:text-lg text-ink font-bold tracking-tight">
                      {selectedTrip.sourceStation} → {selectedTrip.destStation}
                    </strong>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider block">Journey Date</span>
                    <span className="text-sm sm:text-base text-ink font-semibold font-mono">{selectedTrip.journeyDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Travel Class</span>
                    <strong className="text-ink text-sm">{selectedTrip.travelClass}</strong>
                  </div>
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Passengers</span>
                    <strong className="text-ink text-sm">{selectedTrip.passengerCount} / 4 max</strong>
                  </div>
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Preference</span>
                    <strong className="text-ink capitalize text-sm">{selectedTrip.fareVsDurationPreference}</strong>
                  </div>
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Preferred Train</span>
                    <strong className="text-accent-coral text-sm">{selectedTrip.preferredTrainNumber || 'Any Express'}</strong>
                  </div>
                </div>
              </div>

              {/* Multi-Trip Switcher if user has multiple trips */}
              {trips.length > 1 && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono font-bold text-ink-subtle uppercase tracking-widest block mb-2">
                    SWITCH ACTIVE JOURNEY:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trips.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTrip(t)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                          selectedTrip.id === t.id
                            ? 'bg-accent-coral/15 text-accent-coral border-accent-coral/30 shadow-glow-orange'
                            : 'bg-surface-elevated text-ink-muted hover:text-ink border-white/8 hover:bg-surface-elevated/80'
                        }`}
                      >
                        {t.sourceStation.split('-')[0].trim()} → {t.destStation.split('-')[0].trim()} ({t.journeyDate})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Link to Guided Booking Desk */}
              <div className="mt-4 pt-3.5 border-t border-white/8 flex items-center justify-between">
                <span className="text-xs font-mono text-ink-subtle">Ready to prepare passenger details?</span>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-accent-coral hover:text-white border border-white/10 text-ink text-xs font-mono font-medium transition-colors"
                >
                  <span>Go to Booking Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlassCard>
          )}

          {/* Top Recommendation from Member 4 Engine */}
          {topRecommendation && (
            <GlassCard className="border-accent-coral/20 bg-surface-elevated/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="section-idx">[03 // ENGINE.PICK]</span>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-coral" />
                    <h3 className="font-bold text-sm text-ink">Engine Recommendation Summary</h3>
                  </div>
                </div>
                <StatusBadge label={topRecommendation.recommendation?.badge.replace(/_/g, ' ') || 'Top Pick'} variant="warning" />
              </div>

              <div className="p-3.5 rounded-xl bg-surface/80 border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-white/5 text-accent-coral border border-accent-coral/20">
                      #{topRecommendation.trainNumber}
                    </span>
                    <strong className="text-sm text-ink">{topRecommendation.trainName}</strong>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">{topRecommendation.recommendation?.reason}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] font-mono text-ink-subtle uppercase block">Estimated Tatkal Fare</span>
                  <strong className="text-lg font-black text-ink font-mono tracking-tight">₹{topRecommendation.totalFare}</strong>
                  <span className="text-[10px] font-mono text-accent-emerald block font-semibold">{topRecommendation.availabilityStatus}</span>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-xs font-mono">
                <span className="text-ink-subtle text-[10px]">Provenance: {topRecommendation.recommendation?.engineProvenance}</span>
                <Link href="/trains" className="text-accent-coral hover:underline flex items-center gap-1 font-semibold">
                  <span>Compare All {recommendations.length} Trains</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Readiness Checklist & Recent History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 animate-dashboard-col-right">
          {/* Quick Pre-Booking Checklist */}
          <GlassCard depth={1}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="section-idx">[04 // CHECK.SYS]</span>
                <h3 className="font-bold text-sm sm:text-base text-ink">Tatkal Readiness Checklist</h3>
              </div>
              <StatusBadge label="IRCTC Prep" variant="info" />
            </div>
            <p className="text-xs text-ink-muted mb-4 font-mono">
              Complete these steps 10-15 minutes before the opening window to maximize booking speed.
            </p>
            <PreparationChecklist />
          </GlassCard>

          {/* Recent Booking Activity */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-accent-coral" />
                <h3 className="font-bold text-sm text-ink">Recent Booking Activity</h3>
              </div>
              <Link href="/history" className="text-xs font-mono text-accent-coral hover:underline">
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <p className="text-xs text-ink-subtle py-3 text-center font-mono">
                No past booking outcomes recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentBookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-surface-elevated/60 border border-white/8 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-mono font-semibold text-ink">
                        <span className="text-accent-coral">#{b.trainNumber}</span>
                        <span className="text-white/20">•</span>
                        <span>{b.travelClass}</span>
                        {b.pnr && <span className="text-ink-subtle font-normal">({b.pnr})</span>}
                      </div>
                      <span className="text-[10px] font-mono text-ink-subtle">{b.journeyDate}</span>
                    </div>

                    <StatusBadge
                      label={b.status}
                      variant={b.status === 'CONFIRMED' ? 'success' : b.status === 'FAILED' ? 'error' : 'neutral'}
                    />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/trains"
              className="p-4 rounded-xl bg-surface/80 border border-white/8 hover:border-accent-coral/50 hover:bg-surface-elevated transition-all group"
            >
              <Train className="w-5 h-5 text-accent-coral mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-ink block font-mono">Compare Timetables</span>
              <span className="text-[10px] text-ink-subtle block mt-0.5 font-mono">Sort by fare & run time</span>
            </Link>

            <Link
              href="/booking"
              className="p-4 rounded-xl bg-surface/80 border border-white/8 hover:border-accent-coral/50 hover:bg-surface-elevated transition-all group"
            >
              <CheckSquare className="w-5 h-5 text-accent-coral mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-ink block font-mono">Booking Desk</span>
              <span className="text-[10px] text-ink-subtle block mt-0.5 font-mono">IRCTC guided flow</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
