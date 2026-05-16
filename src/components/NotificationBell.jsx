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
      .then(res => { setNotifications(res.data.notifications || []); setUnread(res.data.unread || 0); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  if (!isAuthenticated) return null;

  const typeIcon = { booking: 'fa-calendar', confirmation: 'fa-circle-check', cancellation: 'fa-circle-xmark', system: 'fa-bell' };
  const typeColor = { booking: '#0284c7', confirmation: '#059669', cancellation: '#dc2626', system: '#6b7280' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.6rem', position: 'relative', color: '#2a1a18'
      }}>
        <i className="fa-solid fa-bell fa-lg"></i>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, background: '#AB1509', color: 'white',
            borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', width: 340, background: 'white',
          borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 1000,
          border: '1px solid #f3f4f6', overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Notifications {unread > 0 && <span className="badge" style={{ background: '#AB1509', color: 'white', fontSize: '0.7rem' }}>{unread}</span>}</strong>
            {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#AB1509', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="fa-solid fa-bell-slash fa-lg mb-2 d-block"></i>No notifications yet
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                padding: '1rem 1.25rem', borderBottom: '1px solid #f9fafb',
                background: n.is_read ? 'white' : '#fef9f9', display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${typeColor[n.type]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fa-solid ${typeIcon[n.type]}`} style={{ color: typeColor[n.type], fontSize: '0.85rem' }}></i>
                </div>
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{n.title}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#AB1509', flexShrink: 0, marginTop: 4 }}></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
