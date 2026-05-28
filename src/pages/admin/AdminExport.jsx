import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import api from '../../services/api';

export default function AdminExport() {
  const [doctors, setDoctors] = useState([]);
  const [exporting, setExporting] = useState(null);
  const [preview, setPreview] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '', end_date: '', status: '', doctor_id: '',
  });

  useEffect(() => {
    api.get('/doctors').then(res => setDoctors(res.data.doctors || []));
  }, []);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.status) params.append('status', filters.status);
    if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
    return params.toString();
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const url = type === 'bookings'
        ? `/export/bookings?${buildParams()}`
        : `/export/patients`;

      const res = await api.get(url);
      const data = res.data.data;

      if (!data || data.length === 0) {
        alert('No data to export with current filters');
        return;
      }

      setPreview({ type, count: data.length, data: data.slice(0, 5) });

      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, type === 'bookings' ? 'Bookings' : 'Patients');

      // Auto-size columns
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, ...data.slice(0, 20).map(row => String(row[key] || '').length))
      }));
      ws['!cols'] = colWidths;

      const filename = `medibook_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.error || err.message));
    } finally { setExporting(null); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Export Data</h1>
        <p className="admin-page-subtitle">Download bookings and patient data as Excel files</p>
      </div>

      <div className="row g-4">
        {/* Bookings export */}
        <div className="col-lg-6">
          <div className="admin-card h-100">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(171,21,9,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-calendar-check fa-lg" style={{ color: '#AB1509' }}></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Bookings Report</h6>
                <small className="text-muted">All appointments with patient and doctor details</small>
              </div>
            </div>

            {/* Filters */}
            <div className="row g-2 mb-4">
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>From Date</label>
                <input type="date" className="form-control form-control-sm"
                  value={filters.start_date}
                  onChange={e => setFilters(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>To Date</label>
                <input type="date" className="form-control form-control-sm"
                  value={filters.end_date}
                  onChange={e => setFilters(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Status</label>
                <select className="form-select form-select-sm" value={filters.status}
                  onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem' }}>Doctor</label>
                <select className="form-select form-select-sm" value={filters.doctor_id}
                  onChange={e => setFilters(f => ({ ...f, doctor_id: e.target.value }))}>
                  <option value="">All doctors</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Columns preview */}
            <div className="mb-4 p-3 rounded-3" style={{ background: '#f9f6f0', fontSize: '0.78rem' }}>
              <strong className="d-block mb-2">Columns included:</strong>
              <div className="d-flex flex-wrap gap-1">
                {['Booking ID', 'Patient Name', 'Patient Email', 'Patient Phone', 'Service', 'Price', 'Doctor', 'Date', 'Time', 'Status', 'Notes', 'Doctor Notes'].map(col => (
                  <span key={col} className="badge bg-light text-dark">{col}</span>
                ))}
              </div>
            </div>

            <button className="btn-admin-primary w-100" onClick={() => handleExport('bookings')}
              disabled={exporting === 'bookings'}>
              {exporting === 'bookings'
                ? <><span className="spinner-border spinner-border-sm me-2" />Exporting...</>
                : <><i className="fa-solid fa-file-excel me-2"></i>Export Bookings (.xlsx)</>}
            </button>
          </div>
        </div>

        {/* Patients export */}
        <div className="col-lg-6">
          <div className="admin-card h-100">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(2,132,199,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-users fa-lg" style={{ color: '#0284c7' }}></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0">Patients Report</h6>
                <small className="text-muted">All registered patients with booking statistics</small>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-3" style={{ background: '#f9f6f0', fontSize: '0.78rem' }}>
              <strong className="d-block mb-2">Columns included:</strong>
              <div className="d-flex flex-wrap gap-1">
                {['ID', 'Name', 'Email', 'Phone', 'Gender', 'Date of Birth', 'Status', 'Total Bookings', 'Total Spent', 'Member Since'].map(col => (
                  <span key={col} className="badge bg-light text-dark">{col}</span>
                ))}
              </div>
            </div>

            <div className="mb-4 p-3 rounded-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <small style={{ color: '#1d4ed8' }}>
                <i className="fa-solid fa-circle-info me-2"></i>
                Exports all active and inactive patients with their complete booking history summary.
              </small>
            </div>

            <button className="btn-admin-primary w-100"
              style={{ background: '#0284c7', borderColor: '#0284c7' }}
              onClick={() => handleExport('patients')} disabled={exporting === 'patients'}>
              {exporting === 'patients'
                ? <><span className="spinner-border spinner-border-sm me-2" />Exporting...</>
                : <><i className="fa-solid fa-file-excel me-2"></i>Export Patients (.xlsx)</>}
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="admin-card mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">
              <i className="fa-solid fa-eye me-2" style={{ color: '#AB1509' }}></i>
              Preview — {preview.count} rows exported
            </h6>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPreview(null)}>
              Close preview
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.78rem' }}>
              <thead className="table-light">
                <tr>{Object.keys(preview.data[0]).map(k => <th key={k}>{k}</th>)}</tr>
              </thead>
              <tbody>
                {preview.data.map((row, i) => (
                  <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{v ?? '—'}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="text-muted mt-2 d-block">Showing first 5 rows of {preview.count} total</small>
        </div>
      )}
    </div>
  );
}
