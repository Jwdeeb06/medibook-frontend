import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = () => {
    api.get('/admins/patients')
      .then(res => setPatients(res.data.patients || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const toggleStatus = async (id) => {
    try { await api.put(`/admins/patients/${id}/toggle`); fetchPatients(); }
    catch { alert('Failed'); }
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Patients</h1>
          <p className="admin-page-subtitle">{patients.length} registered patients</p>
        </div>
        <input className="form-control" style={{ maxWidth: 260 }} placeholder="🔍 Search patients..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Joined</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">No patients found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td className="text-muted">#{p.id}</td>
                  <td className="fw-semibold">{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone || '—'}</td>
                  <td className="text-capitalize">{p.gender || '—'}</td>
                  <td>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <span className={`status-badge ${p.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className={`btn btn-sm ${p.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                      onClick={() => toggleStatus(p.id)}>
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
