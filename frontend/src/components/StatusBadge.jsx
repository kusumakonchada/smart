import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Calendar, MinusCircle } from 'lucide-react';

export default function StatusBadge({ status, label, className = '' }) {
  const normStatus = (status || 'upcoming').toLowerCase();

  const configs = {
    taken: {
      badgeClass: 'badge-taken',
      icon: CheckCircle2,
      defaultLabel: 'Taken'
    },
    pending: {
      badgeClass: 'badge-pending',
      icon: Clock,
      defaultLabel: 'Pending'
    },
    missed: {
      badgeClass: 'badge-missed',
      icon: AlertTriangle,
      defaultLabel: 'Missed'
    },
    upcoming: {
      badgeClass: 'badge-upcoming',
      icon: Calendar,
      defaultLabel: 'Upcoming'
    },
    inactive: {
      badgeClass: 'badge-inactive',
      icon: MinusCircle,
      defaultLabel: 'Inactive'
    }
  };

  const current = configs[normStatus] || configs.upcoming;
  const Icon = current.icon;
  const displayLabel = label || current.defaultLabel;

  return (
    <span className={`badge ${current.badgeClass} ${className}`}>
      <span className="badge-dot" aria-hidden="true" />
      <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
