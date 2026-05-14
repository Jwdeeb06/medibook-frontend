import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import NotFound from './pages/NotFound';

// Admin panel
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminServices from './pages/admin/AdminServices';
import AdminPatients from './pages/admin/AdminPatients';
import AdminSettings from './pages/admin/AdminSettings';

// Doctor panel
import DoctorAppointments from './pages/admin/DoctorAppointments';
import DoctorProfile from './pages/admin/DoctorProfile';
import DoctorSchedule from './pages/admin/DoctorSchedule';
import DoctorServices from './pages/admin/DoctorServices';

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PanelRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" />
    </div>
  );
  return ['admin', 'doctor'].includes(user?.role)
    ? children
    : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public layout — with Navbar + Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin/Doctor panel — no public Navbar, own sidebar */}
      <Route path="/admin" element={<PanelRoute><AdminLayout /></PanelRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="settings" element={<AdminSettings />} />
        {/* Doctor routes */}
        <Route path="my-appointments" element={<DoctorAppointments />} />
        <Route path="my-profile" element={<DoctorProfile />} />
        <Route path="my-schedule" element={<DoctorSchedule />} />
        <Route path="my-services" element={<DoctorServices />} />
      </Route>
    </Routes>
  );
}

// Wrapper for public pages
import { Outlet } from 'react-router-dom';
function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

export default App;
