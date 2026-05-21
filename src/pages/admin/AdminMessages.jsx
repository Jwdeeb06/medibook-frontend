import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchMessages = () => {
    api.get('/contact')
      .then(res => {
        setMessages(res.data.messages || []);
        setUnread(res.data.unread || 0);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleOpen = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      await api.put(`/contact/${msg.id}/read`);
      fetchMessages();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await api.delete(`/contact/${id}`);
    if (selected?.id === id) setSelected(null);
    fetchMessages();
  };

  const filtered = filter === 'unread'
    ? messages.filter(m => !m.is_read)
    : messages;

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="admin-page-title">
            Messages
            {unread > 0 && (
              <span className="ms-2 badge" style={{ background: '#AB1509', color: '#fff7d3', fontSize: '0.7rem', borderRadius: 10 }}>
                {unread} new
              </span>
            )}
          </h1>
          <p className="admin-page-subtitle">Contact form messages from visitors</p>
        </div>
        <div className="d-flex gap-2">
          {['all', 'unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="btn btn-sm"
              style={{
                borderRadius: 20, fontWeight: filter === f ? 600 : 400,
                background: filter === f ? '#AB1509' : 'white',
                color: filter === f ? '#fff7d3' : '#6b5a58',
                border: `1px solid ${filter === f ? '#AB1509' : '#e5e7eb'}`,
              }}>
              {f === 'all' ? `All (${messages.length})` : `Unread (${unread})`}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4">
        {/* Message list */}
        <div className="col-lg-4">
          <div className="admin-card p-0 overflow-hidden">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#AB1509' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fa-solid fa-inbox fa-2x mb-3 d-block" style={{ color: '#d1d5db' }}></i>
                No messages
              </div>
            ) : filtered.map(msg => (
              <div key={msg.id}
                onClick={() => handleOpen(msg)}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  background: selected?.id === msg.id ? '#fff7d3' : msg.is_read ? 'white' : '#fef9f9',
                  borderLeft: selected?.id === msg.id ? '4px solid #AB1509' : '4px solid transparent',
                }}
                onMouseEnter={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = '#f9f6f0'; }}
                onMouseLeave={e => { if (selected?.id !== msg.id) e.currentTarget.style.background = msg.is_read ? 'white' : '#fef9f9'; }}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                    {!msg.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#AB1509', flexShrink: 0 }}></div>
                    )}
                    {msg.name}
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {new Date(msg.created_at).toLocaleDateString('en-GB')}
                  </small>
                </div>
                <small className="text-muted d-block mb-1">{msg.email}</small>
                <small className="text-muted" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {msg.message}
                </small>
              </div>
            ))}
          </div>
        </div>

        {/* Message detail */}
        <div className="col-lg-8">
          {selected ? (
            <div className="admin-card">
              <div className="d-flex justify-content-between align-items-start mb-4 pb-3"
                style={{ borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <h5 className="fw-bold mb-1">{selected.name}</h5>
                  <div className="d-flex gap-3 flex-wrap" style={{ fontSize: '0.85rem' }}>
                    <span className="text-muted">
                      <i className="fa-solid fa-envelope me-1" style={{ color: '#AB1509' }}></i>
                      {selected.email}
                    </span>
                    <span className="text-muted">
                      <i className="fa-regular fa-calendar me-1" style={{ color: '#AB1509' }}></i>
                      {new Date(selected.created_at).toLocaleDateString('en-GB', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8 }}
                  onClick={() => handleDelete(selected.id)}>
                  <i className="fa-solid fa-trash me-1"></i>Delete
                </button>
              </div>

              {/* Message body */}
              <div className="p-4 rounded-3 mb-4"
                style={{ background: '#f9f6f0', border: '1px solid #e5e7eb', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </div>

              {/* Actions */}
              <div className="d-flex gap-2 flex-wrap">
                <a href={`mailto:${selected.email}?subject=Re: Your message to MediBook`}
                  className="btn btn-primary" style={{ borderRadius: 10 }}>
                  <i className="fa-solid fa-reply me-2"></i>Reply via Email
                </a>
                <button className="btn btn-outline-secondary" style={{ borderRadius: 10 }}
                  onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-card d-flex flex-column align-items-center justify-content-center text-center"
              style={{ minHeight: 400 }}>
              <i className="fa-solid fa-envelope-open fa-3x mb-3" style={{ color: '#d1d5db' }}></i>
              <h6 className="text-muted fw-semibold mb-1">No message selected</h6>
              <small className="text-muted">Click a message from the list to read it</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}