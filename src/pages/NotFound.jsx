import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 fw-bold" style={{ color: 'var(--brand-red)' }}>404</h1>
      <h3 className="mb-3">Page Not Found</h3>
      <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary px-4">Go Home</Link>
    </div>
  );
}

export default NotFound;
