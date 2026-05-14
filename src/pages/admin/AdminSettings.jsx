import { useState, useEffect } from 'react';
import api from '../../services/api';

const SETTING_LABELS = {
  site_name: { label: 'Site Name', icon: '🏥' },
  site_tagline: { label: 'Tagline', icon: '💬' },
  contact_email: { label: 'Contact Email', icon: '📧' },
  contact_phone: { label: 'Contact Phone', icon: '📞' },
  contact_address: { label: 'Address', icon: '📍' },
  working_hours: { label: 'Working Hours', icon: '🕐' },
  about_text: { label: 'About Text', icon: '📝' },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await api.put(`/settings/${key}`, { value: settings[key] });
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000);
    } catch (err) { alert('Failed to save'); }
    finally { setSaving(s => ({ ...s, [key]: false })); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Site Settings</h1>
        <p className="admin-page-subtitle">Customize your medical center's information</p>
      </div>

      <div className="row g-3">
        {Object.entries(SETTING_LABELS).map(([key, meta]) => (
          <div className="col-md-6" key={key}>
            <div className="admin-card">
              <label className="form-label fw-bold">
                {meta.icon} {meta.label}
              </label>
              {key === 'about_text' || key === 'working_hours' ? (
                <textarea className="form-control mb-3" rows="3"
                  value={settings[key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
              ) : (
                <input className="form-control mb-3"
                  value={settings[key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
              )}
              <button className="btn-admin-primary w-100"
                onClick={() => handleSave(key)} disabled={saving[key]}>
                {saving[key] ? 'Saving...' : saved[key] ? '✅ Saved!' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
