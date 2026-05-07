import { useState, useEffect } from 'react';
import api from '../services/api';

function Booking() {
  const [services, setServices] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [form, setForm] = useState({
    service_id: '',
    doctor_id: '', // empty = "any available doctor"
    booking_date: '',
    start_time: '',
    notes: '',
  });

  // Load services on mount
  useEffect(() => {
    api.get('/services')
      .then((res) => setServices(res.data.services || []))
      .catch((err) => console.error('Could not load services:', err));
  }, []);

  // When user picks a service, load doctors who offer it
  useEffect(() => {
    if (!form.service_id) {
      setAvailableDoctors([]);
      return;
    }

    setLoadingDoctors(true);
    api.get(`/doctors/by-service/${form.service_id}`)
      .then((res) => setAvailableDoctors(res.data.doctors || []))
      .catch((err) => console.error('Could not load doctors:', err))
      .finally(() => setLoadingDoctors(false));
  }, [form.service_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
      // Reset doctor when service changes
      ...(name === 'service_id' ? { doctor_id: '' } : {}),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      'Booking flow will be wired up in Week 2!\n\nSelected:\n' +
      JSON.stringify(form, null, 2)
    );
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="section-title">Book an Appointment</h1>
        <p className="text-muted mt-3">
          Choose your service, doctor, and time — we'll confirm shortly
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card card-medical p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Service */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <span className="badge bg-primary me-2">1</span>
                  Select a service
                </label>
                <select
                  name="service_id"
                  className="form-select form-select-lg"
                  value={form.service_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ${s.price} ({s.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Doctor (optional) */}
              {form.service_id && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <span className="badge bg-primary me-2">2</span>
                    Choose your doctor (optional)
                  </label>
                  {loadingDoctors ? (
                    <div className="text-muted small">Loading doctors...</div>
                  ) : (
                    <select
                      name="doctor_id"
                      className="form-select form-select-lg"
                      value={form.doctor_id}
                      onChange={handleChange}
                    >
                      <option value="">Any available doctor</option>
                      {availableDoctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialization}
                        </option>
                      ))}
                    </select>
                  )}
                  <small className="text-muted">
                    Leave as "Any available" and we'll match you with the next free doctor.
                  </small>
                </div>
              )}

              {/* Step 3: Date + time */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <span className="badge bg-primary me-2">3</span>
                  Pick a date and time
                </label>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="date"
                      name="booking_date"
                      className="form-control form-control-lg"
                      value={form.booking_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="time"
                      name="start_time"
                      className="form-control form-control-lg"
                      value={form.start_time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Notes */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <span className="badge bg-primary me-2">4</span>
                  Additional notes (optional)
                </label>
                <textarea
                  name="notes"
                  rows="3"
                  className="form-control"
                  placeholder="Any symptoms, questions, or special requests?"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100">
                Confirm Appointment
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
