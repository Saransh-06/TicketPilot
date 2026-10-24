'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Trip, SchedulerOpeningInfo, TravelClass } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { CountdownWidget } from '@/components/countdown/CountdownWidget';
import { PreparationChecklist } from '@/components/booking/PreparationChecklist';
import { BookingOutcomeForm } from '@/components/booking/BookingOutcomeForm';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckSquare, Train, ExternalLink, ShieldAlert, Key, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BookingAssistancePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [schedulerInfo, setSchedulerInfo] = useState<SchedulerOpeningInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await api.getTrips();
      const loadedTrips = res.data || [];
      setTrips(loadedTrips);

      if (loadedTrips.length > 0) {
        const first = loadedTrips[0];
        setSelectedTrip(first);
        const schedRes = await api.getSchedulerStatus(first.id);
        if (schedRes.data) {
          setSchedulerInfo(schedRes.data);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleTripSwitch = async (trip: Trip) => {
    setSelectedTrip(trip);
    const schedRes = await api.getSchedulerStatus(trip.id);
    if (schedRes.data) {
      setSchedulerInfo(schedRes.data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-idx">[04 // BOOKING.DESK]</span>
            <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
              GUIDED PREPARATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Guided Tatkal Booking Desk</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Step-by-step readiness checklist, opening countdown, and official portal launcher for user-controlled booking.
          </p>
        </div>

        {/* Journey Selector */}
        {trips.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-ink-subtle uppercase tracking-widest">SWITCH TRIP:</span>
            <select
              value={selectedTrip?.id || ''}
              onChange={(e) => {
                const found = trips.find(t => t.id === e.target.value);
                if (found) handleTripSwitch(found);
              }}
              className="text-xs bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-ink font-mono font-medium focus:outline-none focus:ring-1 focus:ring-accent-coral"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id} className="bg-surface text-ink">
                  {t.sourceStation.split('-')[0].trim()} → {t.destStation.split('-')[0].trim()} ({t.journeyDate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-coral border-t-transparent mb-2" />
          <p className="text-sm font-mono text-ink">Loading booking desk...</p>
        </div>
      ) : !selectedTrip ? (
        <GlassCard className="text-center py-12">
          <Train className="w-12 h-12 text-ink-subtle mx-auto mb-3" />
          <h3 className="font-bold text-base text-ink">No Journey Selected</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto font-mono">
            Please configure a journey first before proceeding to the booking assistance desk.
          </p>
          <Link
            href="/trips/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-coral text-white text-xs font-mono font-semibold shadow-glow-orange"
          >
            <span>Create Journey</span>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Countdown & Checklist (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Countdown for Selected Journey */}
            <CountdownWidget
              schedulerInfo={schedulerInfo}
              journeyTitle={`${selectedTrip.sourceStation} → ${selectedTrip.destStation}`}
              travelClass={selectedTrip.travelClass}
            />

            {/* Preparation Checklist */}
            <GlassCard depth={1}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="section-idx">[04.1 // CHECK.AUDIT]</span>
                  <h3 className="font-bold text-sm sm:text-base text-ink">Pre-Booking Preparation Checklist</h3>
                </div>
                <StatusBadge label="Required Prep" variant="warning" />
              </div>
              <p className="text-xs text-ink-muted mb-4 font-mono">
                Tatkal quotas often fill within 60 to 120 seconds. Ensure all preparatory steps are completed in advance.
              </p>
              <PreparationChecklist />
            </GlassCard>

            {/* Ethical Security Notice */}
            <div className="p-4 rounded-xl bg-surface/70 border border-white/8 text-xs text-ink-muted space-y-2">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <ShieldAlert className="w-4 h-4 text-accent-coral" />
                <span>IRCTC Security & Authorization Standard</span>
              </div>
              <p className="leading-relaxed font-mono text-[11px] text-ink-subtle">
                In strict compliance with Indian Railways and IT regulations, Tatkal Assistant <strong>never</strong> automates IRCTC logins, does <strong>not</strong> bypass CAPTCHA, and <strong>never</strong> collects your banking secrets, card numbers, or passwords. All transactions remain completely under your own direct control on the official IRCTC portal.
              </p>
            </div>
          </div>

          {/* Right Column: Passenger Summary & Outcome Recording (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Journey Summary Box */}
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="section-idx">[04.2 // TARGET]</span>
                  <h3 className="font-bold text-sm text-ink">Target Booking Profile</h3>
                </div>
                <StatusBadge
                  label={selectedTrip.isAC ? 'AC Class' : 'Non-AC Class'}
                  variant={selectedTrip.isAC ? 'ac' : 'nonac'}
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-elevated/60 border border-white/8 space-y-3 text-xs">
                <div>
                  <span className="text-ink-subtle block font-mono text-[10px] uppercase">Sector</span>
                  <strong className="text-sm sm:text-base text-ink block font-bold tracking-tight">
                    {selectedTrip.sourceStation} → {selectedTrip.destStation}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono">
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Date</span>
                    <strong className="text-ink text-xs">{selectedTrip.journeyDate}</strong>
                  </div>
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Class</span>
                    <strong className="text-ink text-xs">{selectedTrip.travelClass}</strong>
                  </div>
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Passengers</span>
                    <strong className="text-ink text-xs">{selectedTrip.passengerCount}</strong>
                  </div>
                  <div>
                    <span className="text-ink-subtle block text-[10px]">Train No.</span>
                    <strong className="text-accent-coral text-xs">{selectedTrip.preferredTrainNumber || 'Any Express'}</strong>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Booking Outcome Recording Form */}
            <GlassCard depth={1}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="section-idx">[04.3 // LOG.RESULT]</span>
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-accent-coral" />
                    <h3 className="font-bold text-sm sm:text-base text-ink">Record Booking Outcome</h3>
                  </div>
                </div>
                <StatusBadge label="Manual Log" variant="neutral" />
              </div>
              <p className="text-xs text-ink-muted mb-4 font-mono">
                After completing your booking attempt on IRCTC, manually record the outcome and PNR here for your personal travel logs.
              </p>

              <BookingOutcomeForm
                tripId={selectedTrip.id}
                trainNumber={selectedTrip.preferredTrainNumber || '12952'}
                trainName={selectedTrip.preferredTrainName || 'Express Train'}
                journeyDate={selectedTrip.journeyDate}
                travelClass={selectedTrip.travelClass}
              />
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
