'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trip, SchedulerOpeningInfo, TrainComparisonResult, BookingOutcomeRecord } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { CountdownWidget } from '@/components/countdown/CountdownWidget';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PreparationChecklist } from '@/components/booking/PreparationChecklist';
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
    <div className="space-y-6">
      {/* Editorial Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-emerald bg-accent-emerald-light px-2.5 py-0.5 rounded-full border border-emerald-200">
              Railway Travel Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Tatkal Booking Preparation Desk
          </h1>
          <p className="text-sm text-ink-muted mt-1 max-w-2xl">
            Precision countdowns, verified timetable comparisons, and automated readiness checklists to ensure you are fully prepared when official IRCTC booking opens.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-emerald hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Journey</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Countdown & Upcoming Trip (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Countdown Widget */}
          {selectedTrip ? (
            <CountdownWidget
              schedulerInfo={schedulerInfo}
              journeyTitle={`${selectedTrip.sourceStation.split('-')[0].trim()} → ${selectedTrip.destStation.split('-')[0].trim()}`}
              travelClass={selectedTrip.travelClass}
            />
          ) : (
            <GlassCard className="text-center py-10">
              <Compass className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h3 className="font-bold text-base text-ink">No Journey Selected Yet</h3>
              <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                Create a journey to activate the Tatkal opening countdown and timetable recommendation engine.
              </p>
              <Link
                href="/trips/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-emerald text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Journey</span>
              </Link>
            </GlassCard>
          )}

          {/* Selected Trip Details Card */}
          {selectedTrip && (
            <GlassCard depth={1}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Train className="w-5 h-5 text-accent-emerald" />
                  <h3 className="font-bold text-base text-ink">Selected Journey Profile</h3>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={selectedTrip.isAC ? 'AC Quota (10:00 AM)' : 'Non-AC Quota (11:00 AM)'}
                    variant={selectedTrip.isAC ? 'ac' : 'nonac'}
                  />
                  <Link
                    href={`/trips/${selectedTrip.id}`}
                    className="text-xs font-semibold text-accent-emerald hover:underline"
                  >
                    Edit Trip
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/70 border border-stone-200/80 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Sector</span>
                    <strong className="text-lg text-ink font-bold">
                      {selectedTrip.sourceStation} → {selectedTrip.destStation}
                    </strong>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Journey Date</span>
                    <span className="text-base text-ink font-semibold">{selectedTrip.journeyDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-500 block">Travel Class</span>
                    <strong className="text-ink font-mono">{selectedTrip.travelClass}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Passengers</span>
                    <strong className="text-ink">{selectedTrip.passengerCount} / 4 max</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Preference</span>
                    <strong className="text-ink capitalize">{selectedTrip.fareVsDurationPreference}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Preferred Train</span>
                    <strong className="text-ink font-mono">{selectedTrip.preferredTrainNumber || 'Any Express'}</strong>
                  </div>
                </div>
              </div>

              {/* Multi-Trip Switcher if user has multiple trips */}
              {trips.length > 1 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
                    Switch Active Journey:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trips.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTrip(t)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          selectedTrip.id === t.id
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {t.sourceStation.split('-')[0].trim()} → {t.destStation.split('-')[0].trim()} ({t.journeyDate})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Link to Guided Booking Desk */}
              <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between">
                <span className="text-xs text-ink-muted">Ready to prepare passenger details?</span>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ink hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                >
                  <span>Go to Booking Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlassCard>
          )}

          {/* Top Recommendation from Member 4 Engine */}
          {topRecommendation && (
            <GlassCard className="border-emerald-200/80 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-sm text-ink">Engine Recommendation Summary</h3>
                </div>
                <StatusBadge label={topRecommendation.recommendation?.badge.replace(/_/g, ' ') || 'Top Pick'} variant="warning" />
              </div>

              <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                      #{topRecommendation.trainNumber}
                    </span>
                    <strong className="text-sm text-ink">{topRecommendation.trainName}</strong>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{topRecommendation.recommendation?.reason}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs text-stone-500 block">Estimated Tatkal Fare</span>
                  <strong className="text-base font-extrabold text-ink font-mono">₹{topRecommendation.totalFare}</strong>
                  <span className="text-[10px] text-emerald-700 block font-semibold">{topRecommendation.availabilityStatus}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-stone-500 text-[11px]">Provenance: {topRecommendation.recommendation?.engineProvenance}</span>
                <Link href="/trains" className="text-accent-emerald font-semibold hover:underline flex items-center gap-1">
                  <span>Compare All {recommendations.length} Trains</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Readiness Checklist & Recent History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Pre-Booking Checklist */}
          <GlassCard depth={1}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-ink">Tatkal Readiness Checklist</h3>
              <StatusBadge label="IRCTC Prep" variant="info" />
            </div>
            <p className="text-xs text-ink-muted mb-4">
              Complete these steps 10-15 minutes before the opening window to maximize booking speed.
            </p>
            <PreparationChecklist />
          </GlassCard>

          {/* Recent Booking Activity */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-stone-500" />
                <h3 className="font-bold text-sm text-ink">Recent Booking Activity</h3>
              </div>
              <Link href="/history" className="text-xs font-semibold text-accent-emerald hover:underline">
                View All
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                No past booking outcomes recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentBookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-white/70 border border-stone-200/80 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-ink">
                        <span>#{b.trainNumber}</span>
                        <span>•</span>
                        <span>{b.travelClass}</span>
                        {b.pnr && <span className="font-mono text-stone-600 font-normal">({b.pnr})</span>}
                      </div>
                      <span className="text-[11px] text-stone-500">{b.journeyDate}</span>
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
              className="p-3.5 rounded-xl bg-white/80 border border-stone-200 hover:border-accent-emerald hover:shadow-xs transition-all group"
            >
              <Train className="w-5 h-5 text-accent-emerald mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold text-ink block">Compare Timetables</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Sort by fare & run time</span>
            </Link>

            <Link
              href="/booking"
              className="p-3.5 rounded-xl bg-white/80 border border-stone-200 hover:border-accent-emerald hover:shadow-xs transition-all group"
            >
              <CheckSquare className="w-5 h-5 text-accent-emerald mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold text-ink block">Booking Desk</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">IRCTC guided flow</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
