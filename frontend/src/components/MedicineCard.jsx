import React from 'react';
import {
  Pill,
  Clock,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Box,
  Check,
  Radio
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function MedicineCard({
  medicine,
  onTake,
  onSimulateIoT,
  showActions = true
}) {
  const {
    id,
    name,
    dosage,
    dosage_unit = '',
    time,
    schedule_time,
    meal,
    meal_instruction,
    status = 'upcoming',
    takenAt,
    slot,
    notes
  } = medicine;

  const displayTime = schedule_time || time;
  const displayMeal = meal_instruction || meal;
  const displayDosage = `${dosage} ${dosage_unit}`.trim();

  const isTaken = status === 'taken';
  const isPending = status === 'pending';
  const isMissed = status === 'missed';
  const isUpcoming = status === 'upcoming';

  let statusDetail = null;
  if (isTaken && takenAt) {
    statusDetail = (
      <span style={{ fontSize: '0.82rem', color: 'var(--status-taken-text)', fontWeight: 600 }}>
        Taken at: <strong>{takenAt}</strong>
      </span>
    );
  } else if (isPending) {
    statusDetail = (
      <span style={{ fontSize: '0.82rem', color: 'var(--status-pending-text)', fontWeight: 600 }}>
        Due now
      </span>
    );
  } else if (isMissed) {
    statusDetail = (
      <span style={{ fontSize: '0.82rem', color: 'var(--status-missed-text)', fontWeight: 600 }}>
        Missed dose
      </span>
    );
  }

  return (
    <div
      className="card medicine-item-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: isTaken
          ? '5px solid var(--status-taken-dot)'
          : isPending
          ? '5px solid var(--status-pending-dot)'
          : isMissed
          ? '5px solid var(--status-missed-dot)'
          : '5px solid var(--status-upcoming-dot)',
        gap: '1rem',
        background: 'var(--bg-card)'
      }}
    >
      {/* Header: Name, Dosage, Status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isTaken
                ? 'var(--status-taken-bg)'
                : isPending
                ? 'var(--status-pending-bg)'
                : isMissed
                ? 'var(--status-missed-bg)'
                : 'var(--status-upcoming-bg)',
              color: isTaken
                ? 'var(--status-taken-dot)'
                : isPending
                ? 'var(--status-pending-dot)'
                : isMissed
                ? 'var(--status-missed-dot)'
                : 'var(--status-upcoming-dot)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Pill size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h3
              className="medicine-title"
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2
              }}
            >
              {name}
            </h3>
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--primary-500)',
                marginTop: '2px'
              }}
            >
              {displayDosage}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <StatusBadge status={status} />
          {statusDetail}
        </div>
      </div>

      {/* Schedule Info Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.65rem',
          padding: '0.75rem 0.85rem',
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Clock size={16} color="var(--primary-500)" />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Scheduled
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {displayTime}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Utensils size={16} color="var(--status-pending-dot)" />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Meal Timing
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {displayMeal || 'With water'}
            </div>
          </div>
        </div>

        {slot && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Box size={16} color="var(--primary-600)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Compartment
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Slot #{slot}
              </div>
            </div>
          </div>
        )}
      </div>

      {notes && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          💡 {notes}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '0.25rem',
            flexWrap: 'wrap'
          }}
        >
          {isTaken ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: 'var(--status-taken-text)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <CheckCircle2 size={16} color="var(--status-taken-dot)" />
              <span>Dose confirmed taken</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
              <button
                type="button"
                onClick={() => onTake && onTake(id)}
                className="btn btn-success btn-sm"
                style={{ flex: 1, minWidth: '130px' }}
              >
                <Check size={16} strokeWidth={2.5} />
                <span>Mark as Taken</span>
              </button>

              <button
                type="button"
                onClick={() => onSimulateIoT && onSimulateIoT(id)}
                className="btn btn-secondary btn-sm"
                title="Simulate hardware sensor detection"
                style={{
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Radio size={14} color="var(--primary-500)" />
                <span>Simulate Hardware</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
