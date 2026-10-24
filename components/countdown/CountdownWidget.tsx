'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, Info, Sparkles, Radio } from 'lucide-react';
import { SchedulerOpeningInfo } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';

interface CountdownWidgetProps {
  schedulerInfo?: SchedulerOpeningInfo;
  journeyTitle?: string;
  travelClass?: string;
  onWindowOpen?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

export function CountdownWidget({
  schedulerInfo,
  journeyTitle = 'Selected Journey',
  travelClass = '3A',
  onWindowOpen,
  className = '',
}: CountdownWidgetProps) {
  const [time, setTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
    isExpired: false,
  });

  const [announcedMessage, setAnnouncedMessage] = useState<string>('');
  const lastAnnouncedMinute = useRef<number | null>(null);

  useEffect(() => {
    if (!schedulerInfo?.openingTimestampIST) return;

    const targetDate = new Date(schedulerInfo.openingTimestampIST).getTime();

    const calculateTime = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTime({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          isExpired: true,
        });
        if (onWindowOpen && diff > -10000) {
          onWindowOpen();
        }
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTime({
        days,
        hours,
        minutes,
        seconds,
        totalMs: diff,
        isExpired: false,
      });

      // Accessible Screen Reader Announcement:
      // Only announce every 5 minutes when far out, every minute when <= 15m, and at 30s.
      // Avoids overwhelming screen reader users with every second ticking!
      if (lastAnnouncedMinute.current !== minutes) {
        lastAnnouncedMinute.current = minutes;
        if (days === 0 && hours === 0 && minutes <= 15) {
          setAnnouncedMessage(`Tatkal preparation alert: ${minutes} minute${minutes !== 1 ? 's' : ''} remaining until official opening.`);
        } else if (minutes % 10 === 0) {
          setAnnouncedMessage(`Tatkal countdown update: ${hours} hours and ${minutes} minutes remaining.`);
        }
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [schedulerInfo?.openingTimestampIST, onWindowOpen]);

  if (!schedulerInfo) {
    return (
      <div className={`p-6 rounded-2xl bg-surface-dim border border-white/10 text-ink-muted relative overflow-hidden ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-accent-coral" />
          <h3 className="font-semibold text-ink text-sm">Opening Time Unavailable</h3>
        </div>
        <p className="text-xs text-ink-subtle">
          Awaiting trip selection or sync with the TicketPilot scheduler service to receive authoritative opening timestamp.
        </p>
      </div>
    );
  }

  const isAC = schedulerInfo.targetClassType === 'AC';
  const openTimeIST = schedulerInfo.openingTimeFormatted || (isAC ? '10:00 AM IST' : '11:00 AM IST');

  // Milestone preparation alerts
  const isWithin15Min = !time.isExpired && time.days === 0 && time.hours === 0 && time.minutes < 15;
  const isWithin5Min = !time.isExpired && time.days === 0 && time.hours === 0 && time.minutes < 5;

  return (
    <div
      role="region"
      aria-label="Tatkal Booking Opening Countdown"
      className={`relative overflow-hidden rounded-2xl p-6 border transition-all ${
        time.isExpired
          ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200 shadow-glow-emerald'
          : isWithin5Min
          ? 'bg-amber-950/20 border-accent-coral/50 text-ink shadow-glow-orange'
          : 'bg-surface/85 backdrop-blur-md border-white/10 shadow-glass'
      } ${className}`}
    >
      {/* Visual Accent Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          time.isExpired
            ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent'
            : isWithin5Min
            ? 'bg-gradient-to-r from-accent-coral via-amber-400 to-transparent'
            : 'bg-gradient-to-r from-accent-coral/60 via-emerald-500/40 to-transparent'
        }`}
      />

      {/* Hidden ARIA Live region for non-intrusive screen reader updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcedMessage}
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="section-idx">[01 // CHRONO.SYNC]</span>
            <span className="flex items-center gap-1.5 font-mono text-[0.625rem] text-accent-emerald uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              REALTIME
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${time.isExpired ? 'text-emerald-400' : 'text-accent-coral'}`} aria-hidden="true" />
            <h3 className="font-bold text-ink text-base sm:text-lg tracking-tight">
              {time.isExpired ? 'Tatkal Booking Window Open' : 'Tatkal Opening Countdown'}
            </h3>
          </div>
          <p className="text-xs text-ink-muted mt-0.5 font-mono">
            {journeyTitle} • <span className="text-ink font-semibold">{travelClass} ({isAC ? 'AC Quota' : 'Non-AC Quota'})</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            label={isAC ? 'AC: 10:00 AM IST' : 'Non-AC: 11:00 AM IST'}
            variant={isAC ? 'ac' : 'nonac'}
          />
          {schedulerInfo.isAuthoritative ? (
            <StatusBadge label="Scheduler Status" variant="warning" hint="Scheduler integration is pending" />
          ) : (
            <StatusBadge label="Configured Default" variant="warning" hint="Awaiting origin verification" />
          )}
        </div>
      </div>

      {/* Countdown Digits */}
      {time.isExpired ? (
        <div className="py-5 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg mb-1">
            <CheckCircle className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <span>Official Booking Active on IRCTC</span>
          </div>
          <p className="text-xs text-emerald-300/90 font-mono">
            The configured opening threshold ({openTimeIST}) has passed. Proceed immediately to the official IRCTC portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3.5 my-4 text-center">
          {/* Days */}
          <div className="bg-surface-elevated/80 border border-white/10 border-t-white/20 rounded-xl p-3 sm:p-4 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-[9px] font-mono text-ink-subtle mb-1">
              <span>[DD]</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
            </div>
            <span className="block text-2xl sm:text-4xl font-black text-ink font-mono tabular-nums tracking-tight group-hover:text-accent-coral transition-colors">
              {String(time.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-ink-muted mt-1 block">
              Days
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5" />
          </div>

          {/* Hours */}
          <div className="bg-surface-elevated/80 border border-white/10 border-t-white/20 rounded-xl p-3 sm:p-4 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-[9px] font-mono text-ink-subtle mb-1">
              <span>[HH]</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
            </div>
            <span className="block text-2xl sm:text-4xl font-black text-ink font-mono tabular-nums tracking-tight group-hover:text-accent-coral transition-colors">
              {String(time.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-ink-muted mt-1 block">
              Hours
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5" />
          </div>

          {/* Minutes */}
          <div className="bg-surface-elevated/80 border border-white/10 border-t-white/20 rounded-xl p-3 sm:p-4 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-[9px] font-mono text-ink-subtle mb-1">
              <span>[MM]</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
            </div>
            <span className="block text-2xl sm:text-4xl font-black text-ink font-mono tabular-nums tracking-tight group-hover:text-accent-coral transition-colors">
              {String(time.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-ink-muted mt-1 block">
              Minutes
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5" />
          </div>

          {/* Seconds */}
          <div className="bg-surface-elevated/80 border border-accent-emerald/30 border-t-emerald-400/30 rounded-xl p-3 sm:p-4 shadow-sm relative overflow-hidden group bg-emerald-500/5">
            <div className="flex items-center justify-between text-[9px] font-mono text-accent-emerald/80 mb-1">
              <span>[SS]</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            </div>
            <span className="block text-2xl sm:text-4xl font-black text-accent-emerald font-mono tabular-nums tracking-tight">
              {String(time.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-accent-emerald mt-1 block font-semibold">
              Seconds
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-emerald/40" />
          </div>
        </div>
      )}

      {/* Target Timestamp & Timezone Notice */}
      <div className="mt-4 pt-3.5 border-t border-white/8 flex flex-wrap items-center justify-between text-xs text-ink-muted gap-2 font-mono">
        <span>
          Target: <strong className="text-ink font-semibold">{openTimeIST}</strong> on {schedulerInfo.openingTimestampIST.slice(0, 10)}
        </span>
        <span className="flex items-center gap-1.5 text-ink-subtle">
          <Info className="w-3.5 h-3.5 text-accent-coral" aria-hidden="true" />
          Indian Standard Time (UTC+05:30)
        </span>
      </div>

      {/* Origin Date Notice */}
      {schedulerInfo.originDateNotice && (
        <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
          <span>{schedulerInfo.originDateNotice}</span>
        </div>
      )}

      {/* Readiness Alert when < 15 minutes */}
      {isWithin15Min && !time.isExpired && (
        <div className="mt-3 p-3.5 rounded-xl bg-accent-coral/10 border border-accent-coral/30 text-ink text-xs flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-accent-coral shrink-0" aria-hidden="true" />
          <span className="leading-relaxed">
            <strong className="text-accent-coral">Preparation Window Active:</strong> Log into IRCTC now, verify Master Passenger list is saved, and keep payment instrument ready.
          </span>
        </div>
      )}
    </div>
  );
}
