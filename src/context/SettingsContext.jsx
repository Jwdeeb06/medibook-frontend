import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

// Sensible defaults shown while settings are loading or if API is down
const DEFAULTS = {
  site_name: 'MediBook',
  site_tagline: 'Your health, our priority',
  contact_email: 'contact@medibook.com',
  contact_phone: '+961 6 123 456',
  contact_address: 'Tripoli, North Lebanon',
  working_hours: 'Mon-Fri: 8 AM - 6 PM',
  about_text: 'We provide comprehensive medical care.',
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        // Merge with defaults so missing keys still have fallbacks
        setSettings({ ...DEFAULTS, ...response.data });
        // Update browser tab title from settings
        if (response.data.site_name) {
          document.title = response.data.site_name;
        }
      } catch (err) {
        console.warn('Could not load settings, using defaults:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
};
