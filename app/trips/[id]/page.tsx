'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Trip, TripCreateInput } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { TripForm } from '@/components/trips/TripForm';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, Train, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrip() {
      if (!id) return;
      setLoading(true);
      const res = await api.getTripById(id);
      if (res.success && res.data) {
        setTrip(res.data);
      }
      setLoading(false);
    }
    fetchTrip();
  }, [id]);

  const handleUpdate = async (input: TripCreateInput): Promise<boolean> => {
    if (!id) return false;
    setIsUpdating(true);
    setFeedbackMessage(null);

    const res = await api.updateTrip(id, input);
    setIsUpdating(false);

    if (res.success && res.data) {
      setTrip(res.data);
      setFeedbackMessage('Journey details updated successfully.');
      setTimeout(() => setFeedbackMessage(null), 3000);
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-coral border-t-transparent mb-2" />
        <p className="text-sm font-mono text-ink">Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-surface/70 border border-white/10 text-center">
        <AlertCircle className="w-10 h-10 text-ink-subtle mx-auto mb-2" />
        <h2 className="text-lg font-bold text-ink">Journey Not Found</h2>
        <p className="text-xs font-mono text-ink-muted mt-1 mb-4">
          The requested trip with ID &quot;{id}&quot; does not exist or has been removed.
        </p>
        <Link href="/trips" className="px-4 py-2 bg-accent-coral text-white rounded-xl text-xs font-mono font-semibold shadow-glow-orange">
          Return to Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-subtle hover:text-accent-coral transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Trips</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="section-idx">[02.2 // TRIP.EDIT]</span>
              <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">PARAMETERS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              {trip.sourceStation.split('-')[0].trim()} → {trip.destStation.split('-')[0].trim()}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              label={trip.isAC ? 'AC Quota (10:00 AM)' : 'Non-AC Quota (11:00 AM)'}
              variant={trip.isAC ? 'ac' : 'nonac'}
            />
            <StatusBadge label={trip.status.toUpperCase()} variant="neutral" />
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-accent-emerald" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <GlassCard depth={2}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-accent-coral" />
            <h2 className="font-bold text-sm sm:text-base text-ink">Edit Journey Parameters</h2>
          </div>
          <span className="text-[11px] text-ink-subtle font-mono">ID: {trip.id}</span>
        </div>

        <TripForm
          initialData={trip}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          submitButtonText="Update Journey"
          cancelHref="/trips"
        />
      </GlassCard>
    </div>
  );
}
