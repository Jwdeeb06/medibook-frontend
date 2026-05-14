import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const res = await api.post('/auth/register', submitData);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card card-medical p-4 p-md-5">
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem' }}>⚕</div>
              <h2 className="fw-bold mt-2">Create Account</h2>
              <p className="text-muted">Register as a patient</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input type="text" name="name" className="form-control"
                  value={form.name} onChange={handleChange}
                  placeholder="Jawad Deeb" required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" name="email" className="form-control"
                  value={form.email} onChange={handleChange}
                  placeholder="your@email.com" required />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <input type="password" name="password" className="form-control"
                    value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input type="password" name="confirmPassword" className="form-control"
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="••••••••" required />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Phone</label>
                  <input type="tel" name="phone" className="form-control"
                    value={form.phone} onChange={handleChange}
                    placeholder="+961 xx xxx xxx" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Gender</label>
                  <select name="gender" className="form-select"
                    value={form.gender} onChange={handleChange}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 mt-2" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-4 mb-0">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--brand-red)' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
