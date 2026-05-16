import { useState, useEffect } from 'react';
import api from '../../services/api';

const PERIODS = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: '1 year', value: '365' },
];

const BAR_COLORS = ['#AB1509','#c93428','#e05040','#f06858','#f8a090'];

function BarChart({ data, valueKey, labelKey, color = '#AB1509', prefix = '', suffix = '' }) {
  if (!data || data.length === 0) return <p className="text-muted text-center py-3">No data available</p>;
  const max = Math.max(...data.map(d => parseFloat(d[valueKey]) || 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, i) => (
        <div key={i}>
          <div className="d-flex justify-content-between mb-1">
            <small className="fw-semibold" style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item[labelKey]}
            </small>
            <small className="fw-bold" style={{ color }}>
              {prefix}{parseFloat(item[valueKey]).toFixed(prefix === '$' ? 2 : 0)}{suffix}
            </small>
          </div>
          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, background: color,
              width: `${max > 0 ? (parseFloat(item[valueKey]) / max) * 100 : 0}%`,
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data }) {
  if (!data || data.length === 0) return <p className="text-muted text-center py-3">No data available</p>;
  const revenues = data.map(d => parseFloat(d.revenue) || 0);
  const max = Math.max(...revenues, 1);
  const W = 100, H = 60;
  const pts = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * W : W / 2,
    y: H - (parseFloat(d.revenue) / max) * H * 0.85,
    ...d
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${path} L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AB1509" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#AB1509" stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke="#AB1509" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1" fill="#AB1509" />
        ))}
      </svg>
      <div className="d-flex justify-content-between mt-1">
        <small className="text-muted">{data[0]?.date?.slice(5)}</small>
        <small className="text-muted">{data[data.length-1]?.date?.slice(5)}</small>
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  if (!data || data.length === 0) return null;
  const colors = { pending: '#f59e0b', confirmed: '#10b981', completed: '#6366f1', cancelled: '#ef4444' };
  const total = data.reduce((s, d) => s + parseInt(d.count), 0);
  let cumAngle = 0;

  const slices = data.map(d => {
    const pct = parseInt(d.count) / total;
    const startAngle = cumAngle;
    cumAngle += pct * 360;
    return { ...d, pct, startAngle, endAngle: cumAngle, color: colors[d.status] || '#9ca3af' };
  });

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <div className="d-flex align-items-center gap-4 flex-wrap">
      <svg viewBox="0 0 100 100" style={{ width: 120, height: 120, flexShrink: 0 }}>
        {slices.map((s, i) => {
          const start = polarToCartesian(50, 50, 40, s.startAngle);
          const end = polarToCartesian(50, 50, 40, s.endAngle - 0.1);
          const large = s.pct > 0.5 ? 1 : 0;
          return (
            <path key={i}
              d={`M 50 50 L ${start.x} ${start.y} A 40 40 0 ${large} 1 ${end.x} ${end.y} Z`}
              fill={s.color} />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="white"/>
        <text x="50" y="53" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2a1a18">{total}</text>
      </svg>
      <div>
        {slices.map((s, i) => (
          <div key={i} className="d-flex align-items-center gap-2 mb-1">
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }}/>
            <small className="text-capitalize fw-semibold">{s.status}</small>
            <small className="text-muted">({s.count} · {(s.pct * 100).toFixed(0)}%)</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics?period=${period}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [period]);

  const summaryCards = data ? [
    { label: 'Total Revenue', value: `$${parseFloat(data.summary.total_revenue).toFixed(2)}`, icon: 'fa-money-bill-wave', color: '#059669' },
    { label: 'Total Bookings', value: data.summary.total_bookings, icon: 'fa-calendar-check', color: '#AB1509' },
    { label: 'New Patients', value: data.summary.new_patients, icon: 'fa-user-plus', color: '#0284c7' },
    { label: 'Cancellation Rate', value: `${data.summary.cancellation_rate}%`, icon: 'fa-circle-xmark', color: '#d97706' },
  ] : [];

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">Revenue, bookings and performance insights</p>
        </div>
        <div className="d-flex gap-2">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className="btn btn-sm"
              style={{
                borderRadius: 20, fontWeight: period === p.value ? 600 : 400,
                background: period === p.value ? '#AB1509' : 'white',
                color: period === p.value ? '#fff7d3' : '#6b5a58',
                border: `1px solid ${period === p.value ? '#AB1509' : '#e5e7eb'}`,
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>
      ) : data && (
        <>
          {/* Summary cards */}
          <div className="row g-3 mb-4">
            {summaryCards.map(card => (
              <div className="col-6 col-lg-3" key={card.label}>
                <div className="stat-card">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="stat-card-value" style={{ color: card.color, fontSize: '1.6rem' }}>{card.value}</div>
                      <div className="stat-card-label">{card.label}</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fa-solid ${card.icon}`} style={{ color: card.color }}></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mb-4">
            {/* Revenue over time */}
            <div className="col-lg-8">
              <div className="admin-card h-100">
                <div className="admin-card-title">Revenue Over Time</div>
                <LineChart data={data.revenue_by_day} />
              </div>
            </div>

            {/* Booking status donut */}
            <div className="col-lg-4">
              <div className="admin-card h-100">
                <div className="admin-card-title">Booking Status</div>
                <DonutChart data={data.bookings_by_status} />
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Revenue by service */}
            <div className="col-md-6">
              <div className="admin-card h-100">
                <div className="admin-card-title">Revenue by Service</div>
                <BarChart data={data.revenue_by_service} valueKey="revenue" labelKey="service" prefix="$" />
              </div>
            </div>

            {/* Revenue by doctor */}
            <div className="col-md-6">
              <div className="admin-card h-100">
                <div className="admin-card-title">Revenue by Doctor</div>
                <BarChart data={data.revenue_by_doctor} valueKey="revenue" labelKey="doctor" prefix="$" />
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Busiest days */}
            <div className="col-md-6">
              <div className="admin-card h-100">
                <div className="admin-card-title">Busiest Days of Week</div>
                <BarChart data={data.busiest_days} valueKey="bookings" labelKey="day_name" suffix=" bookings" color="#0284c7" />
              </div>
            </div>

            {/* Busiest hours */}
            <div className="col-md-6">
              <div className="admin-card h-100">
                <div className="admin-card-title">Busiest Hours</div>
                <BarChart
                  data={data.busiest_hours.map(h => ({ ...h, hour_label: `${h.hour}:00` }))}
                  valueKey="bookings" labelKey="hour_label" suffix=" bookings" color="#7c3aed" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
