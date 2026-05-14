import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Booking() {
  const { user, isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Guest fields
    guest_name: '', guest_email: '', guest_phone: '',
    // Booking fields
    service_id: '', doctor_id: '',
    booking_date: '', start_time: '', notes: '',
  });

  useEffect(() => {
    api.get('/services')
      .then((res) => setServices(res.data.services || []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!form.service_id) { setAvailableDoctors([]); return; }
    setLoadingDoctors(true);
    api.get(`/doctors/by-service/${form.service_id}`)
      .then((res) => setAvailableDoctors(res.data.doctors || []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingDoctors(false));
  }, [form.service_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value, ...(name === 'service_id' ? { doctor_id: '' } : {}) });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSubmitting(true);

  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  console.log('form:', form);

  try {
    const payload = isAuthenticated
      ? {
          service_id: parseInt(form.service_id),
          doctor_id: form.doctor_id ? parseInt(form.doctor_id) : null,
          booking_date: form.booking_date,
          start_time: form.start_time,
          notes: form.notes,
        }
      : {
          guest_name: form.guest_name,
          guest_email: form.guest_email,
          guest_phone: form.guest_phone,
          service_id: parseInt(form.service_id),
          doctor_id: form.doctor_id ? parseInt(form.doctor_id) : null,
          booking_date: form.booking_date,
          start_time: form.start_time,
          notes: form.notes,
        };

    console.log('Sending payload:', payload);
    console.log('Token in localStorage:', localStorage.getItem('token'));

    const res = await api.post('/bookings', payload);
    console.log('Success:', res.data);
    setSuccess(true);

  } catch (err) {
    console.log('Error response:', err.response?.data);
    setError(err.response?.data?.error || 'Booking failed. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  if (success) {
    return (
      <div className="container py-5 text-center">
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h2 className="fw-bold mt-3">Appointment Booked!</h2>
        <p className="text-muted mb-4">
          Your appointment has been submitted successfully. We'll confirm it shortly.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-outline-primary" onClick={() => setSuccess(false)}>
            Book Another
          </button>
          {isAuthenticated && (
            <Link to="/my-bookings" className="btn btn-primary">View My Bookings</Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="section-title">Book an Appointment</h1>
        <p className="text-muted mt-3">
          {isAuthenticated
            ? `Welcome back, ${user.name}. Fill in the details below.`
            : 'Book as a guest or sign in for a faster experience.'}
        </p>
        {!isAuthenticated && (
          <small className="text-muted">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand-red)' }}>Sign in</Link>
            {' '}to skip the guest fields.
          </small>
        )}
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card card-medical p-4 p-md-5">
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Guest fields — only shown when not logged in */}
              {!isAuthenticated && (
                <div className="mb-4 p-4 rounded" style={{ background: 'var(--brand-cream)' }}>
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--brand-red)' }}>
                    Your Contact Information
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input type="text" name="guest_name" className="form-control"
                        value={form.guest_name} onChange={handleChange}
                        placeholder="Jawad Deeb" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone *</label>
                      <input type="tel" name="guest_phone" className="form-control"
                        value={form.guest_phone} onChange={handleChange}
                        placeholder="+961 xx xxx xxx" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Email *</label>
                      <input type="email" name="guest_email" className="form-control"
                        value={form.guest_email} onChange={handleChange}
                        placeholder="your@email.com" required />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Service */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <span className="badge bg-primary me-2">1</span> Select a service *
                </label>
                <select name="service_id" className="form-select form-select-lg"
                  value={form.service_id} onChange={handleChange} required>
                  <option value="">Choose a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ${s.price} ({s.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Doctor */}
              {form.service_id && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <span className="badge bg-primary me-2">2</span> Choose doctor (optional)
                  </label>
                  {loadingDoctors
                    ? <div className="text-muted small">Loading doctors...</div>
                    : (
                      <select name="doctor_id" className="form-select form-select-lg"
                        value={form.doctor_id} onChange={handleChange}>
                        <option value="">Any available doctor</option>
                        {availableDoctors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.specialization}
                          </option>
                        ))}
                      </select>
                    )}
                  <small className="text-muted">
                    Leave as "Any available" to be matched with the next free doctor.
                  </small>
                </div>
              )}

              {/* Step 3: Date + Time */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <span className="badge bg-primary me-2">3</span> Date and time *
                </label>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input type="date" name="booking_date" className="form-control form-control-lg"
                      value={form.booking_date} onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="col-md-6">
                    <input type="time" name="start_time" className="form-control form-control-lg"
                      value={form.start_time} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              {/* Step 4: Notes */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <span className="badge bg-primary me-2">4</span> Notes (optional)
                </label>
                <textarea name="notes" rows="3" className="form-control"
                  placeholder="Symptoms, questions, or special requests..."
                  value={form.notes} onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                  : 'Confirm Appointment'}
              </button>

              <p className="text-muted small text-center mt-3 mb-0">
                You'll receive a confirmation once we verify the time slot.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
