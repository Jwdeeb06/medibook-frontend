import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      // Redirect admins to dashboard, patients to home
      navigate(['admin', 'doctor'].includes(res.data.user.role) ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card card-medical p-4 p-md-5">
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem' }}>⚕</div>
              <h2 className="fw-bold mt-2">Welcome Back</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email" name="email"
                  className="form-control form-control-lg"
                  value={form.email} onChange={handleChange}
                  placeholder="your@email.com" required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password" name="password"
                  className="form-control form-control-lg"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center mt-4 mb-0">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--brand-red)' }}>Register</Link>
            </p>

            <hr className="my-4" />
            <p className="text-center text-muted small mb-0">
              Or{' '}
              <Link to="/booking" style={{ color: 'var(--brand-red)' }}>
                book as a guest
              </Link>{' '}
              without an account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
