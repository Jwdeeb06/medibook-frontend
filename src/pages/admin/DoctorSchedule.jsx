import { useState, useEffect } from 'react';
import api from '../../services/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultSchedule = DAYS.map((_, i) => ({
  day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: i >= 1 && i <= 5
}));

export default function DoctorSchedule() {
  const [doctorId, setDoctorId] = useState(null);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/doctors/me')
      .then(res => {
        setDoctorId(res.data.id);
        if (res.data.schedules?.length > 0) {
          const merged = defaultSchedule.map(def => {
            const existing = res.data.schedules.find(s => s.day_of_week === def.day_of_week);
            return existing
              ? { ...def, start_time: existing.start_time.slice(0,5), end_time: existing.end_time.slice(0,5), is_available: existing.is_available }
              : def;
          });
          setSchedule(merged);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (dayIndex, field, value) => {
    setSchedule(prev => prev.map(s =>
      s.day_of_week === dayIndex ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = schedule.filter(s => s.is_available);
      await api.put(`/doctors/${doctorId}/schedule`, { schedules: toSave });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { alert('Failed to save schedule'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Schedule</h1>
        <p className="admin-page-subtitle">Set your working days and hours</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="admin-card">
            {success && <div className="alert alert-success mb-4">✅ Schedule saved!</div>}

            <div className="schedule-grid mb-4">
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr 70px', gap: '0.75rem', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
                <small className="fw-bold text-muted">Day</small>
                <small className="fw-bold text-muted">Start Time</small>
                <small className="fw-bold text-muted">End Time</small>
                <small className="fw-bold text-muted">Active</small>
              </div>

              {schedule.map(s => (
                <div key={s.day_of_week} className="schedule-row" style={{ opacity: s.is_available ? 1 : 0.5 }}>
                  <div className="schedule-day">{DAYS[s.day_of_week]}</div>
                  <input type="time" className="form-control form-control-sm"
                    value={s.start_time} disabled={!s.is_available}
                    onChange={e => updateDay(s.day_of_week, 'start_time', e.target.value)} />
                  <input type="time" className="form-control form-control-sm"
                    value={s.end_time} disabled={!s.is_available}
                    onChange={e => updateDay(s.day_of_week, 'end_time', e.target.value)} />
                  <div className="text-center">
                    <input type="checkbox" className="form-check-input"
                      checked={s.is_available}
                      onChange={e => updateDay(s.day_of_week, 'is_available', e.target.checked)} />
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-admin-primary w-100" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
