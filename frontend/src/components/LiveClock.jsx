import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Bell } from 'lucide-react';

export default function LiveClock({ nextMedicine = null, nextMinutes = 18 }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="live-clock-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.25rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'var(--primary-50)',
          color: 'var(--primary-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Clock size={24} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.15
          }}>
            {timeString}
          </div>
          <div style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: '2px'
          }}>
            <Calendar size={13} />
            <span>{dateString}</span>
          </div>
        </div>
      </div>

      {nextMedicine && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          background: 'var(--status-pending-bg)',
          border: '1px solid var(--status-pending-border)',
          color: 'var(--status-pending-text)',
          padding: '0.45rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          <Bell size={15} style={{ animation: 'bounce 2s infinite' }} />
          <span>Next medicine in {nextMinutes} minutes</span>
          <span style={{
            background: 'var(--status-pending-dot)',
            color: '#fff',
            padding: '0.15rem 0.45rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            marginLeft: '2px'
          }}>
            {nextMedicine.name}
          </span>
        </div>
      )}
    </div>
  );
}
