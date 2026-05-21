import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function SendNotification() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ user_id: '', title: '', message: '' });
  const [broadcast, setBroadcast] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load patients for the dropdown
    api.get('/patients')
      .then(res => setPatients(res.data.patients || []))
      .catch(() => {});

    // Load recent sent notifications (from current user's sent items — we show all system notifs)
    api.get('/notifications')
      .then(res => setHistory(res.data.notifications?.filter(n => n.type === 'system').slice(0, 10) || []))
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    setError(''); setSuccess('');
    if (!form.title || !form.message) {
      setError('Title and message are required');
      return;
    }
    if (!broadcast && !form.user_id) {
      setError('Please select a patient or use broadcast');
      return;
    }

    setSending(true);
    try {
      if (broadcast) {
        const res = await api.post('/notifications/broadcast', {
          title: form.title,
          message: form.message,
        });
        setSuccess(res.data.message);
      } else {
        const res = await api.post('/notifications/send', {
          user_id: parseInt(form.user_id),
          title: form.title,
          message: form.message,
        });
        setSuccess(res.data.message);
      }
      setForm({ user_id: '', title: '', message: '' });
      setBroadcast(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send');
    } finally { setSending(false); }
  };

  const QUICK_TEMPLATES = [
    { label: 'Appointment reminder', title: '⏰ Appointment Reminder', message: 'This is a reminder about your upcoming appointment. Please arrive 10 minutes early.' },
    { label: 'Results ready', title: '📋 Your Results Are Ready', message: 'Your test results are ready. Please visit us or contact the clinic for more details.' },
    { label: 'Clinic closed', title: '🏥 Clinic Notice', message: 'The clinic will be closed on [DATE]. We apologize for any inconvenience.' },
    { label: 'Follow-up needed', title: '🩺 Follow-up Required', message: 'Your doctor recommends a follow-up appointment. Please book at your earliest convenience.' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Send Notification</h1>
        <p className="admin-page-subtitle">Send messages directly to patients</p>
      </div>

      <div className="row g-4">
        {/* Compose */}
        <div className="col-lg-7">
          <div className="admin-card">
            <h6 className="fw-bold mb-4">
              <i className="fa-solid fa-paper-plane me-2" style={{ color: '#AB1509' }}></i>
              Compose Message
            </h6>

            {error && <div className="alert alert-danger mb-3"><i className="fa-solid fa-circle-exclamation me-2"></i>{error}</div>}
            {success && <div className="alert alert-success mb-3"><i className="fa-solid fa-circle-check me-2"></i>{success}</div>}

            {/* Recipient */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Send To *</label>
              <div className="d-flex gap-2 mb-2">
                <button onClick={() => setBroadcast(false)}
                  className="btn btn-sm flex-fill"
                  style={{ borderRadius: 10, background: !broadcast ? '#AB1509' : 'white', color: !broadcast ? '#fff7d3' : '#6b5a58', border: `1px solid ${!broadcast ? '#AB1509' : '#e5e7eb'}`, fontWeight: !broadcast ? 600 : 400 }}>
                  <i className="fa-solid fa-user me-2"></i>Specific Patient
                </button>
                <button onClick={() => setBroadcast(true)}
                  className="btn btn-sm flex-fill"
                  style={{ borderRadius: 10, background: broadcast ? '#AB1509' : 'white', color: broadcast ? '#fff7d3' : '#6b5a58', border: `1px solid ${broadcast ? '#AB1509' : '#e5e7eb'}`, fontWeight: broadcast ? 600 : 400 }}>
                  <i className="fa-solid fa-users me-2"></i>All Patients
                </button>
              </div>

              {!broadcast && (
                <select className="form-select" value={form.user_id}
                  onChange={e => setForm({ ...form, user_id: e.target.value })}>
                  <option value="">Select a patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.email}
                    </option>
                  ))}
                </select>
              )}

              {broadcast && (
                <div className="p-3 rounded-3 text-center" style={{ background: '#fff7d3', border: '1px solid #f5ecc0' }}>
                  <i className="fa-solid fa-bullhorn me-2" style={{ color: '#AB1509' }}></i>
                  <strong>Broadcast</strong> — this will be sent to <strong>all active patients</strong>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Notification Title *</label>
              <input className="form-control" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Your appointment is confirmed" />
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Message *</label>
              <textarea className="form-control" rows="4" value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..." />
              <small className="text-muted">{form.message.length} characters</small>
            </div>

            <button className="btn-admin-primary w-100" onClick={handleSend} disabled={sending}>
              {sending
                ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                : <><i className="fa-solid fa-paper-plane me-2"></i>{broadcast ? 'Broadcast to All Patients' : 'Send Notification'}</>}
            </button>
          </div>
        </div>

        {/* Quick templates + preview */}
        <div className="col-lg-5">
          {/* Quick templates */}
          <div className="admin-card mb-4">
            <h6 className="fw-bold mb-3">
              <i className="fa-solid fa-bolt me-2" style={{ color: '#AB1509' }}></i>
              Quick Templates
            </h6>
            <div className="d-flex flex-column gap-2">
              {QUICK_TEMPLATES.map(t => (
                <button key={t.label}
                  onClick={() => setForm({ ...form, title: t.title, message: t.message })}
                  className="btn text-start p-3"
                  style={{ borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#AB1509'; e.currentTarget.style.background = '#fff7d3'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}>
                  <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{t.title}</div>
                  <small className="text-muted">{t.message.slice(0, 60)}...</small>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {(form.title || form.message) && (
            <div className="admin-card">
              <h6 className="fw-bold mb-3">
                <i className="fa-solid fa-eye me-2" style={{ color: '#AB1509' }}></i>
                Preview
              </h6>
              <div style={{ background: '#f9f6f0', borderRadius: 12, padding: '1rem', border: '1px solid #e5e7eb' }}>
                <div className="d-flex align-items-start gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#AB150918', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fa-solid fa-bell" style={{ color: '#AB1509', fontSize: '0.9rem' }}></i>
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{form.title || 'Notification Title'}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{form.message || 'Message preview...'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.25rem' }}>Just now</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
