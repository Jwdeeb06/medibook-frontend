import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = () => {
    if (!isAuthenticated) return;
    api.get('/notifications')
      .then(res => {
        setNotifications(res.data.notifications || []);
        setUnread(res.data.unread || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  if (!isAuthenticated) return null;

  const typeConfig = {
    booking:      { icon: 'fa-calendar', color: '#0284c7', bg: '#eff6ff' },
    confirmation: { icon: 'fa-circle-check', color: '#059669', bg: '#f0fdf4' },
    cancellation: { icon: 'fa-circle-xmark', color: '#dc2626', bg: '#fef2f2' },
    system:       { icon: 'fa-bell', color: '#AB1509', bg: '#fff0ef' },
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.6rem', position: 'relative', color: '#2a1a18', borderRadius: 8, transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <i className={`fa-solid fa-bell fa-lg ${unread > 0 ? 'fa-shake' : ''}`} style={{ animationDuration: '2s', animationIterationCount: 3 }}></i>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: '#AB1509', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: '0.6rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 380, background: 'white', borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 1050,
          border: '1px solid #f3f4f6', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Notifications</strong>
              {unread > 0 && (
                <span className="ms-2 badge" style={{ background: '#AB1509', color: 'white', fontSize: '0.65rem' }}>{unread} new</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: '#AB1509', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="fa-solid fa-bell-slash fa-2x mb-2 d-block" style={{ color: '#d1d5db' }}></i>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => {
                const cfg = typeConfig[n.type] || typeConfig.system;
                return (
                  <div key={n.id}
                    onClick={() => !n.is_read && markOneRead(n.id)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #f9fafb',
                      background: n.is_read ? 'white' : '#fef9f9',
                      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                      cursor: n.is_read ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.background = '#fff7d3'; }}
                    onMouseLeave={e => { if (!n.is_read) e.currentTarget.style.background = '#fef9f9'; }}>

                    {/* Icon */}
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fa-solid ${cfg.icon}`} style={{ color: cfg.color, fontSize: '0.85rem' }}></i>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-semibold" style={{ fontSize: '0.875rem', lineHeight: 1.3, marginBottom: 2 }}>{n.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.3rem' }}>{timeAgo(n.created_at)}</div>
                    </div>

                    {/* Unread dot */}
                    {!n.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#AB1509', flexShrink: 0, marginTop: 4 }}></div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '0.75rem', borderTop: '1px solid #f3f4f6', textAlign: 'center', background: '#fafafa' }}>
              <small className="text-muted">Showing last {notifications.length} notifications</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
