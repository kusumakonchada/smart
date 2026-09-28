import React from 'react';
import { CheckCircle2, AlertCircle, Bell, Clock, X } from 'lucide-react';

export default function NotificationToast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        let icon = <CheckCircle2 size={20} color="var(--status-taken-dot)" />;
        let borderLeftColor = 'var(--status-taken-dot)';

        if (t.type === 'error') {
          icon = <AlertCircle size={20} color="var(--status-missed-dot)" />;
          borderLeftColor = 'var(--status-missed-dot)';
        } else if (t.type === 'reminder') {
          icon = <Clock size={20} color="var(--status-pending-dot)" />;
          borderLeftColor = 'var(--status-pending-dot)';
        } else if (t.type === 'alarm') {
          icon = <Bell size={20} color="var(--primary-500)" className="pulse-icon" />;
          borderLeftColor = 'var(--primary-500)';
        } else if (t.type === 'info') {
          icon = <Bell size={20} color="var(--primary-500)" />;
          borderLeftColor = 'var(--primary-500)';
        }

        return (
          <div
            key={t.id}
            className="toast"
            style={{
              borderLeft: `5px solid ${borderLeftColor}`,
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="toast-icon">{icon}</div>
            <div className="toast-body">
              <div className="toast-title" style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                {t.title}
              </div>
              {t.desc && (
                <div className="toast-desc" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {t.desc}
                </div>
              )}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss && onDismiss(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
