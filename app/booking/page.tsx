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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckSquare className="w-5 h-5 text-accent-emerald" />
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">Guided Tatkal Booking Desk</h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">
            Step-by-step readiness checklist, opening countdown, and official portal launcher for user-controlled booking.
          </p>
        </div>

        {/* Journey Selector */}
        {trips.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Switch Trip:</span>
            <select
              value={selectedTrip?.id || ''}
              onChange={(e) => {
                const found = trips.find(t => t.id === e.target.value);
                if (found) handleTripSwitch(found);
              }}
              className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-ink font-medium focus:outline-none focus:ring-2 focus:ring-accent-emerald"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  {t.sourceStation.split('-')[0].trim()} → {t.destStation.split('-')[0].trim()} ({t.journeyDate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-accent-emerald border-t-transparent mb-2" />
          <p className="text-sm font-medium text-ink">Loading booking desk...</p>
        </div>
      ) : !selectedTrip ? (
        <GlassCard className="text-center py-12">
          <Train className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-ink">No Journey Selected</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
            Please configure a journey first before proceeding to the booking assistance desk.
          </p>
          <Link
            href="/trips/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-emerald text-white text-xs font-semibold"
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
                <h3 className="font-bold text-base text-ink">Pre-Booking Preparation Checklist</h3>
                <StatusBadge label="Required Prep" variant="warning" />
              </div>
              <p className="text-xs text-ink-muted mb-4">
                Tatkal quotas often fill within 60 to 120 seconds. Ensure all preparatory steps are completed in advance.
              </p>
              <PreparationChecklist />
            </GlassCard>

            {/* Ethical Security Notice */}
            <div className="p-4 rounded-xl bg-stone-100/90 border border-stone-200 text-xs text-stone-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <ShieldAlert className="w-4 h-4 text-emerald-800" />
                <span>IRCTC Security & Authorization Standard</span>
              </div>
              <p className="leading-relaxed">
                In strict compliance with Indian Railways and IT regulations, Tatkal Assistant <strong>never</strong> automates IRCTC logins, does <strong>not</strong> bypass CAPTCHA, and <strong>never</strong> collects your banking secrets, card numbers, or passwords. All transactions remain completely under your own direct control on the official IRCTC portal.
              </p>
            </div>
          </div>

          {/* Right Column: Passenger Summary & Outcome Recording (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Journey Summary Box */}
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-ink">Target Booking Profile</h3>
                <StatusBadge
                  label={selectedTrip.isAC ? 'AC Class' : 'Non-AC Class'}
                  variant={selectedTrip.isAC ? 'ac' : 'nonac'}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/70 border border-stone-200/80 space-y-2 text-xs">
                <div>
                  <span className="text-stone-500 block">Sector</span>
                  <strong className="text-sm text-ink block font-bold">
                    {selectedTrip.sourceStation} → {selectedTrip.destStation}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-stone-500 block">Date</span>
                    <strong className="text-ink">{selectedTrip.journeyDate}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Class</span>
                    <strong className="text-ink font-mono">{selectedTrip.travelClass}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Passengers</span>
                    <strong className="text-ink">{selectedTrip.passengerCount}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Train No.</span>
                    <strong className="text-ink font-mono">{selectedTrip.preferredTrainNumber || 'Any Express'}</strong>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Booking Outcome Recording Form */}
            <GlassCard depth={1}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-accent-emerald" />
                  <h3 className="font-bold text-base text-ink">Record Booking Outcome</h3>
                </div>
                <StatusBadge label="Manual Log" variant="neutral" />
              </div>
              <p className="text-xs text-ink-muted mb-4">
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
