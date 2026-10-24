'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookingOutcomeRecord, BookingStatus } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { History, CheckCircle2, XCircle, Clock, AlertCircle, FileText, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function BookingHistoryPage() {
  const [history, setHistory] = useState<BookingOutcomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      const res = await api.getBookingHistory();
      setHistory(res.data || []);
      setLoading(false);
    }
    loadHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-ink-subtle" />;
    }
  };

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'FAILED': return 'error';
      case 'IN_PROGRESS': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-idx">[05 // HISTORY.LOG]</span>
            <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
              JOURNAL & AUDIT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Booking Outcome History</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Personal travel records, manually recorded outcomes, and PNR references.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-ink-subtle uppercase tracking-widest">STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-ink font-mono font-medium focus:outline-none focus:ring-1 focus:ring-accent-coral"
          >
            <option value="ALL" className="bg-surface text-ink">All Outcomes ({history.length})</option>
            <option value="CONFIRMED" className="bg-surface text-ink">Confirmed</option>
            <option value="FAILED" className="bg-surface text-ink">Failed</option>
            <option value="IN_PROGRESS" className="bg-surface text-ink">In Progress</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-coral border-t-transparent mb-2" />
          <p className="text-sm font-mono text-ink">Loading history records...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <GlassCard className="text-center py-12">
          <History className="w-12 h-12 text-ink-subtle mx-auto mb-3" />
          <h3 className="font-bold text-base text-ink">No Booking Records Found</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto font-mono">
            {statusFilter !== 'ALL'
              ? `No records found with status "${statusFilter}". Try resetting the filter.`
              : 'You haven’t recorded any booking outcomes yet. Outcomes are logged from the Booking Desk.'}
          </p>
          <Link
            href="/booking"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-coral text-white text-xs font-mono font-semibold shadow-glow-orange"
          >
            <span>Go to Booking Desk</span>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <GlassCard key={item.id} depth={1} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-white/8">
                <div className="flex items-center gap-2.5">
                  {getStatusIcon(item.status)}
                  <h3 className="font-bold text-base text-ink tracking-tight font-mono">
                    Train #{item.trainNumber} {item.trainName && `(${item.trainName})`}
                  </h3>
                  <StatusBadge label={item.travelClass} variant="info" />
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={item.status}
                    variant={getStatusBadgeVariant(item.status)}
                  />
                  {item.isManuallyRecorded ? (
                    <StatusBadge label="Manually Recorded" variant="neutral" hint="Logged by user" />
                  ) : (
                    <StatusBadge label="API Verified" variant="success" hint="Verified with Member 2 backend" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-ink-muted mb-3">
                <div>
                  <span className="text-ink-subtle block text-[10px]">Journey Date</span>
                  <strong className="text-ink">{item.journeyDate}</strong>
                </div>

                <div>
                  <span className="text-ink-subtle block text-[10px]">10-Digit PNR Reference</span>
                  {item.pnr ? (
                    <strong className="text-accent-coral tracking-wider">{item.pnr}</strong>
                  ) : (
                    <span className="text-ink-subtle italic">None provided</span>
                  )}
                </div>

                <div>
                  <span className="text-ink-subtle block text-[10px]">Logged Timestamp</span>
                  <span className="text-ink">
                    {new Date(item.recordedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
              </div>

              {item.proofReference && (
                <div className="p-3 rounded-xl bg-surface-elevated/70 border border-white/8 text-xs mb-3 flex items-center gap-2 font-mono">
                  <FileText className="w-4 h-4 text-accent-coral" />
                  <span className="text-ink-subtle">Proof Reference:</span>
                  <span className="text-ink font-semibold">{item.proofReference}</span>
                </div>
              )}

              {item.notes && (
                <div className="text-xs text-ink-muted bg-surface-elevated/40 p-3 rounded-xl border border-white/5">
                  <span className="font-mono text-accent-coral block mb-1 text-[11px] font-semibold">User Booking Notes:</span>
                  <p className="leading-relaxed">{item.notes}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Disclaimers & Ethics */}
      <div className="p-4 rounded-xl bg-surface/70 border border-white/8 text-xs text-ink-muted space-y-1.5 font-mono">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <Info className="w-4 h-4 text-accent-coral" />
          <span>Outcome Audit & Verification Boundaries</span>
        </div>
        <p className="leading-relaxed text-[11px] text-ink-subtle">
          Outcomes listed in this personal travel history reflect manual entries logged by the user or responses recorded from Member 2 SQLite storage. Tatkal Assistant does not perform automated scraping of live IRCTC accounts or infer payment confirmation without user input.
        </p>
      </div>
    </div>
  );
}
