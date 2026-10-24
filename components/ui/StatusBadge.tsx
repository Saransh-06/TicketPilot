import React from 'react';

export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'neutral' 
  | 'ac' 
  | 'nonac';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  icon,
  hint,
  className = '',
}: StatusBadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/12 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/12 text-red-400 border-red-500/20',
    info: 'bg-sky-500/12 text-sky-400 border-sky-500/20',
    neutral: 'bg-white/5 text-ink-muted border-white/10',
    ac: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    nonac: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.6875rem] font-mono font-medium border tracking-wide ${variantStyles[variant]} ${className}`}
      title={hint}
      role="status"
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
      {hint && <span className="sr-only">({hint})</span>}
    </span>
  );
}
