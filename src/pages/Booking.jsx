import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STEPS = ['Service', 'Doctor', 'Date & Time', 'Details', 'Confirm'];

function Booking() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [slots, setSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [form, setForm] = useState({
    service_id: '', doctor_id: '',
    booking_date: '', start_time: '',
    guest_name: '', guest_email: '', guest_phone: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load services on mount
  useEffect(() => {
    api.get('/services').then(res => setServices(res.data.services || []));
  }, []);

  // Load doctors when service selected
  useEffect(() => {
    if (!form.service_id) { setDoctors([]); return; }
    api.get(`/doctors/by-service/${form.service_id}`)
      .then(res => setDoctors(res.data.doctors || []));
  }, [form.service_id]);

  // Load available days when service + doctor selected
  useEffect(() => {
    if (!form.service_id) return;
    const params = new URLSearchParams({ service_id: form.service_id, month: currentMonth });
    if (form.doctor_id) params.append('doctor_id', form.doctor_id);
    api.get(`/slots/available-days?${params}`)
      .then(res => setAvailableDays(res.data.available_days || []));
  }, [form.service_id, form.doctor_id, currentMonth]);

  // Load slots when date selected
  useEffect(() => {
    if (!form.service_id || !form.booking_date) { setSlots([]); return; }
    setLoading(true);
    const params = new URLSearchParams({ service_id: form.service_id, date: form.booking_date });
    if (form.doctor_id) params.append('doctor_id', form.doctor_id);
    api.get(`/slots?${params}`)
      .then(res => setSlots(res.data.slots || []))
      .finally(() => setLoading(false));
  }, [form.service_id, form.doctor_id, form.booking_date]);

  const selectedService = services.find(s => s.id === parseInt(form.service_id));
  const selectedDoctor = doctors.find(d => d.id === parseInt(form.doctor_id));

  // Calendar helpers
  const getCalendarDays = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      days.push(dateStr);
    }
    return days;
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const payload = isAuthenticated
        ? { service_id: parseInt(form.service_id), doctor_id: form.doctor_id ? parseInt(form.doctor_id) : null,
            booking_date: form.booking_date, start_time: form.start_time, notes: form.notes }
        : { guest_name: form.guest_name, guest_email: form.guest_email, guest_phone: form.guest_phone,
            service_id: parseInt(form.service_id), doctor_id: form.doctor_id ? parseInt(form.doctor_id) : null,
            booking_date: form.booking_date, start_time: form.start_time, notes: form.notes };
      await api.post('/bookings', payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (success) return (
    <div className="container py-5 text-center">
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <i className="fa-solid fa-circle-check fa-2x" style={{ color: '#059669' }}></i>
      </div>
      <h2 className="fw-bold mb-2">Appointment Booked!</h2>
      <p className="text-muted mb-4">
        Your appointment for <strong>{selectedService?.name}</strong> on <strong>{form.booking_date}</strong> at <strong>{form.start_time}</strong> has been received.
        We'll confirm it shortly.
      </p>
      <div className="d-flex gap-2 justify-content-center">
        <button className="btn btn-outline-primary" onClick={() => { setSuccess(false); setStep(1); setForm({ service_id:'', doctor_id:'', booking_date:'', start_time:'', guest_name:'', guest_email:'', guest_phone:'', notes:'' }); }}>
          Book Another
        </button>
        {isAuthenticated && <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>}
      </div>
    </div>
  );

  const calendarDays = getCalendarDays();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ background: '#f8f5f0', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #AB1509 0%, #7a0e06 100%)', padding: '3rem 0' }}>
        <div className="container text-center">
          <h1 className="fw-bold mb-1" style={{ color: '#fff7d3' }}>Book an Appointment</h1>
          <p style={{ color: 'rgba(255,247,211,0.85)' }}>
            {isAuthenticated ? `Welcome back, ${user.name}` : 'Book as a guest or sign in for a faster experience'}
          </p>
        </div>
      </div>

      <div className="container py-4">
        {/* Progress bar */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-4 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className="d-flex align-items-center gap-2">
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > i + 1 ? '#059669' : step === i + 1 ? '#AB1509' : '#e5e7eb',
                color: step >= i + 1 ? 'white' : '#9ca3af', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
              }}>
                {step > i + 1 ? <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i> : i + 1}
              </div>
              <span style={{ fontSize: '0.85rem', color: step === i + 1 ? '#AB1509' : '#9ca3af', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ width: 24, height: 2, background: step > i + 1 ? '#059669' : '#e5e7eb' }}></div>}
            </div>
          ))}
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 20 }}>
              <div className="card-body p-4 p-md-5">
                {error && <div className="alert alert-danger mb-4"><i className="fa-solid fa-circle-exclamation me-2"></i>{error}</div>}

                {/* STEP 1 — Service */}
                {step === 1 && (
                  <div>
                    <h4 className="fw-bold mb-1">Select a Service</h4>
                    <p className="text-muted mb-4">Choose the type of appointment you need</p>
                    <div className="row g-3">
                      {services.map(s => (
                        <div className="col-md-6" key={s.id}>
                          <div onClick={() => setForm({ ...form, service_id: String(s.id), doctor_id: '', booking_date: '', start_time: '' })}
                            style={{
                              padding: '1.25rem', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                              border: form.service_id === String(s.id) ? '2px solid #AB1509' : '2px solid #e5e7eb',
                              background: form.service_id === String(s.id) ? '#fff7d3' : 'white',
                            }}>
                            <div className="fw-bold mb-1">{s.name}</div>
                            <div className="d-flex gap-3">
                              <small className="text-muted"><i className="fa-regular fa-clock me-1"></i>{s.duration_minutes} min</small>
                              <small style={{ color: '#AB1509', fontWeight: 700 }}>${s.price}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary w-100 mt-4 py-3 fw-semibold" disabled={!form.service_id}
                      onClick={() => setStep(2)} style={{ borderRadius: 12 }}>
                      Continue <i className="fa-solid fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                )}

                {/* STEP 2 — Doctor */}
                {step === 2 && (
                  <div>
                    <h4 className="fw-bold mb-1">Choose Your Doctor</h4>
                    <p className="text-muted mb-4">Select a specific doctor or let us assign the next available one</p>

                    {/* Any available option */}
                    <div onClick={() => setForm({ ...form, doctor_id: '', booking_date: '', start_time: '' })}
                      style={{ padding: '1.25rem', borderRadius: 14, cursor: 'pointer', marginBottom: '0.75rem', transition: 'all 0.2s',
                        border: form.doctor_id === '' ? '2px solid #AB1509' : '2px solid #e5e7eb',
                        background: form.doctor_id === '' ? '#fff7d3' : 'white' }}>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-shuffle" style={{ color: '#6b7280' }}></i>
                        </div>
                        <div>
                          <div className="fw-bold">Any Available Doctor</div>
                          <small className="text-muted">We'll match you with the next free specialist</small>
                        </div>
                      </div>
                    </div>

                    {doctors.map(d => (
                      <div key={d.id} onClick={() => setForm({ ...form, doctor_id: String(d.id), booking_date: '', start_time: '' })}
                        style={{ padding: '1.25rem', borderRadius: 14, cursor: 'pointer', marginBottom: '0.75rem', transition: 'all 0.2s',
                          border: form.doctor_id === String(d.id) ? '2px solid #AB1509' : '2px solid #e5e7eb',
                          background: form.doctor_id === String(d.id) ? '#fff7d3' : 'white' }}>
                        <div className="d-flex align-items-center gap-3">
                          <img src={d.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=AB1509&color=fff7d3&size=48`}
                            alt={d.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div className="fw-bold">{d.name}</div>
                            <small style={{ color: '#AB1509', fontWeight: 600 }}>{d.specialization}</small>
                            {d.years_experience > 0 && <small className="text-muted ms-2">· {d.years_experience}+ yrs</small>}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="d-flex gap-2 mt-4">
                      <button className="btn btn-outline-secondary flex-fill py-3" onClick={() => setStep(1)} style={{ borderRadius: 12 }}>
                        <i className="fa-solid fa-arrow-left me-2"></i>Back
                      </button>
                      <button className="btn btn-primary flex-fill py-3 fw-semibold" onClick={() => setStep(3)} style={{ borderRadius: 12 }}>
                        Continue <i className="fa-solid fa-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Date & Time */}
                {step === 3 && (
                  <div>
                    <h4 className="fw-bold mb-1">Pick a Date & Time</h4>
                    <p className="text-muted mb-4">Only available slots are shown based on the doctor's schedule</p>

                    {/* Month navigation */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                        const [y, m] = currentMonth.split('-').map(Number);
                        const prev = new Date(y, m - 2, 1);
                        setCurrentMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2,'0')}`);
                      }}>
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <strong>{new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                        const [y, m] = currentMonth.split('-').map(Number);
                        const next = new Date(y, m, 1);
                        setCurrentMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2,'0')}`);
                      }}>
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>

                    {/* Calendar */}
                    <div className="mb-4">
                      <div className="row g-1 mb-1">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                          <div className="col text-center" key={d}><small className="fw-bold text-muted">{d}</small></div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {calendarDays.map((day, i) => {
                          if (!day) return <div key={i}></div>;
                          const isAvailable = availableDays.includes(day);
                          const isPast = day < today;
                          const isSelected = form.booking_date === day;
                          return (
                            <button key={day} disabled={!isAvailable || isPast}
                              onClick={() => setForm({ ...form, booking_date: day, start_time: '' })}
                              style={{
                                padding: '0.5rem 0.25rem', borderRadius: 10, border: 'none', fontSize: '0.85rem', fontWeight: isSelected ? 700 : 400, cursor: isAvailable && !isPast ? 'pointer' : 'default',
                                background: isSelected ? '#AB1509' : isAvailable && !isPast ? '#fff7d3' : 'transparent',
                                color: isSelected ? '#fff7d3' : isPast ? '#d1d5db' : isAvailable ? '#2a1a18' : '#d1d5db',
                                transition: 'all 0.15s',
                              }}>
                              {parseInt(day.split('-')[2])}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time slots */}
                    {form.booking_date && (
                      <div>
                        <p className="fw-semibold mb-3">Available times on {new Date(form.booking_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}:</p>
                        {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: '#AB1509' }} /></div> : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                            {slots.filter(s => s.is_available).map(slot => (
                              <button key={slot.start_time}
                                onClick={() => setForm({ ...form, start_time: slot.start_time })}
                                style={{
                                  padding: '0.6rem', borderRadius: 10, border: '2px solid', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                  borderColor: form.start_time === slot.start_time ? '#AB1509' : '#e5e7eb',
                                  background: form.start_time === slot.start_time ? '#AB1509' : 'white',
                                  color: form.start_time === slot.start_time ? '#fff7d3' : '#374151',
                                }}>
                                {slot.start_time}
                              </button>
                            ))}
                            {slots.filter(s => s.is_available).length === 0 && !loading && (
                              <p className="text-muted col-span-full">No available slots for this day.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-4">
                      <button className="btn btn-outline-secondary flex-fill py-3" onClick={() => setStep(2)} style={{ borderRadius: 12 }}>
                        <i className="fa-solid fa-arrow-left me-2"></i>Back
                      </button>
                      <button className="btn btn-primary flex-fill py-3 fw-semibold" disabled={!form.booking_date || !form.start_time}
                        onClick={() => setStep(4)} style={{ borderRadius: 12 }}>
                        Continue <i className="fa-solid fa-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4 — Details */}
                {step === 4 && (
                  <div>
                    <h4 className="fw-bold mb-1">Your Details</h4>
                    <p className="text-muted mb-4">
                      {isAuthenticated ? 'Add any notes for your appointment' : 'Fill in your contact information'}
                    </p>

                    {!isAuthenticated && (
                      <div className="p-4 rounded-3 mb-4" style={{ background: '#fff7d3', border: '1px solid #f5ecc0' }}>
                        <p className="fw-semibold mb-3" style={{ color: '#AB1509' }}>
                          <i className="fa-solid fa-user me-2"></i>Contact Information
                        </p>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Full Name *</label>
                            <input className="form-control" value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Phone *</label>
                            <input className="form-control" value={form.guest_phone} onChange={e => setForm({...form, guest_phone: e.target.value})} />
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-semibold">Email *</label>
                            <input type="email" className="form-control" value={form.guest_email} onChange={e => setForm({...form, guest_email: e.target.value})} />
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="form-label fw-semibold">Notes for the doctor (optional)</label>
                    <textarea className="form-control mb-4" rows="4" placeholder="Describe your symptoms, concerns or any relevant medical history..."
                      value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />

                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-secondary flex-fill py-3" onClick={() => setStep(3)} style={{ borderRadius: 12 }}>
                        <i className="fa-solid fa-arrow-left me-2"></i>Back
                      </button>
                      <button className="btn btn-primary flex-fill py-3 fw-semibold"
                        disabled={!isAuthenticated && (!form.guest_name || !form.guest_email || !form.guest_phone)}
                        onClick={() => setStep(5)} style={{ borderRadius: 12 }}>
                        Review <i className="fa-solid fa-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5 — Confirm */}
                {step === 5 && (
                  <div>
                    <h4 className="fw-bold mb-4">Confirm Your Appointment</h4>

                    <div className="p-4 rounded-3 mb-4" style={{ background: '#f8f5f0', border: '1px solid #e5e7eb' }}>
                      {[
                        { icon: 'fa-stethoscope', label: 'Service', value: selectedService?.name },
                        { icon: 'fa-user-doctor', label: 'Doctor', value: form.doctor_id ? selectedDoctor?.name : 'Any available doctor' },
                        { icon: 'fa-calendar', label: 'Date', value: form.booking_date && new Date(form.booking_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                        { icon: 'fa-clock', label: 'Time', value: form.start_time },
                        { icon: 'fa-money-bill', label: 'Price', value: `$${selectedService?.price}` },
                        !isAuthenticated && { icon: 'fa-user', label: 'Patient', value: form.guest_name },
                      ].filter(Boolean).map(item => (
                        <div key={item.label} className="d-flex align-items-center gap-3 mb-3">
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(171,21,9,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={`fa-solid ${item.icon}`} style={{ color: '#AB1509', fontSize: '0.85rem' }}></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">{item.label}</small>
                            <span className="fw-semibold">{item.value}</span>
                          </div>
                        </div>
                      ))}
                      {form.notes && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                          <small className="text-muted d-block mb-1">Notes</small>
                          <p className="mb-0 fst-italic text-muted">"{form.notes}"</p>
                        </div>
                      )}
                    </div>

                    {error && <div className="alert alert-danger mb-3">{error}</div>}

                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-secondary flex-fill py-3" onClick={() => setStep(4)} style={{ borderRadius: 12 }}>
                        <i className="fa-solid fa-arrow-left me-2"></i>Back
                      </button>
                      <button className="btn btn-primary flex-fill py-3 fw-bold" onClick={handleSubmit} disabled={submitting} style={{ borderRadius: 12 }}>
                        {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Booking...</> : <><i className="fa-solid fa-calendar-check me-2"></i>Confirm Booking</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
