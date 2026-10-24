'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trip } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Train, Plus, Trash2, Edit3, ArrowRight, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadTrips = async () => {
    setLoading(true);
    const res = await api.getTrips();
    setTrips(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await api.deleteTrip(id);
    if (res.success) {
      setActionMessage('Trip deleted successfully.');
      setDeleteConfirmId(null);
      loadTrips();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-idx">[02 // FLEET.TRIPS]</span>
            <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
              JOURNEY REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">My Saved Journeys</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Manage your upcoming railway trips and configured Tatkal countdown windows.
          </p>
        </div>

        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-coral hover:bg-orange-600 text-white text-xs font-mono font-bold shadow-glow-orange transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Journey</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-accent-emerald" />
          <span>{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-coral border-t-transparent mb-2" />
          <p className="text-sm font-mono text-ink">Loading trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Train className="w-12 h-12 text-ink-subtle mx-auto mb-3" />
          <h3 className="font-bold text-base text-ink">No Journeys Configured</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto font-mono">
            You haven&apos;t added any journeys yet. Add your travel origin, destination, and journey date to track Tatkal timings.
          </p>
          <Link
            href="/trips/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-coral text-white text-xs font-mono font-semibold shadow-glow-orange"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Journey</span>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map((trip) => {
            const isDeleting = deleteConfirmId === trip.id;

            return (
              <GlassCard key={trip.id} depth={1} className="relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge
                      label={trip.isAC ? 'AC Quota (10 AM)' : 'Non-AC Quota (11 AM)'}
                      variant={trip.isAC ? 'ac' : 'nonac'}
                    />
                    <StatusBadge
                      label={trip.status.toUpperCase()}
                      variant={trip.status === 'ready' ? 'success' : 'neutral'}
                    />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight mt-1">
                    {trip.sourceStation} → {trip.destStation}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-xs font-mono text-ink-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-accent-coral" />
                      <span>{trip.journeyDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-accent-coral" />
                      <span>{trip.passengerCount} Passenger{trip.passengerCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Train className="w-3.5 h-3.5 text-accent-coral" />
                      <span>Class {trip.travelClass}</span>
                    </div>
                    <div>
                      <span className="text-ink-subtle">Pref: </span>
                      <span className="capitalize font-semibold text-ink">{trip.fareVsDurationPreference}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-white/8 flex items-center justify-between">
                  {isDeleting ? (
                    <div className="flex items-center gap-2 w-full justify-between bg-red-950/40 p-2.5 rounded-xl border border-red-500/30">
                      <span className="text-xs text-red-200 font-mono">Confirm deletion?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-mono font-semibold rounded-lg hover:bg-red-500"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 bg-surface-elevated text-ink-muted text-xs font-mono rounded-lg hover:text-ink border border-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-ink-muted hover:text-ink hover:bg-white/5 text-xs font-mono font-medium transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(trip.id)}
                          className="p-1.5 rounded-lg text-ink-subtle hover:text-red-400 hover:bg-white/5 transition-colors"
                          title="Delete trip"
                          aria-label={`Delete trip from ${trip.sourceStation} to ${trip.destStation}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <Link
                        href={`/booking`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent-coral hover:underline"
                      >
                        <span>Prepare Booking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
