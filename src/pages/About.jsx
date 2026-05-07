import { useSettings } from '../context/SettingsContext';

function About() {
  const { settings } = useSettings();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="section-title">About Us</h1>
          </div>

          <div className="card card-medical p-4 p-md-5 mb-4">
            <p className="lead text-muted">
              {settings.about_text}
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card card-medical h-100 p-4">
                <h4 className="fw-bold" style={{ color: 'var(--brand-red)' }}>
                  Our Mission
                </h4>
                <p className="text-muted">
                  To deliver exceptional medical care with compassion, accessibility,
                  and respect for every patient. We believe healthcare should be
                  straightforward, never stressful.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card card-medical h-100 p-4">
                <h4 className="fw-bold" style={{ color: 'var(--brand-red)' }}>
                  Our Values
                </h4>
                <ul className="list-unstyled mb-0 text-muted">
                  <li className="mb-2">✓ Patient-first approach</li>
                  <li className="mb-2">✓ Experienced specialists</li>
                  <li className="mb-2">✓ Modern medical practices</li>
                  <li className="mb-2">✓ Transparent pricing</li>
                  <li>✓ Confidentiality and trust</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
