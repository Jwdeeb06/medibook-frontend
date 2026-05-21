import { useState, useEffect } from 'react';
import api from '../../services/api';

const SETTING_GROUPS = [
  {
    title: 'Clinic Identity',
    icon: 'fa-hospital',
    settings: [
      { key: 'site_name', label: 'Clinic Name', placeholder: 'MediBook Medical Center' },
      { key: 'site_tagline', label: 'Tagline', placeholder: 'Your health, our priority' },
      { key: 'about_text', label: 'About Text', type: 'textarea', placeholder: 'Brief description of your clinic...' },
    ]
  },
  {
    title: 'Contact Information',
    icon: 'fa-address-book',
    settings: [
      { key: 'contact_email', label: 'Email', placeholder: 'contact@medibook.com' },
      { key: 'contact_phone', label: 'Phone', placeholder: '+961 6 123 456' },
      { key: 'contact_address', label: 'Address', placeholder: 'Tripoli, North Lebanon' },
    ]
  },
  {
    title: 'Working Hours',
    icon: 'fa-clock',
    settings: [
      { key: 'working_hours', label: 'Hours', type: 'textarea', placeholder: 'Mon-Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 1:00 PM' },
    ]
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(() => setError('Could not load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    setError(''); setSuccess('');
    try {
      // Save all settings in parallel
      await Promise.all(
        Object.entries(settings).map(([key, value]) =>
          api.put(`/settings/${key}`, { value })
        )
      );
      setSuccess('All settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save some settings');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#AB1509' }} /></div>;

  return (
    <div>
      <div className="admin-page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">Customize your clinic information</p>
        </div>
        <button className="btn-admin-primary px-4" onClick={handleSaveAll} disabled={saving}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
            : <><i className="fa-solid fa-floppy-disk me-2"></i>Save All Changes</>}
        </button>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4"><i className="fa-solid fa-circle-check me-2"></i>{success}</div>}

      <div className="d-flex flex-column gap-4">
        {SETTING_GROUPS.map(group => (
          <div key={group.title} className="admin-card">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3" style={{ borderBottom: '2px solid #f3f4f6' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(171,21,9,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${group.icon}`} style={{ color: '#AB1509' }}></i>
              </div>
              <h6 className="fw-bold mb-0">{group.title}</h6>
            </div>

            <div className="row g-3">
              {group.settings.map(s => (
                <div className={`col-12 ${s.type !== 'textarea' ? 'col-md-6' : ''}`} key={s.key}>
                  <label className="form-label fw-semibold">{s.label}</label>
                  {s.type === 'textarea' ? (
                    <textarea className="form-control" rows="3"
                      value={settings[s.key] || ''}
                      placeholder={s.placeholder}
                      onChange={e => setSettings(prev => ({ ...prev, [s.key]: e.target.value }))} />
                  ) : (
                    <input className="form-control"
                      value={settings[s.key] || ''}
                      placeholder={s.placeholder}
                      onChange={e => setSettings(prev => ({ ...prev, [s.key]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating save button */}
      <div className="text-end mt-4">
        <button className="btn-admin-primary px-5 py-3" onClick={handleSaveAll} disabled={saving}
          style={{ borderRadius: 12, fontSize: '1rem' }}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
            : <><i className="fa-solid fa-floppy-disk me-2"></i>Save All Changes</>}
        </button>
      </div>
    </div>
  );
}