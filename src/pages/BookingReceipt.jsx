import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function BookingReceipt() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get('/settings'),
    ]).then(([bookingRes, settingsRes]) => {
      setBooking(bookingRes.data);
      setSettings(settingsRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>;
  if (!booking) return <div className="container py-5"><div className="alert alert-danger">Booking not found</div></div>;

  const statusColor = { pending: '#d97706', confirmed: '#059669', cancelled: '#ef4444', completed: '#6366f1' };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      <div className="container py-5" style={{ maxWidth: 640 }}>
        {/* Actions */}
        <div className="d-flex gap-2 mb-4 no-print">
          <Link to="/my-bookings" className="btn btn-outline-secondary">
            <i className="fa-solid fa-arrow-left me-2"></i>Back
          </Link>
          <button className="btn btn-primary ms-auto" onClick={handlePrint}>
            <i className="fa-solid fa-print me-2"></i>Print Receipt
          </button>
        </div>

        {/* Receipt */}
        <div className="receipt-card card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #AB1509 0%, #7a0e06 100%)', padding: '2rem', textAlign: 'center' }}>
            <i className="fa-solid fa-hospital-user fa-2x mb-2" style={{ color: '#fff7d3' }}></i>
            <h3 className="fw-bold mb-0" style={{ color: '#fff7d3' }}>{settings.site_name || 'MediBook'}</h3>
            <small style={{ color: 'rgba(255,247,211,0.8)' }}>{settings.contact_address}</small>
          </div>

          <div style={{ padding: '2rem' }}>
            {/* Receipt title + status */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '2px dashed #e5e7eb' }}>
              <div>
                <h5 className="fw-bold mb-0">Booking Receipt</h5>
                <small className="text-muted">#{booking.id}</small>
              </div>
              <span className="badge px-3 py-2 fw-semibold" style={{ background: `${statusColor[booking.status]}18`, color: statusColor[booking.status], fontSize: '0.85rem', borderRadius: 20, textTransform: 'capitalize' }}>
                {booking.status}
              </span>
            </div>

            {/* Patient info */}
            <div className="mb-4">
              <p className="fw-semibold text-uppercase mb-2" style={{ color: '#AB1509', letterSpacing: 1, fontSize: '0.75rem' }}>Patient Information</p>
              <div className="row g-2">
                <div className="col-6">
                  <small className="text-muted d-block">Name</small>
                  <span className="fw-semibold">{booking.customer_name}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Phone</small>
                  <span className="fw-semibold">{booking.customer_phone || '—'}</span>
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Email</small>
                  <span className="fw-semibold">{booking.customer_email}</span>
                </div>
              </div>
            </div>

            {/* Appointment info */}
            <div className="mb-4">
              <p className="fw-semibold text-uppercase mb-2" style={{ color: '#AB1509', letterSpacing: 1, fontSize: '0.75rem' }}>Appointment Details</p>
              {[
                { icon: 'fa-stethoscope', label: 'Service', value: booking.service_name },
                { icon: 'fa-user-doctor', label: 'Doctor', value: booking.doctor_name || 'To be assigned' },
                { icon: 'fa-calendar', label: 'Date', value: new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: 'fa-clock', label: 'Time', value: `${booking.start_time?.slice(0,5)} – ${booking.end_time?.slice(0,5)}` },
              ].map(item => (
                <div key={item.label} className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#AB150910', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${item.icon}`} style={{ color: '#AB1509', fontSize: '0.85rem' }}></i>
                  </div>
                  <div>
                    <small className="text-muted d-block">{item.label}</small>
                    <span className="fw-semibold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="mb-4 p-3 rounded-3" style={{ background: '#f8f5f0' }}>
                <small className="text-muted d-block mb-1">Patient Notes</small>
                <p className="mb-0 fst-italic text-muted">"{booking.notes}"</p>
              </div>
            )}

            {/* Price */}
            <div className="p-3 rounded-3 mb-4" style={{ background: '#f8f5f0', border: '1px solid #e5e7eb' }}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Consultation Fee</span>
                <span className="fw-bold" style={{ fontSize: '1.3rem', color: '#AB1509' }}>${booking.total_price}</span>
              </div>
            </div>

            {/* Clinic contact */}
            <div className="text-center pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
              <small className="text-muted d-block">{settings.contact_phone} · {settings.contact_email}</small>
              <small className="text-muted d-block mt-1">{settings.working_hours}</small>
              <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem' }}>
                Generated on {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
