'use client';

import React from 'react';
import { Trip } from '@/lib/types';
import { Train, ArrowRight, Compass, Shield, MapPin, Zap } from 'lucide-react';

interface JourneyRouteVisualizerProps {
  trip: Trip | null;
  className?: string;
}

export function JourneyRouteVisualizer({ trip, className = '' }: JourneyRouteVisualizerProps) {
  if (!trip) {
    return (
      <div
        role="region"
        aria-label="Journey corridor route visualizer — neutral state"
        className={`rounded-2xl border border-white/8 bg-surface/50 p-4 sm:p-5 backdrop-blur-sm transition-all ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-ink-subtle">
          <div className="flex items-center gap-2">
            <span className="section-idx">[CORRIDOR.TELEMETRY]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle/50" />
            <span>STANDBY</span>
          </div>
          <span className="text-[11px] text-ink-muted">No journey selected • Select or configure a trip below</span>
        </div>

        {/* Neutral Route Track Preview */}
        <div className="mt-3 py-2 flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full border-2 border-white/20 bg-surface-dim" />
            <span className="font-mono text-xs text-ink-subtle">ORIGIN</span>
          </div>

          <div className="flex-1 h-px bg-dashed-track relative flex items-center justify-center">
            <div className="h-0.5 w-full border-t border-dashed border-white/15" />
            <span className="absolute bg-surface px-2 text-[10px] font-mono text-ink-subtle uppercase tracking-widest">
              RAILWAY SECTOR
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-ink-subtle">DESTINATION</span>
            <div className="w-3 h-3 rounded-full border-2 border-white/20 bg-surface-dim" />
          </div>
        </div>
      </div>
    );
  }

  // Parse origin station code & name safely
  const sourceRaw = trip.sourceStation || 'ORIGIN';
  const sourceCode = sourceRaw.includes('-') ? sourceRaw.split('-')[0].trim() : sourceRaw.slice(0, 4).toUpperCase();
  const sourceName = sourceRaw.includes('-') ? sourceRaw.split('-').slice(1).join('-').trim() : sourceRaw;

  // Parse dest station code & name safely
  const destRaw = trip.destStation || 'DESTINATION';
  const destCode = destRaw.includes('-') ? destRaw.split('-')[0].trim() : destRaw.slice(0, 4).toUpperCase();
  const destName = destRaw.includes('-') ? destRaw.split('-').slice(1).join('-').trim() : destRaw;

  const quotaLabel = trip.isAC ? '10:00 AM AC Quota' : '11:00 AM Non-AC Quota';
  const trainDetail = trip.preferredTrainNumber
    ? `#${trip.preferredTrainNumber} ${trip.preferredTrainName ? `(${trip.preferredTrainName})` : ''}`
    : 'Direct Express Corridor';

  return (
    <div
      role="region"
      aria-label={`Railway journey route visualization from ${sourceRaw} to ${destRaw}`}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-surface/75 p-4 sm:p-5 shadow-glass backdrop-blur-md transition-all ${className}`}
    >
      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/8 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="section-idx">[CORRIDOR.TELEMETRY]</span>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-accent-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            TRACK SYNCHRONIZED
          </span>
        </div>

        <div className="flex items-center gap-3 text-ink-subtle text-[11px]">
          <span>
            DATE: <strong className="text-ink font-semibold">{trip.journeyDate}</strong>
          </span>
          <span className="text-white/20">•</span>
          <span>
            CLASS: <strong className="text-accent-coral font-semibold">{trip.travelClass}</strong>
          </span>
        </div>
      </div>

      {/* Responsive Route Graphical Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Origin Station Node */}
        <div className="md:col-span-3 flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-accent-coral/15 border border-accent-coral/30 flex items-center justify-center text-accent-coral font-bold shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-coral border-2 border-surface" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle block">Origin Station</span>
            <span className="font-mono text-base sm:text-lg font-black text-ink block tracking-tight truncate">
              {sourceCode}
            </span>
            <span className="text-xs text-ink-muted truncate block">{sourceName}</span>
          </div>
        </div>

        {/* Connecting Route Track Line (Center Graphic) */}
        <div className="md:col-span-6 px-1 sm:px-3">
          <div className="relative flex flex-col items-center justify-center">
            {/* Train metadata pill positioned above line */}
            <div className="mb-2 flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-elevated/90 border border-white/10 text-[10px] font-mono text-ink-muted shadow-xs max-w-full truncate">
              <Train className="w-3 h-3 text-accent-coral shrink-0" />
              <span className="truncate">{trainDetail}</span>
              <span className="text-white/20 shrink-0">•</span>
              <span className="text-accent-emerald font-semibold shrink-0">{quotaLabel}</span>
            </div>

            {/* SVG Connecting Route Vector */}
            <div className="w-full h-8 relative flex items-center">
              <svg
                className="w-full h-6 overflow-visible"
                viewBox="0 0 400 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Background track line */}
                <line
                  x1="10"
                  y1="12"
                  x2="390"
                  y2="12"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Active connecting gradient route path */}
                <line
                  x1="10"
                  y1="12"
                  x2="390"
                  y2="12"
                  stroke="url(#route-gradient)"
                  strokeWidth="2.5"
                />

                {/* Animated traveling signal pulse along the line */}
                <circle r="4" cy="12" fill="#F97316" className="animate-signal-pulse">
                  <animate
                    attributeName="cx"
                    values="20;380;20"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Middle waypoint chevron */}
                <polygon
                  points="198,8 206,12 198,16"
                  fill="#F97316"
                  opacity="0.8"
                />

                <defs>
                  <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#FB923C" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Direction indicator subtitle */}
            <div className="flex items-center justify-between w-full text-[10px] font-mono text-ink-subtle px-1">
              <span>DEPARTURE TRACK</span>
              <span className="flex items-center gap-1 text-accent-coral/90">
                <span>TRANSIT DIRECTION</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
              <span>ARRIVAL TERMINUS</span>
            </div>
          </div>
        </div>

        {/* Destination Station Node */}
        <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-3">
          <div className="min-w-0 md:text-right order-2 md:order-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle block">Destination Station</span>
            <span className="font-mono text-base sm:text-lg font-black text-ink block tracking-tight truncate">
              {destCode}
            </span>
            <span className="text-xs text-ink-muted truncate block">{destName}</span>
          </div>
          <div className="relative shrink-0 order-1 md:order-2">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 border border-accent-emerald/30 flex items-center justify-center text-accent-emerald font-bold shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-emerald border-2 border-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}
