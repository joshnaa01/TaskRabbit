import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Toaster } from 'sonner';

// Components
import Chatbot from './components/common/Chatbot';

// Layouts
import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Pages
import Home from './pages/public/Home';
import SearchPage from './pages/public/SearchPage';
import ServiceDetails from './pages/public/ServiceDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';
import NearbyTechnicians from './pages/public/NearbyTechnicians';

import { ArrowRight } from 'lucide-react';
// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import BookingsTable from './pages/dashboard/BookingsTable';
import PaymentsTable from './pages/dashboard/PaymentsTable';
import CheckoutPage from './pages/dashboard/CheckoutPage';
import ProviderServices from './pages/dashboard/ProviderServices';
import AddService from './pages/dashboard/AddService';
import Chat from './pages/dashboard/Chat';
import AdminCategories from './pages/dashboard/AdminCategories';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminUsers from './pages/dashboard/AdminUsers';
import AdminDisputes from './pages/dashboard/AdminDisputes';
import AdminCompletionReviews from './pages/dashboard/AdminCompletionReviews';
import AdminMap from './pages/dashboard/AdminMap';

// Role-based Route Protection
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Protect public routes from being accessed by non-clients (e.g. providers)
const ClientOrGuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user && user.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
  if (user && user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// Dynamic Dashboard Layout Wrapper
const DynamicLayout = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

// Route components for redirection
const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
  return <Navigate to="/client/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Toaster position="top-center" richColors />
        <Router>
          <Routes>

            {/* PUBLIC / CLIENT ONLY */}
            <Route path="/" element={<PublicLayout noContainer><ClientOrGuestRoute><Home /></ClientOrGuestRoute></PublicLayout>} />
            <Route path="/search" element={<PublicLayout noContainer><ClientOrGuestRoute><SearchPage /></ClientOrGuestRoute></PublicLayout>} />
            <Route path="/service/:id" element={<PublicLayout noContainer><ClientOrGuestRoute><ServiceDetails /></ClientOrGuestRoute></PublicLayout>} />
            <Route path="/how-it-works" element={<PublicLayout noContainer><ClientOrGuestRoute><HowItWorks /></ClientOrGuestRoute></PublicLayout>} />
            <Route path="/nearby" element={<PublicLayout noContainer><ClientOrGuestRoute><NearbyTechnicians /></ClientOrGuestRoute></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout noContainer><ClientOrGuestRoute><Contact /></ClientOrGuestRoute></PublicLayout>} />

            {/* GUEST ONLY */}
            <Route path="/login" element={<PublicLayout noContainer><GuestRoute><Login /></GuestRoute></PublicLayout>} />
            <Route path="/register" element={<PublicLayout noContainer><GuestRoute><Register /></GuestRoute></PublicLayout>} />

            {/* ROLE-BASED REDIRECTION */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* CLIENT ROUTES */}
            <Route path="/client/dashboard" element={<RoleRoute roles={['client']}><DashboardLayout><DashboardOverview /></DashboardLayout></RoleRoute>} />
            <Route path="/client/bookings" element={<RoleRoute roles={['client']}><DashboardLayout><BookingsTable /></DashboardLayout></RoleRoute>} />
            <Route path="/client/messages" element={<RoleRoute roles={['client']}><DashboardLayout><Chat /></DashboardLayout></RoleRoute>} />
            <Route path="/client/payments" element={<RoleRoute roles={['client']}><DashboardLayout><PaymentsTable /></DashboardLayout></RoleRoute>} />
            <Route path="/client/checkout/:bookingId" element={<RoleRoute roles={['client']}><DashboardLayout><CheckoutPage /></DashboardLayout></RoleRoute>} />

            {/* PROVIDER ROUTES */}
            <Route path="/provider/dashboard" element={<RoleRoute roles={['provider']}><DashboardLayout><DashboardOverview /></DashboardLayout></RoleRoute>} />
            <Route path="/provider/bookings" element={<RoleRoute roles={['provider']}><DashboardLayout><BookingsTable /></DashboardLayout></RoleRoute>} />
            <Route path="/provider/messages" element={<RoleRoute roles={['provider']}><DashboardLayout><Chat /></DashboardLayout></RoleRoute>} />
            <Route path="/provider/services" element={<RoleRoute roles={['provider']}><DashboardLayout><ProviderServices /></DashboardLayout></RoleRoute>} />
            <Route path="/provider/services/add" element={<RoleRoute roles={['provider']}><DashboardLayout><AddService /></DashboardLayout></RoleRoute>} />
            <Route path="/provider/services/edit/:id" element={<RoleRoute roles={['provider']}><DashboardLayout><AddService /></DashboardLayout></RoleRoute>} />
            <Route path="/provider/earnings" element={
              <RoleRoute roles={['provider']}><DashboardLayout>
                <div className="p-20 text-center flex flex-col items-center">
                  <p className="text-4xl font-black text-slate-900 tracking-tight mb-4">My Earnings</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total income from your services</p>
                </div>
              </DashboardLayout></RoleRoute>
            } />

            {/* ADMIN ROUTES */}
            <Route path="/admin/dashboard" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/bookings" element={<RoleRoute roles={['admin']}><DashboardLayout><BookingsTable /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/messages" element={<RoleRoute roles={['admin']}><DashboardLayout><Chat /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/categories" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminCategories /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminUsers /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/disputes" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminDisputes /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/verification-queue" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminCompletionReviews /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/payments" element={<RoleRoute roles={['admin']}><DashboardLayout><PaymentsTable /></DashboardLayout></RoleRoute>} />
            <Route path="/admin/map" element={<RoleRoute roles={['admin']}><DashboardLayout><AdminMap /></DashboardLayout></RoleRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Chatbot />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
