import { useState, useEffect } from 'react';
import api from '../../services/api';

const STEPS = ['Patient', 'Service & Doctor', 'Date & Time', 'Confirm'];

export default function AdminCreateBooking({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [patientType, setPatientType] = useState('existing');
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Patient
    user_id: '',
    guest_name: '', guest_email: '', guest_phone: '',
    new_name: '', new_email: '', new_phone: '', new_password: '', new_gender: '',
    // Booking
    service_id: '', doctor_id: '',
    booking_date: '', start_time: '', notes: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get('/services').then(res => setServices(res.data.services || []));
    api.get('/doctors').then(res => setDoctors(res.data.doctors || []));
  }, []);

  // Search patients
  useEffect(() => {
    if (patientType !== 'existing') return;
    const timeout = setTimeout(() => {
      api.get(`/patients?search=${patientSearch}`)
        .then(res => setPatients(res.data.patients || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientSearch, patientType]);

  // Load slots
  useEffect(() => {
    if (!form.service_id || !form.booking_date) { setSlots([]); return; }
    setLoadingSlots(true);
    const params = new URLSearchParams({ service_id: form.service_id, date: form.booking_date });
    if (form.doctor_id) params.append('doctor_id', form.doctor_id);
    api.get(`/slots?${params}`)
      .then(res => setSlots(res.data.slots?.filter(s => s.is_available) || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.service_id, form.doctor_id, form.booking_date]);

  const selectedService = services.find(s => s.id === parseInt(form.service_id));
  const selectedDoctor = doctors.find(d => d.id === parseInt(form.doctor_id));
  const selectedPatient = patients.find(p => p.id === parseInt(form.user_id));

  const handleSubmit = async () => {
    setError(''); setSaving(true);
    try {
      const payload = {
        patient_type: patientType,
        service_id: parseInt(form.service_id),
        doctor_id: form.doctor_id ? parseInt(form.doctor_id) : null,
        booking_date: form.booking_date,
        start_time: form.start_time,
        notes: form.notes,
      };

      if (patientType === 'existing') payload.user_id = parseInt(form.user_id);
      else if (patientType === 'guest') {
        payload.guest_name = form.guest_name;
        payload.guest_email = form.guest_email;
        payload.guest_phone = form.guest_phone;
      } else {
        payload.new_name = form.new_name;
        payload.new_email = form.new_email;
        payload.new_phone = form.new_phone;
        payload.new_password = form.new_password;
        payload.new_gender = form.new_gender;
      }

      await api.post('/bookings/admin-create', payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
      setStep(1);
    } finally { setSaving(false); }
  };

  const canNext = () => {
    if (step === 1) {
      if (patientType === 'existing') return !!form.user_id;
      if (patientType === 'guest') return !!(form.guest_name && form.guest_email);
      if (patientType === 'new') return !!(form.new_name && form.new_email && form.new_password);
    }
    if (step === 2) return !!form.service_id;
    if (step === 3) return !!(form.booking_date && form.start_time);
    return true;
  };

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="admin-modal-title">
          <i className="fa-solid fa-calendar-plus me-2" style={{ color: '#AB1509' }}></i>
          Create Booking
        </div>

        {/* Progress */}
        <div className="d-flex align-items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="d-flex align-items-center gap-2 flex-shrink-0">
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > i + 1 ? '#059669' : step === i + 1 ? '#AB1509' : '#e5e7eb',
                color: step >= i + 1 ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.78rem',
              }}>
                {step > i + 1 ? <i className="fa-solid fa-check" style={{ fontSize: '0.65rem' }}></i> : i + 1}
              </div>
              <span style={{ fontSize: '0.78rem', color: step === i + 1 ? '#AB1509' : '#9ca3af', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ width: 20, height: 2, background: step > i + 1 ? '#059669' : '#e5e7eb' }}></div>}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-danger mb-3"><i className="fa-solid fa-circle-exclamation me-2"></i>{error}</div>}

        {/* ── STEP 1: PATIENT ── */}
        {step === 1 && (
          <div>
            <h6 className="fw-bold mb-3">Select Patient</h6>

            {/* Patient type tabs */}
            <div className="d-flex gap-2 mb-4">
              {[
                { key: 'existing', icon: 'fa-user', label: 'Existing Patient' },
                { key: 'guest', icon: 'fa-user-clock', label: 'Guest (Walk-in)' },
                { key: 'new', icon: 'fa-user-plus', label: 'New Patient' },
              ].map(t => (
                <button key={t.key} onClick={() => { setPatientType(t.key); setError(''); }}
                  className="btn btn-sm flex-fill"
                  style={{ borderRadius: 10, fontWeight: patientType === t.key ? 600 : 400, fontSize: '0.82rem',
                    background: patientType === t.key ? '#AB1509' : 'white',
                    color: patientType === t.key ? '#fff7d3' : '#6b5a58',
                    border: `1px solid ${patientType === t.key ? '#AB1509' : '#e5e7eb'}` }}>
                  <i className={`fa-solid ${t.icon} me-1`}></i>{t.label}
                </button>
              ))}
            </div>

            {/* Existing patient */}
            {patientType === 'existing' && (
              <div>
                <input className="form-control mb-3" placeholder="🔍 Search patient by name or email..."
                  value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                  {patients.length === 0 ? (
                    <div className="text-center text-muted py-4 small">
                      {patientSearch ? 'No patients found' : 'Start typing to search patients'}
                    </div>
                  ) : patients.map(p => (
                    <div key={p.id} onClick={() => setForm(f => ({ ...f, user_id: String(p.id) }))}
                      style={{
                        padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                        background: form.user_id === String(p.id) ? '#fff7d3' : 'white',
                        borderLeft: form.user_id === String(p.id) ? '3px solid #AB1509' : '3px solid transparent',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (form.user_id !== String(p.id)) e.currentTarget.style.background = '#f9f6f0'; }}
                      onMouseLeave={e => { if (form.user_id !== String(p.id)) e.currentTarget.style.background = 'white'; }}>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#AB150918', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#AB1509', flexShrink: 0 }}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{p.name}</div>
                          <small className="text-muted">{p.email} {p.phone && `· ${p.phone}`}</small>
                        </div>
                        {form.user_id === String(p.id) && (
                          <i className="fa-solid fa-circle-check ms-auto" style={{ color: '#AB1509' }}></i>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guest */}
            {patientType === 'guest' && (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Full Name *</label>
                  <input className="form-control" value={form.guest_name}
                    onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                    placeholder="Patient full name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email *</label>
                  <input type="email" className="form-control" value={form.guest_email}
                    onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))}
                    placeholder="patient@email.com" />
                  <small className="text-muted">Confirmation email will be sent here</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone</label>
                  <input className="form-control" value={form.guest_phone}
                    onChange={e => setForm(f => ({ ...f, guest_phone: e.target.value }))}
                    placeholder="+961 xx xxx xxx" />
                </div>
              </div>
            )}

            {/* New patient */}
            {patientType === 'new' && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full Name *</label>
                  <input className="form-control" value={form.new_name}
                    onChange={e => setForm(f => ({ ...f, new_name: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gender</label>
                  <select className="form-select" value={form.new_gender}
                    onChange={e => setForm(f => ({ ...f, new_gender: e.target.value }))}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email *</label>
                  <input type="email" className="form-control" value={form.new_email}
                    onChange={e => setForm(f => ({ ...f, new_email: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone</label>
                  <input className="form-control" value={form.new_phone}
                    onChange={e => setForm(f => ({ ...f, new_phone: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Temporary Password *</label>
                  <input type="password" className="form-control" value={form.new_password}
                    onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                    placeholder="Patient can change this later" />
                  <small className="text-muted">A new account will be created for this patient</small>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: SERVICE & DOCTOR ── */}
        {step === 2 && (
          <div>
            <h6 className="fw-bold mb-3">Service & Doctor</h6>

            <div className="mb-4">
              <label className="form-label fw-semibold">Service *</label>
              <div className="row g-2">
                {services.map(s => (
                  <div className="col-md-6" key={s.id}>
                    <div onClick={() => setForm(f => ({ ...f, service_id: String(s.id), doctor_id: '', start_time: '' }))}
                      style={{
                        padding: '0.875rem', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                        border: form.service_id === String(s.id) ? '2px solid #AB1509' : '2px solid #e5e7eb',
                        background: form.service_id === String(s.id) ? '#fff7d3' : 'white',
                      }}>
                      <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{s.name}</div>
                      <div className="d-flex gap-2 mt-1">
                        <small className="text-muted"><i className="fa-regular fa-clock me-1"></i>{s.duration_minutes} min</small>
                        <small style={{ color: '#AB1509', fontWeight: 700 }}>${s.price}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {form.service_id && (
              <div>
                <label className="form-label fw-semibold">Doctor (optional)</label>
                <select className="form-select" value={form.doctor_id}
                  onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value, start_time: '' }))}>
                  <option value="">Any available doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: DATE & TIME ── */}
        {step === 3 && (
          <div>
            <h6 className="fw-bold mb-3">Date & Time</h6>
            <div className="mb-4">
              <label className="form-label fw-semibold">Date *</label>
              <input type="date" className="form-control" value={form.booking_date} min={today}
                onChange={e => setForm(f => ({ ...f, booking_date: e.target.value, start_time: '' }))} />
            </div>

            {form.booking_date && (
              <div className="mb-4">
                <label className="form-label fw-semibold">Available Slots *</label>
                {loadingSlots ? (
                  <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: '#AB1509' }} /></div>
                ) : slots.length === 0 ? (
                  <div className="alert alert-warning">No available slots for this date and doctor.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {slots.map(slot => (
                      <button key={slot.start_time} onClick={() => setForm(f => ({ ...f, start_time: slot.start_time }))}
                        style={{
                          padding: '0.5rem', borderRadius: 8, border: '2px solid', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                          borderColor: form.start_time === slot.start_time ? '#AB1509' : '#e5e7eb',
                          background: form.start_time === slot.start_time ? '#AB1509' : 'white',
                          color: form.start_time === slot.start_time ? '#fff7d3' : '#374151',
                        }}>
                        {slot.start_time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="form-label fw-semibold">Notes (optional)</label>
              <textarea className="form-control" rows="3"
                placeholder="Any notes about this appointment..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        )}

        {/* ── STEP 4: CONFIRM ── */}
        {step === 4 && (
          <div>
            <h6 className="fw-bold mb-3">Confirm Booking</h6>
            <div className="p-4 rounded-3 mb-4" style={{ background: '#f9f6f0', border: '1px solid #e5e7eb' }}>
              {[
                { icon: 'fa-user', label: 'Patient', value: patientType === 'existing' ? selectedPatient?.name : patientType === 'new' ? form.new_name : form.guest_name },
                { icon: 'fa-envelope', label: 'Email', value: patientType === 'existing' ? selectedPatient?.email : patientType === 'new' ? form.new_email : form.guest_email },
                { icon: 'fa-stethoscope', label: 'Service', value: selectedService?.name },
                { icon: 'fa-user-doctor', label: 'Doctor', value: selectedDoctor?.name || 'Any available' },
                { icon: 'fa-calendar', label: 'Date', value: form.booking_date && new Date(form.booking_date + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: 'fa-clock', label: 'Time', value: form.start_time },
                { icon: 'fa-money-bill', label: 'Price', value: `$${selectedService?.price}` },
              ].map(item => item.value && (
                <div key={item.label} className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(171,21,9,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${item.icon}`} style={{ color: '#AB1509', fontSize: '0.82rem' }}></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">{item.label}</small>
                    <span className="fw-semibold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-3 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <small style={{ color: '#059669' }}>
                <i className="fa-solid fa-circle-check me-2"></i>
                <strong>Auto-confirmed</strong> — Admin bookings are confirmed immediately. A confirmation email will be sent to the patient.
                {patientType === 'new' && ' A new patient account will also be created.'}
              </small>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="d-flex gap-2 mt-4">
          {step > 1 && (
            <button className="btn-admin-secondary flex-fill" onClick={() => setStep(s => s - 1)}>
              <i className="fa-solid fa-arrow-left me-2"></i>Back
            </button>
          )}
          {step < 4 ? (
            <button className="btn-admin-primary flex-fill" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Continue <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          ) : (
            <button className="btn-admin-primary flex-fill" onClick={handleSubmit} disabled={saving}>
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                : <><i className="fa-solid fa-calendar-check me-2"></i>Create Booking</>}
            </button>
          )}
          {step === 1 && (
            <button className="btn-admin-secondary" onClick={onClose}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
